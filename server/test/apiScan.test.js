const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const JSZip = require('jszip');

const scanRoutes = require('../src/routes/scan.routes');

function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', scanRoutes);
  return app;
}

async function createSampleDocx(textContent) {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '</Types>'
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '</Relationships>'
  );
  zip.file(
    'word/document.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body><w:p><w:r><w:t>' +
      textContent +
      '</w:t></w:r></w:p></w:body>' +
      '</w:document>'
  );

  return zip.generateAsync({ type: 'nodebuffer' });
}

test('API /api/scan Endpoint - Verification Suite', async (t) => {
  const app = createTestApp();
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  await t.test('GET /api/health returns ok status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });

  await t.test('GET /api/keywords returns 20 default Tritorc keywords', async () => {
    const res = await fetch(`${baseUrl}/keywords`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.keywords));
    assert.equal(data.keywords.length, 20);
    assert.ok(data.keywords.includes('Hydraulic torque wrench'));
    assert.ok(data.keywords.includes('Bolt tensioner'));
  });

  await t.test('POST /api/scan rejects empty upload with 400', async () => {
    const formData = new FormData();
    const res = await fetch(`${baseUrl}/scan`, {
      method: 'POST',
      body: formData,
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /No files uploaded/i);
  });

  await t.test('POST /api/scan processes both PDF and DOCX files in batch', async () => {
    const pdfPath = path.join(__dirname, '..', '..', 'Tender_Keyword_Scanner_Assignment.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const docxBuffer = await createSampleDocx(
      'Requirements: Hydraulic torque wrench and bolt tensioner needed for plant shutdown.'
    );

    const formData = new FormData();
    formData.append('files', new Blob([pdfBuffer], { type: 'application/pdf' }), 'Assignment.pdf');
    formData.append(
      'files',
      new Blob([docxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
      'Tender_Scope.docx'
    );

    const res = await fetch(`${baseUrl}/scan`, {
      method: 'POST',
      body: formData,
    });

    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(data.batchId);
    assert.equal(data.results.length, 2);

    // Assignment.pdf has bolting keywords
    const pdfResult = data.results.find((r) => r.documentName === 'Assignment.pdf');
    assert.ok(pdfResult);
    assert.ok(pdfResult.matchCount >= 3);
    assert.equal(pdfResult.relevance, 'Related');

    // Tender_Scope.docx has 3 keywords: Hydraulic torque wrench, Bolt tensioner, Plant shutdown
    const docxResult = data.results.find((r) => r.documentName === 'Tender_Scope.docx');
    assert.ok(docxResult);
    assert.equal(docxResult.matchCount, 3);
    assert.equal(docxResult.relevance, 'Related');

    // Excel report was generated
    assert.ok(data.excelBase64);
    assert.match(data.excelFilename, /\.xlsx$/);
  });

  await t.test('POST /api/scan handles mixed valid and unsupported files independently', async () => {
    const docxBuffer = await createSampleDocx(
      'Office catering and cleaning services only.'
    );

    const formData = new FormData();
    formData.append(
      'files',
      new Blob([docxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
      'catering.docx'
    );
    formData.append(
      'files',
      new Blob([Buffer.from('plain text file')], { type: 'text/plain' }),
      'notes.txt'
    );

    const res = await fetch(`${baseUrl}/scan`, {
      method: 'POST',
      body: formData,
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.results.length, 2);

    const validResult = data.results.find((r) => r.documentName === 'catering.docx');
    assert.ok(validResult);
    assert.equal(validResult.matchCount, 0);
    assert.equal(validResult.relevance, 'Not Related');

    const invalidResult = data.results.find((r) => r.documentName === 'notes.txt');
    assert.ok(invalidResult);
    assert.ok(invalidResult.error);
    assert.match(invalidResult.error, /Unsupported file type/i);

    // Excel report still generated for the valid file
    assert.ok(data.excelBase64);
  });

  await t.test('POST /api/scan handles corrupt document without failing entire batch', async () => {
    const docxBuffer = await createSampleDocx('Needs stud bolt tensioning.');

    const formData = new FormData();
    formData.append(
      'files',
      new Blob([Buffer.from('not a real pdf content')], { type: 'application/pdf' }),
      'broken.pdf'
    );
    formData.append(
      'files',
      new Blob([docxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
      'valid.docx'
    );

    const res = await fetch(`${baseUrl}/scan`, {
      method: 'POST',
      body: formData,
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.results.length, 2);

    const brokenResult = data.results.find((r) => r.documentName === 'broken.pdf');
    assert.ok(brokenResult);
    assert.ok(brokenResult.error);

    const validResult = data.results.find((r) => r.documentName === 'valid.docx');
    assert.ok(validResult);
    assert.equal(validResult.matchCount, 1);
    assert.equal(validResult.relevance, 'Possibly Related');
    assert.ok(data.excelBase64);
  });
});

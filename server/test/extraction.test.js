const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { extractText } = require('../src/services/extractText.service');

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

test('PDF Extraction - Extracts text from valid PDF document', async () => {
  const pdfPath = path.join(__dirname, '..', '..', 'Tender_Keyword_Scanner_Assignment.pdf');
  assert.ok(fs.existsSync(pdfPath), 'Assignment PDF should exist in workspace');

  const pdfBuffer = fs.readFileSync(pdfPath);
  const text = await extractText({
    originalname: 'tender_sample.pdf',
    buffer: pdfBuffer,
  });

  assert.ok(typeof text === 'string');
  assert.ok(text.length > 500);
  assert.match(text, /Tritorc/i);
  assert.match(text, /Scope\s+of\s+Work/i);
});

test('DOCX Extraction - Extracts text from valid DOCX document', async () => {
  const docxBuffer = await createSampleDocx(
    'Technical requirements: Hydraulic torque wrench and bolt tensioner needed for plant shutdown.'
  );

  const text = await extractText({
    originalname: 'technical_sow.docx',
    buffer: docxBuffer,
  });

  assert.ok(typeof text === 'string');
  assert.match(text, /Hydraulic torque wrench/);
  assert.match(text, /bolt tensioner/);
  assert.match(text, /plant shutdown/);
});

test('Extraction Error Handling - Rejects unsupported file extension', async () => {
  await assert.rejects(
    async () => {
      await extractText({
        originalname: 'unsupported.txt',
        buffer: Buffer.from('hello world'),
      });
    },
    (err) => {
      assert.equal(err.code, 'UNSUPPORTED_TYPE');
      return true;
    }
  );
});

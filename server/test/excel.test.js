const test = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');
const { buildExcel, formatKeywords } = require('../src/services/excel.service');

test('Excel Generation - Produces valid .xlsx buffer with required columns and values', async () => {
  const mockResults = [
    {
      documentName: 'SOW_Flange_Tensioning.pdf',
      matchedKeywords: ['Hydraulic torque wrench', 'Bolt tensioner', 'Controlled bolting'],
      matchCount: 3,
      relevance: 'Related',
    },
    {
      documentName: 'Maintenance_Shutdown.docx',
      matchedKeywords: ['Plant shutdown'],
      matchCount: 1,
      relevance: 'Possibly Related',
    },
    {
      documentName: 'Office_Supplies.pdf',
      matchedKeywords: [],
      matchCount: 0,
      relevance: 'Not Related',
    },
  ];

  const buffer = await buildExcel(mockResults);
  assert.ok(Buffer.isBuffer(buffer) || buffer instanceof Uint8Array);
  assert.ok(buffer.length > 0);

  // Parse generated Excel buffer back into ExcelJS to verify contents
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet('Tender Scan Report');
  assert.ok(worksheet, 'Worksheet "Tender Scan Report" should exist');

  // Verify header row
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell) => {
    headers.push(String(cell.value).trim());
  });

  assert.ok(headers.includes('Document Name'), 'Header should contain "Document Name"');
  assert.ok(headers.includes('Matched Keywords'), 'Header should contain "Matched Keywords"');
  assert.ok(headers.includes('Match Count'), 'Header should contain "Match Count"');
  assert.ok(headers.includes('Relevance to Tritorc'), 'Header should contain "Relevance to Tritorc"');

  // Verify rows
  assert.equal(worksheet.rowCount, 4); // 1 header + 3 data rows

  const row1 = worksheet.getRow(2);
  assert.equal(row1.getCell(1).value, 'SOW_Flange_Tensioning.pdf');
  assert.equal(row1.getCell(2).value, 'Hydraulic torque wrench, Bolt tensioner, Controlled bolting');
  assert.equal(row1.getCell(3).value, 3);
  assert.equal(row1.getCell(4).value, 'Related');

  const row3 = worksheet.getRow(4);
  assert.equal(row3.getCell(1).value, 'Office_Supplies.pdf');
  assert.equal(row3.getCell(2).value, '(none found)');
  assert.equal(row3.getCell(3).value, 0);
  assert.equal(row3.getCell(4).value, 'Not Related');
});

test('Excel Formatting - formatKeywords helper works correctly', () => {
  assert.equal(formatKeywords([]), '(none found)');
  assert.equal(formatKeywords(null), '(none found)');
  assert.equal(formatKeywords(['A', 'B']), 'A, B');
});

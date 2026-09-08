const ExcelJS = require('exceljs');

const COLUMNS = [
  { header: 'Document Name', key: 'documentName', width: 32 },
  { header: 'Matched Keywords', key: 'matchedKeywordsDisplay', width: 44 },
  { header: 'Match Count', key: 'matchCount', width: 14 },
  { header: 'Relevance to Tritorc', key: 'relevance', width: 22 },
];

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1F4E79' },
};

const RELEVANCE_FILL = {
  Related: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } },
  'Possibly Related': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } },
  Possible: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } },
  'Not Related': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } },
};

function formatKeywords(matchedKeywords) {
  if (!matchedKeywords || matchedKeywords.length === 0) return '(none found)';
  return matchedKeywords.join(', ');
}

async function buildExcel(results) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tender Scan Report', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
  });

  sheet.columns = COLUMNS;
  sheet.getRow(1).height = 28;
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = HEADER_FILL;
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  results.forEach((result) => {
    const row = sheet.addRow({
      documentName: result.documentName,
      matchedKeywordsDisplay: formatKeywords(result.matchedKeywords),
      matchCount: result.matchCount,
      relevance: result.relevance,
    });

    row.height = 36;
    row.alignment = { vertical: 'middle', wrapText: true };

    const matchCountCell = row.getCell('matchCount');
    matchCountCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const relevanceCell = row.getCell('relevance');
    relevanceCell.alignment = { vertical: 'middle', horizontal: 'center' };
    if (RELEVANCE_FILL[result.relevance]) {
      relevanceCell.fill = RELEVANCE_FILL[result.relevance];
      relevanceCell.font = { bold: true };
    }
  });

  return workbook.xlsx.writeBuffer();
}

module.exports = { buildExcel, formatKeywords };

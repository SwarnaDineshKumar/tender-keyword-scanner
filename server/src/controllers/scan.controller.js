const crypto = require('crypto');
const { isAllowedFile, getExtension } = require('../middleware/upload');
const { loadKeywords } = require('../utils/keywords');
const { extractText } = require('../services/extractText.service');
const { matchKeywords } = require('../services/matchKeywords.service');
const { scoreRelevance } = require('../services/scoreRelevance.service');
const { buildExcel, formatKeywords } = require('../services/excel.service');

function health(_req, res) {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

function getKeywords(_req, res) {
  res.json({ keywords: loadKeywords() });
}

async function scanFile(file, keywords) {
  const documentName = file.originalname;

  if (!isAllowedFile(file)) {
    return {
      documentName,
      error: `Unsupported file type. Only .pdf and .docx are allowed (${getExtension(documentName) || 'unknown'})`,
    };
  }

  const text = await extractText(file);
  const { matchedKeywords, matchCount } = matchKeywords(text, keywords);
  const relevance = scoreRelevance(matchCount);

  return {
    documentName,
    matchedKeywords,
    matchedKeywordsDisplay: formatKeywords(matchedKeywords),
    matchCount,
    relevance,
  };
}

async function scan(req, res, next) {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      res.status(400).json({ error: 'No files uploaded. Use multipart field name "files".' });
      return;
    }

    const keywords = loadKeywords();
    const batchId = crypto.randomUUID();
    const results = [];

    for (const file of files) {
      try {
        results.push(await scanFile(file, keywords));
      } catch (error) {
        results.push({
          documentName: file.originalname,
          error: error.message || 'Failed to process file',
        });
      }
    }

    const successful = results.filter((result) => !result.error);
    let excelBase64 = null;
    let excelFilename = null;

    if (successful.length > 0) {
      const buffer = await buildExcel(successful);
      excelBase64 = Buffer.from(buffer).toString('base64');
      excelFilename = `tender_scan_report_${Date.now()}.xlsx`;
    }

    res.json({
      batchId,
      results,
      excelBase64,
      excelFilename,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { health, getKeywords, scan };

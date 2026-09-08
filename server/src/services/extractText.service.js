const mammoth = require('mammoth');
const { getExtension } = require('../middleware/upload');

async function extractPdf(buffer) {
  // Require the implementation file to avoid pdf-parse's debug entrypoint.
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');
  const result = await pdfParse(buffer);
  return (result && result.text) || '';
}

async function extractDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return (result && result.value) || '';
}

async function extractText(file) {
  const extension = getExtension(file.originalname);

  if (extension === '.pdf') {
    return extractPdf(file.buffer);
  }
  if (extension === '.docx') {
    return extractDocx(file.buffer);
  }

  const error = new Error(`Unsupported file type: ${extension || 'unknown'}`);
  error.code = 'UNSUPPORTED_TYPE';
  throw error;
}

module.exports = { extractText };

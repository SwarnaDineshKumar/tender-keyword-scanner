const NOT_FOUND = 'Not Found';

function firstCapture(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match || !match[1]) continue;
    const value = cleanValue(match[1]);
    if (value) return value;
  }
  return NOT_FOUND;
}

function cleanValue(value) {
  return String(value)
    .replace(/\s+/g, ' ')
    .replace(/^[:\-\s]+/, '')
    .replace(/\s+$/, '')
    .trim();
}

function labeled(label) {
  return new RegExp(`${label}\\s*[:\\-]\\s*(.+)`, 'i');
}

function extractEmail(text) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : NOT_FOUND;
}

function extractWebsite(text) {
  const match = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
  if (!match) return NOT_FOUND;
  return match[1].replace(/[),.;]+$/, '');
}

function extractFields(text) {
  const raw = String(text || '');
  const collapsed = raw.replace(/[ \t]+/g, ' ');
  const labeledWebsite = firstCapture(collapsed, [labeled('Website')]);

  return {
    tenderId: firstCapture(collapsed, [labeled('Tender ID'), labeled('TenderId')]),
    tenderNo: firstCapture(collapsed, [labeled('Tender No(?:umber)?'), labeled('Tender Number')]),
    tenderAuthority: firstCapture(collapsed, [
      labeled('Tender Authority'),
      labeled('Authority'),
      labeled('Client'),
      labeled('Purchaser'),
    ]),
    location: firstCapture(collapsed, [labeled('Location'), labeled('Place of Work')]),
    openingDate: firstCapture(collapsed, [labeled('Opening Date'), labeled('Bid Opening Date')]),
    closingDate: firstCapture(collapsed, [
      labeled('Closing Date'),
      labeled('Bid Closing Date'),
      labeled('Submission Date'),
    ]),
    tenderAmount: firstCapture(collapsed, [
      labeled('Tender Amount'),
      labeled('Estimated Value'),
      labeled('Contract Value'),
    ]),
    emd: firstCapture(collapsed, [labeled('EMD'), labeled('Earnest Money')]),
    documentCost: firstCapture(collapsed, [labeled('Document Cost'), labeled('Tender Document Cost')]),
    tenderFee: firstCapture(collapsed, [labeled('Tender Fee')]),
    tabName: firstCapture(collapsed, [labeled('Tab Name'), labeled('Category'), labeled('Work Category')]),
    technicalQualification: firstCapture(collapsed, [
      labeled('Technical Qualification'),
      labeled('Technical Eligibility'),
    ]),
    financialQualification: firstCapture(collapsed, [
      labeled('Financial Qualification'),
      labeled('Financial Eligibility'),
    ]),
    scopeOfWork: firstCapture(collapsed, [labeled('Scope of Work'), labeled('SOW')]),
    tenderSummary: firstCapture(collapsed, [labeled('Tender Summary'), labeled('Summary')]),
    tenderDescription: firstCapture(collapsed, [labeled('Tender Description'), labeled('Description')]),
    corrigendum: firstCapture(collapsed, [labeled('Corrigendum'), labeled('Addendum')]),
    purchaserAddress: firstCapture(collapsed, [
      labeled('Purchaser Address'),
      labeled('Address'),
    ]),
    email: extractEmail(raw),
    website: labeledWebsite === NOT_FOUND ? extractWebsite(raw) : labeledWebsite,
  };
}

function emptyFields() {
  return {
    tenderId: NOT_FOUND,
    tenderNo: NOT_FOUND,
    tenderAuthority: NOT_FOUND,
    location: NOT_FOUND,
    openingDate: NOT_FOUND,
    closingDate: NOT_FOUND,
    tenderAmount: NOT_FOUND,
    emd: NOT_FOUND,
    documentCost: NOT_FOUND,
    tenderFee: NOT_FOUND,
    tabName: NOT_FOUND,
    technicalQualification: NOT_FOUND,
    financialQualification: NOT_FOUND,
    scopeOfWork: NOT_FOUND,
    tenderSummary: NOT_FOUND,
    tenderDescription: NOT_FOUND,
    corrigendum: NOT_FOUND,
    purchaserAddress: NOT_FOUND,
    email: NOT_FOUND,
    website: NOT_FOUND,
  };
}

module.exports = { extractFields, emptyFields, NOT_FOUND };

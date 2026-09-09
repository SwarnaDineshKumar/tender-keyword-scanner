const { getDatabase } = require('../config/mongodb');

async function saveScanHistory(batchId, results) {
  const db = getDatabase();

  const documents = results
    .filter((result) => !result.error)
    .map((result) => ({
      batchId,
      documentName: result.documentName,
      matchedKeywords: result.matchedKeywords,
      matchCount: result.matchCount,
      relevance: result.relevance,
      scannedAt: new Date(),
    }));

  if (documents.length === 0) {
    return;
  }

  await db.collection('scan_history').insertMany(documents);
}

async function getScanHistory(limit = 20) {
  const db = getDatabase();

  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));

  return await db
    .collection('scan_history')
    .find({})
    .sort({ scannedAt: -1 })
    .limit(safeLimit)
    .maxTimeMS(5000)
    .toArray();
}

module.exports = {
  saveScanHistory,
  getScanHistory,
};
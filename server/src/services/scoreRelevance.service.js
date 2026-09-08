const { thresholds, labels } = require('../config/relevance');

/**
 * Dynamically scores relevance based on configurable thresholds.
 * @param {number} matchCount - Number of distinct matched keywords
 * @returns {string} Relevance label ('Not Related', 'Possibly Related', 'Related')
 */
function scoreRelevance(matchCount) {
  const count = Number(matchCount) || 0;

  if (count <= thresholds.notRelatedMax) {
    return labels.NOT_RELATED;
  }
  if (count <= thresholds.possiblyRelatedMax) {
    return labels.POSSIBLY_RELATED;
  }
  return labels.RELATED;
}

module.exports = { scoreRelevance };

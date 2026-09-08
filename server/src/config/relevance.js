/**
 * Configurable relevance thresholds and labels for keyword scanning.
 * Default rules:
 *   - 0 matches: Not Related
 *   - 1–2 matches: Possibly Related
 *   - 3+ matches: Related
 */
module.exports = {
  thresholds: {
    notRelatedMax: 0,
    possiblyRelatedMax: 2,
  },
  labels: {
    NOT_RELATED: 'Not Related',
    POSSIBLY_RELATED: 'Possibly Related',
    RELATED: 'Related',
  },
};

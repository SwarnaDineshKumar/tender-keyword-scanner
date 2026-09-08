function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate singular and plural variants for a word.
 * Covers standard English pluralization (-s, -es, -ies) and common engineering terms.
 */
function wordForms(word) {
  const forms = new Set([word]);

  if (word.endsWith('ies') && word.length > 3) {
    forms.add(`${word.slice(0, -3)}y`);
  } else if (word.endsWith('es') && /(s|x|z|ch|sh)es$/.test(word) && word.length > 3) {
    forms.add(word.slice(0, -2));
  } else if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) {
    forms.add(word.slice(0, -1));
  }

  if (word.endsWith('y') && word.length > 1 && !'aeiou'.includes(word[word.length - 2])) {
    forms.add(`${word.slice(0, -1)}ies`);
  } else if (/(s|x|z|ch|sh)$/.test(word)) {
    forms.add(`${word}es`);
  } else if (!word.endsWith('s')) {
    forms.add(`${word}s`);
  }

  // Common engineering verb/noun variants:
  // e.g., tensioning <-> tension, tensioned, tensionings
  if (word.endsWith('ing') && word.length > 4) {
    const base = word.slice(0, -3);
    forms.add(`${word}s`);
    forms.add(base);
    forms.add(`${base}ed`);
  }

  return [...forms];
}

/**
 * Generate phrase variants by varying the terminal noun/verb forms
 */
function phraseVariants(phrase) {
  const normalized = normalizeText(phrase);
  const words = normalized.split(' ').filter(Boolean);
  if (words.length === 0) return [];

  const last = words[words.length - 1];
  const prefix = words.slice(0, -1).join(' ');
  const variants = new Set();

  for (const form of wordForms(last)) {
    variants.add(prefix ? `${prefix} ${form}` : form);
  }

  return [...variants];
}

/**
 * Build a regular expression that matches a phrase with:
 * 1. Word boundaries (not matching inside words like "donut" for "nut")
 * 2. Flexible spacing between words
 * 3. Flexible hyphens (matching both "pre-tensioning" and "pre tensioning")
 */
function buildPhraseRegex(phraseVariant) {
  const words = phraseVariant.split(' ').filter(Boolean);
  const escapedWords = words.map((w) => {
    // Replace hyphens with regex allowing hyphen, space, or none
    const parts = w.split('-');
    return parts.map(escapeRegex).join('[- ]?');
  });

  const pattern = '(?<![a-zA-Z0-9])' + escapedWords.join('\\s+') + '(?![a-zA-Z0-9])';
  return new RegExp(pattern, 'i');
}

/**
 * Finds a matching variant in the haystack using word boundaries.
 */
function findVariant(haystack, variant) {
  const regex = buildPhraseRegex(variant);
  const match = regex.exec(haystack);
  if (!match) return null;
  return { index: match.index, length: match[0].length };
}

/**
 * Deterministically match keywords in text.
 * - Case-insensitive
 * - Complete keyword phrases with singular/plural support
 * - Word boundary safe (no substring false positives like 'donut splitter' for 'nut splitter')
 * - Does not double-count repeated keywords
 *
 * @param {string} text - Input text
 * @param {string[]} keywords - Configured keyword list
 * @returns {{ matchedKeywords: string[], matchCount: number }}
 */
function matchKeywords(text, keywords) {
  let haystack = normalizeText(text);
  const list = Array.isArray(keywords) ? keywords.filter(Boolean) : [];

  // Sort by length descending so longer specific phrases (e.g. "Hydraulic torque wrench")
  // match before shorter sub-phrases (e.g. "Torque wrench") on the same occurrence
  const sorted = [...list].sort((a, b) => b.length - a.length);
  const hitSet = new Set();

  for (const keyword of sorted) {
    const variants = phraseVariants(keyword);
    let found = null;

    for (const variant of variants) {
      found = findVariant(haystack, variant);
      if (found) break;
    }

    if (!found) continue;

    hitSet.add(keyword);

    // Blank out the matched span so that shorter phrases contained entirely within
    // this matched phrase do not double-count on this exact occurrence
    haystack =
      haystack.slice(0, found.index) +
      ' '.repeat(found.length) +
      haystack.slice(found.index + found.length);
  }

  // Preserve original keyword order from configuration
  const matchedKeywords = list.filter((keyword) => hitSet.has(keyword));

  return {
    matchedKeywords,
    matchCount: matchedKeywords.length,
  };
}

module.exports = { matchKeywords, normalizeText, phraseVariants, wordForms };

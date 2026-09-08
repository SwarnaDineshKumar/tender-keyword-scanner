const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '..', 'config', 'keywords.json');
const CSV_PATH = path.join(__dirname, '..', 'config', 'keywords.csv');

let cached = null;

function parseCsv(contents) {
  const lines = contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const start = /^keyword$/i.test(lines[0]) ? 1 : 0;
  const keywords = [];
  const seen = new Set();

  for (let i = start; i < lines.length; i += 1) {
    const keyword = lines[i].replace(/^"|"$/g, '').trim();
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    keywords.push(keyword);
  }

  return keywords;
}

function loadKeywords(reload = false) {
  if (cached && !reload) return cached;

  if (fs.existsSync(JSON_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
      if (Array.isArray(data)) {
        cached = data.map((k) => String(k).trim()).filter(Boolean);
        return cached;
      }
    } catch (e) {
      console.warn('Failed to parse keywords.json, falling back to CSV', e);
    }
  }

  if (fs.existsSync(CSV_PATH)) {
    const contents = fs.readFileSync(CSV_PATH, 'utf8');
    cached = parseCsv(contents);
    return cached;
  }

  cached = [];
  return cached;
}

module.exports = { loadKeywords, JSON_PATH, CSV_PATH };

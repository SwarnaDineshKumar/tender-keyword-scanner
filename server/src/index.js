const express = require('express');
const cors = require('cors');
const { port } = require('./config/env');
const scanRoutes = require('./routes/scan.routes');
const { loadKeywords } = require('./utils/keywords');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'Tritorc Tender Keyword Scanner API',
    health: '/api/health',
    keywords: '/api/keywords',
    scan: 'POST /api/scan',
  });
});

app.use('/api', scanRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  const keywords = loadKeywords();
  console.log(`Loaded ${keywords.length} keywords for scanning.`);

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});

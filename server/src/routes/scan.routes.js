const express = require('express');
const { handleUpload } = require('../middleware/upload');
const { health, getKeywords, scan } = require('../controllers/scan.controller');

const router = express.Router();

router.get('/health', health);
router.get('/keywords', getKeywords);
router.post('/scan', handleUpload, scan);

module.exports = router;

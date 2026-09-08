const { maxFileSizeBytes, maxFiles } = require('../config/env');
const multer = require('multer');

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
    files: maxFiles,
  },
});

function getExtension(filename = '') {
  const match = filename.toLowerCase().match(/\.[^.]+$/);
  return match ? match[0] : '';
}

function isAllowedFile(file) {
  return ALLOWED_EXTENSIONS.has(getExtension(file.originalname));
}

function handleUpload(req, res, next) {
  upload.array('files', maxFiles)(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          error: `Each file must be ${Math.round(maxFileSizeBytes / (1024 * 1024))}MB or smaller`,
        });
        return;
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({
          error: `Upload at most ${maxFiles} files using the field name "files"`,
        });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    next(err);
  });
}

module.exports = { handleUpload, isAllowedFile, getExtension, ALLOWED_EXTENSIONS };

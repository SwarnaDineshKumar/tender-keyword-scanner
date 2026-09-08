const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
  port: Number(process.env.PORT) || 4000,
  maxFileSizeBytes: 15 * 1024 * 1024,
  maxFiles: 10,
};

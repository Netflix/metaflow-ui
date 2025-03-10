const importPaths = require('./import-alias.config');

module.exports = {
  webpack: {
    alias: importPaths,
  },
};

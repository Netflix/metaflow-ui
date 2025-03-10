const path = require('path');

const importAliasPaths = {
  '@': path.resolve(__dirname, 'src'),
  '@assets': path.resolve(__dirname, 'src/assets'),
  '@theme': path.resolve(__dirname, 'src/theme'),
  '@translations': path.resolve(__dirname, 'src/translations'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@pages': path.resolve(__dirname, 'src/pages'),
  '@utils': path.resolve(__dirname, 'src/utils'),
};

module.exports = importAliasPaths;

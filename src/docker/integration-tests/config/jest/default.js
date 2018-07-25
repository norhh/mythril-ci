/* eslint-disable import/no-commonjs */

module.exports = {
  rootDir: '../..',
  testMatch: ['**/__tests__/**/*.js?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  setupFiles: [
    '<rootDir>/config/jest/setup.js',
  ],
};

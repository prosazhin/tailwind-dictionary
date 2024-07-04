const esLintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  esLintConfigPrettier,
  {
    files: ['**/*.js'],
    rules: {
      curly: 'error',
      'no-shadow': 'error',
      'no-nested-ternary': 'error',
    },
  },
];

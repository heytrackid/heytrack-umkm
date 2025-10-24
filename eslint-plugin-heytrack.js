/**
 * ESLint plugin to enforce using logger instead of console methods
 */

const noConsoleUsage = require('./eslint-rules/no-console-usage');

module.exports = {
  rules: {
    'no-console-usage': noConsoleUsage,
  },
  configs: {
    recommended: {
      rules: {
        'heytrack/no-console-usage': 'error',
      },
    },
  },
};
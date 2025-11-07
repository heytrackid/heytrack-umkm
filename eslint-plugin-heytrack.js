/**
 * ESLint plugin for HeyTrack custom rules
 */

import consistentErrorHandling from './eslint-rules/consistent-error-handling.js';
import noConsoleUsage from './eslint-rules/no-console-usage.js';

export default {
  rules: {
    'consistent-error-handling': consistentErrorHandling,
    'no-console-usage': noConsoleUsage,
  },
  configs: {
    recommended: {
      rules: {
        'heytrack/consistent-error-handling': 'error',
        'heytrack/no-console-usage': 'error',
      },
    },
  },
};
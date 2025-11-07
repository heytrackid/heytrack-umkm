/**
 * Custom ESLint rule to enforce using logger instead of console methods
 * This rule disallows direct console usage and suggests using proper logger
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct console usage in favor of proper logger',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noConsole: 'Use logger instead of console. Import logger from "@/lib/logger" and use apiLogger, dbLogger, etc. as appropriate.',
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'console' &&
          node.property.type === 'Identifier'
        ) {
          // Report the violation
          context.report({
            node: node,
            messageId: 'noConsole',
          });
        }
      },
      // Handle cases like console.log in function calls (e.g., promise.catch(console.error))
      Identifier(node) {
        if (node.name === 'console' && node.parent && node.parent.type === 'MemberExpression') {
          // Skip reporting if it's already handled by the MemberExpression rule
          return;
        }
      }
    };
  },
};
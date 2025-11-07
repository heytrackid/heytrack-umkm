/**
 * ESLint Rule: Consistent Error Handling
 *
 * Enforces consistent error variable naming in catch blocks.
 * Requires using 'error' instead of 'error', 'e', or other variations.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent error variable naming in catch blocks',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      inconsistentErrorName: 'Use "error" as the catch parameter name for consistency. Found: "{{name}}"',
    },
  },

  create(context) {
    return {
      CatchClause(node) {
        if (node.param && node.param.type === 'Identifier') {
          const paramName = node.param.name

          // Allow 'error' or '_error' (for unused errors)
          if (paramName !== 'error' && paramName !== '_error') {
            context.report({
              node: node.param,
              messageId: 'inconsistentErrorName',
              data: {
                name: paramName,
              },
              fix(fixer) {
                // Auto-fix: rename to 'error'
                const fixes = []

                // Fix the parameter declaration
                fixes.push(fixer.replaceText(node.param, 'error'))

                // Note: In ESLint 9, scope analysis is more complex
                // For now, we'll just fix the parameter name
                // Full scope-based fixing would require additional implementation

                return fixes
              },
            })
          }
        }
      },
    }
  },
}

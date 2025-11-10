#!/bin/bash

# Script to fix hardcoded colors in codebase
# Replace with CSS variables

echo "🔍 Fixing hardcoded colors in codebase..."

# Replace text-gray-* with semantic colors
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/text-gray-900/text-foreground/g' \
  -e 's/text-gray-800/text-foreground/g' \
  -e 's/text-gray-700/text-muted-foreground/g' \
  -e 's/text-gray-600/text-muted-foreground/g' \
  -e 's/text-gray-500/text-muted-foreground/g' \
  -e 's/text-slate-900/text-foreground/g' \
  -e 's/text-slate-800/text-foreground/g' \
  -e 's/text-slate-700/text-muted-foreground/g' \
  -e 's/text-slate-600/text-muted-foreground/g' \
  -e 's/text-slate-500/text-muted-foreground/g' \
  {} \;

# Replace bg-gray-* with semantic colors
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/bg-gray-50/bg-muted/g' \
  -e 's/bg-gray-100/bg-secondary/g' \
  -e 's/bg-gray-200/bg-muted/g' \
  -e 's/bg-gray-800/bg-card/g' \
  -e 's/bg-gray-900/bg-card/g' \
  -e 's/bg-gray-950/bg-background/g' \
  {} \;

# Replace border-gray-* with semantic colors
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/border-gray-200/border-border/g' \
  -e 's/border-gray-300/border-border/g' \
  -e 's/border-gray-400/border-border/g' \
  -e 's/border-gray-700/border-border/g' \
  -e 's/border-gray-800/border-border/g' \
  {} \;

# Replace text-white with semantic colors (context-dependent, be careful)
# This is commented out as it needs manual review
# find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
#   -e 's/text-white/text-primary-foreground/g' \
#   {} \;

# Replace bg-white with semantic colors
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/bg-white dark:bg-gray-900/bg-card/g' \
  -e 's/bg-white dark:bg-gray-800/bg-card/g' \
  {} \;

echo "✅ Done! Please review the changes and test thoroughly."
echo "⚠️  Note: text-white and bg-white replacements need manual review."

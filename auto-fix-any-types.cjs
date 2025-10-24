#!/usr/bin/env node

/**
 * TypeScript Any Type Auto-Fixer
 * Automatically fixes common 'any' type patterns
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  rootDir: path.join(__dirname),
  maxFiles: 10, // Limit to avoid too many changes at once
  backup: true
};

/**
 * Common type replacements
 */
const TYPE_REPLACEMENTS = {
  // Function parameters
  'function\\s*\\([^)]*\\bany\\b[^)]*\\)': {
    'any': 'unknown',
    description: 'Function parameter any -> unknown'
  },

  // Variable declarations
  '\\b(const|let|var)\\s+\\w+\\s*:\\s*any\\b': {
    'any': 'unknown',
    description: 'Variable declaration any -> unknown'
  },

  // Generic types
  '\\bPromise<any>': {
    'Promise<any>': 'Promise<unknown>',
    description: 'Promise<any> -> Promise<unknown>'
  },

  // Array types
  '\\bany\\[\\]': {
    'any[]': 'unknown[]',
    description: 'any[] -> unknown[]'
  },

  // Object types
  '\\{[^}]*\\bany\\b[^}]*\\}': {
    'any': 'unknown',
    description: 'Object property any -> unknown'
  }
};

/**
 * Find and fix 'any' types in a file
 */
function fixAnyTypesInFile(filePath) {
  console.log(`🔧 Processing: ${path.relative(CONFIG.rootDir, filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  const originalContent = content;

  // Apply each replacement pattern
  Object.entries(TYPE_REPLACEMENTS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'g');

    // Count matches before replacement
    const matches = content.match(regex);
    if (matches) {
      console.log(`  📝 ${replacement.description}: ${matches.length} matches`);

      // Apply replacement
      content = content.replace(regex, (match) => {
        return match.replace(new RegExp('\\bany\\b', 'g'), replacement.any || 'unknown');
      });

      changes += matches.length;
    }
  });

  // Additional specific replacements
  const additionalReplacements = [
    // Function parameters like (data: any) => (data: unknown)
    { pattern: /\((\w+):\s*any\)/g, replacement: '($1: unknown)' },
    // Interface properties like prop: any;
    { pattern: /(\w+):\s*any;/g, replacement: '$1: unknown;' },
    // Generic constraints like <T extends any>
    { pattern: /<(\w+)\s+extends\s+any>/g, replacement: '<$1 extends unknown>' }
  ];

  additionalReplacements.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  📝 Custom replacement: ${matches.length} matches`);
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  });

  // Write back if changes were made
  if (content !== originalContent) {
    if (CONFIG.backup) {
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, originalContent);
      console.log(`  💾 Backup created: ${path.relative(CONFIG.rootDir, backupPath)}`);
    }

    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${changes} any types`);
    return changes;
  }

  console.log(`  ℹ️ No changes needed`);
  return 0;
}

/**
 * Get files with most 'any' usage
 */
function getTopAnyFiles(limit = CONFIG.maxFiles) {
  const srcDir = path.join(CONFIG.rootDir, 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found');
    return [];
  }

  const files = [];

  function scanDir(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
        scanDir(fullPath);
      } else if (stat.isFile() && ['.ts', '.tsx'].includes(path.extname(item))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const anyCount = (content.match(/\bany\b/g) || []).length;

        if (anyCount > 0) {
          files.push({ path: fullPath, count: anyCount });
        }
      }
    }
  }

  scanDir(srcDir);
  return files.sort((a, b) => b.count - a.count).slice(0, limit);
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 TypeScript Any Type Auto-Fixer\n');

  const topFiles = getTopAnyFiles();
  console.log(`📁 Found ${topFiles.length} files with most 'any' usage\n`);

  let totalFixed = 0;
  let filesProcessed = 0;

  for (const file of topFiles) {
    console.log(`\n${'='.repeat(60)}`);
    const fixed = fixAnyTypesInFile(file.path);
    totalFixed += fixed;
    filesProcessed++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Auto-fix complete!');
  console.log(`📊 Summary:`);
  console.log(`   • Files processed: ${filesProcessed}`);
  console.log(`   • Total 'any' types fixed: ${totalFixed}`);
  console.log(`   • Backup files created: ${totalFixed > 0 ? 'Yes' : 'No'}`);

  if (totalFixed > 0) {
    console.log(`\n💡 Next steps:`);
    console.log(`   • Run 'npm run type-check' to verify changes`);
    console.log(`   • Check backup files if you need to revert`);
    console.log(`   • Consider adding specific interface types for better type safety`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixAnyTypesInFile, getTopAnyFiles, TYPE_REPLACEMENTS };

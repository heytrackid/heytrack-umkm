#!/usr/bin/env node

/**
 * TypeScript Any Type Fixer Script
 * This script helps identify and fix 'any' type usage in the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludeDirs: ['node_modules', '.next', 'dist', 'build', '.git'],
  reportFile: 'type-any-report.json'
};

/**
 * Recursively find all TypeScript/JavaScript files
 */
function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!CONFIG.excludeDirs.includes(item)) {
        findFiles(fullPath, files);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (CONFIG.extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Extract 'any' type usage from a file
 */
function extractAnyTypes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const anyTypes = [];
  let inComment = false;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let processedLine = line;

    // Handle multi-line comments
    if (processedLine.includes('/*')) inComment = true;
    if (processedLine.includes('*/')) inComment = false;

    // Handle strings
    if (!inComment) {
      for (let j = 0; j < processedLine.length; j++) {
        const char = processedLine[j];
        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && processedLine[j-1] !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
    }

    // Find 'any' types (only outside comments and strings)
    if (!inComment && !inString) {
      const anyRegex = /\bany\b/g;
      let match;
      while ((match = anyRegex.exec(processedLine)) !== null) {
        // Check context to avoid false positives
        const beforeChar = match.index > 0 ? processedLine[match.index - 1] : '';
        const afterChar = match.index + 3 < processedLine.length ? processedLine[match.index + 3] : '';

        // Skip if it's part of a word or in a comment/string
        if (!/\w/.test(beforeChar) && !/\w/.test(afterChar)) {
          anyTypes.push({
            line: i + 1,
            column: match.index + 1,
            context: processedLine.trim(),
            file: path.relative(CONFIG.rootDir, filePath)
          });
        }
      }
    }

    // Reset comment flag for next line
    if (inComment && !processedLine.includes('/*')) {
      inComment = false;
    }
  }

  return anyTypes;
}

/**
 * Analyze 'any' type usage and suggest fixes
 */
function analyzeAnyTypes(anyTypes) {
  const analysis = {
    total: anyTypes.length,
    byFile: {},
    suggestions: []
  };

  // Group by file
  anyTypes.forEach(item => {
    if (!analysis.byFile[item.file]) {
      analysis.byFile[item.file] = [];
    }
    analysis.byFile[item.file].push(item);
  });

  // Generate suggestions
  anyTypes.forEach(item => {
    const suggestion = analyzeContext(item);
    if (suggestion) {
      analysis.suggestions.push({
        ...item,
        suggestion
      });
    }
  });

  return analysis;
}

/**
 * Analyze context to suggest proper types
 */
function analyzeContext(anyType) {
  const context = anyType.context.toLowerCase();

  // Function parameters
  if (context.includes('function') || context.includes('=>') || context.includes('(')) {
    if (context.includes('event') || context.includes('e:')) {
      return 'React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>';
    }
    if (context.includes('error') || context.includes('err')) {
      return 'Error | unknown';
    }
    if (context.includes('data') || context.includes('result')) {
      return 'Record<string, unknown>';
    }
    if (context.includes('item') || context.includes('element')) {
      return 'unknown';
    }
  }

  // Variables
  if (context.includes('const') || context.includes('let') || context.includes('var')) {
    if (context.includes('user') || context.includes('profile')) {
      return 'User';
    }
    if (context.includes('recipe') || context.includes('resep')) {
      return 'Recipe';
    }
    if (context.includes('order') || context.includes('pesanan')) {
      return 'Order';
    }
    if (context.includes('ingredient') || context.includes('bahan')) {
      return 'Ingredient';
    }
    if (context.includes('data') || context.includes('response')) {
      return 'Record<string, unknown>';
    }
  }

  // Generic fallback
  return 'unknown';
}

/**
 * Generate HTML report
 */
function generateHTMLReport(analysis) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeScript Any Type Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #495057; }
        .stat-label { color: #6c757d; margin-top: 5px; }
        .files { padding: 0 30px 30px; }
        .file-card { margin-bottom: 20px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .file-header { background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #e9ecef; font-weight: 600; }
        .file-content { padding: 0; }
        .any-item { padding: 15px 20px; border-bottom: 1px solid #f8f9fa; display: flex; justify-content: space-between; align-items: center; }
        .any-item:last-child { border-bottom: none; }
        .any-location { font-family: 'Monaco', 'Menlo', monospace; font-size: 0.9rem; color: #6c757d; }
        .any-context { flex: 1; margin: 0 20px; font-family: 'Monaco', 'Menlo', monospace; background: #f8f9fa; padding: 5px 10px; border-radius: 4px; }
        .suggestion { background: #d4edda; color: #155724; padding: 5px 10px; border-radius: 4px; font-weight: 500; }
        .summary { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 TypeScript Any Type Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${analysis.total}</div>
                <div class="stat-label">Total 'any' Types</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(analysis.byFile).length}</div>
                <div class="stat-label">Files Affected</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${analysis.suggestions.length}</div>
                <div class="stat-label">Suggestions Available</div>
            </div>
        </div>

        <div class="summary">
            <h3>📋 Summary</h3>
            <p>This report shows all instances of 'any' type usage in your TypeScript codebase. Using 'any' defeats the purpose of TypeScript's type safety. Consider replacing them with more specific types.</p>
            <p><strong>Quick fixes:</strong> Replace 'any' with 'unknown' for safer type checking, or use specific interface/object types when possible.</p>
        </div>

        <div class="files">
            <h2>📁 Files with 'any' Types</h2>
            ${Object.entries(analysis.byFile).map(([file, items]) => `
                <div class="file-card">
                    <div class="file-header">${file} (${items.length} instances)</div>
                    <div class="file-content">
                        ${items.map((item, index) => `
                            <div class="any-item">
                                <div class="any-location">Line ${item.line}:${item.column}</div>
                                <div class="any-context">${item.context}</div>
                                ${analysis.suggestions.find(s => s.line === item.line && s.file === item.file)?.suggestion ?
                                    `<div class="suggestion">${analysis.suggestions.find(s => s.line === item.line && s.file === item.file).suggestion}</div>` :
                                    '<div class="suggestion">unknown</div>'
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(CONFIG.rootDir, 'type-any-report.html'), html);
  return html;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Analyzing TypeScript any types...\n');

  // Find all relevant files
  const files = findFiles(CONFIG.rootDir);
  console.log(`📁 Found ${files.length} files to analyze`);

  // Extract 'any' types
  const allAnyTypes = [];
  for (const file of files) {
    const anyTypes = extractAnyTypes(file);
    if (anyTypes.length > 0) {
      allAnyTypes.push(...anyTypes);
    }
  }

  console.log(`🎯 Found ${allAnyTypes.length} instances of 'any' type usage`);

  // Analyze and generate suggestions
  const analysis = analyzeAnyTypes(allAnyTypes);

  // Save JSON report
  fs.writeFileSync(
    path.join(CONFIG.rootDir, CONFIG.reportFile),
    JSON.stringify(analysis, null, 2)
  );

  // Generate HTML report
  generateHTMLReport(analysis);

  console.log('\n📊 Analysis complete!');
  console.log(`📄 JSON Report: ${CONFIG.reportFile}`);
  console.log(`🌐 HTML Report: type-any-report.html`);
  console.log('\n📈 Summary:');
  console.log(`   • Total 'any' types: ${analysis.total}`);
  console.log(`   • Files affected: ${Object.keys(analysis.byFile).length}`);
  console.log(`   • Suggestions available: ${analysis.suggestions.length}`);

  if (analysis.total > 0) {
    console.log('\n💡 Recommendations:');
    console.log('   • Replace \'any\' with \'unknown\' for safer type checking');
    console.log('   • Use specific interfaces when possible');
    console.log('   • Consider using utility types like Partial<T>, Pick<T>, etc.');
    console.log('   • Open the HTML report for detailed analysis');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findFiles, extractAnyTypes, analyzeAnyTypes, generateHTMLReport };

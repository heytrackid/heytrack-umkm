#!/usr/bin/env node
/**
 * Script to detect and analyze all remaining 'any' types in the codebase
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Define the source directory
const SRC_DIR = './src';

// Pattern to match different forms of 'any' usage
const ANY_PATTERNS = [
  /:\s*any/g,      // : any
  /as\s+any/g,     // as any
  /\bany\s*\|/g,   // any | (union)
  /\|\s*any\b/g,   // | any (union)
  /\bany\b/g       // standalone 'any' (but not in comments)
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/
];

function findFiles(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
      continue;
    }
    
    if (stat.isDirectory()) {
      results = results.concat(findFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(item)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

function analyzeAnyUsage() {
  const files = findFiles(SRC_DIR);
  const results = [];
  let totalCount = 0;
  
  console.log('🔍 Analyzing files for "any" type usage...\n');
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for any patterns but exclude comment lines
      if (ANY_PATTERNS.some(pattern => pattern.test(line))) {
        // Check if it's in a comment (naive check for // or /*)
        const commentIndex = line.indexOf('//');
        const blockCommentStart = line.indexOf('/*');
        const blockCommentEnd = line.indexOf('*/');
        
        // Simple heuristic: if // appears before any pattern and patterns appear after it, likely a comment
        let isComment = false;
        
        for (const pattern of ANY_PATTERNS) {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const matchIndex = match.index;
            
            // Check if this occurrence is in a comment
            if (commentIndex !== -1 && matchIndex > commentIndex) {
              isComment = true;
              break;
            }
            if (blockCommentStart !== -1 && blockCommentEnd !== -1 && 
                matchIndex > blockCommentStart && matchIndex < blockCommentEnd) {
              isComment = true;
              break;
            }
          }
          if (isComment) break;
        }
        
        if (!isComment) {
          const lineContent = line.trim();
          results.push({
            file: path.relative('.', file),
            line: lineNum,
            content: lineContent,
            type: determineAnyType(lineContent)
          });
          totalCount++;
        }
      }
    }
  }
  
  return { results, totalCount };
}

function determineAnyType(line) {
  if (/:.*any/.test(line)) return 'annotation';
  if (/as\s+any/.test(line)) return 'assertion';
  if (/any\s*\|/.test(line) || /\|\s*any/.test(line)) return 'union';
  if (/\bany\[\]/.test(line)) return 'array';
  if (/\(\s*\w+\s*:\s*any\s*\)/.test(line)) return 'parameter';
  if (/catch\s*\(\s*\w+\s*:\s*any\s*\)/.test(line)) return 'catch';
  return 'general';
}

function generateReport(analysis) {
  const { results, totalCount } = analysis;
  
  console.log(`📊 Found ${totalCount} instances of 'any' type in ${results.length} lines across ${new Set(results.map(r => r.file)).size} files\n`);
  
  // Group by type
  const byType = {};
  for (const result of results) {
    if (!byType[result.type]) byType[result.type] = [];
    byType[result.type].push(result);
  }
  
  console.log('📋 Breakdown by type:');
  for (const [type, items] of Object.entries(byType)) {
    console.log(`  - ${type}: ${items.length} instances`);
  }
  
  console.log('\n📝 Details (first 20):');
  for (let i = 0; i < Math.min(20, results.length); i++) {
    const result = results[i];
    console.log(`  ${result.file}:${result.line} - ${result.type} - ${result.content}`);
  }
  
  if (results.length > 20) {
    console.log(`  ... and ${results.length - 20} more`);
  }
  
  // Save detailed report
  const report = {
    summary: {
      totalInstances: totalCount,
      totalFiles: new Set(results.map(r => r.file)).size,
      breakdown: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.length]))
    },
    details: results.slice(0, 100) // Limit details to first 100
  };
  
  fs.writeFileSync('any-types-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Detailed report saved to any-types-report.json');
}

// Run the analysis
const analysis = analyzeAnyUsage();
generateReport(analysis);

export { analyzeAnyUsage };
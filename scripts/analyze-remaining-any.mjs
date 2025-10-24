#!/usr/bin/env node
/**
 * Script to analyze and categorize the remaining 'any' type instances
 */

import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

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

function analyzeRemainingAnyTypes() {
  const files = findFiles(SRC_DIR);
  const results = [];
  const patterns = {
    'reactComponentProps': [],
    'callbackParameters': [],
    'promiseTypes': [],
    'interfaceProperties': [],
    'comments': [],
    'other': []
  };
  
  console.log('🔍 Analyzing remaining "any" type patterns...\n');
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Skip comment lines (ones that start with // or contain // with 'any' after it)
      const commentIndex = line.indexOf('//');
      const isCommentLine = line.trim().startsWith('//');
      const hasAnyAfterComment = commentIndex !== -1 && line.substring(commentIndex).includes(' any');
      
      if (isCommentLine) continue; // Skip if entire line is comment
      
      if (hasAnyAfterComment) {
        // Check if 'any' appears before the comment marker (meaning it's actual code)
        const anyIndex = line.toLowerCase().indexOf('any');
        if (anyIndex < commentIndex) {
          // 'any' appears in code before comment, so process it
        } else {
          // 'any' only appears in comment, skip
          continue;
        }
      }
      
      // Check for actual type annotations
      if (/\bany\b/.test(line) && !/\/\*.*\bany\b.*\*\//.test(line)) {
        const context = line.trim();
        
        // Categorize the pattern
        let categorized = false;
        
        if (context.includes('({') && context.includes('}: any)')) {
          // React component props destructuring
          patterns.reactComponentProps.push({ file, line: lineNum, content: context, type: 'reactComponentProps' });
          categorized = true;
        } else if (context.includes('=> {') && context.includes(': any')) {
          // Function parameters
          patterns.callbackParameters.push({ file, line: lineNum, content: context, type: 'callbackParameters' });
          categorized = true;
        } else if (context.includes('Promise<any>')) {
          // Promise types
          patterns.promiseTypes.push({ file, line: lineNum, content: context, type: 'promiseTypes' });
          categorized = true;
        } else if (context.includes('?: any') || context.includes(': any')) {
          // Interface/object properties
          patterns.interfaceProperties.push({ file, line: lineNum, content: context, type: 'interfaceProperties' });
          categorized = true;
        }
        
        if (!categorized) {
          patterns.other.push({ file, line: lineNum, content: context, type: 'other' });
        }
        
        results.push({
          file: path.relative('.', file),
          line: lineNum,
          content: context,
          type: categorized ? Object.keys(patterns).find(key => patterns[key].includes(results[results.length-1])) : 'other'
        });
      }
    }
  }
  
  console.log(`📊 Found ${results.length} actual "any" type instances (excluding comments)\n`);
  
  // Print summary by category
  for (const [category, items] of Object.entries(patterns)) {
    if (items.length > 0) {
      console.log(`📋 ${category.toUpperCase()}: ${items.length} instances`);
      for (let i = 0; i < Math.min(3, items.length); i++) {
        console.log(`    ${items[i].file}:${items[i].line} - ${items[i].content}`);
      }
      if (items.length > 3) {
        console.log(`    ... and ${items.length - 3} more`);
      }
      console.log('');
    }
  }
  
  return { results, patterns };
}

// Run the analysis
const analysis = analyzeRemainingAnyTypes();

// Save categorized results
const report = {
  summary: {
    totalInstances: analysis.results.length,
    categories: Object.fromEntries(
      Object.entries(analysis.patterns).map(([key, value]) => [key, value.length])
    )
  },
  details: analysis.results.slice(0, 100) // Limit details
};

fs.writeFileSync('remaining-any-types-analysis.json', JSON.stringify(report, null, 2));
console.log('💾 Analysis report saved to remaining-any-types-analysis.json');

export { analyzeRemainingAnyTypes };
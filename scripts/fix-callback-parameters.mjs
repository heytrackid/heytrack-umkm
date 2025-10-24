#!/usr/bin/env node
/**
 * Script to fix callback and event handler parameters with 'any' type
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

function fixCallbackParameters() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing callback function parameters (any → unknown or specific types)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix function callback parameters like: (action: string, data?: any) => void
    content = content.replace(/\(action: string, data\?: any\) => void/g, '(action: string, data?: unknown) => void');
    
    // Fix array map callbacks with destructuring like: ([tier, data]: [string, any])
    content = content.replace(/\(\[([^,\]]+), ([^\]]+)\]: \[string, any\]\)/g, '([$1, $2]: [string, unknown])');
    
    // Fix generic callback parameters in function types
    content = content.replace(/\(.*?: any\)(?=\s*=>)/g, (match) => {
      // More careful replacement to avoid breaking legitimate code
      if (/\w+: any/.test(match)) {
        return match.replace(/: any/g, ': unknown');
      }
      return match;
    });
    
    // Fix event handler parameters like onClick, etc.
    content = content.replace(/\(event: any\)/g, '(event: unknown)');
    content = content.replace(/\(e: any\)/g, '(e: unknown)');
    
    // Replace specific callback patterns that are likely function parameters
    content = content.replace(/=>\s*any(?=\s*[,}])/g, '=> unknown');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/: unknown/g) || []).length - 
                         (originalContent.match(/: unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} callback parameters in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total callback parameters fixed: ${totalFixed}`);
  return totalFixed;
}

function fixArrayMapCallbackParameters() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing array map callback parameters (e.g., ([key, value]: [string, any]))...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // More specific targeting for object/array destructuring in callbacks
    content = content.replace(/\(\[([a-zA-Z_$][\w$]*), ([a-zA-Z_$][\w$]*)\]: \[string, any\]\)/g, 
                             '([$1, $2]: [string, unknown])');
    
    // Handle object destructuring in callbacks
    content = content.replace(/\(\{[^}]*\}: any\)(?=\s*=>)/g, 
                             '({ ...props }: { [key: string]: unknown })');
    
    // More conservative approach: replace specific problematic patterns
    content = content.replace(/\[string, any\]/g, '[string, unknown]');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/\[string, unknown\]/g) || []).length - 
                         (originalContent.match(/\[string, unknown\]/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} array callback parameters in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total array callback parameters fixed: ${totalFixed}`);
  return totalFixed;
}

function fixObjectIndexSignatures() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing object index signatures ([key: string]: any → [key: string]: unknown)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace index signatures [key: string]: any with [key: string]: unknown
    content = content.replace(/\[key: string\]: any/g, '[key: string]: unknown');
    
    // Also handle number index signatures
    content = content.replace(/\[key: number\]: any/g, '[key: number]: unknown');
    content = content.replace(/\[index: number\]: any/g, '[index: number]: unknown');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/\[key: string\]: unknown/g) || []).length - 
                         (originalContent.match(/\[key: string\]: unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} object index signatures in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total object index signatures fixed: ${totalFixed}`);
  return totalFixed;
}

function fixComplexCallbackPatterns() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing complex callback patterns...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix the specific Object.entries case in smart-pricing-assistant.tsx
    content = content.replace(/\[string, any\](?=\s*\)\s*=>)/g, '[string, unknown]');
    
    // Handle generic type parameters in callbacks
    content = content.replace(/React\.ComponentType<any>/g, 'React.ComponentType<unknown>');
    content = content.replace(/React\.FC<any>/g, 'React.FC<unknown>');
    
    // Handle generic function types
    content = content.replace(/=> any(?=\s*[,}])/g, '=> unknown');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/: unknown/g) || []).length + 
                         (content.match(/\[string, unknown\]/g) || []).length - 
                         (originalContent.match(/: unknown/g) || []).length - 
                         (originalContent.match(/\[string, unknown\]/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} complex callback patterns in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total complex callback patterns fixed: ${totalFixed}`);
  return totalFixed;
}

// Run all fixes
const callbackParamsFixed = fixCallbackParameters();
const arrayCallbackFixed = fixArrayMapCallbackParameters();
const objectIndexFixed = fixObjectIndexSignatures();
const complexPatternsFixed = fixComplexCallbackPatterns();

console.log(`\n🎯 Summary:`);
console.log(`   Callback parameters: ${callbackParamsFixed}`);
console.log(`   Array callback parameters: ${arrayCallbackFixed}`);
console.log(`   Object index signatures: ${objectIndexFixed}`);
console.log(`   Complex callback patterns: ${complexPatternsFixed}`);
console.log(`   Total changes made: ${callbackParamsFixed + arrayCallbackFixed + objectIndexFixed + complexPatternsFixed}`);
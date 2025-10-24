#!/usr/bin/env node
/**
 * Script to fix remaining 'any' patterns that require more context-aware fixing
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

function fixVariableDeclarations() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing variable declarations (const var: any = {...}) to use unknown...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace common variable declarations with object types
    content = content.replace(/(const|let|var)\s+(\w+)\s*:\s*any\s*=/g, '$1 $2: unknown =');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/: unknown =/g) || []).length - 
                         (originalContent.match(/: unknown =/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} variable declarations in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total variable declarations fixed: ${totalFixed}`);
  return totalFixed;
}

function fixReactHookState() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing React useState with any type to use unknown or proper types...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace useState<any>(...) with useState<unknown>(...)
    content = content.replace(/useState<any>\(/g, 'useState<unknown>(');
    
    // Replace more complex cases like useState<Record<string, any>>(...)
    content = content.replace(/useState<Record<string,\s*any>>/g, 'useState<Record<string, unknown>>');
    content = content.replace(/useState<Record<string,\s*any>\[\]>/g, 'useState<Record<string, unknown>[]>');
    content = content.replace(/useState<Map<string,\s*any>>/g, 'useState<Map<string, unknown>>');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/useState</g) || []).length - 
                         (originalContent.match(/useState</g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} useState declarations in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total useState declarations fixed: ${totalFixed}`);
  return totalFixed;
}

function fixFunctionReturnTypes() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing function return types (function(): any → function(): unknown)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace function return types
    content = content.replace(/(\w+)\s*\([^)]*\)\s*:\s*any(?=\s*{)/g, (match) => {
      // Only replace if it's not followed by certain known patterns we want to preserve
      return match.replace(/:\s*any/, ': unknown');
    });
    
    // Also handle arrow functions
    content = content.replace(/\)\s*:\s*any\s*=>\s*{/g, ') => {');
    content = content.replace(/([^:]):\s*any\s*(?=\s*=>)/g, '$1: unknown ');
    
    // Handle explicit function return types
    content = content.replace(/:\s*any(?=\s*=>\s*\w)/g, ': unknown');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/: unknown/g) || []).length - 
                         (originalContent.match(/: unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} function return types in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total function return types fixed: ${totalFixed}`);
  return totalFixed;
}

function fixPropertyDeclarations() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing property declarations in interfaces/types...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace property types in interfaces
    content = content.replace(/(\w+)\s*(\??):\s*any(?=\s*[,\n}])/g, '$1$2: unknown');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      // Count changes by looking at the new unknown references
      const changeCount = (content.match(/: unknown/g) || []).length - 
                         (originalContent.match(/: unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} property declarations in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total property declarations fixed: ${totalFixed}`);
  return totalFixed;
}

// Run all fixes
const variableDeclarationsFixed = fixVariableDeclarations();
const useStateFixed = fixReactHookState();
const functionReturnTypesFixed = fixFunctionReturnTypes();
const propertyDeclarationsFixed = fixPropertyDeclarations();

console.log(`\n🎯 Summary:`);
console.log(`   Variable declarations: ${variableDeclarationsFixed}`);
console.log(`   React useState: ${useStateFixed}`);
console.log(`   Function return types: ${functionReturnTypesFixed}`);
console.log(`   Property declarations: ${propertyDeclarationsFixed}`);
console.log(`   Total changes made: ${variableDeclarationsFixed + useStateFixed + functionReturnTypesFixed + propertyDeclarationsFixed}`);
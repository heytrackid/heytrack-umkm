#!/usr/bin/env node
/**
 * Script to fix catch block parameters from (error: any) to (error: unknown)
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

function fixCatchBlocks() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing catch block parameters (error: any → error: unknown)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace (error: any) with (error: unknown) in catch blocks
    content = content.replace(
      /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g,
      (match, errorVar) => `catch (${errorVar}: unknown)`
    );
    
    // Count changes
    const changes = (content.match(new RegExp('catch\\s*\\([^)]+\\)', 'g')) || []).length - 
                  (originalContent.match(new RegExp('catch\\s*\\([^)]+\\)', 'g')) || []).length;
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/: unknown/g) || []).length - (originalContent.match(/: unknown/g) || []).length;
      totalFixed += changeCount;
      console.log(`  ✅ Fixed ${changeCount} catch blocks in ${path.relative('.', file)}`);
    }
  }
  
  console.log(`\n✅ Total catch blocks fixed: ${totalFixed}`);
  return totalFixed;
}

function fixParameterAnnotations() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing parameter annotations (param: any → param: unknown)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace direct parameter annotations: paramName: any
    content = content.replace(/(\w+)\s*:\s*any(?=\s*[,\)])/g, '$1: unknown');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/: unknown/g) || []).length - (originalContent.match(/: unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} parameter annotations in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total parameter annotations fixed: ${totalFixed}`);
  return totalFixed;
}

function fixArrayAnnotations() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing array annotations (any[] → unknown[])...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace any[] with unknown[]
    content = content.replace(/\bany\s*\[\s*\]/g, 'unknown[]');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/unknown\[\]/g) || []).length - (originalContent.match(/unknown\[\]/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} array annotations in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total array annotations fixed: ${totalFixed}`);
  return totalFixed;
}

function fixAsAnyAssertions() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing type assertions (as any → as unknown)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace 'as any' with 'as unknown' - but be careful with complex cases
    content = content.replace(/\s+as\s+any\b/g, ' as unknown');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/as unknown/g) || []).length - (originalContent.match(/as unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} type assertions in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total type assertions fixed: ${totalFixed}`);
  return totalFixed;
}

// Run all fixes
const catchBlocksFixed = fixCatchBlocks();
const paramsFixed = fixParameterAnnotations();
const arraysFixed = fixArrayAnnotations();
const assertionsFixed = fixAsAnyAssertions();

console.log(`\n🎯 Summary:`);
console.log(`   Catch blocks: ${catchBlocksFixed}`);
console.log(`   Parameter annotations: ${paramsFixed}`);
console.log(`   Array annotations: ${arraysFixed}`);
console.log(`   Type assertions: ${assertionsFixed}`);
console.log(`   Total changes made: ${catchBlocksFixed + paramsFixed + arraysFixed + assertionsFixed}`);
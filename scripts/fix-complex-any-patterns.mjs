#!/usr/bin/env node
/**
 * Script to fix remaining complex 'any' patterns
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

function fixRecordTypes() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing Record<string, any> patterns...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace Record<string, any> with Record<string, unknown>
    content = content.replace(/\bRecord<string,\s*any>/g, 'Record<string, unknown>');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/Record<string, unknown>/g) || []).length - 
                         (originalContent.match(/Record<string, unknown>/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} Record types in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total Record<string, any> patterns fixed: ${totalFixed}`);
  return totalFixed;
}

function fixGenericAny() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing generic type parameters (T = any → T = unknown)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace <T = any> with <T = unknown> in function and type definitions
    content = content.replace(/<([^>]*?)any([^>]*?)>/g, (match, before, after) => {
      // Check if it's a T = any pattern specifically
      if (/<[^>]*=\s*any/.test(match) || /=\s*any/.test(match)) {
        return match.replace(/\s*=\s*any\s*/g, ' = unknown ');
      }
      return match;
    });
    
    // More specific pattern matching for generic parameters
    content = content.replace(/<T\s*=\s*any>/g, '<T = unknown>');
    content = content.replace(/<T extends ComponentType<any>>/g, '<T extends ComponentType<unknown>>');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/= unknown/g) || []).length - 
                         (originalContent.match(/= unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} generic parameters in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total generic type parameters fixed: ${totalFixed}`);
  return totalFixed;
}

function fixComponentTypeAny() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing ComponentType<any> patterns...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace ComponentType<any> with ComponentType<unknown>
    content = content.replace(/\bComponentType<any>/g, 'ComponentType<unknown>');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/ComponentType<unknown>/g) || []).length - 
                         (originalContent.match(/ComponentType<unknown>/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} ComponentType patterns in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total ComponentType<any> patterns fixed: ${totalFixed}`);
  return totalFixed;
}

function fixMapValueTypes() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('\n🔧 Fixing Map value types (Map<string, any> → Map<string, unknown>)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace Map<string, any> with Map<string, unknown>
    content = content.replace(/\bMap<string,\s*any>/g, 'Map<string, unknown>');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/Map<string, unknown>/g) || []).length - 
                         (originalContent.match(/Map<string, unknown>/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} Map types in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total Map<string, any> patterns fixed: ${totalFixed}`);
  return totalFixed;
}

// Run all fixes
const recordTypesFixed = fixRecordTypes();
const genericTypesFixed = fixGenericAny();
const componentTypesFixed = fixComponentTypeAny();
const mapTypesFixed = fixMapValueTypes();

console.log(`\n🎯 Summary:`);
console.log(`   Record<string, any>: ${recordTypesFixed}`);
console.log(`   Generic parameters: ${genericTypesFixed}`);
console.log(`   ComponentType<any>: ${componentTypesFixed}`);
console.log(`   Map<string, any>: ${mapTypesFixed}`);
console.log(`   Total changes made: ${recordTypesFixed + genericTypesFixed + componentTypesFixed + mapTypesFixed}`);
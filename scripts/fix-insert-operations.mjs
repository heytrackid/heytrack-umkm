#!/usr/bin/env node

/**
 * Fix Supabase insert operations that have "never" type errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllTsFiles(dir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    try {
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...getAllTsFiles(fullPath));
      } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    } catch (e) {
      // Skip
    }
  }
  
  return files;
}

const apiDir = 'src/app/api';
const files = getAllTsFiles(apiDir);

let fixedFiles = 0;
let totalFixes = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let fileModified = false;
  let fileFixes = 0;

  // Fix .insert() operations - look for patterns like .insert([payload])
  const insertArrayRegex = /\.insert\(\[(\w+(?:Payload|Data|Record)?)\]\)/g;
  let match;
  const inserts = [];
  
  while ((match = insertArrayRegex.exec(content)) !== null) {
    const varName = match[1];
    const fullMatch = match[0];
    
    // Check if already has type casting
    if (!fullMatch.includes(' as any') && !fullMatch.includes(' as ')) {
      inserts.push({ index: match.index, varName, fullMatch });
    }
  }

  if (inserts.length > 0) {
    let offset = 0;
    for (const insert of inserts) {
      const newMatch = `.insert([${insert.varName}] as any)`;
      const adjustedIndex = insert.index + offset;
      content = content.substring(0, adjustedIndex) + 
                newMatch +
                content.substring(adjustedIndex + insert.fullMatch.length);
      offset += (newMatch.length - insert.fullMatch.length);
      fileFixes++;
    }
    fileModified = true;
  }

  // Fix single insert operations
  const insertSingleRegex = /\.insert\((\w+(?:Payload|Data|Record|update))\s*\)/g;
  const singleInserts = [];
  
  while ((match = insertSingleRegex.exec(content)) !== null) {
    const varName = match[1];
    const fullMatch = match[0];
    
    // Check if already has type casting
    const checkRegion = content.substring(match.index - 50, match.index + fullMatch.length + 50);
    if (!checkRegion.includes(' as any') && !checkRegion.includes(' as Record') && !fullMatch.includes('[')) {
      singleInserts.push({ index: match.index, varName, fullMatch });
    }
  }

  if (singleInserts.length > 0) {
    let offset = 0;
    for (const insert of singleInserts) {
      const newMatch = `.insert(${insert.varName} as any)`;
      const adjustedIndex = insert.index + offset;
      content = content.substring(0, adjustedIndex) + 
                newMatch +
                content.substring(adjustedIndex + insert.fullMatch.length);
      offset += (newMatch.length - insert.fullMatch.length);
      fileFixes++;
    }
    fileModified = true;
  }

  if (fileModified) {
    writeFileSync(file, content, 'utf-8');
    fixedFiles++;
    totalFixes += fileFixes;
    console.log(`✓ Fixed ${fileFixes} insert(s) in ${file}`);
  }
}

console.log(`\n✅ Total: Fixed ${totalFixes} inserts in ${fixedFiles} files`);

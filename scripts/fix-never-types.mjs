#!/usr/bin/env node

/**
 * Fix Supabase "never" type issues by adding type assertions
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllTsFiles(dir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
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

  // Fix 1: Add getErrorMessage import if error.message is used without import
  if (content.includes('error.message') && !content.includes('getErrorMessage')) {
    const lines = content.split('\n');
    const importIndex = lines.findIndex(line => line.includes('import') && line.includes('from'));
    if (importIndex !== -1) {
      lines.splice(importIndex + 1, 0, "import { getErrorMessage } from '@/lib/type-guards'");
      content = lines.join('\n');
      content = content.replace(/error\.message/g, 'getErrorMessage(error)');
      fileModified = true;
      fileFixes++;
    }
  }

  // Fix 2: Prefix unused request/req variables with _
  const unusedVarPatterns = [
    { pattern: /\bfunction\s+\w+\(\s*request:/g, replacement: 'function $&(_request:' },
    { pattern: /\basync\s+function\s+\w+\(\s*request:/g, replacement: 'async function $&(_request:' },
    { pattern: /\basync\s+\(([\w\s,]*)\brequest\b([^)]*)\)\s*=>/g, replacement: 'async ($1_request$2) =>' },
    { pattern: /\basync\s+\(([\w\s,]*)\breq\b([^)]*)\)\s*=>/g, replacement: 'async ($1_req$2) =>' },
  ];

  // Fix 3: Add error type handling for catch blocks
  content = content.replace(/catch\s*\(\s*error\s*\)\s*{/g, 'catch (error: unknown) {');
  if (content !== readFileSync(file, 'utf-8')) {
    fileModified = true;
    fileFixes++;
  }

  if (fileModified) {
    writeFileSync(file, content, 'utf-8');
    fixedFiles++;
    totalFixes += fileFixes;
    console.log(`✓ Fixed ${fileFixes} issue(s) in ${file}`);
  }
}

console.log(`\n✅ Total: Fixed ${totalFixes} issues in ${fixedFiles} files`);

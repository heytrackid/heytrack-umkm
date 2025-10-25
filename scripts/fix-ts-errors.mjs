#!/usr/bin/env node

/**
 * Batch fix common TypeScript errors
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

    // Fix 1: Replace error.message with getErrorMessage(error)
    if (content.includes('error.message') && !content.includes('import { getErrorMessage }')) {
      const regex = /catch\s*\(\s*error\s*:\s*unknown\s*\)\s*{[^}]*error\.message/g;
      if (regex.test(content)) {
        // Add import if needed
        if (!content.includes('getErrorMessage')) {
          const importRegex = /^(import\s+{[^}]*}\s+from\s+'@\/lib\/[^']+'\n)/m;
          const typeGuardsImport = "import { getErrorMessage } from '@/lib/type-guards'\n";
          
          if (importRegex.test(content)) {
            content = content.replace(importRegex, `$1${typeGuardsImport}`);
          } else {
            // Add at the beginning after other imports
            const firstImportEnd = content.indexOf('\n', content.indexOf('import'));
            if (firstImportEnd > 0) {
              content = content.slice(0, firstImportEnd + 1) + typeGuardsImport + content.slice(firstImportEnd + 1);
            }
          }
        }

        // Replace error.message with getErrorMessage(error)
        content = content.replace(/error\.message/g, 'getErrorMessage(error)');
        fileModified = true;
        fileFixes++;
      }
    }

    // Fix 2: Remove "as any" from Supabase operations
    const asAnyPatterns = [
      /\.update\((\w+)\s+as\s+any\)/g,
      /\.insert\(\[?(\w+)\]?\s+as\s+any\)/g,
    ];

    for (const pattern of asAnyPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match, varName) => {
          if (match.includes('.update')) {
            return `.update(${varName})`;
          } else if (match.includes('.insert')) {
            return match.includes('[') ? `.insert([${varName}])` : `.insert(${varName})`;
          }
          return match;
        });
        fileModified = true;
        fileFixes++;
      }
    }

    if (fileModified) {
      writeFileSync(file, content, 'utf-8');
      fixedFiles++;
      totalFixes += fileFixes;
      console.log(`✓ Fixed ${fileFixes} issue(s) in ${file}`);
    }
}

console.log(`\n✅ Total: Fixed ${totalFixes} issues in ${fixedFiles} files`);

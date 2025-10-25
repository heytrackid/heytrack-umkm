#!/usr/bin/env node

/**
 * Migrate API routes to use TypedSupabaseClient
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllApiFiles(dir) {
  const files = [];
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...getAllApiFiles(fullPath));
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Skip
  }
  return files;
}

const apiFiles = getAllApiFiles('src/app/api');
let fixedCount = 0;

for (const file of apiFiles) {
  try {
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    // Add typed client import if file uses Supabase
    if (content.includes('supabase.from') && !content.includes('TypedSupabaseClient')) {
      // Find last import
      const lines = content.split('\n');
      const lastImportIdx = lines.findLastIndex(line => line.startsWith('import '));
      
      if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0,
          "import { createTypedClient, hasData, hasArrayData, isQueryError } from '@/lib/supabase-typed-client'"
        );
        content = lines.join('\n');
        modified = true;
      }
    }

    // Replace Supabase operations with typed client
    const patterns = [
      // Select operations
      {
        pattern: /const\s+{\s*data:\s*(\w+),\s*error(?:\s*:\s*\w+)?\s*}\s*=\s*await\s+supabase\s*\.from\('(\w+)'\)\s*\.select\('?\*'?\)\s*\.eq\('id',\s*(\w+)\)\s*\.single\(\)/g,
        replacement: (match, dataVar, table, idVar) => {
          return `const typedClient = createTypedClient(supabase)\n    const result = await typedClient.selectOne('${table}', ${idVar})\n    if (isQueryError(result)) {\n      const error = result.error\n      // Handle error\n    }\n    const ${dataVar} = result.data`;
        }
      },
      // Update operations
      {
        pattern: /\.update\((\w+)\s+as\s+any\)/g,
        replacement: '.update($1 as any)'
      },
      // Insert operations
      {
        pattern: /\.insert\(\[?(\w+)\]?\s+as\s+any\)/g,
        replacement: '.insert($1 as any)'
      }
    ];

    // Note: Full migration would be too complex for script
    // Instead, we'll add the import and let developers migrate incrementally

    if (modified) {
      writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`✓ Added typed client import to ${file}`);
    }
  } catch (error) {
    console.log(`✗ Could not process ${file}: ${error.message}`);
  }
}

console.log(`\n✅ Added typed client imports to ${fixedCount} files`);
console.log('\n📝 Next steps:');
console.log('1. Manually replace Supabase operations with typed client methods');
console.log('2. Use hasData/hasArrayData type guards for better type inference');
console.log('3. Enable strict TypeScript settings');

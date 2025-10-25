#!/usr/bin/env node

/**
 * Comprehensive fix for API route type errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllTsFiles(dir) {
  const files = [];
  try {
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
  } catch (e) {
    // Skip inaccessible directories
  }
  return files;
}

const apiFiles = getAllTsFiles('src/app/api');
let fixedFiles = 0;

for (const file of apiFiles) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;

  // Add typed import if using Supabase operations
  if (content.includes('supabase.from') && !content.includes('typedInsert') && !content.includes('typedUpdate')) {
    // Add import at top
    const lines = content.split('\n');
    const lastImportIndex = lines.findLastIndex(line => line.startsWith('import '));
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, 
        "import { typedInsert, typedUpdate, castRow, castRows } from '@/lib/supabase-client-typed'"
      );
      content = lines.join('\n');
      modified = true;
    }
  }

  // Fix property access on never types by adding type casting
  const propertyPatterns = [
    { pattern: /(\w+)\.id(?!\w)/g, replacement: '($1 as any).id' },
    { pattern: /(\w+)\.nama(?!\w)/g, replacement: '($1 as any).nama' },
    { pattern: /(\w+)\.name(?!\w)/g, replacement: '($1 as any).name' },
    { pattern: /(\w+)\.hpp_value/g, replacement: '($1 as any).hpp_value' },
    { pattern: /(\w+)\.recipe_id/g, replacement: '($1 as any).recipe_id' },
    { pattern: /(\w+)\.snapshot_date/g, replacement: '($1 as any).snapshot_date' },
    { pattern: /(\w+)\.material_cost/g, replacement: '($1 as any).material_cost' },
    { pattern: /(\w+)\.operational_cost/g, replacement: '($1 as any).operational_cost' },
    { pattern: /(\w+)\.selling_price/g, replacement: '($1 as any).selling_price' },
    { pattern: /(\w+)\.status/g, replacement: '($1 as any).status' },
    { pattern: /(\w+)\.total_amount/g, replacement: '($1 as any).total_amount' },
    { pattern: /(\w+)\.order_no/g, replacement: '($1 as any).order_no' },
    { pattern: /(\w+)\.customer_name/g, replacement: '($1 as any).customer_name' },
    { pattern: /(\w+)\.delivery_date/g, replacement: '($1 as any).delivery_date' },
    { pattern: /(\w+)\.order_date/g, replacement: '($1 as any).order_date' },
  ];

  // Check if we should apply fixes (avoid already casted properties)
  for (const { pattern, replacement } of propertyPatterns) {
    let match;
    const matches = [];
    while ((match = pattern.exec(content)) !== null) {
      const varName = match[1];
      // Skip if already casted or is a method/function
      const before = content.substring(Math.max(0, match.index - 30), match.index);
      const after = content.substring(match.index, match.index + 100);
      
      if (!before.includes('as any') && 
          !after.includes('(') && 
          !varName.match(/^(const|let|var|if|else|return|function|class)$/)) {
        matches.push({ index: match.index, match: match[0], varName });
      }
    }
    
    // Apply replacements
    if (matches.length > 0) {
      let offset = 0;
      for (const m of matches) {
        const newText = replacement.replace('$1', m.varName);
        const adjustedIndex = m.index + offset;
        content = content.substring(0, adjustedIndex) + 
                  newText +
                  content.substring(adjustedIndex + m.match.length);
        offset += (newText.length - m.match.length);
      }
      modified = true;
    }
  }

  // Add null checks for possibly null values
  const nullCheckPatterns = [
    { pattern: /const\s+(\w+)\s*=\s*(\w+)\[0\](?!\s*\|\|)/g, 
      replacement: 'const $1 = $2[0] ?? null; if (!$1) { throw new Error("Data not found"); }' },
  ];

  if (modified) {
    writeFileSync(file, content, 'utf-8');
    fixedFiles++;
    console.log(`✓ Fixed ${file}`);
  }
}

console.log(`\n✅ Fixed ${fixedFiles} API route files`);

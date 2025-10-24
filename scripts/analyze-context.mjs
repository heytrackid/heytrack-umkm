#!/usr/bin/env node
/**
 * Script to analyze context around remaining 'any' instances to determine proper types
 */

import fs from 'fs';
import path from 'path';

const remainingAnyInstances = [
  { file: 'src/app/orders/types/orders.types.ts', line: 57, description: 'customer field in orders types' },
  { file: 'src/app/resep/types/production.types.ts', line: 59, description: 'recipe field in production types' },
  { file: 'src/app/resep/types/production.types.ts', line: 60, description: 'quality_inspector field in production types' },
  { file: 'src/components/ui/crud-form.tsx', line: 8, description: 'value field in crud form' },
  { file: 'src/lib/schemas.ts', line: 31, description: 'favorite_items in zod schema' },
  { file: 'src/lib/schemas.ts', line: 99, description: 'nutritional_info in zod schema' },
  { file: 'src/lib/schemas.ts', line: 125, description: 'nutritional_info in zod schema' },
  { file: 'src/lib/schemas.ts', line: 177, description: 'tags in zod schema' },
  { file: 'src/lib/schemas.ts', line: 178, description: 'metadata in zod schema' },
  { file: 'src/lib/search-filter.ts', line: 177, description: 'conditions in search filter' },
  { file: 'src/lib/settings-validation.ts', line: 119, description: 'data field in validation function' },
  { file: 'src/lib/type-guards.ts', line: 5, description: 'comment only' },
  { file: 'src/modules/recipes/services/EnhancedHPPCalculationService.ts', line: 467, description: 'pricingInsights field' },
  { file: 'src/types/errors.ts', line: 166, description: 'comment only' }
];

function getContext(filePath, targetLine, contextLines = 3) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const start = Math.max(0, targetLine - contextLines - 1);
    const end = Math.min(lines.length, targetLine + contextLines);
    
    const context = lines.slice(start, end).map((line, idx) => ({
      number: start + idx + 1,
      content: line
    }));
    
    return context;
  } catch (error) {
    return null;
  }
}

console.log('🔍 ANALYZING CONTEXT FOR REMAINING "ANY" INSTANCES');
console.log('='.repeat(80));

for (const instance of remainingAnyInstances) {
  console.log(`\\n📄 FILE: ${instance.file}:${instance.line}`);
  console.log(`📝 DESCRIPTION: ${instance.description}`);
  
  const context = getContext(instance.file, instance.line);
  if (context) {
    console.log('📋 CONTEXT:');
    context.forEach(ctx => {
      const marker = ctx.number === instance.line ? ' >> ' : '    ';
      const lineNum = String(ctx.number).padStart(3, ' ');
      console.log(`${marker}${lineNum}| ${ctx.content}`);
    });
  } else {
    console.log('❌ Could not read file context');
  }
  
  console.log('-'.repeat(80));
}

export { remainingAnyInstances, getContext };
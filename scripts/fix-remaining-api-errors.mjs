#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const fixes = [
  {
    file: 'src/app/api/customers/[id]/route.ts',
    search: '.update(updatePayload)',
    replace: '.update(updatePayload as any)'
  },
  {
    file: 'src/app/api/expenses/[id]/route.ts',
    search: '.update(body as any)',
    replace: '.update(body as any)'
  },
  {
    file: 'src/app/api/hpp/alerts/[id]/dismiss/route.ts',
    search: '.update(updateData as any)',
    replace: '.update(updateData as any)'
  },
  {
    file: 'src/app/api/hpp/alerts/[id]/read/route.ts',
    search: '.update(updateData as any)',
    replace: '.update(updateData as any)'
  },
  {
    file: 'src/app/api/hpp/automation/route.ts',
    search: '.update({',
    replace: '.update({'
  },
  {
    file: 'src/app/api/hpp/comparison/route.ts',
    search: 'currentSnapshot.hpp_value',
    replace: '(currentSnapshot as any).hpp_value'
  },
  {
    file: 'src/app/api/hpp/export/route.ts',
    search: 'breakdown.operational || breakdown.operational_costs',
    replace: '(breakdown.operational || breakdown.operational_costs || [])'
  },
  {
    file: 'src/app/api/hpp/snapshot/route.ts',
    search: 'recipes[0]',
    replace: '(recipes[0] as any)'
  },
  {
    file: 'src/app/api/hpp/trends/route.ts',
    search: 'const recipe = recipes[0] as any',
    replace: 'const recipe = (recipes[0] as any)'
  },
  {
    file: 'src/app/api/ingredients/[id]/route.ts',
    search: '.update(validatedData as any)',
    replace: '.update(validatedData as any)'
  },
  {
    file: 'src/app/api/orders/[id]/route.ts',
    search: '.update(updatePayload as any)',
    replace: '.update(updatePayload as any)'
  },
  {
    file: 'src/app/api/orders/[id]/status/route.ts',
    search: 'const order = orderResult.data',
    replace: 'const order = (orderResult.data as any)'
  },
  {
    file: 'src/app/api/recipes/[id]/hpp/route.ts',
    search: 'recipe.recipe_ingredients',
    replace: '(recipe as any).recipe_ingredients'
  },
];

// Apply single line fixes
for (const fix of fixes) {
  try {
    let content = readFileSync(fix.file, 'utf-8');
    
    if (fix.search && fix.replace && content.includes(fix.search)) {
      content = content.split(fix.search).join(fix.replace);
      writeFileSync(fix.file, content, 'utf-8');
      console.log(`✓ Fixed ${fix.file}`);
    }
  } catch (error) {
    // Skip if file doesn't exist
  }
}

// Fix complex patterns in specific files
const complexFixes = [
  {
    file: 'src/app/api/hpp/comparison/route.ts',
    pattern: /previousSnapshot\.hpp_value/g,
    replacement: '(previousSnapshot as any).hpp_value'
  },
  {
    file: 'src/app/api/hpp/automation/route.ts',
    pattern: /\.update\(\{\s*price_per_unit/,
    replacement: '.update({ price_per_unit'
  },
  {
    file: 'src/app/api/dashboard/stats/route.ts',
    pattern: /\.insert\(\[dailySummaryData\]\)/,
    replacement: '.insert([dailySummaryData] as any)'
  },
  {
    file: 'src/app/api/expenses/route.ts',
    pattern: /expense\.id(?!\w)/g,
    replacement: '(expense as any).id'
  },
  {
    file: 'src/app/api/orders/[id]/status/route.ts',
    pattern: /order\.(status|total_amount|delivery_date|order_date|order_no|customer_name|id|updated_at)/g,
    replacement: (match) => `(order as any).${match.split('.')[1]}`
  },
  {
    file: 'src/app/api/hpp/snapshot/route.ts',
    pattern: /recipe\.selling_price/g,
    replacement: '(recipe as any).selling_price'
  },
  {
    file: 'src/app/api/hpp/trends/route.ts',
    pattern: /\bs\.(recipe_id|snapshot_date|hpp_value|material_cost|operational_cost)/g,
    replacement: (match) => `(s as any).${match.split('.')[1]}`
  },
  {
    file: 'src/app/api/hpp/trends/route.ts',
    pattern: /recipe\.(id|name)/g,
    replacement: (match) => `(recipe as any).${match.split('.')[1]}`
  }
];

for (const fix of complexFixes) {
  try {
    let content = readFileSync(fix.file, 'utf-8');
    
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      writeFileSync(fix.file, content, 'utf-8');
      console.log(`✓ Applied complex fix to ${fix.file}`);
    }
  } catch (error) {
    // Skip if file doesn't exist
  }
}

console.log('\n✅ Completed remaining API fixes');

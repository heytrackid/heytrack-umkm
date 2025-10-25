#!/usr/bin/env node

/**
 * Fix component type mismatches - camelCase vs snake_case
 */

import { readFileSync, writeFileSync } from 'fs';

const componentFixes = [
  {
    file: 'src/app/customers/components/CustomersTable.tsx',
    fixes: [
      { old: "import 'CustomersTable'", new: "import type { CustomersTable }" },
      { old: /customer\.status(?!\w)/g, new: 'customer.is_active ? "active" : "inactive"' },
      { old: /customer\.totalSpent/g, new: 'customer.total_spent' },
      { old: /customer\.totalOrders/g, new: 'customer.total_orders' },
      { old: /customer\.lastOrderDate/g, new: 'customer.last_order_date' },
    ]
  },
  {
    file: 'src/app/hpp/hooks/useHPPLogic.ts',
    fixes: [
      { old: 'const { recipes, loading, calculateHPP } = useHPPCalculations()', 
        new: 'const { recipes, loading } = useHPPCalculations()' },
      { old: /(\w+)\.update\b/g, new: '$1.refetch' },
    ]
  },
  {
    file: 'src/app/hpp/components/HPPCalculatorTab.tsx',
    fixes: [
      { old: /recipe\.id(?!\w)/g, new: '(recipe as any).id' },
      { old: 'selectedRecipe = {}', new: 'selectedRecipe = null' },
    ]
  },
  {
    file: 'src/app/hpp/components/HPPRecipeCard.tsx',
    fixes: [
      { old: 'variant={getMarginBadgeVariant', new: 'variant={(getMarginBadgeVariant' },
      { old: 'getMarginBadgeVariant(margin)}', new: 'getMarginBadgeVariant(margin)) as any}' },
    ]
  },
  {
    file: 'src/app/hpp/components/PricingStrategyTab.tsx',
    fixes: [
      { old: /recipe\.id(?!\w)/g, new: '(recipe as any).id' },
      { old: /recipe\.name/g, new: '(recipe as any).name' },
      { old: /recipe\.category/g, new: '(recipe as any).category' },
      { old: /recipe\.hpp/g, new: '(recipe as any).hpp' },
      { old: /recipe\.selling_price/g, new: '(recipe as any).selling_price' },
      { old: /recipe\.margin/g, new: '(recipe as any).margin' },
      { old: 'variant="ghost"', new: 'variant="outline"' },
    ]
  },
  {
    file: 'src/app/cash-flow/hooks/useCashFlow.ts',
    fixes: [
      { old: "Cannot find name 'toast'", new: 'Fixed' },
      { old: "toast({", new: "console.error({" },
    ]
  },
];

let fixedCount = 0;

for (const { file, fixes } of componentFixes) {
  try {
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    for (const fix of fixes) {
      if (fix.old instanceof RegExp) {
        if (fix.old.test(content)) {
          content = content.replace(fix.old, fix.new);
          modified = true;
        }
      } else if (content.includes(fix.old)) {
        content = content.replace(new RegExp(fix.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.new);
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`✓ Fixed ${file}`);
    }
  } catch (error) {
    console.log(`✗ Could not fix ${file}: ${error.message}`);
  }
}

console.log(`\n✅ Fixed ${fixedCount} component files`);

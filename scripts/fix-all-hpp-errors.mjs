#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const fixes = [
  {
    file: 'src/app/api/hpp/alerts/route.ts',
    replacements: [
      { old: /error\.message/g, new: 'getErrorMessage(error)' }
    ]
  },
  {
    file: 'src/app/api/hpp/automation/route.ts',
    replacements: [
      { old: 'recipes.forEach((recipe) => {', new: 'recipes.forEach((recipe: any) => {' },
      { old: 'recipe.id', new: '(recipe as any).id', flags: 'g' },
      { old: 'recipe.nama', new: '(recipe as any).nama', flags: 'g' }
    ]
  },
  {
    file: 'src/app/api/hpp/comparison/route.ts',
    replacements: [
      { old: 'const currentSnapshot = currentData[0]', new: 'const currentSnapshot = currentData[0] as any' },
      { old: 'const previousSnapshot = previousData[0]', new: 'const previousSnapshot = previousData[0] as any' },
      { old: 'recipe.nama', new: '(recipe as any).nama' },
      { old: /error\.message/g, new: 'getErrorMessage(error)' }
    ]
  },
  {
    file: 'src/app/api/hpp/export/route.ts',
    replacements: [
      { old: 'recipe.nama', new: '(recipe as any).nama', flags: 'g' },
      { old: 'breakdown.operational', new: 'breakdown.operational || breakdown.operational_costs' },
      { old: /error\.message/g, new: 'getErrorMessage(error)' }
    ]
  },
  {
    file: 'src/app/api/hpp/recommendations/route.ts',
    replacements: [
      { old: /error\.message/g, new: 'getErrorMessage(error)' }
    ]
  },
  {
    file: 'src/app/api/hpp/snapshot/route.ts',
    replacements: [
      { old: 'const recipe = recipes[0]', new: 'const recipe = recipes[0] as any' },
      { old: /error\.message/g, new: 'getErrorMessage(error)' }
    ]
  },
  {
    file: 'src/app/api/hpp/snapshots/route.ts',
    replacements: [
      { old: ': { name: any }', new: ': any' }
    ]
  },
  {
    file: 'src/app/api/hpp/trends/route.ts',
    replacements: [
      { old: 'snapshots.map((s) =>', new: 'snapshots.map((s: any) =>' },
      { old: 'const recipe = recipes[0]', new: 'const recipe = recipes[0] as any' },
      { old: /error\.message/g, new: 'getErrorMessage(error)' }
    ]
  },
];

let totalFixed = 0;

for (const fix of fixes) {
  try {
    let content = readFileSync(fix.file, 'utf-8');
    let modified = false;

    for (const replacement of fix.replacements) {
      const oldValue = replacement.old;
      const newValue = replacement.new;
      
      if (oldValue instanceof RegExp) {
        if (oldValue.test(content)) {
          content = content.replace(oldValue, newValue);
          modified = true;
          totalFixed++;
        }
      } else {
        if (content.includes(oldValue)) {
          if (replacement.flags === 'g') {
            content = content.split(oldValue).join(newValue);
          } else {
            content = content.replace(oldValue, newValue);
          }
          modified = true;
          totalFixed++;
        }
      }
    }

    if (modified) {
      writeFileSync(fix.file, content, 'utf-8');
      console.log(`✓ Fixed ${fix.file}`);
    }
  } catch (error) {
    console.log(`✗ Error fixing ${fix.file}: ${error.message}`);
  }
}

console.log(`\n✅ Applied ${totalFixed} fixes`);

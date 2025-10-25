#!/usr/bin/env node

/**
 * Fix missing hook imports in pages
 */

import { readFileSync, writeFileSync } from 'fs';

const pagesToFix = [
  'src/app/orders/page.tsx',
  'src/app/reports/page.tsx',
  'src/app/resep/page.tsx',
  'src/app/dashboard/page.tsx',
];

const importsToAdd = {
  useAuth: "import { useAuth } from '@/hooks/useAuth';",
  useToast: "import { useToast } from '@/hooks/use-toast';",
  useRouter: "import { useRouter } from 'next/navigation';",
  useEffect: "import { useEffect } from 'react';",
};

let fixedFiles = 0;

for (const file of pagesToFix) {
  try {
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    // Check what's being used but not imported
    const needsUseAuth = content.includes('useAuth()') && !content.includes("from '@/hooks/useAuth'");
    const needsUseToast = content.includes('useToast()') && !content.includes("from '@/hooks/use-toast'");
    const needsUseRouter = content.includes('useRouter()') && !content.includes("from 'next/navigation'");
    const needsUseEffect = content.includes('useEffect(') && !content.includes('useEffect } from');

    if (!needsUseAuth && !needsUseToast && !needsUseRouter && !needsUseEffect) {
      console.log(`✓ ${file} - No fixes needed`);
      continue;
    }

    // Find the best place to add imports (after 'use client' and before first import)
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("'use client'") || lines[i].includes('"use client"')) {
        insertIndex = i + 2; // After use client and empty line
        break;
      }
    }

    if (insertIndex === -1) {
      insertIndex = 0;
    }

    const importsToInsert = [];
    if (needsUseEffect) importsToInsert.push(importsToAdd.useEffect);
    if (needsUseRouter) importsToInsert.push(importsToAdd.useRouter);
    if (needsUseAuth) importsToInsert.push(importsToAdd.useAuth);
    if (needsUseToast) importsToInsert.push(importsToAdd.useToast);

    if (importsToInsert.length > 0) {
      lines.splice(insertIndex, 0, ...importsToInsert);
      content = lines.join('\n');
      writeFileSync(file, content, 'utf-8');
      modified = true;
      fixedFiles++;
      console.log(`✓ Fixed ${file} - Added: ${importsToInsert.map(i => i.match(/{ (.*) }/)[1]).join(', ')}`);
    }

  } catch (error) {
    console.error(`✗ Error fixing ${file}:`, error.message);
  }
}

console.log(`\n✅ Fixed ${fixedFiles} files`);

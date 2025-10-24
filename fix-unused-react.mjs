#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get all files with TS6133 errors about React
try {
  const errors = execSync('npm run type-check 2>&1 | grep "TS6133.*\'React\'"', { 
    encoding: 'utf8', 
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  }).split('\n').filter(l => l.trim());

  const files = [...new Set(errors.map(e => {
    const match = e.match(/^([^:]+):/);
    return match ? match[1] : null;
  }).filter(Boolean))];

  console.log(`Found ${files.length} files with unused React imports`);

  let fixed = 0;

  files.forEach(file => {
    try {
      const filePath = path.join(process.cwd(), file);
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;

      // Only remove: import * as React from 'react' OR import React from 'react'
      // Check if React is actually used in the file
      const reactUsed = /React\./g.test(content);
      
      if (!reactUsed) {
        content = content.replace(/import\s+\*\s+as\s+React\s+from\s+['"]react['"];?\n?/g, '');
        content = content.replace(/import\s+React\s+from\s+['"]react['"];?\n?/g, '');
        
        if (content !== original) {
          fs.writeFileSync(filePath, content);
          fixed++;
          console.log(`✓ Fixed: ${file}`);
        }
      }
    } catch (error) {
      console.error(`✗ Error fixing ${file}: ${error.message}`);
    }
  });

  console.log(`\nFixed ${fixed} files!`);
  console.log('Next: run npm run type-check to verify');
} catch (error) {
  console.log('No unused React imports found or error occurred');
}

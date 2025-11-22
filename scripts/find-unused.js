import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getAllTSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllTSFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getAllTSFiles('src');
const unused = [];

for (const file of allFiles) {
  const relativePath = path.relative('src', file);
  // Skip app pages and layouts that are not imported
  if (relativePath.startsWith('app/') && (relativePath.endsWith('/page.tsx') || relativePath.endsWith('/layout.tsx') || relativePath.endsWith('/loading.tsx') || relativePath.endsWith('/not-found.tsx') || relativePath.endsWith('/global-error.tsx'))) {
    continue;
  }
  const name = path.basename(file, path.extname(file));
  // Search for import statements containing the name
  try {
    const result = execSync(`grep -r "import.*${name}" src --include="*.{ts,tsx}" --exclude="${path.basename(file)}" | wc -l`, { encoding: 'utf8' });
    const count = parseInt(result.trim());
    // Also check for from statements
    const fromResult = execSync(`grep -r "from.*${name}" src --include="*.{ts,tsx}" --exclude="${path.basename(file)}" | wc -l`, { encoding: 'utf8' });
    const fromCount = parseInt(fromResult.trim());
    if (count === 0 && fromCount === 0) {
      unused.push(file);
    }
  } catch (e) {
    unused.push(file);
  }
}

console.log(JSON.stringify(unused, null, 2));
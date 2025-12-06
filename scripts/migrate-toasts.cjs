const fs = require('fs');
const path = require('path');

// Function to recursively find .tsx files
function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsxFiles(fullPath, files);
    } else if (stat.isFile() && item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Function to replace toast calls
function replaceToastCalls(content) {
  // Replace error toasts
  content = content.replace(
    /toast\(\{\s*title:\s*['"`][^'"`]*['"`],\s*description:\s*['"`]([^'"`]*)['"`],\s*variant:\s*['"`]destructive['"`]\s*\}\)/g,
    "toast.error('$1')"
  );

  // Replace success toasts
  content = content.replace(
    /toast\(\{\s*title:\s*['"`][^'"`]*['"`],\s*description:\s*['"`]([^'"`]*)['"`](?:,\s*variant:\s*['"`]default['"`])?\s*\}\)/g,
    "toast.success('$1')"
  );

  // Replace simple description toasts
  content = content.replace(
    /toast\(\{\s*description:\s*['"`]([^'"`]*)['"`]\s*\}\)/g,
    "toast('$1')"
  );

  return content;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = findTsxFiles(srcDir);

let processedCount = 0;
for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = replaceToastCalls(content);

    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✅ Updated: ${file}`);
      processedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n🎉 Migration completed! Updated ${processedCount} files.`);
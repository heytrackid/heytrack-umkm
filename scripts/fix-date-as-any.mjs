#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

function findFiles(dir, ext) {
  const files = []
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        files.push(...findFiles(fullPath, ext))
      } else if (item.isFile() && item.name.endsWith(ext)) {
        files.push(fullPath)
      }
    }
  } catch (e) {}
  return files
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  const before = content
  
  // Fix: new Date( as any).toISOString() -> new Date().toISOString()
  content = content.replace(/new\s+Date\s*\(\s*as\s+any\s*\)/g, 'new Date()')
  
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf-8')
    return 1
  }
  return 0
}

const srcDir = path.join(process.cwd(), 'src')
const files = [...findFiles(srcDir, '.ts'), ...findFiles(srcDir, '.tsx')]

let total = 0
for (const file of files) {
  total += fixFile(file)
}

console.log(`✓ Fixed ${total} Date constructor issues`)

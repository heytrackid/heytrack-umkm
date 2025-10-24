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
  let changeCount = 0
  
  // Fix function parameters
  const matches = [
    { regex: /:\s*unknown\s*\)/g, replacement: ': any)', desc: 'param: unknown)' },
    { regex: /:\s*unknown,/g, replacement: ': any,', desc: 'param: unknown,' },
    { regex: /:\s*unknown\]/g, replacement: ': any]', desc: 'param: unknown]' },
    { regex: /data\?\s*:\s*unknown\b/g, replacement: 'data?: any', desc: 'data?: unknown' },
    { regex: /props\s*\?\s*:\s*unknown\b/g, replacement: 'props?: any', desc: 'props?: unknown' },
  ]
  
  for (const { regex, replacement, desc } of matches) {
    const found = (content.match(regex) || []).length
    if (found > 0) {
      content = content.replace(regex, replacement)
      changeCount += found
    }
  }
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`${path.relative(process.cwd(), filePath)}: ${changeCount}`)
  }
  
  return changeCount
}

const srcDir = path.join(process.cwd(), 'src')
const files = [...findFiles(srcDir, '.ts'), ...findFiles(srcDir, '.tsx')]

let total = 0
for (const file of files) {
  total += fixFile(file)
}

console.log(`\n✓ Fixed ${total} component prop/function parameter types`)

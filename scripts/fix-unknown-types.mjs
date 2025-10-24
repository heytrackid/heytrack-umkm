#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function findFiles(dir, ext) {
  const files = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...findFiles(fullPath, ext))
    } else if (item.isFile() && item.name.endsWith(ext)) {
      files.push(fullPath)
    }
  }
  
  return files
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let changeCount = 0
  
  // Fix error: unknown patterns
  const errorUnknown = content.match(/catch\s*\(\s*error\s*:\s*unknown\s*\)/g)
  if (errorUnknown) {
    changeCount += errorUnknown.length
    console.log(`  ${path.relative(process.cwd(), filePath)}: Fix error: unknown (${errorUnknown.length})`)
    content = content.replace(/catch\s*\(\s*error\s*:\s*unknown\s*\)/g, 'catch (error: Error)')
  }
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8')
  }
  
  return changeCount
}

function main() {
  const srcDir = path.join(process.cwd(), 'src')
  const tsFiles = findFiles(srcDir, '.ts')
  const tsxFiles = findFiles(srcDir, '.tsx')
  const allFiles = [...tsFiles, ...tsxFiles]
  
  console.log(`Found ${allFiles.length} TypeScript files\n`)
  
  let totalChanges = 0
  for (const file of allFiles) {
    const changes = fixFile(file)
    totalChanges += changes
  }
  
  console.log(`\nTotal fixes applied: ${totalChanges}`)
}

main()

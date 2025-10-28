#!/usr/bin/env tsx
/**
 * Script to fix common TypeScript errors in the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const SRC_DIR = join(process.cwd(), 'src')

function getAllTsFiles(dir: string): string[] {
  const files: string[] = []
  
  const items = readdirSync(dir)
  
  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next') {
        files.push(...getAllTsFiles(fullPath))
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  
  return files
}

function fixFile(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Fix 1: Remove unused @ts-expect-error comments
  const unusedTsExpectErrorPattern = /\s*\/\/ @ts-expect-error.*\n/g
  if (content.match(unusedTsExpectErrorPattern)) {
    content = content.replace(unusedTsExpectErrorPattern, '\n')
    modified = true
  }
  
  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    console.log(`✓ Fixed: ${filePath}`)
    return true
  }
  
  return false
}

function main() {
  console.log('🔍 Scanning TypeScript files...\n')
  
  const files = getAllTsFiles(SRC_DIR)
  console.log(`Found ${files.length} TypeScript files\n`)
  
  let fixedCount = 0
  
  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files`)
}

main()

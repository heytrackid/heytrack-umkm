#!/usr/bin/env tsx
/**
 * Script to add null checks after .single() calls
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function getAllTsFiles(dir: string): string[] {
  const files: string[] = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory() && item !== 'node_modules' && item !== '.next') {
        files.push(...getAllTsFiles(fullPath))
      } else if ((item.endsWith('.ts') || item.endsWith('.tsx')) && !item.endsWith('.test.ts')) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files
}

function fixFile(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Pattern: const { data: varName, error: errorVar } = await ... .single()
  //          if (errorVar) { throw errorVar }
  // Should be: if (errorVar || !varName) { throw errorVar || new Error(...) }
  
  const pattern = /const\s+{\s*data:\s*(\w+),\s*error:\s*(\w+)\s*}\s*=\s*await\s+[^;]+\.single\(\)[^}]*\s+if\s*\(\s*\2\s*\)\s*{\s*throw\s+\2/g
  
  const matches = content.match(pattern)
  if (matches) {
    for (const match of matches) {
      const varMatch = match.match(/data:\s*(\w+),\s*error:\s*(\w+)/)
      if (varMatch) {
        const dataVar = varMatch[1]
        const errorVar = varMatch[2]
        
        // Replace: if (errorVar) { throw errorVar }
        // With: if (errorVar || !dataVar) { throw errorVar || new Error('...') }
        const oldCheck = `if (${errorVar}) {\n      throw ${errorVar}`
        const newCheck = `if (${errorVar} || !${dataVar}) {\n      throw ${errorVar} || new Error('Failed to fetch data')`
        
        if (content.includes(oldCheck)) {
          content = content.replace(oldCheck, newCheck)
          modified = true
        }
      }
    }
  }
  
  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    return true
  }
  
  return false
}

async function main() {
  const files = getAllTsFiles('src/app/api')
  
  console.log(`Found ${files.length} files\n`)
  
  let fixedCount = 0
  
  for (const filePath of files) {
    try {
      if (fixFile(filePath)) {
        console.log(`✓ Fixed: ${filePath}`)
        fixedCount++
      }
    } catch (error) {
      console.error(`✗ Error fixing ${filePath}:`, error)
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files`)
}

main()

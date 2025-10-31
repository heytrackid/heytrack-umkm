#!/usr/bin/env tsx
/**
 * Script to add type assertions for Supabase operations that TypeScript can't infer
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function getAllApiFiles(dir: string): string[] {
  const files: string[] = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...getAllApiFiles(fullPath))
      } else if (item.endsWith('.ts') && !item.endsWith('.test.ts')) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  
  return files
}

function fixFile(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Fix 1: Add type assertion for .insert() operations
  // Pattern: .insert({ ... })
  // Replace with: .insert({ ... } as any)
  const insertPattern = /\.insert\(\{([^}]+)\}\)(?!\s+as\s+any)/g
  if (content.match(insertPattern)) {
    content = content.replace(insertPattern, '.insert({$1} as any)')
    modified = true
  }
  
  // Fix 2: Add type assertion for .update() operations
  const updatePattern = /\.update\(\{([^}]+)\}\)(?!\s+as\s+any)/g
  if (content.match(updatePattern)) {
    content = content.replace(updatePattern, '.update({$1} as any)')
    modified = true
  }
  
  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    return true
  }
  
  return false
}

async function main() {
  const files = getAllApiFiles('src/app/api')
  
  console.log(`Found ${files.length} API files\n`)
  
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

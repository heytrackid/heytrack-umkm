#!/usr/bin/env tsx
/**
 * Script to fix Supabase insert/update type errors by wrapping objects in arrays
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
    // Directory doesn't exist or can't be read
  }
  
  return files
}

async function main() {
  // Get all API route files
  const files = getAllApiFiles('src/app/api')
  
  console.log(`Found ${files.length} API route files\n`)
  
  let fixedCount = 0
  
  for (const filePath of files) {
    try {
      let content = readFileSync(filePath, 'utf-8')
      let modified = false
      
      // Fix 1: Remove unused Database imports
      if (content.includes("import type { Database } from '@/types/supabase-generated'")) {
        // Check if Database is actually used
        const usesDatabase = content.match(/Database\['public'\]/) || 
                            content.match(/: Database/) ||
                            content.match(/<Database>/)
        
        if (!usesDatabase) {
          content = content.replace(/import type { Database } from '@\/types\/supabase-generated'\n/, '')
          modified = true
        }
      }
      
      // Fix 2: Fix variable name typos (_request vs request)
      if (content.includes('_request: NextRequest') && content.includes("Cannot find name 'request'")) {
        content = content.replace(/export async function (GET|POST|PUT|PATCH|DELETE)\(_request: NextRequest/g, 
                                  'export async function $1(request: NextRequest')
        modified = true
      }
      
      if (modified) {
        writeFileSync(filePath, content, 'utf-8')
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

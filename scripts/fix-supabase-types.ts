#!/usr/bin/env tsx
/**
 * Script to add proper type imports and assertions for Supabase queries
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

// Get all files with type errors
const output = execSync('pnpm type-check 2>&1 || true', { encoding: 'utf-8' })
const errorLines = output.split('\n').filter(line => line.includes('error TS'))

// Extract unique file paths
const filePaths = new Set<string>()
for (const line of errorLines) {
  const match = line.match(/^(src\/[^(]+)/)
  if (match) {
    filePaths.add(match[1])
  }
}

console.log(`Found ${filePaths.size} files with errors\n`)

// Common fixes
const fixes = [
  {
    name: 'Add Database type import',
    pattern: /^import { createClient } from '@\/utils\/supabase\/server'/m,
    check: (content: string) => !content.includes("import type { Database }"),
    fix: (content: string) => {
      return content.replace(
        /^(import { createClient } from '@\/utils\/supabase\/server')/m,
        `$1\nimport type { Database } from '@/types/supabase-generated'`
      )
    }
  },
  {
    name: 'Fix variable name typos (request vs _request)',
    pattern: /Cannot find name 'request'/,
    check: (content: string) => content.includes('_request') && !content.includes('request:'),
    fix: (content: string) => {
      // Replace _request with request in function signatures
      return content.replace(
        /export async function (GET|POST|PUT|PATCH|DELETE)\(_request: NextRequest/g,
        'export async function $1(request: NextRequest'
      )
    }
  }
]

let fixedCount = 0

for (const filePath of filePaths) {
  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false
    
    for (const fix of fixes) {
      if (fix.check(content)) {
        content = fix.fix(content)
        modified = true
      }
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

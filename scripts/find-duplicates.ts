#!/usr/bin/env ts-node
/**
 * Script untuk menemukan duplikasi di codebase
 * Usage: npx ts-node scripts/find-duplicates.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

interface DuplicateReport {
  category: string
  pattern: string
  files: Array<{
    path: string
    lineNumber: number
    content: string
  }>
}

const reports: DuplicateReport[] = []

// Patterns to search for duplicates
const patterns = [
  {
    category: 'Supabase Client Creation',
    regex: /createClient|createBrowserClient|createServerClient/g,
  },
  {
    category: 'Interface Recipe',
    regex: /interface\s+Recipe\s*{/g,
  },
  {
    category: 'Interface Order',
    regex: /interface\s+Order(Data|Response)?\s*{/g,
  },
  {
    category: 'Interface Ingredient',
    regex: /interface\s+Ingredient(s|Response)?\s*{/g,
  },
  {
    category: 'Interface Customer',
    regex: /interface\s+Customer(Data|Response)?\s*{/g,
  },
  {
    category: 'Zod Schema - Pagination',
    regex: /const\s+Pagination(Query)?Schema\s*=/g,
  },
  {
    category: 'Zod Schema - DateRange',
    regex: /const\s+DateRange(Query)?Schema\s*=/g,
  },
  {
    category: 'Zod Schema - IdParam',
    regex: /const\s+IdParamSchema\s*=/g,
  },
  {
    category: 'Hook - useMobile',
    regex: /export\s+(function|const)\s+useMobile/g,
  },
  {
    category: 'Hook - useResponsive',
    regex: /export\s+(function|const)\s+useResponsive/g,
  },
  {
    category: 'Hook - useSupabase',
    regex: /export\s+(function|const)\s+useSupabase/g,
  },
]

async function findDuplicates() {
  console.log('🔍 Scanning codebase for duplicates...\n')

  // Get all TypeScript files
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'],
  })

  for (const pattern of patterns) {
    const matches: DuplicateReport['files'] = []

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        if (pattern.regex.test(line)) {
          matches.push({
            path: file,
            lineNumber: index + 1,
            content: line.trim(),
          })
        }
      })
    }

    if (matches.length > 1) {
      reports.push({
        category: pattern.category,
        pattern: pattern.regex.source,
        files: matches,
      })
    }
  }

  // Print report
  console.log('📊 DUPLICATE DETECTION REPORT\n')
  console.log('=' .repeat(80))

  if (reports.length === 0) {
    console.log('✅ No duplicates found!')
    return
  }

  reports.forEach((report, index) => {
    console.log(`\n${index + 1}. ${report.category}`)
    console.log('-'.repeat(80))
    console.log(`Found ${report.files.length} occurrences:\n`)

    report.files.forEach((file) => {
      console.log(`  📄 ${file.path}:${file.lineNumber}`)
      console.log(`     ${file.content}`)
    })
  })

  console.log('\n' + '='.repeat(80))
  console.log(`\n⚠️  Total duplicate categories found: ${reports.length}`)
  console.log(`📝 See DUPLIKASI_AUDIT_REPORT.md for detailed analysis\n`)

  // Generate summary JSON
  const summary = {
    timestamp: new Date().toISOString(),
    totalCategories: reports.length,
    totalOccurrences: reports.reduce((sum, r) => sum + r.files.length, 0),
    categories: reports.map((r) => ({
      name: r.category,
      count: r.files.length,
      files: r.files.map((f) => f.path),
    })),
  }

  fs.writeFileSync(
    'duplicate-detection-summary.json',
    JSON.stringify(summary, null, 2)
  )

  console.log('💾 Summary saved to: duplicate-detection-summary.json\n')
}

// Run the script
findDuplicates().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

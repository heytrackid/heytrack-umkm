#!/usr/bin/env tsx
/**
 * Script to check for underscore prefixes and ensure proper database type usage
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

interface Issue {
  file: string
  line: number
  issue: string
  suggestion: string
  severity: 'error' | 'warning'
}

const issues: Issue[] = []

function scanDirectory(dir: string, baseDir: string = dir) {
  const files = readdirSync(dir)

  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        continue
      }
      scanDirectory(fullPath, baseDir)
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      checkFile(fullPath, baseDir)
    }
  }
}

function checkFile(filePath: string, baseDir: string) {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relativePath = filePath.replace(baseDir + '/', '')

  lines.forEach((line, index) => {
    const lineNumber = index + 1

    // Check 1: Underscore prefix in parameter names (except in type definitions)
    const underscoreParamMatch = line.match(/\(([^)]*_\w+[^)]*)\)/)
    if (underscoreParamMatch && !line.includes('type ') && !line.includes('interface ')) {
      // Extract parameter names with underscore
      const params = underscoreParamMatch[1].split(',')
      params.forEach(param => {
        const paramName = param.trim().split(':')[0].trim()
        if (paramName.startsWith('_') && !line.includes('// eslint-disable')) {
          issues.push({
            file: relativePath,
            line: lineNumber,
            issue: `Parameter with underscore prefix: ${paramName}`,
            suggestion: `Remove underscore prefix or add comment explaining why it's unused`,
            severity: 'warning'
          })
        }
      })
    }

    // Check 2: Unused variables with underscore that should be removed
    const unusedVarMatch = line.match(/const\s+(_\w+)\s*=/)
    if (unusedVarMatch && !line.includes('// eslint-disable')) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: `Unused variable with underscore: ${unusedVarMatch[1]}`,
        suggestion: 'Remove if truly unused, or use the variable',
        severity: 'warning'
      })
    }

    // Check 3: Using old table field names (user_id vs created_by in recipes)
    if (line.includes("'recipes'") || line.includes('"recipes"')) {
      if (line.includes('.eq(') && line.includes('user_id')) {
        issues.push({
          file: relativePath,
          line: lineNumber,
          issue: 'Using user_id field on recipes table',
          suggestion: 'Recipes table uses created_by field, not user_id',
          severity: 'error'
        })
      }
    }

    // Check 4: Incorrect Supabase client import in services
    if (relativePath.includes('/services/') || relativePath.includes('/modules/')) {
      if (line.includes("from '@/utils/supabase/client'") && !relativePath.includes('.tsx')) {
        issues.push({
          file: relativePath,
          line: lineNumber,
          issue: 'Using client Supabase in server-side service',
          suggestion: "Use createClient from '@/utils/supabase/server' for server-side code",
          severity: 'error'
        })
      }
    }

    // Check 5: Missing 'server-only' import in service files
    if (relativePath.includes('Service.ts') && 
        !relativePath.includes('client') && 
        !relativePath.includes('/hooks/') &&
        !relativePath.includes('/components/')) {
      if (lineNumber === 1 && !line.includes("'server-only'")) {
        // Check if file has server-only anywhere
        if (!content.includes("import 'server-only'")) {
          issues.push({
            file: relativePath,
            line: 1,
            issue: 'Missing server-only import in service file',
            suggestion: "Add import 'server-only' at the top of the file",
            severity: 'error'
          })
        }
      }
    }

    // Check 6: Using || instead of || for null coalescing
    const nullCoalesceMatch = line.match(/\|\|\s*(\d+|'[^']*'|"[^"]*"|\[\]|\{\})/g)
    if (nullCoalesceMatch && !line.includes('//') && !line.includes('boolean')) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: 'Using || instead of || for null coalescing',
        suggestion: 'Use || operator for null/undefined checks instead of ||',
        severity: 'warning'
      })
    }

    // Check 7: Direct Database type usage in non-generic code
    if (line.includes("Database['public']['Tables']") && 
        !line.includes('keyof') &&
        !line.includes('type TablesMap') &&
        !line.includes('type TableMap') &&
        !relativePath.includes('types/')) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: "Direct Database['public']['Tables'] usage",
        suggestion: 'Use specific types from @/types/database (e.g., RecipesTable, IngredientsTable)',
        severity: 'error'
      })
    }

    // Check 8: Using .single() without error handling
    if (line.includes('.single()') && !line.includes('const {')) {
      const nextLines = lines.slice(index, Math.min(index + 5, lines.length)).join('\n')
      if (!nextLines.includes('if (error') && !nextLines.includes('if (!data')) {
        issues.push({
          file: relativePath,
          line: lineNumber,
          issue: 'Using .single() without error handling',
          suggestion: 'Always check for error and null data after .single()',
          severity: 'warning'
        })
      }
    }

    // Check 9: Console.log in production code
    if (line.includes('console.log') && !relativePath.includes('scripts/') && !relativePath.includes('.test.')) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: 'Using console.log in production code',
        suggestion: 'Use logger (dbLogger, apiLogger, or clientLogger) instead',
        severity: 'warning'
      })
    }

    // Check 10: Missing await on createClient() in server code
    if (line.includes('createClient()') && 
        !line.includes('await') && 
        line.includes("from '@/utils/supabase/server'")) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: 'Missing await on createClient() from server',
        suggestion: 'Server createClient() returns a Promise, use: await createClient()',
        severity: 'error'
      })
    }
  })
}

// Run the scan
console.log('🔍 Scanning for underscore prefixes and type issues...\n')
scanDirectory('./src')

// Report results
if (issues.length === 0) {
  console.log('✅ No issues found!\n')
} else {
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} error(s):\n`)
    
    const errorsByFile = errors.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = []
      }
      acc[issue.file].push(issue)
      return acc
    }, {} as Record<string, Issue[]>)

    Object.entries(errorsByFile).forEach(([file, fileIssues]) => {
      console.log(`📄 ${file}`)
      fileIssues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.issue}`)
        console.log(`   💡 ${issue.suggestion}`)
      })
      console.log()
    })
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Found ${warnings.length} warning(s):\n`)
    
    const warningsByFile = warnings.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = []
      }
      acc[issue.file].push(issue)
      return acc
    }, {} as Record<string, Issue[]>)

    Object.entries(warningsByFile).forEach(([file, fileIssues]) => {
      console.log(`📄 ${file}`)
      fileIssues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.issue}`)
        console.log(`   💡 ${issue.suggestion}`)
      })
      console.log()
    })
  }

  console.log(`\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings\n`)
}

process.exit(errors.length > 0 ? 1 : 0)

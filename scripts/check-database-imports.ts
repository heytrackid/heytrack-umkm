#!/usr/bin/env tsx
/**
 * Script to check and report files that should import from @/types/database
 * instead of using raw types or direct supabase-generated imports
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

interface Issue {
  file: string
  line: number
  issue: string
  suggestion: string
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

    // Check 1: Direct import from supabase-generated (except in database.ts itself)
    if (
      !relativePath.includes('types/database.ts') &&
      !relativePath.includes('types/supabase-generated.ts') &&
      line.includes("from '@/types/supabase-generated'")
    ) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: 'Direct import from supabase-generated',
        suggestion: "Import from '@/types/database' instead"
      })
    }

    // Check 2: Raw Database['public']['Tables'] pattern
    // Only flag if it's NOT in a type alias definition (which is valid for generic utilities)
    if (
      line.includes("Database['public']['Tables']") && 
      !line.includes('keyof') &&
      !line.includes('type TablesMap =') &&
      !line.includes('type TableMap =')
    ) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: "Using raw Database['public']['Tables'] pattern",
        suggestion: 'Use specific table types like RecipesTable, IngredientsTable, etc.'
      })
    }

    // Check 3: Inline type definitions that should use database types
    const inlineTypeMatch = line.match(/type\s+(\w+)\s*=\s*\{[^}]*\bid:\s*string/)
    if (inlineTypeMatch && !relativePath.includes('types/')) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: `Inline type definition: ${inlineTypeMatch[1]}`,
        suggestion: 'Consider using types from @/types/database if this represents a database table'
      })
    }

    // Check 4: Using Tables<'table_name'> with string literal (should use specific type)
    const tablesMatch = line.match(/Tables<['"](\w+)['"]>/)
    if (tablesMatch && !relativePath.includes('types/') && !line.includes('extends keyof')) {
      const tableName = tablesMatch[1]
      const pascalCase = tableName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: `Using Tables<'${tableName}'> with string literal`,
        suggestion: `Use ${pascalCase}Table type instead for better type safety`
      })
    }

    // Check 5: Using TablesInsert<'table_name'> with string literal
    const tablesInsertMatch = line.match(/TablesInsert<['"](\w+)['"]>/)
    if (tablesInsertMatch && !relativePath.includes('types/') && !line.includes('extends keyof')) {
      const tableName = tablesInsertMatch[1]
      const pascalCase = tableName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: `Using TablesInsert<'${tableName}'> with string literal`,
        suggestion: `Use ${pascalCase}Insert type instead for better type safety`
      })
    }

    // Check 6: Using TablesUpdate<'table_name'> with string literal
    const tablesUpdateMatch = line.match(/TablesUpdate<['"](\w+)['"]>/)
    if (tablesUpdateMatch && !relativePath.includes('types/') && !line.includes('extends keyof')) {
      const tableName = tablesUpdateMatch[1]
      const pascalCase = tableName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      issues.push({
        file: relativePath,
        line: lineNumber,
        issue: `Using TablesUpdate<'${tableName}'> with string literal`,
        suggestion: `Use ${pascalCase}Update type instead for better type safety`
      })
    }
  })
}

// Run the scan
console.log('🔍 Scanning for database type import issues...\n')
scanDirectory('./src')

// Report results
if (issues.length === 0) {
  console.log('✅ No issues found! All files are using proper database type imports.\n')
} else {
  console.log(`⚠️  Found ${issues.length} potential issues:\n`)

  // Group by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = []
    }
    acc[issue.file].push(issue)
    return acc
  }, {} as Record<string, Issue[]>)

  Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
    console.log(`📄 ${file}`)
    fileIssues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.issue}`)
      console.log(`   💡 ${issue.suggestion}`)
    })
    console.log()
  })

  console.log(`\n📊 Summary: ${issues.length} issues in ${Object.keys(issuesByFile).length} files\n`)
}

process.exit(issues.length > 0 ? 1 : 0)

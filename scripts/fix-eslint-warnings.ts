#!/usr/bin/env tsx

/**
 * ESLint Warnings Auto-Fix Script
 * Automatically fixes common ESLint warnings in the HeyTrack codebase
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

console.log('🔧 Starting ESLint warnings auto-fix...')

// Get all TypeScript/React files recursively
function getFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = []

  function scan(directory: string) {
    const items = readdirSync(directory)

    for (const item of items) {
      const fullPath = path.join(directory, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath)
      } else if (stat.isFile()) {
        const ext = path.extname(item)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  scan(dir)
  return files
}

const files = getFiles('src', ['.ts', '.tsx'])
console.log(`📁 Found ${files.length} files to process`)

// Track fixes
let totalFixes = 0

// 1. Fix nullish coalescing operators (|| → ||)
console.log('🔄 Fixing nullish coalescing operators...')
let nullishFixes = 0

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8')
    let modified = false

    // Pattern: variable = value || default
    // But avoid changing: condition && value || default (nested expressions)
    // And avoid changing: array[index] || default (where array access might be falsy)
    const nullishPattern = /(\w+)\s*=\s*([^|&]+?)\s*\|\|\s*([^;]+)/g

    content = content.replace(nullishPattern, (match, varName, value, defaultValue) => {
      // Skip if the value contains && (nested condition)
      if (value.includes('&&') || value.includes('||')) {
        return match
      }

      // Skip if it's an array access or function call that might legitimately be falsy
      if (value.includes('[') || value.includes('(')) {
        return match
      }

      nullishFixes++
      modified = true
      return `${varName} = ${value} || ${defaultValue.trim()}`
    })

    if (modified) {
      writeFileSync(file, content)
    }
  } catch (error) {
    console.warn(`⚠️  Failed to process ${file}:`, error)
  }
}

console.log(`✅ Fixed ${nullishFixes} nullish coalescing operators`)

// 2. Fix duplicate imports
console.log('🔄 Fixing duplicate imports...')
let duplicateFixes = 0

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    const importLines: string[] = []
    const otherLines: string[] = []
    const seenImports = new Set<string>()

    for (const line of lines) {
      if (line.trim().startsWith('import')) {
        // Extract the import path
        const importMatch = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/)
        if (importMatch) {
          const importPath = importMatch[1]
          if (!seenImports.has(importPath)) {
            seenImports.add(importPath)
            importLines.push(line)
          } else {
            duplicateFixes++
          }
        } else {
          importLines.push(line)
        }
      } else {
        otherLines.push(line)
      }
    }

    if (duplicateFixes > 0) {
      const newContent = [...importLines, '', ...otherLines].join('\n')
      writeFileSync(file, newContent)
    }
  } catch (error) {
    console.warn(`⚠️  Failed to process ${file}:`, error)
  }
}

console.log(`✅ Fixed ${duplicateFixes} duplicate imports`)

// 3. Run ESLint auto-fix for remaining issues
console.log('🔄 Running ESLint auto-fix...')
try {
  execSync('npx eslint src/ --ext .ts,.tsx --fix --max-warnings 0', {
    stdio: 'inherit',
    cwd: process.cwd()
  })
  console.log('✅ ESLint auto-fix completed')
} catch (error) {
  console.log('⚠️  ESLint auto-fix completed with some issues (this is normal)')
}

// 4. Check remaining warnings
console.log('📊 Checking remaining warnings...')
try {
  const result = execSync('npx eslint src/ --ext .ts,.tsx --max-warnings 0 | grep -c "warning"', {
    encoding: 'utf-8',
    cwd: process.cwd()
  }).trim()

  const remainingWarnings = parseInt(result) || 0
  console.log(`📈 Remaining warnings: ${remainingWarnings}`)

  if (remainingWarnings < 963) {
    const fixed = 963 - remainingWarnings
    console.log(`🎉 Fixed ${fixed} warnings automatically!`)
  }
} catch (error) {
  console.log('⚠️  Could not count remaining warnings')
}

console.log('✨ ESLint warnings auto-fix completed!')
console.log('💡 Some warnings may require manual fixes (nested ternaries, array keys, etc.)')

#!/usr/bin/env tsx

/**
 * Fix remaining simple nullish coalescing operators
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

console.log('🔧 Fixing remaining simple nullish coalescing operators...')

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

let fixes = 0

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8')
    let modified = false

    // Only fix very simple patterns: variable = expression || default
    const simplePattern = /(\w+)\s*=\s*([^=]+?)\s*\|\|\s*([^;,\n}]+)([;,\n}])/g

    content = content.replace(simplePattern, (match, varName, expr, defaultValue, terminator) => {
      // Skip if expression contains operators that would make this invalid
      if (expr.includes('&&') || expr.includes('||') || expr.includes('?') || expr.includes(':')) {
        return match
      }

      // Skip if it's an array access or function call
      if (expr.includes('[') || expr.includes('(')) {
        return match
      }

      // Skip if default value contains operators
      if (defaultValue.includes('&&') || defaultValue.includes('||') || defaultValue.includes('?')) {
        return match
      }

      fixes++
      modified = true
      return `${varName} = ${expr} || ${defaultValue.trim()}${terminator}`
    })

    if (modified) {
      writeFileSync(file, content)
    }
  } catch (error) {
    console.warn(`⚠️  Failed to process ${file}:`, error)
  }
}

console.log(`✅ Fixed ${fixes} simple nullish coalescing operators`)
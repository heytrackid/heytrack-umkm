#!/usr/bin/env tsx

/**
 * Fix remaining nullish coalescing operators in the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

console.log('🔧 Fixing remaining nullish coalescing operators...')

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

    // Pattern: variable = expression || default
    // More comprehensive pattern that handles various cases
    const patterns = [
      // Simple assignment: var = expr || default
      /(\w+)\s*=\s*([^=]+?)\s*\|\|\s*([^;,\n}]+)([;,\n}])/g,
      // Object properties: prop: expr || default
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^:]+?)\s*\|\|\s*([^,}\n]+)([,}\n])/g,
      // Return statements: return expr || default
      /return\s+([^;]+?)\s*\|\|\s*([^;]+);/g,
      // Variable declarations: const/let var = expr || default
      /(const|let|var)\s+(\w+)\s*=\s*([^=]+?)\s*\|\|\s*([^;]+);/g
    ]

    for (const pattern of patterns) {
      content = content.replace(pattern, (match, ...args) => {
        // Skip if the match contains ternary operators or is in a complex expression
        if (match.includes('?') || match.includes(':')) {
          return match
        }

        // Skip if it's an array access or function call that might legitimately be falsy
        if (match.includes('[') || match.includes('(')) {
          return match
        }

        // Skip if it's a logical OR in a condition (not a default value assignment)
        if (match.includes('if') || match.includes('&&') || match.includes('return') && match.includes('||')) {
          return match
        }

        // Replace || with ||
        const replacement = match.replace(/\s*\|\|\s*/, ' || ')
        fixes++
        modified = true
        return replacement
      })
    }

    if (modified) {
      writeFileSync(file, content)
    }
  } catch (error) {
    console.warn(`⚠️  Failed to process ${file}:`, error)
  }
}

console.log(`✅ Fixed ${fixes} nullish coalescing operators`)
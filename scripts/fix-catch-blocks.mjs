#!/usr/bin/env node

/**
 * Fix Catch Blocks Script
 * 
 * This script removes underscore prefixes from error variables in catch blocks
 * and removes unnecessary variable reassignments.
 * 
 * Usage: node scripts/fix-catch-blocks.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const DRY_RUN = process.argv.includes('--dry-run')

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = join(dirPath, file)
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      arrayOfFiles.push(filePath)
    }
  })

  return arrayOfFiles
}

function fixCatchBlocks(content) {
  let modified = false
  let newContent = content

  // Pattern 1: catch (_error) -> catch (error)
  if (newContent.includes('catch (_error)')) {
    newContent = newContent.replace(/catch \(_error\)/g, 'catch (error)')
    modified = true
  }

  // Pattern 2: catch (_err) -> catch (err)
  if (newContent.includes('catch (_err)')) {
    newContent = newContent.replace(/catch \(_err\)/g, 'catch (err)')
    modified = true
  }

  // Pattern 3: Remove "const error = _error as Error" lines
  const errorReassignPattern = /\s*const error = _error as Error\s*\n/g
  if (errorReassignPattern.test(newContent)) {
    newContent = newContent.replace(errorReassignPattern, '')
    modified = true
  }

  // Pattern 4: Remove "const err = _err as Error" lines
  const errReassignPattern = /\s*const err = _err as Error\s*\n/g
  if (errReassignPattern.test(newContent)) {
    newContent = newContent.replace(errReassignPattern, '')
    modified = true
  }

  return { modified, newContent }
}

function main() {
  log('🔧 Fixing catch blocks in TypeScript files...', 'blue')
  log('')

  if (DRY_RUN) {
    log('🔍 DRY RUN MODE - No files will be modified', 'yellow')
    log('')
  }

  const srcPath = join(process.cwd(), 'src')
  const files = getAllFiles(srcPath)

  let fixedCount = 0
  let totalFiles = 0

  files.forEach((filePath) => {
    totalFiles++
    const content = readFileSync(filePath, 'utf8')
    const { modified, newContent } = fixCatchBlocks(content)

    if (modified) {
      fixedCount++
      const relativePath = filePath.replace(process.cwd() + '/', '')
      log(`📝 ${relativePath}`, 'green')

      if (!DRY_RUN) {
        writeFileSync(filePath, newContent, 'utf8')
      }
    }
  })

  log('')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log(`✅ Fixed ${fixedCount} out of ${totalFiles} files`, 'green')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('')

  if (DRY_RUN) {
    log('💡 Run without --dry-run to apply changes', 'yellow')
  } else {
    log('🎉 All catch blocks have been fixed!', 'green')
  }
}

main()

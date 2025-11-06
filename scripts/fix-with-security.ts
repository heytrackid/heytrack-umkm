#!/usr/bin/env tsx
/**
 * Script to add withSecurity middleware to API routes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const SRC_DIR = join(process.cwd(), 'src')

function getAllRouteFiles(dir: string): string[] {
  const files: string[] = []

  const items = readdirSync(dir)

  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next') {
        files.push(...getAllRouteFiles(fullPath))
      }
    } else if (item === 'route.ts') {
      files.push(fullPath)
    }
  }

  return files
}

function fixFile(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false

  // Check if file already has withSecurity wrapping
  if (content.includes('export const') && content.includes('withSecurity(')) {
    return false
  }

  // Remove duplicate withSecurity imports
  const importLines = content.split('\n').filter(line => line.includes('withSecurity'))
  if (importLines.length > 1) {
    // Keep only one import
    const uniqueImport = importLines[0]
    content = content.replace(/import \{ withSecurity, SecurityPresets \} from '@\/utils\/security'\n/g, '')
    content = content.replace(/import \{ type NextRequest, NextResponse \} from 'next\/server'\n/, uniqueImport + '\n')
    modified = true
  }

  // Change export async function to const handler
  const functionRegex = /export async function (GET|POST|PUT|DELETE)\b/g
  if (functionRegex.test(content)) {
    content = content.replace(functionRegex, (match, method) => {
      const handlerName = method.toLowerCase() + 'Handler'
      return `const ${handlerName} = async`
    })
    modified = true
  }

  // Add the export wrapping at the end
  if (modified && !content.includes('export const') && content.includes('withSecurity')) {
    // Determine if it's read or write based on method
    const hasGET = content.includes('const getHandler')
    const hasPOST = content.includes('const postHandler')
    const hasPUT = content.includes('const putHandler')
    const hasDELETE = content.includes('const deleteHandler')

    let exports = []
    if (hasGET) exports.push('export const GET = withSecurity(getHandler, SecurityPresets.apiRead())')
    if (hasPOST) exports.push('export const POST = withSecurity(postHandler, SecurityPresets.apiWrite())')
    if (hasPUT) exports.push('export const PUT = withSecurity(putHandler, SecurityPresets.apiWrite())')
    if (hasDELETE) exports.push('export const DELETE = withSecurity(deleteHandler, SecurityPresets.apiWrite())')

    if (exports.length > 0) {
      content += '\n\n' + exports.join('\n')
      modified = true
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    console.log(`✓ Fixed: ${filePath}`)
    return true
  }

  return false
}

function main() {
  const routeFiles = getAllRouteFiles(join(SRC_DIR, 'app', 'api'))
  let fixedCount = 0

  for (const file of routeFiles) {
    if (fixFile(file)) {
      fixedCount++
    }
  }

  console.log(`Fixed ${fixedCount} files`)
}

main()
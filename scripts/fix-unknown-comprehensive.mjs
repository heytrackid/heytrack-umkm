#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function findFiles(dir, ext) {
  const files = []
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        files.push(...findFiles(fullPath, ext))
      } else if (item.isFile() && item.name.endsWith(ext)) {
        files.push(fullPath)
      }
    }
  } catch (e) {
    // Ignore permission errors
  }
  return files
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let changeCount = 0
  const changes = []
  
  // Fix useState<unknown[]> to useState<any[]>
  const stateUnknown = (content.match(/useState<unknown\[\]>/g) || []).length
  if (stateUnknown > 0) {
    changes.push(`useState<unknown[]> → useState<any[]> (${stateUnknown})`)
    content = content.replace(/useState<unknown\[\]>/g, 'useState<any[]>')
    changeCount += stateUnknown
  }
  
  // Fix useState<unknown> to useState<any>
  const stateUnknownSingle = (content.match(/useState<unknown>/g) || []).length
  if (stateUnknownSingle > 0) {
    changes.push(`useState<unknown> → useState<any> (${stateUnknownSingle})`)
    content = content.replace(/useState<unknown>/g, 'useState<any>')
    changeCount += stateUnknownSingle
  }
  
  // Fix Record<string, unknown> where it's in setting functions
  const recordSetting = (content.match(/setHppCalculations\s*\(\s*Record<string, unknown>/g) || []).length
  if (recordSetting > 0) {
    changes.push(`setHppCalculations Record<string, unknown> → Record<string, any> (${recordSetting})`)
    content = content.replace(/setHppCalculations\s*\(\s*Record<string, unknown>/g, 'setHppCalculations(Record<string, any>')
    changeCount += recordSetting
  }
  
  // Fix as unknown casts to as any (but be careful with database schema casts)
  const asUnknown = (content.match(/as unknown(?![\s\S]*hpp_alerts|Database\['public'\])/g) || []).length
  if (asUnknown > 0 && !filePath.includes('hpp-alert') && !filePath.includes('supabase/functions')) {
    // Only replace if not in sensitive files
    const beforeUnknown = content
    content = content.replace(/as unknown(?![\s\S]*hpp_alerts|Database\['public'\])/g, 'as any')
    if (beforeUnknown !== content) {
      changes.push(`as unknown → as any (${asUnknown})`)
      changeCount += asUnknown
    }
  }
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8')
    const relPath = path.relative(process.cwd(), filePath)
    console.log(`  ${relPath}`)
    changes.forEach(c => console.log(`    • ${c}`))
  }
  
  return changeCount
}

function main() {
  const srcDir = path.join(process.cwd(), 'src')
  const tsFiles = findFiles(srcDir, '.ts')
  const tsxFiles = findFiles(srcDir, '.tsx')
  const allFiles = [...tsFiles, ...tsxFiles]
  
  console.log(`Found ${allFiles.length} TypeScript files\n`)
  
  let totalChanges = 0
  for (const file of allFiles) {
    const changes = fixFile(file)
    totalChanges += changes
  }
  
  console.log(`\n✓ Total fixes applied: ${totalChanges}`)
}

main()

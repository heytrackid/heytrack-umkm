#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

interface FixPattern {
  pattern: RegExp
  replacement: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

const patterns: FixPattern[] = [
  // Error handling patterns - use Error type
  {
    pattern: /catch\s*\(\s*error\s*:\s*unknown\s*\)/g,
    replacement: 'catch (error: Error)',
    description: 'Fix error: unknown in catch blocks',
    priority: 'high'
  },
  
  // Component props - add proper typing
  {
    pattern: /props\s*:\s*unknown\s*[,}]/g,
    replacement: 'props: Record<string, any> ',
    description: 'Fix component props: unknown',
    priority: 'high'
  },

  // useState with unknown arrays - use any[] for now to maintain functionality
  {
    pattern: /useState<unknown\[\]>/g,
    replacement: 'useState<any[]>',
    description: 'Fix useState<unknown[]>',
    priority: 'medium'
  },

  // as unknown cast patterns
  {
    pattern: /as\s+unknown(\s*[,\);])/g,
    replacement: 'as any$1',
    description: 'Replace as unknown with as any',
    priority: 'low'
  }
]

function findFiles(dir: string, ext: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...findFiles(fullPath, ext))
    } else if (item.isFile() && item.name.endsWith(ext)) {
      files.push(fullPath)
    }
  }
  
  return files
}

function fixFile(filePath: string): number {
  let content = fs.readFileSync(filePath, 'utf-8')
  let changeCount = 0
  
  for (const { pattern, replacement, description } of patterns) {
    const matches = content.match(pattern)
    if (matches) {
      changeCount += matches.length
      console.log(`  [${filePath}] ${description}: ${matches.length} fixes`)
      content = content.replace(pattern, replacement)
    }
  }
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8')
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
    if (changes > 0) {
      totalChanges += changes
    }
  }
  
  console.log(`\nTotal fixes applied: ${totalChanges}`)
}

main()

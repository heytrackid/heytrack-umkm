#!/usr/bin/env node

/**
 * Fix Missing UI Component Imports
 * 
 * Automatically adds missing Textarea and Switch imports to files
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function getFilesWithMissingComponent(componentName) {
  try {
    const output = execSync(
      `npx tsc --noEmit 2>&1 | grep "Cannot find name '${componentName}'" | cut -d'(' -f1 | sort -u`,
      { encoding: 'utf8' }
    )
    return output.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

function addImport(content, componentName, importPath) {
  // Check if import already exists
  if (content.includes(`import { ${componentName} }`)) {
    return { modified: false, content }
  }

  // Find the last import from @/components/ui
  const uiImportRegex = /import\s+{[^}]+}\s+from\s+['"]@\/components\/ui\/[^'"]+['"]/g
  const matches = [...content.matchAll(uiImportRegex)]
  
  if (matches.length > 0) {
    // Add to existing ui imports if possible
    const lastMatch = matches[matches.length - 1]
    const lastImport = lastMatch[0]
    
    // Check if it's from the same path
    if (lastImport.includes(importPath)) {
      // Add to existing import
      const newImport = lastImport.replace(
        /}\s+from/,
        `, ${componentName} } from`
      )
      content = content.replace(lastImport, newImport)
      return { modified: true, content }
    }
    
    // Add new import line after last ui import
    const insertPosition = lastMatch.index + lastMatch[0].length
    const newImport = `\nimport { ${componentName} } from '${importPath}'`
    content = content.slice(0, insertPosition) + newImport + content.slice(insertPosition)
    return { modified: true, content }
  }
  
  // Find first import statement
  const firstImportMatch = content.match(/^import\s+/m)
  if (firstImportMatch) {
    const insertPosition = firstImportMatch.index
    const newImport = `import { ${componentName} } from '${importPath}'\n`
    content = content.slice(0, insertPosition) + newImport + content.slice(insertPosition)
    return { modified: true, content }
  }
  
  return { modified: false, content }
}

function fixFile(filePath, componentName, importPath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const { modified, content: newContent } = addImport(content, componentName, importPath)
    
    if (modified) {
      writeFileSync(filePath, newContent, 'utf8')
      return true
    }
    return false
  } catch (error) {
    log(`❌ Error fixing ${filePath}: ${error.message}`, 'red')
    return false
  }
}

function main() {
  log('🔧 Fixing missing UI component imports...', 'blue')
  log('')

  const components = [
    { name: 'Textarea', path: '@/components/ui/textarea' },
    { name: 'Switch', path: '@/components/ui/switch' },
  ]

  let totalFixed = 0

  for (const { name, path } of components) {
    log(`📦 Checking for missing ${name} imports...`, 'yellow')
    const files = getFilesWithMissingComponent(name)
    
    if (files.length === 0) {
      log(`  ✅ No files need ${name} import`, 'green')
      continue
    }

    log(`  Found ${files.length} files missing ${name}`, 'yellow')
    
    for (const file of files) {
      if (fixFile(file, name, path)) {
        log(`  ✅ Fixed: ${file}`, 'green')
        totalFixed++
      }
    }
  }

  log('')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log(`✅ Fixed ${totalFixed} files`, 'green')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
}

main()

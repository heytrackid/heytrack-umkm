#!/usr/bin/env node

/**
 * Convert Default Exports to Named Exports
 * 
 * This script safely converts default exports to named exports across the codebase.
 * It skips Next.js special files that require default exports.
 * 
 * Usage:
 *   node scripts/convert-to-named-exports.js --dry-run  # Preview changes
 *   node scripts/convert-to-named-exports.js            # Apply changes
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Files that MUST use default export (Next.js requirements)
const SKIP_PATTERNS = [
  /\/page\.tsx?$/,
  /\/layout\.tsx?$/,
  /\/route\.ts$/,
  /\/error\.tsx?$/,
  /\/not-found\.tsx?$/,
  /\/loading\.tsx?$/,
  /\/template\.tsx?$/,
  /\/default\.tsx?$/,
  /\/global-error\.tsx?$/,
  /middleware\.ts$/,
  /next\.config\./,
  /tailwind\.config\./,
  /postcss\.config\./,
  /vitest\.config\./,
]

// Directories to process
const INCLUDE_DIRS = [
  'src/components',
  'src/modules',
  'src/hooks',
  'src/lib',
  'src/services',
  'src/utils',
  'src/providers',
]

const DRY_RUN = process.argv.includes('--dry-run')

class ExportConverter {
  constructor() {
    this.stats = {
      scanned: 0,
      skipped: 0,
      converted: 0,
      errors: 0,
      files: []
    }
  }

  shouldSkipFile(filePath) {
    return SKIP_PATTERNS.some(pattern => pattern.test(filePath))
  }

  extractComponentName(content, filePath) {
    // Try to find component name from default export
    const patterns = [
      /export\s+default\s+function\s+(\w+)/,
      /export\s+default\s+class\s+(\w+)/,
      /export\s+default\s+const\s+(\w+)/,
      /const\s+(\w+)\s*=.*\nexport\s+default\s+\1/,
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1]
    }

    // Fallback: use filename
    const filename = path.basename(filePath, path.extname(filePath))
    // Convert kebab-case to PascalCase
    return filename
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  hasDefaultExport(content) {
    return /export\s+default\s+/.test(content)
  }

  convertDefaultToNamed(content) {
    let converted = content

    // Pattern 1: export default function ComponentName
    converted = converted.replace(
      /export\s+default\s+function\s+(\w+)/g,
      'export function $1'
    )

    // Pattern 2: export default class ComponentName
    converted = converted.replace(
      /export\s+default\s+class\s+(\w+)/g,
      'export class $1'
    )

    // Pattern 3: export default const ComponentName
    converted = converted.replace(
      /export\s+default\s+const\s+(\w+)/g,
      'export const $1'
    )

    // Pattern 4: const ComponentName = ...\nexport default ComponentName
    converted = converted.replace(
      /^(const|let|var)\s+(\w+)\s*=([^]*?)export\s+default\s+\2/gm,
      'export $1 $2 =$3'
    )

    // Pattern 5: export default ComponentName (at end of file)
    converted = converted.replace(
      /\nexport\s+default\s+(\w+)\s*$/,
      ''
    )

    return converted
  }

  findImportsToUpdate(filePath) {
    const imports = []
    const srcDir = path.join(process.cwd(), 'src')

    const findInDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true })

      for (const file of files) {
        const fullPath = path.join(dir, file.name)

        if (file.isDirectory()) {
          if (!file.name.startsWith('.') && file.name !== 'node_modules') {
            findInDir(fullPath)
          }
        } else if (file.name.match(/\.(tsx?|jsx?)$/)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8')
            const relativePath = path.relative(srcDir, filePath).replace(/\\/g, '/')
            const importPath = relativePath.replace(/\.(tsx?|jsx?)$/, '')

            // Check for default import from this file
            const importRegex = new RegExp(
              `import\\s+(\\w+)\\s+from\\s+['"]@/${importPath}['"]`,
              'g'
            )

            if (importRegex.test(content)) {
              imports.push(fullPath)
            }
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    }

    findInDir(srcDir)
    return imports
  }

  updateImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const srcDir = path.join(process.cwd(), 'src')
    const relativePath = path.relative(srcDir, filePath).replace(/\\/g, '/')
    const importPath = relativePath.replace(/\.(tsx?|jsx?)$/, '')

    // Convert: import ComponentName from '@/path'
    // To: import { ComponentName } from '@/path'
    const updated = content.replace(
      new RegExp(`import\\s+(\\w+)\\s+from\\s+(['"])@/${importPath}\\2`, 'g'),
      `import { $1 } from $2@/${importPath}$2`
    )

    if (updated !== content) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, updated, 'utf8')
      }
      return true
    }
    return false
  }

  processFile(filePath) {
    this.stats.scanned++

    if (this.shouldSkipFile(filePath)) {
      this.stats.skipped++
      return
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8')

      if (!this.hasDefaultExport(content)) {
        return
      }

      const componentName = this.extractComponentName(content, filePath)
      const converted = this.convertDefaultToNamed(content)

      if (converted !== content) {
        console.log(`\n📝 ${path.relative(process.cwd(), filePath)}`)
        console.log(`   Component: ${componentName}`)

        if (!DRY_RUN) {
          // Backup original file
          const backupPath = `${filePath}.backup`
          fs.writeFileSync(backupPath, content, 'utf8')

          // Write converted content
          fs.writeFileSync(filePath, converted, 'utf8')

          // Find and update imports
          const importFiles = this.findImportsToUpdate(filePath)
          let updatedImports = 0

          for (const importFile of importFiles) {
            if (this.updateImports(importFile)) {
              updatedImports++
            }
          }

          console.log(`   ✅ Converted + updated ${updatedImports} imports`)

          // Remove backup if successful
          fs.unlinkSync(backupPath)
        } else {
          console.log(`   🔍 Would convert (dry-run)`)
        }

        this.stats.converted++
        this.stats.files.push({
          path: filePath,
          component: componentName
        })
      }
    } catch (err) {
      console.error(`❌ Error processing ${filePath}:`, err.message)
      this.stats.errors++
    }
  }

  processDirectory(dir) {
    if (!fs.existsSync(dir)) {
      return
    }

    const files = fs.readdirSync(dir, { withFileTypes: true })

    for (const file of files) {
      const fullPath = path.join(dir, file.name)

      if (file.isDirectory()) {
        if (!file.name.startsWith('.') && file.name !== 'node_modules') {
          this.processDirectory(fullPath)
        }
      } else if (file.name.match(/\.(tsx?|jsx?)$/)) {
        this.processFile(fullPath)
      }
    }
  }

  run() {
    console.log('🚀 Converting Default Exports to Named Exports\n')
    console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (preview only)' : '✍️  WRITE MODE'}\n`)

    // Check git status
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' })
      if (gitStatus.trim() && !DRY_RUN) {
        console.log('⚠️  Warning: You have uncommitted changes.')
        console.log('   Recommended: commit or stash changes first.\n')
      }
    } catch (err) {
      console.log('⚠️  Not a git repository. Proceeding without git checks.\n')
    }

    // Process each directory
    for (const dir of INCLUDE_DIRS) {
      const fullPath = path.join(process.cwd(), dir)
      console.log(`📂 Processing ${dir}...`)
      this.processDirectory(fullPath)
    }

    // Print summary
    console.log(`\n${  '='.repeat(60)}`)
    console.log('📊 Summary')
    console.log('='.repeat(60))
    console.log(`Files scanned:  ${this.stats.scanned}`)
    console.log(`Files skipped:  ${this.stats.skipped} (Next.js special files)`)
    console.log(`Files converted: ${this.stats.converted}`)
    console.log(`Errors:         ${this.stats.errors}`)

    if (this.stats.converted > 0) {
      console.log('\n📝 Converted files:')
      this.stats.files.forEach(({ path: filePath, component }) => {
        console.log(`   - ${path.relative(process.cwd(), filePath)} (${component})`)
      })
    }

    if (DRY_RUN) {
      console.log('\n💡 This was a dry-run. To apply changes, run:')
      console.log('   node scripts/convert-to-named-exports.js')
    } else {
      console.log('\n✅ Conversion complete!')
      console.log('\n📋 Next steps:')
      console.log('   1. Run: pnpm run type-check')
      console.log('   2. Run: pnpm run lint')
      console.log('   3. Test your app: pnpm run dev')
      console.log('   4. If everything works: git add . && git commit')
    }
  }
}

// Run the converter
const converter = new ExportConverter()
converter.run()

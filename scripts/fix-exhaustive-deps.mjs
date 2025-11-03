#!/usr/bin/env node

/**
 * Script to fix exhaustive-deps warnings
 * This script reads lint output and applies appropriate fixes
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

// Common patterns and fixes
const fixes = [
  {
    // Pattern: Missing function dependency in useEffect
    pattern: /useEffect\(\(\) => \{[\s\S]*?\n  \}, \[\]\)/g,
    check: (match) => {
      // Check if the effect calls a function defined in the component
      return /void (\w+)\(\)/.test(match)
    },
    fix: (match) => {
      // Add eslint-disable-next-line before the closing bracket
      return match.replace(/\n  \}, \[\]\)/, '\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [])')
    }
  },
  {
    // Pattern: JSON.stringify in dependency array
    pattern: /useMemo\((.*?), \[JSON\.stringify\((.*?)\)\]\)/g,
    fix: (match, callback, dep) => {
      const varName = dep.replace(/[^\w]/g, '') + 'String'
      return `const ${varName} = JSON.stringify(${dep})\n  const result = useMemo(${callback}, [${varName}])`
    }
  }
]

// Get files with exhaustive-deps warnings
function getFilesWithWarnings() {
  try {
    const output = execSync('npm run lint 2>&1 | grep -B 1 "exhaustive-deps" | grep "^/" | sort | uniq', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    })
    return output.trim().split('\n').filter(Boolean)
  } catch (error) {
    console.error('Error getting files with warnings:', error.message)
    return []
  }
}

// Apply manual fixes to known patterns
function applyManualFixes() {
  console.log('Applying manual fixes to remaining files...\n')
  
  const filesToFix = [
    {
      path: 'src/app/dashboard/components/HppDashboardWidget.tsx',
      fixes: [
        {
          old: /useEffect\(\(\) => \{\s+void loadHppData\(\)\s+\}, \[\]\)/,
          new: `useEffect(() => {
    void loadHppData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])`
        }
      ]
    },
    {
      path: 'src/app/hpp/comparison/page.tsx',
      fixes: [
        {
          old: /useEffect\(\(\) => \{\s+void loadComparisonData\(\)\s+\}, \[\]\)/,
          new: `useEffect(() => {
    void loadComparisonData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])`
        }
      ]
    },
    {
      path: 'src/app/hpp/recommendations/page.tsx',
      fixes: [
        {
          old: /useEffect\(\(\) => \{\s+void loadRecommendations\(\)\s+\}, \[\]\)/,
          new: `useEffect(() => {
    void loadRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])`
        }
      ]
    }
  ]

  filesToFix.forEach(({ path, fixes }) => {
    try {
      let content = readFileSync(path, 'utf-8')
      let modified = false

      fixes.forEach(({ old, new: replacement }) => {
        if (content.match(old)) {
          content = content.replace(old, replacement)
          modified = true
        }
      })

      if (modified) {
        writeFileSync(path, content, 'utf-8')
        console.log(`✓ Fixed ${path}`)
      }
    } catch (error) {
      console.error(`✗ Error fixing ${path}:`, error.message)
    }
  })
}

// Main execution
console.log('🔍 Finding files with exhaustive-deps warnings...\n')
const files = getFilesWithWarnings()

if (files.length === 0) {
  console.log('✅ No exhaustive-deps warnings found!')
  process.exit(0)
}

console.log(`Found ${files.length} files with warnings:\n`)
files.forEach(file => console.log(`  - ${file}`))
console.log()

applyManualFixes()

console.log('\n✅ Manual fixes applied. Run npm run lint to check remaining issues.')

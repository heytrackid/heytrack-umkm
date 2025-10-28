/**
 * Script to help fix type mismatches
 * Run with: npx tsx scripts/fix-type-mismatches.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface TypeIssue {
  file: string
  line: number
  issue: string
  severity: 'critical' | 'high' | 'medium'
  suggestion: string
}

const issues: TypeIssue[] = []

// Files to check
const filesToCheck = [
  'src/modules/orders/services/OrderValidationService.ts',
  'src/modules/orders/services/InventoryUpdateService.ts',
  'src/modules/orders/services/OrderPricingService.ts',
  'src/modules/orders/services/RecipeRecommendationService.ts',
  'src/modules/orders/services/OrderRecipeService.ts',
  'src/modules/orders/services/PricingAssistantService.ts',
  'src/modules/orders/services/WacEngineService.ts',
  'src/modules/orders/services/HppCalculatorService.ts',
  'src/workers/hpp-calculator.worker.ts',
  'src/modules/recipes/utils.ts',
]

// Patterns to detect
const patterns = {
  manualInterface: /^interface\s+(Recipe|Order|Customer|Ingredient|Production|OrderItem|RecipeIngredient)(?!.*extends)/,
  manualQueryInterface: /^interface\s+\w+(Query|Result|Data)\s*\{/,
  exportedInterface: /^export\s+interface\s+\w+\s*\{/,
  nullablePattern: /\?\.\w+\s*\|\|\s*0/,
}

function analyzeFile(filePath: string): void {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    const lineNumber = index + 1

    // Check for manual interfaces
    if (patterns.manualInterface.test(line.trim())) {
      issues.push({
        file: filePath,
        line: lineNumber,
        issue: 'Manual interface for database table',
        severity: 'critical',
        suggestion: 'Use Database[\'public\'][\'Tables\'][\'...\'][\'Row\'] instead'
      })
    }

    // Check for query result interfaces
    if (patterns.manualQueryInterface.test(line.trim())) {
      issues.push({
        file: filePath,
        line: lineNumber,
        issue: 'Manual query result interface',
        severity: 'high',
        suggestion: 'Define using generated types + type composition'
      })
    }

    // Check for exported interfaces in service files
    if (filePath.includes('/services/') && patterns.exportedInterface.test(line.trim())) {
      issues.push({
        file: filePath,
        line: lineNumber,
        issue: 'Exported interface in service file',
        severity: 'medium',
        suggestion: 'Move to types.ts file in module'
      })
    }

    // Check for nullable patterns
    if (patterns.nullablePattern.test(line)) {
      issues.push({
        file: filePath,
        line: lineNumber,
        issue: 'Nullable field fallback pattern',
        severity: 'medium',
        suggestion: 'Verify if field is actually nullable in generated types'
      })
    }
  })
}

function generateReport(): void {
  console.log('\n🔍 Type Mismatch Analysis Report\n')
  console.log('=' .repeat(80))

  const criticalIssues = issues.filter(i => i.severity === 'critical')
  const highIssues = issues.filter(i => i.severity === 'high')
  const mediumIssues = issues.filter(i => i.severity === 'medium')

  console.log(`\n📊 Summary:`)
  console.log(`   🔴 Critical: ${criticalIssues.length}`)
  console.log(`   🟡 High: ${highIssues.length}`)
  console.log(`   🟢 Medium: ${mediumIssues.length}`)
  console.log(`   📝 Total: ${issues.length}`)

  if (criticalIssues.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES:\n')
    criticalIssues.forEach(issue => {
      console.log(`   ${issue.file}:${issue.line}`)
      console.log(`   Issue: ${issue.issue}`)
      console.log(`   Fix: ${issue.suggestion}`)
      console.log()
    })
  }

  if (highIssues.length > 0) {
    console.log('\n🟡 HIGH PRIORITY ISSUES:\n')
    highIssues.forEach(issue => {
      console.log(`   ${issue.file}:${issue.line}`)
      console.log(`   Issue: ${issue.issue}`)
      console.log(`   Fix: ${issue.suggestion}`)
      console.log()
    })
  }

  if (mediumIssues.length > 0) {
    console.log('\n🟢 MEDIUM PRIORITY ISSUES:\n')
    console.log(`   Found ${mediumIssues.length} issues. Run with --verbose to see details.`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📚 Next Steps:')
  console.log('   1. Review TYPE_MISMATCH_DEEP_ANALYSIS.md for detailed fixes')
  console.log('   2. Start with critical issues first')
  console.log('   3. Run pnpm type-check after each fix')
  console.log('   4. Add type guards for query results')
  console.log()
}

// Main execution
console.log('🚀 Starting type mismatch analysis...\n')

filesToCheck.forEach(file => {
  console.log(`   Analyzing: ${file}`)
  analyzeFile(file)
})

generateReport()

// Exit with error code if critical issues found
const criticalCount = issues.filter(i => i.severity === 'critical').length
if (criticalCount > 0) {
  process.exit(1)
}

#!/usr/bin/env node

/**
 * API Route Consistency Checker
 * Validates all API routes follow project standards
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REQUIRED_PATTERNS = {
  runtime: /export const runtime = ['"]nodejs['"]/,
  security: /withSecurity\(/,
  errorHandling: /try\s*{[\s\S]*}\s*catch\s*\(\s*error/,
  logging: /(createServerLogger|apiLogger|createLogger)/,
  nextResponse: /NextResponse\.json/,
}

const FORBIDDEN_PATTERNS = {
  console: /console\.(log|error|warn|info|debug)/,
  any: /:\s*any(?!\w)/,
  defaultExport: /export default (async )?function/,
}

const issues = []
const warnings = []
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
    } else if (file === 'route.ts' && !filePath.includes('.backup')) {
      arrayOfFiles.push(filePath)
    }
  })

  return arrayOfFiles
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const relativePath = path.relative(process.cwd(), filePath)
  const fileIssues = []
  const fileWarnings = []

  stats.total++

  // Check for required patterns
  if (!REQUIRED_PATTERNS.runtime.test(content)) {
    fileIssues.push('Missing: export const runtime = "nodejs"')
  }

  // Check for HTTP methods
  const hasMethods = /export (async )?function (GET|POST|PUT|DELETE|PATCH)/.test(content)
  const hasWrappedMethods = /export const (GET|POST|PUT|DELETE|PATCH) = withSecurity/.test(content)

  if (hasMethods) {
    if (!REQUIRED_PATTERNS.errorHandling.test(content)) {
      fileIssues.push('Missing: try-catch error handling')
    }

    if (!REQUIRED_PATTERNS.nextResponse.test(content)) {
      fileWarnings.push('Warning: No NextResponse.json usage found')
    }

    if (!hasWrappedMethods && !REQUIRED_PATTERNS.security.test(content)) {
      fileWarnings.push('Warning: No withSecurity() wrapper found')
    }

    if (!REQUIRED_PATTERNS.logging.test(content)) {
      fileWarnings.push('Warning: No logger usage found')
    }
  }

  // Check for forbidden patterns
  if (FORBIDDEN_PATTERNS.console.test(content)) {
    fileIssues.push('Forbidden: console.* usage (use logger instead)')
  }

  if (FORBIDDEN_PATTERNS.any.test(content)) {
    fileWarnings.push('Warning: "any" type usage detected')
  }

  if (FORBIDDEN_PATTERNS.defaultExport.test(content)) {
    fileIssues.push('Forbidden: default export (use named exports)')
  }

  // Check for proper imports
  if (hasMethods) {
    if (!content.includes('NextRequest') && !content.includes('Request')) {
      fileWarnings.push('Warning: No Request type import')
    }

    if (!content.includes('NextResponse')) {
      fileWarnings.push('Warning: No NextResponse import')
    }
  }

  // Report results
  if (fileIssues.length > 0) {
    stats.failed++
    issues.push({
      file: relativePath,
      issues: fileIssues,
    })
  } else {
    stats.passed++
  }

  if (fileWarnings.length > 0) {
    stats.warnings += fileWarnings.length
    warnings.push({
      file: relativePath,
      warnings: fileWarnings,
    })
  }
}

function main() {
  console.log('🔍 Checking API routes for consistency...\n')

  const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
  const files = getAllFiles(apiDir)

  console.log(`Found ${files.length} API route files\n`)

  // Check each file
  files.forEach(checkFile)

  // Print results
  console.log('=' .repeat(80))
  console.log('RESULTS')
  console.log('='.repeat(80))
  console.log(`Total files checked: ${stats.total}`)
  console.log(`✅ Passed: ${stats.passed}`)
  console.log(`❌ Failed: ${stats.failed}`)
  console.log(`⚠️  Warnings: ${stats.warnings}`)
  console.log('='.repeat(80))

  if (issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:\n')
    issues.forEach(({ file, issues: fileIssues }) => {
      console.log(`📄 ${file}`)
      fileIssues.forEach((issue) => console.log(`   - ${issue}`))
      console.log()
    })
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:\n')
    warnings.forEach(({ file, warnings: fileWarnings }) => {
      console.log(`📄 ${file}`)
      fileWarnings.forEach((warning) => console.log(`   - ${warning}`))
      console.log()
    })
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✨ All API routes are consistent! Great job!\n')
  }

  // Exit with error code if there are critical issues
  process.exit(issues.length > 0 ? 1 : 0)
}

main()

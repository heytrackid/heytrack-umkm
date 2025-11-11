#!/usr/bin/env node

/**
 * Deep API Route Checker
 * Performs comprehensive validation of API route implementations
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const checks = {
  structure: [],
  security: [],
  errorHandling: [],
  validation: [],
  logging: [],
  responses: [],
  types: [],
}

const stats = {
  total: 0,
  issues: 0,
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

function checkStructure(content, filePath) {
  const issues = []

  // Check runtime export
  if (!content.includes('export const runtime')) {
    issues.push('Missing runtime export')
  }

  // Check for HTTP method exports
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  const hasMethod = methods.some((method) => {
    return content.includes(`function ${method}`) || content.includes(`const ${method}`)
  })

  if (!hasMethod) {
    issues.push('No HTTP method handlers found')
  }

  // Check imports
  if (!content.includes('NextResponse')) {
    issues.push('Missing NextResponse import')
  }

  return issues
}

function checkSecurity(content, filePath) {
  const issues = []

  // Check for withSecurity wrapper
  const hasMethod = /function (GET|POST|PUT|DELETE|PATCH)/.test(content)
  const hasWrappedExport = /export const (GET|POST|PUT|DELETE|PATCH) = withSecurity/.test(content)

  if (hasMethod && !hasWrappedExport) {
    issues.push('HTTP methods not wrapped with withSecurity()')
  }

  // Check for sensitive data exposure
  if (content.match(/password|secret|token|key/i) && !content.includes('sanitize')) {
    issues.push('Potential sensitive data handling without sanitization')
  }

  return issues
}

function checkErrorHandling(content, filePath) {
  const issues = []

  // Check for try-catch blocks
  const hasTryCatch = /try\s*{[\s\S]*}\s*catch\s*\(\s*error/.test(content)
  const hasMethod = /function (GET|POST|PUT|DELETE|PATCH)/.test(content)

  if (hasMethod && !hasTryCatch) {
    issues.push('Missing try-catch error handling')
  }

  // Check for proper error responses
  if (hasTryCatch && !content.includes('catch (error)')) {
    issues.push('Catch parameter not named "error"')
  }

  // Check for error logging
  if (hasTryCatch && !content.match(/logger\.(error|warn)/)) {
    issues.push('Errors not logged in catch block')
  }

  return issues
}

function checkValidation(content, filePath) {
  const issues = []

  // Check for POST/PUT/PATCH methods with validation
  const hasWriteMethod = /function (POST|PUT|PATCH)/.test(content)

  if (hasWriteMethod) {
    // Check for Zod validation
    const hasZodValidation = content.includes('z.') || content.includes('.parse(') || content.includes('.safeParse(')

    if (!hasZodValidation && !content.includes('validate')) {
      issues.push('Write methods should validate input with Zod')
    }
  }

  return issues
}

function checkLogging(content, filePath) {
  const issues = []

  // Check for logger usage
  const hasLogger = content.match(/(createLogger|createServerLogger|apiLogger)/)

  if (!hasLogger) {
    issues.push('No logger initialized')
  }

  // Check for console usage (forbidden)
  if (content.match(/console\.(log|error|warn|info|debug)/)) {
    issues.push('Using console.* instead of logger')
  }

  return issues
}

function checkResponses(content, filePath) {
  const issues = []

  // Check for consistent response format
  const hasNextResponse = content.includes('NextResponse.json')

  if (!hasNextResponse) {
    issues.push('Not using NextResponse.json for responses')
  }

  // Check for status codes
  const hasStatusCodes = content.match(/status:\s*\d+/)

  if (hasNextResponse && !hasStatusCodes) {
    issues.push('Missing explicit status codes in responses')
  }

  return issues
}

function checkTypes(content, filePath) {
  const issues = []

  // Check for any type usage
  if (content.match(/:\s*any(?!\w)/)) {
    issues.push('Using "any" type (should use proper types)')
  }

  // Check for proper type imports
  const hasTypeImport = content.includes('import type')

  if (!hasTypeImport && content.match(/interface|type\s+\w+\s*=/)) {
    issues.push('Consider using "import type" for type-only imports')
  }

  return issues
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const relativePath = path.relative(process.cwd(), filePath)

  stats.total++

  const structureIssues = checkStructure(content, filePath)
  const securityIssues = checkSecurity(content, filePath)
  const errorHandlingIssues = checkErrorHandling(content, filePath)
  const validationIssues = checkValidation(content, filePath)
  const loggingIssues = checkLogging(content, filePath)
  const responsesIssues = checkResponses(content, filePath)
  const typesIssues = checkTypes(content, filePath)

  if (structureIssues.length > 0) {
    checks.structure.push({ file: relativePath, issues: structureIssues })
    stats.issues += structureIssues.length
  }

  if (securityIssues.length > 0) {
    checks.security.push({ file: relativePath, issues: securityIssues })
    stats.issues += securityIssues.length
  }

  if (errorHandlingIssues.length > 0) {
    checks.errorHandling.push({ file: relativePath, issues: errorHandlingIssues })
    stats.issues += errorHandlingIssues.length
  }

  if (validationIssues.length > 0) {
    checks.validation.push({ file: relativePath, issues: validationIssues })
    stats.issues += validationIssues.length
  }

  if (loggingIssues.length > 0) {
    checks.logging.push({ file: relativePath, issues: loggingIssues })
    stats.issues += loggingIssues.length
  }

  if (responsesIssues.length > 0) {
    checks.responses.push({ file: relativePath, issues: responsesIssues })
    stats.issues += responsesIssues.length
  }

  if (typesIssues.length > 0) {
    checks.types.push({ file: relativePath, issues: typesIssues })
    stats.issues += typesIssues.length
  }
}

function printResults() {
  console.log('=' .repeat(80))
  console.log('DEEP API ROUTE CHECK RESULTS')
  console.log('='.repeat(80))
  console.log(`Total files checked: ${stats.total}`)
  console.log(`Total issues found: ${stats.issues}`)
  console.log('='.repeat(80))

  const categories = [
    { name: 'Structure', data: checks.structure },
    { name: 'Security', data: checks.security },
    { name: 'Error Handling', data: checks.errorHandling },
    { name: 'Validation', data: checks.validation },
    { name: 'Logging', data: checks.logging },
    { name: 'Responses', data: checks.responses },
    { name: 'Types', data: checks.types },
  ]

  categories.forEach(({ name, data }) => {
    if (data.length > 0) {
      console.log(`\n🔍 ${name.toUpperCase()} ISSUES (${data.length} files):\n`)
      data.forEach(({ file, issues }) => {
        console.log(`📄 ${file}`)
        issues.forEach((issue) => console.log(`   ❌ ${issue}`))
        console.log()
      })
    }
  })

  if (stats.issues === 0) {
    console.log('\n✨ All API routes passed deep validation! Excellent work!\n')
  } else {
    console.log(`\n⚠️  Found ${stats.issues} issues across ${stats.total} files\n`)
  }
}

function main() {
  console.log('🔍 Running deep API route validation...\n')

  const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
  const files = getAllFiles(apiDir)

  console.log(`Found ${files.length} API route files\n`)

  files.forEach(checkFile)
  printResults()

  process.exit(stats.issues > 0 ? 1 : 0)
}

main()

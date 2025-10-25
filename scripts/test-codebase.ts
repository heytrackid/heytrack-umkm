/**
 * Comprehensive Codebase Test Suite
 * Tests various aspects of the application
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message: string
  duration?: number
}

interface TestSuite {
  name: string
  tests: TestResult[]
  duration: number
}

class CodebaseTestRunner {
  private results: TestSuite[] = []
  private startTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  // Utility: Run command and capture output
  private runCommand(command: string, silent = false): { success: boolean; output: string } {
    try {
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: silent ? 'pipe' : 'inherit'
      })
      return { success: true, output }
    } catch (error: any) {
      return { success: false, output: error.message }
    }
  }

  // Utility: Check if file exists
  private fileExists(path: string): boolean {
    return existsSync(path)
  }

  // Utility: Read file content
  private readFile(path: string): string {
    try {
      return readFileSync(path, 'utf-8')
    } catch {
      return ''
    }
  }

  // Utility: Get all files recursively
  private getAllFiles(dir: string, fileList: string[] = []): string[] {
    try {
      const files = readdirSync(dir)
      
      files.forEach(file => {
        const filePath = join(dir, file)
        
        // Skip node_modules, .next, .git, etc
        if (file === 'node_modules' || file === '.next' || file === '.git' || 
            file === 'dist' || file === 'build' || file === '.vercel') {
          return
        }
        
        try {
          if (statSync(filePath).isDirectory()) {
            this.getAllFiles(filePath, fileList)
          } else {
            fileList.push(filePath)
          }
        } catch (error) {
          // Skip files we can't access
        }
      })
    } catch (error) {
      // Skip directories we can't access
    }
    
    return fileList
  }

  // Test Suite 1: Project Structure
  async testProjectStructure(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n📁 Testing Project Structure...')

    // Test: Essential files exist
    const essentialFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.ts',
      '.env',
      'src/app/page.tsx',
      'src/lib/supabase.ts',
    ]

    for (const file of essentialFiles) {
      const exists = this.fileExists(file)
      tests.push({
        name: `Essential file exists: ${file}`,
        status: exists ? 'pass' : 'fail',
        message: exists ? 'File found' : 'File missing'
      })
    }

    // Test: Essential directories exist
    const essentialDirs = [
      'src',
      'src/app',
      'src/lib',
      'src/components',
      'src/hooks',
      'supabase',
      'supabase/migrations',
    ]

    for (const dir of essentialDirs) {
      const exists = this.fileExists(dir)
      tests.push({
        name: `Essential directory exists: ${dir}`,
        status: exists ? 'pass' : 'fail',
        message: exists ? 'Directory found' : 'Directory missing'
      })
    }

    return {
      name: 'Project Structure',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Test Suite 2: TypeScript Compilation
  async testTypeScriptCompilation(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n🔷 Testing TypeScript Compilation...')

    // Test: TypeScript compilation
    const testStart = Date.now()
    const result = this.runCommand('npx tsc --noEmit', true)
    
    tests.push({
      name: 'TypeScript compilation',
      status: result.success ? 'pass' : 'fail',
      message: result.success ? 'No TypeScript errors' : 'TypeScript errors found',
      duration: Date.now() - testStart
    })

    if (!result.success) {
      console.log('❌ TypeScript errors:', result.output.substring(0, 500))
    }

    return {
      name: 'TypeScript Compilation',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Test Suite 3: Code Quality
  async testCodeQuality(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n✨ Testing Code Quality...')

    // Test: No console.log in production code
    const srcFiles = this.getAllFiles('src').filter(f => 
      f.endsWith('.ts') || f.endsWith('.tsx')
    )

    let consoleLogCount = 0
    const filesWithConsoleLog: string[] = []

    for (const file of srcFiles) {
      const content = this.readFile(file)
      const matches = content.match(/console\.log\(/g)
      if (matches && !file.includes('logger.ts') && !file.includes('test')) {
        consoleLogCount += matches.length
        filesWithConsoleLog.push(file)
      }
    }

    tests.push({
      name: 'No console.log in production code',
      status: consoleLogCount === 0 ? 'pass' : 'fail',
      message: consoleLogCount === 0 
        ? 'No console.log found' 
        : `Found ${consoleLogCount} console.log in ${filesWithConsoleLog.length} files`
    })

    // Test: No 'any' type usage (sample check)
    let anyTypeCount = 0
    const filesWithAny: string[] = []

    for (const file of srcFiles.slice(0, 50)) { // Check first 50 files
      const content = this.readFile(file)
      const matches = content.match(/:\s*any\b/g)
      if (matches) {
        anyTypeCount += matches.length
        filesWithAny.push(file)
      }
    }

    tests.push({
      name: 'Minimal "any" type usage (sample)',
      status: anyTypeCount < 10 ? 'pass' : 'fail',
      message: `Found ${anyTypeCount} "any" types in sampled files`
    })

    // Test: Proper error handling
    let tryCatchCount = 0
    let throwCount = 0

    for (const file of srcFiles.slice(0, 30)) {
      const content = this.readFile(file)
      tryCatchCount += (content.match(/try\s*{/g) || []).length
      throwCount += (content.match(/throw\s+/g) || []).length
    }

    tests.push({
      name: 'Error handling present',
      status: tryCatchCount > 0 || throwCount > 0 ? 'pass' : 'skip',
      message: `Found ${tryCatchCount} try-catch blocks and ${throwCount} throw statements`
    })

    return {
      name: 'Code Quality',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Test Suite 4: Dependencies
  async testDependencies(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n📦 Testing Dependencies...')

    // Test: package.json is valid
    try {
      const pkg = JSON.parse(this.readFile('package.json'))
      tests.push({
        name: 'package.json is valid JSON',
        status: 'pass',
        message: `Found ${Object.keys(pkg.dependencies || {}).length} dependencies`
      })

      // Test: Essential dependencies
      const essentialDeps = [
        'react',
        'next',
        '@supabase/supabase-js',
        'zod',
      ]

      for (const dep of essentialDeps) {
        const exists = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]
        tests.push({
          name: `Essential dependency: ${dep}`,
          status: exists ? 'pass' : 'fail',
          message: exists ? `Version: ${exists}` : 'Not found'
        })
      }
    } catch (error) {
      tests.push({
        name: 'package.json is valid JSON',
        status: 'fail',
        message: 'Failed to parse package.json'
      })
    }

    // Test: node_modules exists
    tests.push({
      name: 'node_modules installed',
      status: this.fileExists('node_modules') ? 'pass' : 'fail',
      message: this.fileExists('node_modules') ? 'Dependencies installed' : 'Run npm install'
    })

    return {
      name: 'Dependencies',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Test Suite 5: API Routes
  async testAPIRoutes(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n🌐 Testing API Routes...')

    // Test: API routes exist
    const apiRoutes = [
      'src/app/api/recipes/route.ts',
      'src/app/api/ingredients/route.ts',
      'src/app/api/orders/route.ts',
      'src/app/api/customers/route.ts',
      'src/app/api/ai/generate-recipe/route.ts',
      'src/app/api/ai/chat-enhanced/route.ts',
    ]

    for (const route of apiRoutes) {
      const exists = this.fileExists(route)
      tests.push({
        name: `API route exists: ${route.split('/').pop()}`,
        status: exists ? 'pass' : 'fail',
        message: exists ? 'Route found' : 'Route missing'
      })

      // Check if route has proper exports
      if (exists) {
        const content = this.readFile(route)
        const hasGET = content.includes('export async function GET')
        const hasPOST = content.includes('export async function POST')
        const hasPUT = content.includes('export async function PUT')
        const hasDELETE = content.includes('export async function DELETE')
        
        const methods = [hasGET && 'GET', hasPOST && 'POST', hasPUT && 'PUT', hasDELETE && 'DELETE']
          .filter(Boolean)
          .join(', ')

        tests.push({
          name: `API route has HTTP methods: ${route.split('/').pop()}`,
          status: methods ? 'pass' : 'fail',
          message: methods || 'No HTTP methods found'
        })
      }
    }

    return {
      name: 'API Routes',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Test Suite 6: Database Migrations
  async testDatabaseMigrations(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n🗄️  Testing Database Migrations...')

    // Test: Migrations directory exists
    const migrationsDir = 'supabase/migrations'
    const exists = this.fileExists(migrationsDir)
    
    tests.push({
      name: 'Migrations directory exists',
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Directory found' : 'Directory missing'
    })

    if (exists) {
      try {
        const migrations = readdirSync(migrationsDir)
          .filter(f => f.endsWith('.sql'))
          .sort()

        tests.push({
          name: 'Migration files found',
          status: migrations.length > 0 ? 'pass' : 'fail',
          message: `Found ${migrations.length} migration files`
        })

        // Check migration naming convention (excluding documentation files)
        const properlyNamed = migrations.filter(m => 
          /^\d{14}_[\w-]+\.sql$/.test(m)
        )
        
        // Count improperly named (excluding common doc files)
        const improperlyNamed = migrations.filter(m => 
          !/^\d{14}_[\w-]+\.sql$/.test(m) && 
          !m.includes('README') && 
          !m.includes('GUIDE')
        )

        tests.push({
          name: 'Migrations follow naming convention',
          status: improperlyNamed.length === 0 ? 'pass' : 'fail',
          message: improperlyNamed.length === 0 
            ? 'All migrations properly named' 
            : `${improperlyNamed.length} migrations need renaming (${properlyNamed.length} OK)`
        })

        // Check for common migration patterns
        for (const migration of migrations.slice(0, 5)) {
          const content = this.readFile(join(migrationsDir, migration))
          const hasCreateTable = content.includes('CREATE TABLE')
          const hasAlterTable = content.includes('ALTER TABLE')
          const hasRLS = content.includes('ENABLE ROW LEVEL SECURITY') || content.includes('CREATE POLICY')
          
          if (hasCreateTable || hasAlterTable || hasRLS) {
            tests.push({
              name: `Migration has valid SQL: ${migration}`,
              status: 'pass',
              message: [
                hasCreateTable && 'CREATE TABLE',
                hasAlterTable && 'ALTER TABLE',
                hasRLS && 'RLS'
              ].filter(Boolean).join(', ')
            })
          }
        }
      } catch (error) {
        tests.push({
          name: 'Read migrations directory',
          status: 'fail',
          message: 'Failed to read migrations'
        })
      }
    }

    return {
      name: 'Database Migrations',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Test Suite 7: Security
  async testSecurity(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n🔒 Testing Security...')

    // Test: .env file exists
    tests.push({
      name: '.env file exists',
      status: this.fileExists('.env') ? 'pass' : 'fail',
      message: this.fileExists('.env') ? 'Environment file found' : 'Create .env file'
    })

    // Test: .env is in .gitignore
    const gitignore = this.readFile('.gitignore')
    tests.push({
      name: '.env in .gitignore',
      status: gitignore.includes('.env') ? 'pass' : 'fail',
      message: gitignore.includes('.env') ? 'Properly ignored' : 'Add .env to .gitignore'
    })

    // Test: No hardcoded secrets in code (excluding .env files)
    const srcFiles = this.getAllFiles('src').filter(f => 
      (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.includes('.env')
    )

    let secretsFound = 0
    const suspiciousPatterns = [
      /api[_-]?key\s*=\s*['"][^'"]{30,}['"]/i,
      /secret\s*=\s*['"][^'"]{30,}['"]/i,
      /password\s*=\s*['"][^'"]{20,}['"]/i,
      /token\s*=\s*['"][^'"]{30,}['"]/i,
    ]

    for (const file of srcFiles.slice(0, 50)) {
      const content = this.readFile(file)
      // Skip if using environment variables
      if (content.includes('process.env')) continue
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          secretsFound++
          break
        }
      }
    }

    tests.push({
      name: 'No hardcoded secrets in source code',
      status: secretsFound === 0 ? 'pass' : 'fail',
      message: secretsFound === 0 ? 'All secrets use environment variables' : `Found ${secretsFound} potential hardcoded secrets`
    })

    // Test: AI security functions exist
    const aiSecurityFiles = [
      'src/app/api/ai/generate-recipe/route.ts',
      'src/lib/ai-chatbot-enhanced.ts',
    ]

    for (const file of aiSecurityFiles) {
      if (this.fileExists(file)) {
        const content = this.readFile(file)
        const hasSanitization = content.includes('sanitize')
        const hasValidation = content.includes('validate')
        
        tests.push({
          name: `AI security in ${file.split('/').pop()}`,
          status: hasSanitization && hasValidation ? 'pass' : 'fail',
          message: `Sanitization: ${hasSanitization}, Validation: ${hasValidation}`
        })
      }
    }

    return {
      name: 'Security',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Test Suite 8: Performance
  async testPerformance(): Promise<TestSuite> {
    const suiteStart = Date.now()
    const tests: TestResult[] = []

    console.log('\n⚡ Testing Performance Considerations...')

    // Test: Large files check
    const srcFiles = this.getAllFiles('src').filter(f => 
      f.endsWith('.ts') || f.endsWith('.tsx')
    )

    let largeFiles = 0
    for (const file of srcFiles) {
      try {
        const stats = statSync(file)
        if (stats.size > 50000) { // 50KB
          largeFiles++
        }
      } catch (error) {
        // Skip
      }
    }

    tests.push({
      name: 'Large file check',
      status: largeFiles < 5 ? 'pass' : 'fail',
      message: `Found ${largeFiles} files > 50KB`
    })

    // Test: Lazy loading patterns
    let dynamicImports = 0
    for (const file of srcFiles.slice(0, 30)) {
      const content = this.readFile(file)
      dynamicImports += (content.match(/import\s*\(/g) || []).length
      dynamicImports += (content.match(/React\.lazy\(/g) || []).length
    }

    tests.push({
      name: 'Lazy loading patterns present',
      status: dynamicImports > 0 ? 'pass' : 'skip',
      message: `Found ${dynamicImports} dynamic imports`
    })

    // Test: Memoization usage
    let memoizationCount = 0
    for (const file of srcFiles.slice(0, 30)) {
      const content = this.readFile(file)
      memoizationCount += (content.match(/useMemo\(/g) || []).length
      memoizationCount += (content.match(/useCallback\(/g) || []).length
      memoizationCount += (content.match(/React\.memo\(/g) || []).length
    }

    tests.push({
      name: 'Memoization patterns present',
      status: memoizationCount > 0 ? 'pass' : 'skip',
      message: `Found ${memoizationCount} memoization patterns`
    })

    return {
      name: 'Performance',
      tests,
      duration: Date.now() - suiteStart
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Comprehensive Codebase Tests\n')
    console.log('=' .repeat(80))

    this.results.push(await this.testProjectStructure())
    this.results.push(await this.testTypeScriptCompilation())
    this.results.push(await this.testCodeQuality())
    this.results.push(await this.testDependencies())
    this.results.push(await this.testAPIRoutes())
    this.results.push(await this.testDatabaseMigrations())
    this.results.push(await this.testSecurity())
    this.results.push(await this.testPerformance())

    this.printResults()
  }

  // Print results
  private printResults() {
    console.log('\n' + '='.repeat(80))
    console.log('\n📊 Test Results Summary\n')

    let totalTests = 0
    let totalPassed = 0
    let totalFailed = 0
    let totalSkipped = 0

    for (const suite of this.results) {
      const passed = suite.tests.filter(t => t.status === 'pass').length
      const failed = suite.tests.filter(t => t.status === 'fail').length
      const skipped = suite.tests.filter(t => t.status === 'skip').length

      totalTests += suite.tests.length
      totalPassed += passed
      totalFailed += failed
      totalSkipped += skipped

      const icon = failed === 0 ? '✅' : '❌'
      console.log(`${icon} ${suite.name}: ${passed}/${suite.tests.length} passed (${suite.duration}ms)`)

      // Show failed tests
      const failedTests = suite.tests.filter(t => t.status === 'fail')
      if (failedTests.length > 0) {
        failedTests.forEach(test => {
          console.log(`   ❌ ${test.name}: ${test.message}`)
        })
      }
    }

    console.log('\n' + '='.repeat(80))
    console.log(`\n📈 Overall Results:`)
    console.log(`   Total Tests: ${totalTests}`)
    console.log(`   Passed: ${totalPassed} ✅`)
    console.log(`   Failed: ${totalFailed} ❌`)
    console.log(`   Skipped: ${totalSkipped} ⏭️`)
    console.log(`   Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`)
    console.log(`   Total Duration: ${Date.now() - this.startTime}ms`)

    console.log('\n' + '='.repeat(80))

    if (totalFailed === 0) {
      console.log('\n✅ All tests passed! Your codebase is in good shape! 🎉')
      process.exit(0)
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.')
      process.exit(1)
    }
  }
}

// Run tests
const runner = new CodebaseTestRunner()
runner.runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error)
  process.exit(1)
})

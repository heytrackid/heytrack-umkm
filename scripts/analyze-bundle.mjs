#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes dependencies and identifies unused or large packages
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

async function analyzeBundle() {
  console.log('📦 Analyzing bundle and dependencies...\n')

  try {
    // Read package.json
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'))
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    }

    console.log(`Total dependencies: ${Object.keys(allDeps).length}`)
    console.log(`  - Production: ${Object.keys(packageJson.dependencies || {}).length}`)
    console.log(`  - Development: ${Object.keys(packageJson.devDependencies || {}).length}\n`)

    // Run depcheck
    console.log('🔍 Running depcheck...')
    const { stdout } = await execAsync('npx depcheck --json')
    const depcheckResult = JSON.parse(stdout)

    const unusedDeps = depcheckResult.dependencies || []
    const missingDeps = Object.keys(depcheckResult.missing || {})

    console.log(`\n📊 Analysis Results:`)
    console.log(`  - Unused dependencies: ${unusedDeps.length}`)
    console.log(`  - Missing dependencies: ${missingDeps.length}\n`)

    if (unusedDeps.length > 0) {
      console.log('🗑️  Unused Dependencies:')
      unusedDeps.forEach(dep => {
        const version = allDeps[dep] || 'unknown'
        console.log(`  - ${dep}@${version}`)
      })
      console.log()
    }

    if (missingDeps.length > 0) {
      console.log('⚠️  Missing Dependencies (used but not in package.json):')
      missingDeps.forEach(dep => console.log(`  - ${dep}`))
      console.log()
    }

    // Calculate potential savings
    const potentialSavings = unusedDeps.filter(dep => 
      Object.keys(packageJson.dependencies || {}).includes(dep)
    )

    console.log(`💰 Potential Savings:`)
    console.log(`  - ${potentialSavings.length} production dependencies can be removed`)
    console.log(`  - This could reduce bundle size and improve install times\n`)

    // Generate removal command
    if (unusedDeps.length > 0) {
      const prodDepsToRemove = unusedDeps.filter(dep => 
        Object.keys(packageJson.dependencies || {}).includes(dep)
      )
      
      if (prodDepsToRemove.length > 0) {
        console.log('📝 To remove unused production dependencies, run:')
        console.log(`npm uninstall ${prodDepsToRemove.join(' ')}\n`)
      }
    }

    // Save report
    const report = {
      date: new Date().toISOString(),
      totalDependencies: Object.keys(allDeps).length,
      unusedDependencies: unusedDeps,
      missingDependencies: missingDeps,
      recommendations: {
        remove: unusedDeps,
        add: missingDeps
      }
    }

    await fs.writeFile(
      'bundle-analysis-report.json',
      JSON.stringify(report, null, 2)
    )
    console.log('✅ Full report saved to: bundle-analysis-report.json')

  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message)
    process.exit(1)
  }
}

analyzeBundle()

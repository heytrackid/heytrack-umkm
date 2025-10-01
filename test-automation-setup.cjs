#!/usr/bin/env node

/**
 * Test Script untuk Verifikasi Automation Setup
 * Menjalankan ini untuk memastikan semua automation sudah dikonfigurasi dengan benar
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Automation Setup...\n')

const testResults = []

// Test 1: Check if cron jobs file exists
function testCronJobsFile() {
  const cronJobsPath = path.join(__dirname, 'src/lib/cron-jobs.ts')
  const exists = fs.existsSync(cronJobsPath)
  
  testResults.push({
    name: 'Cron Jobs File',
    passed: exists,
    details: exists ? 'File exists' : 'File not found'
  })
  
  if (exists) {
    const content = fs.readFileSync(cronJobsPath, 'utf8')
    const hasAutoReorder = content.includes('checkInventoryReorder')
    const hasNotifications = content.includes('processSmartNotifications')
    const hasEngine = content.includes('runAutomationEngine')
    
    testResults.push({
      name: 'Auto Reorder Function',
      passed: hasAutoReorder,
      details: hasAutoReorder ? 'Function defined' : 'Function missing'
    })
    
    testResults.push({
      name: 'Smart Notifications Function',
      passed: hasNotifications,
      details: hasNotifications ? 'Function defined' : 'Function missing'
    })
    
    testResults.push({
      name: 'Automation Engine Function',
      passed: hasEngine,
      details: hasEngine ? 'Function defined' : 'Function missing'
    })
  }
}

// Test 2: Check if API endpoint exists
function testApiEndpoint() {
  const apiPath = path.join(__dirname, 'src/app/api/automation/run/route.ts')
  const exists = fs.existsSync(apiPath)
  
  testResults.push({
    name: 'Automation API Endpoint',
    passed: exists,
    details: exists ? 'Endpoint exists' : 'Endpoint not found'
  })
  
  if (exists) {
    const content = fs.readFileSync(apiPath, 'utf8')
    const hasPOST = content.includes('export async function POST')
    const hasGET = content.includes('export async function GET')
    
    testResults.push({
      name: 'POST Method Handler',
      passed: hasPOST,
      details: hasPOST ? 'Handler defined' : 'Handler missing'
    })
    
    testResults.push({
      name: 'GET Method Handler',
      passed: hasGET,
      details: hasGET ? 'Handler defined' : 'Handler missing'
    })
  }
}

// Test 3: Check if dashboard page exists
function testDashboardPage() {
  const dashboardPath = path.join(__dirname, 'src/app/(dashboard)/automation/page.tsx')
  const exists = fs.existsSync(dashboardPath)
  
  testResults.push({
    name: 'Automation Dashboard Page',
    passed: exists,
    details: exists ? 'Page exists' : 'Page not found'
  })
  
  if (exists) {
    const content = fs.readFileSync(dashboardPath, 'utf8')
    const hasAutoReorder = content.includes('Auto Reorder')
    const hasNotifications = content.includes('Smart Notifications')
    const hasEngine = content.includes('Automation Engine')
    
    testResults.push({
      name: 'Dashboard Has Auto Reorder Card',
      passed: hasAutoReorder,
      details: hasAutoReorder ? 'Card present' : 'Card missing'
    })
    
    testResults.push({
      name: 'Dashboard Has Notifications Card',
      passed: hasNotifications,
      details: hasNotifications ? 'Card present' : 'Card missing'
    })
    
    testResults.push({
      name: 'Dashboard Has Engine Card',
      passed: hasEngine,
      details: hasEngine ? 'Card present' : 'Card missing'
    })
  }
}

// Test 4: Check if services exist
function testServices() {
  const services = [
    { path: 'src/services/inventory/AutoReorderService.ts', name: 'Auto Reorder Service' },
    { path: 'src/services/notification/SmartNotificationService.ts', name: 'Smart Notification Service' },
    { path: 'src/services/automation/AutomationEngine.ts', name: 'Automation Engine Service' }
  ]
  
  services.forEach(service => {
    const servicePath = path.join(__dirname, service.path)
    const exists = fs.existsSync(servicePath)
    
    testResults.push({
      name: service.name,
      passed: exists,
      details: exists ? 'Service exists' : 'Service not found'
    })
  })
}

// Test 5: Check if lazy loading components fixed
function testLazyLoading() {
  const lazyPath = path.join(__dirname, 'src/components/lazy/index.tsx')
  const exists = fs.existsSync(lazyPath)
  
  testResults.push({
    name: 'Lazy Loading Module',
    passed: exists,
    details: exists ? 'Module exists' : 'Module not found'
  })
  
  if (exists) {
    const content = fs.readFileSync(lazyPath, 'utf8')
    const hasPreloadChart = content.includes('export const preloadChartBundle')
    const hasPreloadTable = content.includes('export const preloadTableBundle')
    const hasPreloadModal = content.includes('export const preloadModalComponent')
    const hasGlobalUtils = content.includes('export const globalLazyLoadingUtils')
    
    testResults.push({
      name: 'Preload Chart Function',
      passed: hasPreloadChart,
      details: hasPreloadChart ? 'Function exported' : 'Function missing'
    })
    
    testResults.push({
      name: 'Preload Table Function',
      passed: hasPreloadTable,
      details: hasPreloadTable ? 'Function exported' : 'Function missing'
    })
    
    testResults.push({
      name: 'Preload Modal Function',
      passed: hasPreloadModal,
      details: hasPreloadModal ? 'Function exported' : 'Function missing'
    })
    
    testResults.push({
      name: 'Global Lazy Loading Utils',
      passed: hasGlobalUtils,
      details: hasGlobalUtils ? 'Utils exported' : 'Utils missing'
    })
  }
}

// Run all tests
testCronJobsFile()
testApiEndpoint()
testDashboardPage()
testServices()
testLazyLoading()

// Display results
console.log('📊 Test Results:\n')
console.log('='.repeat(70))

let passedCount = 0
let failedCount = 0

testResults.forEach((result, index) => {
  const status = result.passed ? '✅' : '❌'
  const statusText = result.passed ? 'PASS' : 'FAIL'
  
  console.log(`${status} ${result.name}`)
  console.log(`   Status: ${statusText} - ${result.details}`)
  console.log('')
  
  if (result.passed) passedCount++
  else failedCount++
})

console.log('='.repeat(70))
console.log(`\n📈 Summary: ${passedCount} passed, ${failedCount} failed out of ${testResults.length} tests\n`)

if (failedCount === 0) {
  console.log('🎉 All tests passed! Automation setup is complete.\n')
  console.log('Next Steps:')
  console.log('1. Run `npm run dev` to start the development server')
  console.log('2. Navigate to /automation to see the dashboard')
  console.log('3. Test the automation by clicking "Run Now" buttons')
  console.log('')
} else {
  console.log('⚠️  Some tests failed. Please review the failed items above.\n')
  process.exit(1)
}

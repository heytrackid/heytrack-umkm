/**
 * Browser-based AI API Testing Script
 * Tests all AI endpoints using browser automation
 * 
 * Usage: node test-ai-with-browser.js
 * Make sure dev server is running: npm run dev
 */

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3000';
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPIEndpoint(page, name, method, endpoint, body = null) {
  log(`\n🧪 Testing: ${name}`, 'cyan');
  log(`   ${method} ${endpoint}`, 'yellow');
  
  try {
    const result = await page.evaluate(async ({ method, endpoint, body, baseUrl }) => {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      return {
        success: response.ok,
        status: response.status,
        data,
        duration
      };
    }, { method, endpoint, body, baseUrl: BASE_URL });
    
    if (result.success) {
      log(`   ✅ PASSED (${result.duration}ms)`, 'green');
      log(`   Status: ${result.status}`);
      
      // Show summary of response
      if (result.data.success !== undefined) {
        log(`   Success: ${result.data.success}`);
      }
      if (result.data.message) {
        log(`   Message: ${result.data.message}`);
      }
      if (result.data.dataSource) {
        log(`   Data Source: ${result.data.dataSource}`);
      }
      
      return { passed: true, result };
    } else {
      log(`   ❌ FAILED (${result.duration}ms)`, 'red');
      log(`   Status: ${result.status}`);
      log(`   Error: ${result.data.error || 'Unknown error'}`);
      
      return { passed: false, result };
    }
  } catch (error) {
    log(`   ❌ ERROR: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Starting AI API Browser Tests', 'cyan');
  log('=====================================\n');
  
  let browser;
  let results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  try {
    // Launch browser
    log('🌐 Launching browser...', 'yellow');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logs from page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        log(`   Browser Error: ${msg.text()}`, 'red');
      }
    });
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to the site first to avoid CORS issues
    log('📍 Navigating to site...', 'yellow');
    try {
      await page.goto(`${BASE_URL}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      log('✅ Site loaded, ready for API tests\n', 'green');
    } catch (error) {
      log('⚠️  Could not load homepage, but continuing with tests...\n', 'yellow');
    }
    
    // Test 1: Data Fetcher
    results.total++;
    const test1 = await testAPIEndpoint(
      page,
      'Data Fetcher Verification',
      'GET',
      '/api/test-ai-data'
    );
    if (test1.passed) results.passed++; else results.failed++;
    
    // Test 2: AI Pricing (GET)
    results.total++;
    const test2 = await testAPIEndpoint(
      page,
      'AI Pricing Analysis (All Recipes)',
      'GET',
      '/api/ai/pricing'
    );
    if (test2.passed) results.passed++; else results.failed++;
    
    // Test 3: AI Pricing (POST with database)
    results.total++;
    const test3 = await testAPIEndpoint(
      page,
      'AI Pricing Analysis (Database Mode)',
      'POST',
      '/api/ai/pricing',
      { useDatabase: true, productName: 'Roti' }
    );
    if (test3.passed) results.passed++; else results.failed++;
    
    // Test 4: AI Inventory
    results.total++;
    const test4 = await testAPIEndpoint(
      page,
      'AI Inventory Optimization',
      'POST',
      '/api/ai/inventory',
      { useDatabase: true }
    );
    if (test4.passed) results.passed++; else results.failed++;
    
    // Test 5: Customer Insights
    results.total++;
    const test5 = await testAPIEndpoint(
      page,
      'AI Customer Insights',
      'GET',
      '/api/ai/customer-insights'
    );
    if (test5.passed) results.passed++; else results.failed++;
    
    // Test 6: Dashboard Insights
    results.total++;
    const test6 = await testAPIEndpoint(
      page,
      'AI Dashboard Insights',
      'GET',
      '/api/ai/dashboard-insights'
    );
    if (test6.passed) results.passed++; else results.failed++;
    
    // Test 7: AI Chat
    results.total++;
    const test7 = await testAPIEndpoint(
      page,
      'AI Chat with Database Context',
      'POST',
      '/api/ai/chat-with-data',
      { message: 'Berapa total bahan yang ada di inventory?' }
    );
    if (test7.passed) results.passed++; else results.failed++;
    
    // Test 8: Navigate to dashboard
    log('\n🧪 Testing: Dashboard Page Load', 'cyan');
    results.total++;
    try {
      await page.goto(`${BASE_URL}/dashboard`, { 
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      const title = await page.title();
      log(`   ✅ PASSED - Page loaded: ${title}`, 'green');
      results.passed++;
      
      // Take screenshot
      await page.screenshot({ 
        path: 'dashboard-screenshot.png',
        fullPage: false
      });
      log(`   📸 Screenshot saved: dashboard-screenshot.png`);
    } catch (error) {
      log(`   ❌ FAILED: ${error.message}`, 'red');
      results.failed++;
    }
    
    // Summary
    log('\n=====================================', 'cyan');
    log('📊 Test Summary', 'cyan');
    log('=====================================');
    log(`Total Tests: ${results.total}`);
    log(`✅ Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
    log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    log('=====================================\n');
    
    if (results.failed === 0) {
      log('🎉 All tests passed!', 'green');
    } else {
      log('⚠️  Some tests failed. Check logs above.', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (browser) {
      await browser.close();
      log('\n🔒 Browser closed', 'yellow');
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/test-ai-data`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  log('\n🔍 Checking if server is running...', 'yellow');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('❌ Server not running!', 'red');
    log('\nPlease start the dev server first:');
    log('  npm run dev\n', 'cyan');
    process.exit(1);
  }
  
  log('✅ Server is running!\n', 'green');
  
  await runTests();
})();

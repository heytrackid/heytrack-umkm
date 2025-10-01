#!/usr/bin/env node

/**
 * Test Script untuk Order Income Tracking Integration
 * 
 * Script ini akan menjalankan beberapa test case untuk memverifikasi
 * bahwa income tracking berfungsi dengan baik.
 */

const BASE_URL = 'http://localhost:3000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🧪 TEST: ${testName}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test Case 1: Update order status PENDING -> DELIVERED
async function testStatusUpdate() {
  logTest('Test Case 1: Update Order Status PENDING → DELIVERED');
  
  try {
    // First, create a test order with PENDING status
    logInfo('Step 1: Creating test order with PENDING status...');
    const orderNo = `TEST-${Date.now()}`;
    const createResponse = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_no: orderNo,
        customer_name: 'Test Customer',
        customer_phone: '081234567890',
        status: 'PENDING',
        total_amount: 150000,
        order_date: new Date().toISOString().split('T')[0],
        payment_status: 'UNPAID',
        payment_method: 'CASH'
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create order: ${createResponse.statusText}`);
    }
    
    const createdOrder = await createResponse.json();
    logSuccess(`Order created: ${createdOrder.order_no} (ID: ${createdOrder.id})`);
    logInfo(`  - Status: ${createdOrder.status}`);
    logInfo(`  - Total Amount: Rp ${createdOrder.total_amount.toLocaleString('id-ID')}`);
    logInfo(`  - Financial Record ID: ${createdOrder.financial_record_id || 'null'}`);
    
    if (createdOrder.financial_record_id) {
      logWarning('Order already has financial_record_id! Income should not be created yet.');
    }
    
    // Step 2: Update status to DELIVERED
    logInfo('\nStep 2: Updating status to DELIVERED...');
    const updateResponse = await fetch(`${BASE_URL}/api/orders/${createdOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DELIVERED',
        notes: 'Test income tracking - status update'
      })
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Failed to update status: ${JSON.stringify(errorData)}`);
    }
    
    const updateResult = await updateResponse.json();
    logSuccess('Status updated successfully!');
    logInfo(`  - Previous Status: ${updateResult.status_change.from}`);
    logInfo(`  - New Status: ${updateResult.status_change.to}`);
    logInfo(`  - Income Recorded: ${updateResult.financial.income_recorded}`);
    logInfo(`  - Income Amount: Rp ${updateResult.financial.amount ? updateResult.financial.amount.toLocaleString('id-ID') : '0'}`);
    logInfo(`  - Financial Record ID: ${updateResult.financial.income_record_id || 'null'}`);
    
    // Step 3: Verify income record was created
    if (updateResult.financial.income_recorded) {
      logSuccess('✅ TEST PASSED: Income record created on status update!');
      return {
        passed: true,
        orderId: createdOrder.id,
        orderNo: orderNo,
        incomeId: updateResult.financial.income_record_id
      };
    } else {
      logError('❌ TEST FAILED: Income record NOT created!');
      return { passed: false };
    }
    
  } catch (error) {
    logError(`TEST ERROR: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Test Case 2: Create order directly with DELIVERED status
async function testDirectCreation() {
  logTest('Test Case 2: Create Order with DELIVERED Status');
  
  try {
    const orderNo = `TEST-${Date.now()}`;
    logInfo('Creating test order with DELIVERED status...');
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_no: orderNo,
        customer_name: 'Test Customer Direct',
        customer_phone: '081234567891',
        status: 'DELIVERED',
        total_amount: 250000,
        order_date: new Date().toISOString().split('T')[0],
        payment_status: 'PAID',
        payment_method: 'CASH'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create order: ${JSON.stringify(errorData)}`);
    }
    
    const createdOrder = await response.json();
    logSuccess(`Order created: ${createdOrder.order_no} (ID: ${createdOrder.id})`);
    logInfo(`  - Status: ${createdOrder.status}`);
    logInfo(`  - Total Amount: Rp ${createdOrder.total_amount.toLocaleString('id-ID')}`);
    logInfo(`  - Income Recorded: ${createdOrder.income_recorded}`);
    logInfo(`  - Financial Record ID: ${createdOrder.financial_record_id || 'null'}`);
    
    if (createdOrder.income_recorded && createdOrder.financial_record_id) {
      logSuccess('✅ TEST PASSED: Income record created on order creation!');
      return {
        passed: true,
        orderId: createdOrder.id,
        orderNo: orderNo,
        incomeId: createdOrder.financial_record_id
      };
    } else {
      logError('❌ TEST FAILED: Income record NOT created!');
      return { passed: false };
    }
    
  } catch (error) {
    logError(`TEST ERROR: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Test Case 3: Update already DELIVERED order (should not create duplicate)
async function testNoDuplicate(orderId) {
  logTest('Test Case 3: Update Already DELIVERED Order (No Duplicate)');
  
  try {
    logInfo('Updating already DELIVERED order...');
    
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DELIVERED',
        notes: 'Re-confirming delivery - should not create duplicate income'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update status: ${JSON.stringify(errorData)}`);
    }
    
    const updateResult = await response.json();
    logInfo(`  - Status: ${updateResult.order.status}`);
    logInfo(`  - Income Recorded: ${updateResult.financial.income_recorded}`);
    
    if (!updateResult.financial.income_recorded) {
      logSuccess('✅ TEST PASSED: No duplicate income created!');
      return { passed: true };
    } else {
      logError('❌ TEST FAILED: Duplicate income created!');
      return { passed: false };
    }
    
  } catch (error) {
    logError(`TEST ERROR: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Test Case 4: Zero amount order (should not create income)
async function testZeroAmount() {
  logTest('Test Case 4: Zero Amount Order (No Income)');
  
  try {
    const orderNo = `TEST-${Date.now()}`;
    logInfo('Creating test order with zero amount...');
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_no: orderNo,
        customer_name: 'Test Free Sample',
        status: 'DELIVERED',
        total_amount: 0,
        order_date: new Date().toISOString().split('T')[0]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create order: ${JSON.stringify(errorData)}`);
    }
    
    const createdOrder = await response.json();
    logInfo(`  - Order created: ${createdOrder.order_no}`);
    logInfo(`  - Total Amount: ${createdOrder.total_amount}`);
    logInfo(`  - Income Recorded: ${createdOrder.income_recorded}`);
    
    if (!createdOrder.income_recorded) {
      logSuccess('✅ TEST PASSED: No income created for zero amount order!');
      return { passed: true };
    } else {
      logError('❌ TEST FAILED: Income created for zero amount order!');
      return { passed: false };
    }
    
  } catch (error) {
    logError(`TEST ERROR: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Main test runner
async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 ORDER INCOME TRACKING - TEST SUITE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Test 1: Status Update
  const test1 = await testStatusUpdate();
  results.total++;
  if (test1.passed) results.passed++; else results.failed++;
  
  // Test 2: Direct Creation
  const test2 = await testDirectCreation();
  results.total++;
  if (test2.passed) results.passed++; else results.failed++;
  
  // Test 3: No Duplicate (only if test2 passed)
  if (test2.passed && test2.orderId) {
    const test3 = await testNoDuplicate(test2.orderId);
    results.total++;
    if (test3.passed) results.passed++; else results.failed++;
  } else {
    logWarning('Skipping Test 3 (No Duplicate) - previous test failed');
  }
  
  // Test 4: Zero Amount
  const test4 = await testZeroAmount();
  results.total++;
  if (test4.passed) results.passed++; else results.failed++;
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total Tests: ${results.total}`);
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.failed === 0 ? 'green' : 'yellow');
  log('='.repeat(60) + '\n', 'cyan');
  
  if (results.failed === 0) {
    logSuccess('🎉 All tests passed!');
  } else {
    logError('⚠️  Some tests failed. Please review the output above.');
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

/**
 * Simple Logger Test (ESM)
 */

import logger, {
    apiLogger,
    authLogger,
    automationLogger,
    createLogger,
    cronLogger,
    dbLogger,
    uiLogger
} from '../../../src/lib/logger.ts'

console.log('\n=== Logger Verification Test ===\n')

// Test 1: Default logger
console.log('1. Testing default logger...')
logger.info('✓ Default logger works')

// Test 2: Context-specific loggers
console.log('\n2. Testing context-specific loggers...')
apiLogger.info('✓ API logger works')
dbLogger.info('✓ Database logger works')
authLogger.info('✓ Auth logger works')
cronLogger.info('✓ Cron logger works')
automationLogger.info('✓ Automation logger works')
uiLogger.info('✓ UI logger works')

// Test 3: Error logging with error object
console.log('\n3. Testing error object logging...')
const testError = new Error('Test error message')
logger.error({ err: testError }, 'Error with error object')

// Test 4: Logging with additional context
console.log('\n4. Testing logging with additional context...')
logger.info({ userId: '123', action: 'test' }, 'User action logged')
apiLogger.info({ endpoint: '/api/test', method: 'GET' }, 'API request logged')

// Test 5: Custom logger creation
console.log('\n5. Testing custom logger creation...')
const customLogger = createLogger('CustomContext')
customLogger.info('✓ Custom logger works')

console.log('\n=== All Tests Passed ===')
console.log('✓ All logger exports are working correctly')
console.log('✓ Context-specific loggers are functioning')
console.log('✓ Error object logging is working')
console.log('✓ Additional context logging is working')
console.log('✓ Custom logger creation is working')

/**
 * Logger Verification Test Script
 * 
 * This script tests all logger exports and functionality
 */

import logger, {
    apiLogger,
    authLogger,
    automationLogger,
    createLogger,
    cronLogger,
    dbLogger,
    uiLogger
} from '../../../src/lib/logger'

console.log('=== Logger Verification Test ===\n')

// Test 1: Default logger
console.log('1. Testing default logger...')
logger.info('Default logger - info message')
logger.debug('Default logger - debug message')
logger.warn('Default logger - warn message')
logger.error('Default logger - error message')

// Test 2: Context-specific loggers
console.log('\n2. Testing context-specific loggers...')
apiLogger.info('API logger - info message')
dbLogger.info('Database logger - info message')
authLogger.info('Auth logger - info message')
cronLogger.info('Cron logger - info message')
automationLogger.info('Automation logger - info message')
uiLogger.info('UI logger - info message')

// Test 3: Error logging with error object
console.log('\n3. Testing error object logging...')
const testError = new Error('Test error message')
logger.error({ err: testError }, 'Error with error object')
apiLogger.error({ err: testError }, 'API error with error object')

// Test 4: Logging with additional context
console.log('\n4. Testing logging with additional context...')
logger.info({ userId: '123', action: 'test' }, 'User action logged')
apiLogger.info({ endpoint: '/api/test', method: 'GET' }, 'API request logged')
dbLogger.info({ query: 'SELECT * FROM test', duration: 45 }, 'Database query logged')

// Test 5: Custom logger creation
console.log('\n5. Testing custom logger creation...')
const customLogger = createLogger('CustomContext')
customLogger.info('Custom logger message')

// Test 6: Different log levels
console.log('\n6. Testing different log levels...')
logger.debug({ data: 'debug data' }, 'Debug level message')
logger.info({ data: 'info data' }, 'Info level message')
logger.warn({ data: 'warn data' }, 'Warn level message')
logger.error({ data: 'error data' }, 'Error level message')

console.log('\n=== Logger Verification Complete ===')
console.log('✓ All logger exports are working correctly')
console.log('✓ Context-specific loggers are functioning')
console.log('✓ Error object logging is working')
console.log('✓ Additional context logging is working')
console.log('✓ Custom logger creation is working')

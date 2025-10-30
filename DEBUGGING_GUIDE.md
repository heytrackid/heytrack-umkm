# Comprehensive Debugging Guide

## Overview

This guide provides detailed instructions on using the enhanced debugging capabilities in the HeyTrack application. The debugging system includes structured logging, performance monitoring, error tracking, and detailed context information.

## Enhanced Debugging Features

### 1. Structured Logging with Context

The application now supports rich logging with detailed context information:

```typescript
import { apiDebugLogger, debugLogger } from '@/lib/debugging';

// Basic logging with context
debugLogger.setContext({ userId: 'user-123', sessionId: 'session-456' });
debugLogger.logDetailed('User performed action', { level: 'info' });

// API request logging
apiDebugLogger.request('/api/orders', 'GET', { userId: 'user-123' });
```

### 2. Performance Monitoring

Track execution time and memory usage:

```typescript
import { performanceLogger, measurePerformance, measurePerformanceAsync } from '@/lib/debugging';

// Synchronous function timing
const result = performanceLogger.time('Database query', () => {
  return database.query('SELECT * FROM orders');
}, { 
  includeMemory: true, 
  level: 'info' 
});

// Asynchronous function timing
const asyncResult = await performanceLogger.timeAsync('API call', async () => {
  return await fetch('/api/data');
}, { 
  includeMemory: true, 
  level: 'info' 
});

// Using helper functions
const data = measurePerformance('Expensive calculation', () => {
  // Expensive operation
  return calculatedValue;
});

const apiData = await measurePerformanceAsync('External API call', async () => {
  return await fetchExternalApi();
});
```

### 3. Function Tracing

Automatically trace function execution with detailed parameters and results:

```typescript
import { debugLogger } from '@/lib/debugging';

const tracedFunction = debugLogger.traceFunction(myFunction, {
  name: 'MyFunction',
  logParams: true,
  logResult: true,
  includeMemory: true,
  level: 'debug'
});

// Using the decorator for class methods
import { DebugMethod } from '@/lib/debugging';

class MyService {
  @DebugMethod({ logParams: true, logResult: true })
  async processData(data: any) {
    // Function implementation
    return processedData;
  }
}
```

### 4. Detailed Error Logging

Enhanced error logging with full context and stack traces:

```typescript
import { detailedErrorLog } from '@/lib/debugging';

try {
  // Some operation
  await someOperation();
} catch (error) {
  detailedErrorLog(error, {
    userId: 'user-123',
    functionName: 'someOperation',
    component: 'MyService',
    action: 'processData',
    timestamp: new Date().toISOString()
  }, 'Failed to process data');
}
```

## Logger Types and Usage

### 1. Context-Specific Loggers

Different loggers are available for different application layers:

```typescript
import { 
  apiLogger, 
  dbLogger, 
  authLogger, 
  uiLogger, 
  productionLogger, 
  inventoryLogger 
} from '@/lib/logger';

// API layer logging
apiLogger.info({ userId: user.id }, 'API request processed');

// Database operations
dbLogger.error({ error, query }, 'Database query failed');

// Authentication events
authLogger.warn({ userId }, 'Multiple failed login attempts');

// UI interactions
uiLogger.debug({ action: 'button-click' }, 'User clicked submit button');
```

### 2. Enhanced Debug Loggers

For more detailed debugging, use the enhanced debug loggers:

```typescript
import { 
  apiDebugLogger, 
  dbDebugLogger, 
  uiDebugLogger, 
  performanceLogger 
} from '@/lib/debugging';

// API debugging with request/response details
apiDebugLogger.request('/api/orders', 'GET', { userId: 'user-123' });
apiDebugLogger.response('/api/orders', 'GET', 200, 150.25, { count: 10 });

// Performance-specific logging
performanceLogger.info({
  operation: 'HPP calculation',
  duration: '250.5ms',
  memoryBefore: process.memoryUsage(),
  memoryAfter: process.memoryUsage()
}, 'HPP calculation completed');
```

## Advanced Debugging Techniques

### 1. API Route Debugging

Use the enhanced API debugging wrapper for your API routes:

```typescript
import { withDetailedDebug } from '@/lib/debugging';

export const GET = withDetailedDebug(async (request) => {
  // Your route logic
  const data = await fetchData();
  return Response.json(data);
}, { 
  name: 'GetOrdersAPI', 
  includeMemory: true, 
  performanceTracking: true 
});
```

### 2. Database Query Debugging

Log database queries with execution details:

```typescript
import { dbDebugLogger } from '@/lib/debugging';

const executeQuery = dbDebugLogger.traceFunction(async (query, params) => {
  return await database.execute(query, params);
}, { 
  logParams: true, 
  includeMemory: true 
});
```

### 3. Client-Side Debugging

Enhanced debugging for client components:

```typescript
import { uiDebugLogger } from '@/lib/debugging';

// In React components
const handleClick = uiDebugLogger.traceFunction(() => {
  // Handle click
}, { name: 'Button Click', logParams: false, logResult: false });
```

## Performance Debugging

### 1. Memory Usage Tracking

Monitor memory consumption in your functions:

```typescript
import { performanceLogger } from '@/lib/debugging';

const processLargeDataset = () => {
  return performanceLogger.time('Large dataset processing', () => {
    // Processing logic
    return result;
  }, { includeMemory: true, level: 'info' });
};
```

### 2. Function Execution Timing

Track how long functions take to execute:

```typescript
import { measurePerformance, measurePerformanceAsync } from '@/lib/debugging';

const result = measurePerformance('Expensive operation', () => {
  // Code to measure
  return result;
});

const asyncResult = await measurePerformanceAsync('Async operation', async () => {
  // Async code to measure
  return result;
});
```

## Error Context and Tracking

### 1. Comprehensive Error Context

When logging errors, include as much context as possible:

```typescript
import { detailedErrorLog } from '@/lib/debugging';

try {
  await someOperation(userId, orderId);
} catch (error) {
  detailedErrorLog(error, {
    userId,
    orderId,
    functionName: 'someOperation',
    component: 'OrderService',
    action: 'updateStatus',
    timestamp: new Date().toISOString(),
    additionalInfo: 'This is additional context for debugging'
  }, 'Failed to update order status');
}
```

### 2. Error Tracking ID

Errors are automatically assigned tracking IDs for debugging:

```typescript
import { debugLogger } from '@/lib/debugging';

// The detailedErrorLog function returns an error ID
const errorId = debugLogger.logDetailed('Error occurred', { level: 'error' }, {
  error: serializedError,
  // Additional context
});
```

## Best Practices

### 1. Structured Context Information

When logging, always include relevant context:

- `userId` - The user performing the action
- `sessionId` - Current session identifier
- `requestId` - Unique request identifier
- `functionName` - Name of the function being executed
- `component` - Component or module name
- `action` - Specific action being performed

### 2. Log Level Guidelines

- `debug` - Detailed diagnostic information for debugging
- `info` - General information about application flow
- `warn` - Potential issues that aren't errors
- `error` - Errors that occurred but were handled

### 3. Performance Considerations

- Only log performance data in development or for critical paths
- Be mindful of memory usage when logging large objects
- Consider sampling for high-frequency operations

### 4. Security Considerations

- Never log sensitive information like passwords or tokens
- Sanitize user input before logging
- Be careful with PII (Personally Identifiable Information)

## Common Debugging Scenarios

### 1. API Response Issues

```typescript
import { apiDebugLogger } from '@/lib/debugging';

apiDebugLogger.request(request.url, request.method, { userId: user.id });
try {
  const response = await processRequest(request);
  const duration = Date.now() - startTime;
  apiDebugLogger.response(request.url, request.method, 200, duration, { 
    responseSize: JSON.stringify(response).length 
  });
  return Response.json(response);
} catch (error) {
  apiDebugLogger.error(request.url, request.method, error, { userId: user.id });
  throw error;
}
```

### 2. Database Performance Issues

```typescript
import { dbDebugLogger } from '@/lib/debugging';

const queryWithDebugging = dbDebugLogger.traceFunction(async (sql, params) => {
  return await database.query(sql, params);
}, { 
  name: 'Database Query',
  logParams: false, // Be careful with logging query parameters
  performanceTracking: true,
  includeMemory: true
});
```

### 3. Frontend Performance Issues

```typescript
// In React components
import { uiDebugLogger } from '@/lib/debugging';

const Component = () => {
  const data = uiDebugLogger.time('Data fetching', () => {
    return fetchData();
  }, { level: 'debug', includeMemory: true });

  return <div>{/* Render component */}</div>;
};
```

## Debugging Tools Integration

### 1. Browser Console

Enhanced debugging information is also output to the browser console in development mode:

```typescript
import { uiLogger } from '@/lib/client-logger';

uiLogger.info('Component mounted', { component: 'OrderForm', userId });
```

### 2. External Monitoring

The detailed logging can be integrated with external monitoring services like Sentry, DataDog, or others.

## Troubleshooting Common Issues

### 1. High Memory Usage

Look for logs with memory information to identify memory issues:

- Memory before vs after operations
- Memory differences that indicate leaks
- Operations with increasing memory usage

### 2. Slow Performance

Use the performance logging to identify bottlenecks:

- Functions taking too long
- Database queries with slow execution
- Network calls causing delays

### 3. Error Tracking

Use the error IDs and context to track down issues:

- Search logs by error ID
- Filter by user ID to see user-specific issues
- Filter by component to see component-specific issues

## Conclusion

This enhanced debugging system provides detailed, contextual logging that should help identify and resolve issues quickly. Remember to use the appropriate log levels, include relevant context, and be mindful of performance and security implications when adding debug logging to your code.
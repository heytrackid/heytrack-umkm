# Design Document

## Overview

This design outlines the systematic migration of all `console` statements to the centralized `logger` utility. The migration will be performed in batches, organized by directory and context, to ensure consistency and maintainability. The logger utility uses Pino for high-performance structured logging with different formats for development and production environments.

## Architecture

### Logger System

The existing logger system (`src/lib/logger.ts`) provides:

1. **Default Logger**: Generic logger for general-purpose logging
2. **Context-Specific Loggers**: Pre-configured child loggers with context:
   - `apiLogger` - For API routes and endpoints
   - `dbLogger` - For database operations
   - `authLogger` - For authentication flows
   - `cronLogger` - For scheduled tasks and cron jobs
   - `automationLogger` - For automation features
   - `uiLogger` - For UI components

3. **Environment-Aware Configuration**:
   - Development: Pretty-formatted, colorized logs with timestamps
   - Production: JSON-structured logs for log aggregation services
   - Test: Silent mode to avoid noise in test output

### Migration Strategy

The migration will follow a directory-based approach:

1. **Services Layer** (`src/services/`)
2. **Modules Layer** (`src/modules/`)
3. **Library Layer** (`src/lib/`)
4. **API Routes** (`src/app/api/`)
5. **Components** (`src/components/`, `src/app/`)

## Components and Interfaces

### Logger Import Patterns

```typescript
// Default logger for general use
import logger from '@/lib/logger'

// Context-specific loggers
import { apiLogger, dbLogger, authLogger, cronLogger, automationLogger, uiLogger } from '@/lib/logger'
```

### Conversion Patterns

#### Pattern 1: Simple console.log → logger.info/debug

```typescript
// Before
console.log('User logged in')

// After
logger.info('User logged in')
```

#### Pattern 2: console.error with error object

```typescript
// Before
console.error('Failed to fetch data:', error)

// After
logger.error({ err: error }, 'Failed to fetch data')
```

#### Pattern 3: console.warn

```typescript
// Before
console.warn('Cache miss for key:', key)

// After
logger.warn({ key }, 'Cache miss for key')
```

#### Pattern 4: console.error with only error object

```typescript
// Before
console.error(error)

// After
logger.error({ err: error }, error.message || 'Error occurred')
```

#### Pattern 5: Contextual logging with data

```typescript
// Before
console.log(`Processing ${count} items`)

// After
logger.info({ count }, 'Processing items')
```

### Context-Specific Logger Selection

| File Location/Type | Logger to Use | Rationale |
|-------------------|---------------|-----------|
| `src/app/api/**/*` | `apiLogger` | API endpoint logging |
| `src/lib/supabase.ts`, `src/lib/*-db.ts` | `dbLogger` | Database operations |
| `src/app/auth/**/*`, `src/lib/auth-*.ts` | `authLogger` | Authentication flows |
| `src/lib/cron-*.ts`, `**/cron/**/*` | `cronLogger` | Scheduled tasks |
| `src/lib/automation/**/*`, `**/automation/**/*` | `automationLogger` | Automation features |
| `src/components/**/*`, `src/app/**/components/**/*` | `uiLogger` | UI components |
| All other files | `logger` (default) | General purpose |

## Data Models

### Log Entry Structure (Pino Format)

```typescript
{
  level: number,        // Log level (10=trace, 20=debug, 30=info, 40=warn, 50=error, 60=fatal)
  time: number,         // Unix timestamp
  msg: string,          // Log message
  context?: string,     // Logger context (API, Database, etc.)
  err?: {              // Error object (if present)
    type: string,
    message: string,
    stack: string
  },
  [key: string]: any   // Additional contextual data
}
```

## Error Handling

### Error Object Handling

When migrating `console.error()` calls that include error objects:

1. **Preserve Error Context**: Use Pino's `err` field to maintain error stack traces
2. **Add Descriptive Messages**: Always include a human-readable message
3. **Include Additional Context**: Add relevant data as separate fields

```typescript
// Good
logger.error({ err: error, userId, operation: 'fetchData' }, 'Failed to fetch user data')

// Avoid
logger.error(error.message) // Loses stack trace
```

### Special Cases

#### 1. Error Handler Functions

Files like `src/lib/server-error-handler.ts` and `src/lib/client-error-handler.ts` that already handle errors should use the logger for consistency:

```typescript
// Before
console.error(`Auth error${context ? ` in ${context}` : ''}:`, error)

// After
authLogger.error({ err: error, context }, 'Auth error')
```

#### 2. API Client Logger

The `src/lib/api/client.ts` file has its own logger object. This should be refactored to use the centralized logger:

```typescript
// Before
const logger = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${message}`, data)
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[API ERROR] ${message}`, error)
  },
}

// After
import { apiLogger } from '@/lib/logger'

const logger = {
  log: (message: string, data?: any) => {
    apiLogger.debug({ data }, message)
  },
  error: (message: string, error?: any) => {
    apiLogger.error({ err: error }, message)
  },
  warn: (message: string, data?: any) => {
    apiLogger.warn({ data }, message)
  },
}
```

#### 3. AppError Logger

The `src/lib/errors/AppError.ts` file has a `logError` function that uses console. This should be updated to use the logger:

```typescript
// Before
if (typeof window === 'undefined') {
  console.error(`[${context || 'ERROR'}]`, normalizedError.toJSON())
} else {
  console.error(`[${context || 'ERROR'}]`, normalizedError.message)
}

// After
import logger from '@/lib/logger'

if (typeof window === 'undefined') {
  logger.error({ err: normalizedError, context }, 'Server error')
} else {
  logger.error({ context, message: normalizedError.message }, 'Client error')
}
```

## Testing Strategy

### Verification Steps

1. **Syntax Check**: Run TypeScript compiler to ensure no import errors
   ```bash
   npm run type-check
   ```

2. **Search for Remaining Console Statements**:
   ```bash
   grep -r "console\." src/ --include="*.ts" --include="*.tsx"
   ```

3. **Manual Testing**: Test key flows to ensure logs appear correctly:
   - API requests (check apiLogger output)
   - Database operations (check dbLogger output)
   - Authentication flows (check authLogger output)
   - Error scenarios (check error logging format)

4. **Log Output Verification**:
   - Development: Verify pretty-formatted logs appear in terminal
   - Production build: Verify JSON-structured logs are generated

### Test Scenarios

1. **API Route Logging**: Make API requests and verify logs include proper context
2. **Error Logging**: Trigger errors and verify stack traces are preserved
3. **Database Logging**: Perform database operations and verify query logs
4. **Authentication Logging**: Test login/logout flows and verify auth logs
5. **Component Logging**: Interact with UI components and verify UI logs

## Migration Checklist

### Phase 1: Services Layer
- [ ] `src/services/production/ProductionDataIntegration.ts`
- [ ] `src/services/production/BatchSchedulingService.ts`
- [ ] `src/services/excel-export-lazy.service.ts`
- [ ] `src/services/inventory/**/*`

### Phase 2: Modules Layer
- [ ] `src/modules/orders/services/**/*`
- [ ] `src/modules/orders/components/**/*`
- [ ] `src/modules/recipes/**/*`
- [ ] `src/modules/notifications/**/*`

### Phase 3: Library Layer
- [ ] `src/lib/supabase.ts`
- [ ] `src/lib/server-error-handler.ts`
- [ ] `src/lib/client-error-handler.ts`
- [ ] `src/lib/errors/AppError.ts`
- [ ] `src/lib/api/client.ts`
- [ ] `src/lib/api-validation.ts`
- [ ] `src/lib/api-cache.ts`
- [ ] `src/lib/query-cache.ts`
- [ ] `src/lib/sync-api.ts`
- [ ] `src/lib/hpp-*.ts`
- [ ] `src/lib/ai-services/**/*`
- [ ] `src/lib/automation/**/*`

### Phase 4: API Routes
- [ ] All files in `src/app/api/**/*`

### Phase 5: Components
- [ ] All files in `src/components/**/*`
- [ ] All files in `src/app/**/components/**/*`

## Performance Considerations

1. **Pino Performance**: Pino is one of the fastest Node.js loggers, with minimal overhead
2. **Lazy Evaluation**: Logger only serializes data when the log level is enabled
3. **Production Optimization**: JSON logs in production are optimized for log aggregation services
4. **Development Experience**: Pretty logs in development don't impact performance significantly

## Security Considerations

1. **Sensitive Data**: Ensure no sensitive data (passwords, tokens, PII) is logged
2. **Error Messages**: Error messages should be descriptive but not expose internal implementation details
3. **Production Logs**: Production logs should be sent to secure log aggregation services
4. **Log Levels**: Use appropriate log levels to control verbosity in production

## Future Enhancements

1. **Log Aggregation**: Integrate with services like Datadog, LogRocket, or Sentry
2. **Custom Context Loggers**: Add more context-specific loggers as needed
3. **Log Sampling**: Implement log sampling for high-traffic scenarios
4. **Structured Logging Standards**: Define team-wide standards for log message formats

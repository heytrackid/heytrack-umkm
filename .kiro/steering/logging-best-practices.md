# Logging Best Practices

## Overview

Gunakan Pino logger untuk semua logging di aplikasi. **JANGAN gunakan `console.log/error/warn`** - ini akan fail ESLint.

## Basic Usage

### Import Logger

```typescript
import { apiLogger, dbLogger, authLogger } from '@/lib/logger'
```

### Log Levels

```typescript
// Info - general information
apiLogger.info({ userId, orderId }, 'Order created successfully')

// Debug - detailed debugging info (only in development)
apiLogger.debug({ query, params }, 'Executing database query')

// Warn - warning but not error
apiLogger.warn({ userId, threshold }, 'User approaching rate limit')

// Error - error occurred
apiLogger.error({ error, userId }, 'Failed to create order')
```

## Error Logging (RECOMMENDED)

### Using `logError` Helper

```typescript
import { apiLogger, logError } from '@/lib/logger'

try {
  // ... operation
} catch (error: unknown) {
  // ✅ BEST - Use logError helper
  logError(apiLogger, error, 'Failed to create order', {
    userId: user.id,
    orderId,
  })
  
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

### Manual Error Logging

```typescript
import { apiLogger, serializeError } from '@/lib/logger'

try {
  // ... operation
} catch (error: unknown) {
  // ✅ GOOD - Manual serialization
  apiLogger.error({
    error: serializeError(error),
    userId: user.id,
    orderId,
  }, 'Failed to create order')
}
```

### Why Use Helpers?

Error objects contain non-serializable properties (circular references, functions, etc). Helpers ensure errors are safely logged:

```typescript
// ❌ BAD - May fail to serialize
apiLogger.error({ error }, 'Failed')

// ✅ GOOD - Safe serialization
apiLogger.error({ error: serializeError(error) }, 'Failed')

// ✅ BEST - Use helper
logError(apiLogger, error, 'Failed', { userId })
```

## Context-Specific Loggers

```typescript
import {
  apiLogger,        // API routes
  dbLogger,         // Database operations
  authLogger,       // Authentication
  middlewareLogger, // Middleware
  productionLogger, // Production service
  inventoryLogger,  // Inventory service
} from '@/lib/logger'
```

## API Route Pattern

```typescript
import { apiLogger, logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      apiLogger.warn({ authError }, 'Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log successful operation
    apiLogger.info({ userId: user.id }, 'Processing request')

    const { data, error } = await supabase
      .from('orders')
      .insert({ ...orderData, user_id: user.id })
      .select()
      .single()

    if (error) {
      logError(apiLogger, error, 'Database insert failed', {
        userId: user.id,
        table: 'orders',
      })
      throw error
    }

    apiLogger.info({ userId: user.id, orderId: data.id }, 'Order created')
    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    logError(apiLogger, error, 'Error in POST /api/orders')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## Service Pattern

```typescript
import { dbLogger, logError } from '@/lib/logger'

export class OrderService {
  static async createOrder(
    supabase: SupabaseClient<Database>,
    userId: string,
    data: OrderInsert
  ): Promise<Order> {
    try {
      dbLogger.info({ userId }, 'Creating order')

      const { data: order, error } = await supabase
        .from('orders')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (error) {
        logError(dbLogger, error, 'Failed to create order', { userId })
        throw error
      }

      dbLogger.info({ userId, orderId: order.id }, 'Order created')
      return order

    } catch (error: unknown) {
      logError(dbLogger, error, 'Error in createOrder', { userId })
      throw error
    }
  }
}
```

## What to Log

### ✅ DO Log:

- **User actions**: Order created, recipe updated, etc.
- **Authentication events**: Login, logout, failed auth
- **Errors**: All errors with context
- **Performance**: Slow queries, timeouts
- **Security**: Unauthorized access attempts
- **Business events**: Payment processed, stock low

### ❌ DON'T Log:

- **Sensitive data**: Passwords, tokens, API keys
- **PII without masking**: Full credit card numbers, etc.
- **Excessive debug info in production**
- **Inside tight loops** (use sampling)

## Structured Logging

Always use structured data (objects) instead of string concatenation:

```typescript
// ✅ GOOD - Structured
apiLogger.info({ userId, orderId, amount }, 'Order created')

// ❌ BAD - String concatenation
apiLogger.info(`Order ${orderId} created by ${userId} for ${amount}`)
```

Benefits:
- Easier to search/filter logs
- Better for log aggregation tools
- Type-safe with TypeScript

## Development vs Production

### Development
- Pretty formatted logs with colors
- Level: `debug` (shows all logs)
- Includes timestamp and context

### Production
- JSON structured logs
- Level: `info` (hides debug logs)
- Optimized for log aggregation tools (Datadog, CloudWatch, etc.)

## Common Patterns

### Database Query Logging

```typescript
dbLogger.debug({ table: 'orders', userId }, 'Fetching orders')

const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)

if (error) {
  logError(dbLogger, error, 'Query failed', { table: 'orders', userId })
  throw error
}

dbLogger.info({ userId, count: data.length }, 'Orders fetched')
```

### Authentication Logging

```typescript
authLogger.info({ userId, method: 'email' }, 'User logged in')

authLogger.warn({ email, reason: 'invalid_password' }, 'Login failed')

authLogger.error({ error: serializeError(error) }, 'Auth error')
```

### Performance Logging

```typescript
const startTime = Date.now()

// ... operation

const duration = Date.now() - startTime
apiLogger.info({ duration, userId }, 'Operation completed')

if (duration > 1000) {
  apiLogger.warn({ duration, userId }, 'Slow operation detected')
}
```

## Testing

In test environment, logs are automatically silenced:

```typescript
// No logs will appear during tests
apiLogger.info({ test: 'data' }, 'This is silent in tests')
```

To enable logs in tests:
```typescript
process.env.NODE_ENV = 'development'
```

## Migration from console.log

```typescript
// ❌ OLD - Will fail ESLint
console.log('Order created:', orderId)
console.error('Error:', error)
console.warn('Low stock:', ingredientId)

// ✅ NEW - Use logger
apiLogger.info({ orderId }, 'Order created')
logError(apiLogger, error, 'Operation failed')
apiLogger.warn({ ingredientId }, 'Low stock detected')
```

## Quick Reference

| Use Case | Logger | Example |
|----------|--------|---------|
| API routes | `apiLogger` | `apiLogger.info({ userId }, 'Request processed')` |
| Database ops | `dbLogger` | `dbLogger.error({ error, table }, 'Query failed')` |
| Auth events | `authLogger` | `authLogger.info({ userId }, 'User logged in')` |
| Middleware | `middlewareLogger` | `middlewareLogger.debug({ path }, 'Request')` |
| Services | `productionLogger` | `productionLogger.info({ batchId }, 'Batch created')` |
| Errors | `logError()` | `logError(apiLogger, error, 'Failed', { userId })` |

---

**Remember**: Always use structured logging with context objects, never `console.log`!

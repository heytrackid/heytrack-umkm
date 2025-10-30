---
inclusion: always
---

# Client vs Server Logging Guidelines

## Critical Rule

**NEVER use server-side loggers (`apiLogger`, `dbLogger`, etc.) in client components!**

Server-side loggers (Pino) use Node.js APIs that don't exist in the browser and will cause runtime errors.

---

## When to Use Each Logger

### Server-Side Logging (API Routes, Server Components, Services)

```typescript
// ✅ CORRECT - API Route
import { apiLogger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    apiLogger.info({ userId }, 'Fetching data')
    // ...
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Failed to fetch')
  }
}
```

```typescript
// ✅ CORRECT - Server Component
import { dbLogger } from '@/lib/logger'

export default async function ServerComponent() {
  try {
    dbLogger.info('Loading data')
    const data = await fetchData()
    // ...
  } catch (error: unknown) {
    dbLogger.error({ error }, 'Failed')
  }
}
```

**Available Server Loggers:**
- `apiLogger` - API routes
- `dbLogger` - Database operations
- `authLogger` - Authentication
- `middlewareLogger` - Middleware
- `productionLogger` - Production service
- `inventoryLogger` - Inventory service

### Client-Side Logging (Client Components, Hooks)

```typescript
// ✅ CORRECT - Client Component
'use client'

import { queryLogger, uiLogger } from '@/lib/client-logger'

export function ClientComponent() {
  const { data, error } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      try {
        queryLogger.info('Fetching data')
        const response = await fetch('/api/data')
        return response.json()
      } catch (error) {
        queryLogger.error('Failed to fetch', error)
        throw error
      }
    }
  })

  if (error) {
    queryLogger.error('Query error', error)
  }

  return <div>...</div>
}
```

**Available Client Loggers:**
- `uiLogger` - UI interactions and events
- `queryLogger` - Data fetching and queries
- `formLogger` - Form submissions and validation

**Create Custom Client Logger:**
```typescript
import { createClientLogger } from '@/lib/client-logger'

const myLogger = createClientLogger('MyFeature')
myLogger.info('Something happened')
myLogger.error('Something failed', error)
```

---

## Quick Reference

| Context | Use | Import |
|---------|-----|--------|
| API Route | `apiLogger` | `import { apiLogger } from '@/lib/logger'` |
| Server Component | `dbLogger` | `import { dbLogger } from '@/lib/logger'` |
| Client Component | `queryLogger` | `import { queryLogger } from '@/lib/client-logger'` |
| React Hook | `uiLogger` | `import { uiLogger } from '@/lib/client-logger'` |
| Service (server) | `apiLogger` | `import { apiLogger } from '@/lib/logger'` |

---

## Common Mistakes

### ❌ WRONG - Server logger in client component
```typescript
'use client'

import { apiLogger } from '@/lib/logger' // ❌ Will fail in browser!

export function MyComponent() {
  const { error } = useQuery(...)
  
  if (error) {
    apiLogger.error({ error }, 'Failed') // ❌ Runtime error!
  }
}
```

### ✅ CORRECT - Client logger in client component
```typescript
'use client'

import { queryLogger } from '@/lib/client-logger' // ✅ Browser-safe

export function MyComponent() {
  const { error } = useQuery(...)
  
  if (error) {
    queryLogger.error('Failed', error) // ✅ Works in browser
  }
}
```

---

## Error Handling Patterns

### Client Component Error Handling
```typescript
'use client'

import { queryLogger } from '@/lib/client-logger'

export function MyComponent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    onError: (error) => {
      queryLogger.error('Query failed', error, {
        queryKey: 'data',
        timestamp: new Date().toISOString()
      })
    }
  })

  if (error) {
    queryLogger.error('Rendering error state', error)
    return <ErrorDisplay />
  }

  return <div>{data}</div>
}
```

### API Route Error Handling
```typescript
import { apiLogger } from '@/lib/logger'
import { handleAPIError } from '@/lib/errors/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'Processing request')
    // ... logic
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Request failed')
    return handleAPIError(error)
  }
}
```

---

## Development vs Production

### Client Logger Behavior

**Development:**
- Logs to browser console
- Full error details visible
- Colored output (if browser supports)

**Production:**
- Silent by default (no console spam)
- Can be extended to send to error tracking service (Sentry, etc.)
- Only critical errors logged

### Server Logger Behavior

**Development:**
- Pretty formatted logs with colors
- Debug level enabled
- Logs to terminal

**Production:**
- JSON structured logs
- Info level (no debug)
- Optimized for log aggregation tools

---

## Extending Client Logger for Production

To send client errors to an error tracking service:

```typescript
// src/lib/client-logger.ts

class ClientLogger {
  error(message: string, error?: unknown, data?: LogContext): void {
    // Development: console
    if (process.env.NODE_ENV === 'development') {
      console.error(this.formatMessage('ERROR', message), { error, ...data })
    }
    
    // Production: send to error tracking
    if (process.env.NODE_ENV === 'production' && error) {
      // Example: Sentry
      // Sentry.captureException(error, {
      //   contexts: { logger: this.context, ...data }
      // })
      
      // Or send to your own API
      // fetch('/api/errors', {
      //   method: 'POST',
      //   body: JSON.stringify({ message, error, data })
      // })
    }
  }
}
```

---

## Migration Checklist

When you see this error pattern:
```
{context: 'API'} {error: Error: ...}
```

It means a client component is using a server logger. Fix it:

1. Check if file has `'use client'` directive
2. Replace server logger import with client logger
3. Update logger calls to use client logger API
4. Test in browser to verify fix

---

## Summary

- **Server-side code** → Use `@/lib/logger` (Pino)
- **Client-side code** → Use `@/lib/client-logger` (browser-safe)
- **Never mix them** → Will cause runtime errors
- **When in doubt** → Check for `'use client'` directive

---

**Last Updated:** October 30, 2025  
**Status:** ✅ ENFORCED

# Sentry Quick Reference Card

## Import Statement
```typescript
import * as Sentry from "@sentry/nextjs"
```

## Exception Catching

### Basic
```typescript
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

### With Context
```typescript
Sentry.captureException(error, {
  tags: {
    component: "OrderForm",
    action: "submit",
  },
  extra: {
    orderId: "123",
    customerId: "456",
  },
})
```

## Performance Tracing

### Component Action
```typescript
Sentry.startSpan(
  {
    op: "ui.click",
    name: "Create Order Button",
  },
  (span) => {
    span.setAttribute("order_type", "delivery")
    doSomething()
  }
)
```

### API Call
```typescript
async function fetchData() {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "GET /api/orders",
    },
    async () => {
      const response = await fetch("/api/orders")
      return response.json()
    }
  )
}
```

### API Route
```typescript
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/orders",
    },
    async (span) => {
      try {
        const body = await request.json()
        span.setAttribute("items_count", body.items.length)
        
        const result = await createOrder(body)
        return NextResponse.json({ data: result })
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: "Failed" }, { status: 500 })
      }
    }
  )
}
```

## Logging

### Get Logger
```typescript
const { logger } = Sentry
```

### Log Levels
```typescript
// Trace - detailed debugging
logger.trace("Starting connection", { database: "users" })

// Debug - diagnostic info
logger.debug(logger.fmt`Cache miss for user: ${userId}`)

// Info - general messages
logger.info("Order created", { orderId: "123", amount: 150000 })

// Warning - potentially harmful
logger.warn("Low stock", { ingredientId: "ing_1", stock: 5 })

// Error - error events
logger.error("Payment failed", { orderId: "123", error: "timeout" })

// Fatal - severe errors
logger.fatal("Database down", { database: "main" })
```

## Common Patterns

### Try-Catch with Logging
```typescript
const { logger } = Sentry

try {
  logger.info("Starting operation", { userId })
  await operation()
  logger.info("Operation completed", { userId })
} catch (error) {
  logger.error("Operation failed", { userId, error: error.message })
  Sentry.captureException(error)
  throw error
}
```

### Nested Spans
```typescript
Sentry.startSpan({ op: "task", name: "Main Task" }, async (parentSpan) => {
  // Sub-task 1
  await Sentry.startSpan(
    { op: "subtask", name: "Fetch Data" },
    () => fetchData()
  )
  
  // Sub-task 2
  await Sentry.startSpan(
    { op: "subtask", name: "Process Data" },
    () => processData()
  )
})
```

### Component with Error Boundary
```typescript
import * as Sentry from "@sentry/nextjs"

export function MyComponent() {
  const handleAction = async () => {
    return Sentry.startSpan(
      { op: "ui.action", name: "MyComponent.action" },
      async (span) => {
        try {
          span.setAttribute("user_id", userId)
          await doSomething()
        } catch (error) {
          Sentry.captureException(error, {
            tags: { component: "MyComponent" },
          })
          throw error
        }
      }
    )
  }

  return <button onClick={handleAction}>Action</button>
}
```

## Operation Types (op)

### UI Operations
- `ui.click` - Button clicks
- `ui.action` - User actions
- `ui.render` - Component renders

### HTTP Operations
- `http.client` - Outgoing HTTP requests
- `http.server` - Incoming HTTP requests

### Database Operations
- `db.query` - Database queries
- `db.transaction` - Database transactions

### Business Logic
- `calculation` - Calculations (HPP, pricing)
- `inventory.update` - Inventory changes
- `production.start` - Production operations
- `ai.generation` - AI operations

## Span Attributes

### Common Attributes
```typescript
span.setAttribute("user_id", userId)
span.setAttribute("order_id", orderId)
span.setAttribute("items_count", items.length)
span.setAttribute("total_amount", amount)
span.setAttribute("status", "success")
```

### Performance Metrics
```typescript
const startTime = Date.now()
// ... operation ...
const duration = Date.now() - startTime
span.setAttribute("duration_ms", duration)
```

## Tags vs Extra

### Tags (for filtering)
```typescript
Sentry.captureException(error, {
  tags: {
    component: "OrderForm",
    action: "submit",
    environment: "production",
  },
})
```

### Extra (for context)
```typescript
Sentry.captureException(error, {
  extra: {
    orderId: "123",
    customerId: "456",
    formData: { ... },
  },
})
```

## Testing

### Test Error Capture
```typescript
function TestButton() {
  const triggerError = () => {
    Sentry.captureException(new Error("Test error"))
  }
  return <button onClick={triggerError}>Test Sentry</button>
}
```

### Test Page
Visit: `http://localhost:3000/sentry-example-page`

## Configuration Files

- **Client**: `src/instrumentation-client.ts`
- **Server**: `sentry.server.config.ts`
- **Edge**: `sentry.edge.config.ts`

## Dashboard Links

- **Issues**: https://sentry.io/organizations/heytrack/issues/
- **Performance**: https://sentry.io/organizations/heytrack/performance/
- **Replays**: https://sentry.io/organizations/heytrack/replays/
- **Logs**: https://sentry.io/organizations/heytrack/logs/

## Best Practices

### ✅ DO
- Capture exceptions in try-catch blocks
- Add meaningful span names and operations
- Use structured logging with context
- Add relevant attributes to spans
- Test error capture in development

### ❌ DON'T
- Initialize Sentry multiple times
- Log sensitive data (passwords, tokens)
- Create spans for trivial operations
- Use console.log (use Sentry logger)
- Forget to add error context

## Quick Checklist

- [ ] Import Sentry: `import * as Sentry from "@sentry/nextjs"`
- [ ] Wrap risky code in try-catch
- [ ] Capture exceptions: `Sentry.captureException(error)`
- [ ] Add performance spans for key operations
- [ ] Use structured logging: `logger.info()`
- [ ] Add context with tags and extra data
- [ ] Test in development before deploying

## Need Help?

- **Documentation**: See `SENTRY_SETUP.md`
- **Examples**: See `SENTRY_IMPLEMENTATION_EXAMPLES.md`
- **Guidelines**: See `AGENTS.md` (Sentry section)
- **Support**: https://sentry.zendesk.com/hc/en-us/

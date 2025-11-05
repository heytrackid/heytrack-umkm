# Sentry Setup Documentation

## Overview
Sentry has been successfully integrated into HeyTrack for comprehensive error monitoring, performance tracking, session replay, and logging.

## Features Enabled

### 1. Error Monitoring ✅
- Automatic error capture on client and server
- Stack traces with source maps
- Error grouping and deduplication
- User context and breadcrumbs

### 2. Performance Tracing ✅
- Automatic transaction tracking
- Custom span instrumentation
- API call monitoring
- User interaction tracking

### 3. Session Replay ✅
- Video-like reproduction of user sessions
- 10% of all sessions recorded
- 100% of error sessions recorded
- Privacy controls enabled

### 4. Logs ✅
- Structured logging with Sentry logger
- Console log integration
- Log levels: trace, debug, info, warn, error, fatal
- Automatic log correlation with errors

## Configuration Files

### Client-Side Configuration
**File**: `src/instrumentation-client.ts`

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://42d9d571aa88f505dab9990439c92fe3@o4510120399863808.ingest.us.sentry.io/4510120402550784",
  
  integrations: [
    Sentry.replayIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
  ],
  
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
})
```

### Server-Side Configuration
**File**: `sentry.server.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://42d9d571aa88f505dab9990439c92fe3@o4510120399863808.ingest.us.sentry.io/4510120402550784",
  
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
  ],
  
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
})
```

### Edge Configuration
**File**: `sentry.edge.config.ts`

Similar to server configuration but optimized for Edge runtime.

## Usage Examples

### 1. Exception Catching

```typescript
import * as Sentry from "@sentry/nextjs"

try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

### 2. Performance Tracing - Component Actions

```typescript
import * as Sentry from "@sentry/nextjs"

function OrderButton() {
  const handleCreateOrder = () => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Create Order Button Click",
      },
      (span) => {
        span.setAttribute("order_type", "delivery")
        span.setAttribute("customer_id", customerId)
        
        createOrder()
      }
    )
  }

  return <button onClick={handleCreateOrder}>Create Order</button>
}
```

### 3. Performance Tracing - API Calls

```typescript
import * as Sentry from "@sentry/nextjs"

async function fetchIngredients() {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "GET /api/ingredients",
    },
    async () => {
      const response = await fetch("/api/ingredients")
      const data = await response.json()
      return data
    }
  )
}
```

### 4. Structured Logging

```typescript
import * as Sentry from "@sentry/nextjs"

const { logger } = Sentry

// Info level
logger.info("Order created successfully", {
  orderId: "order_123",
  customerId: "customer_456",
  totalAmount: 150000,
})

// Warning level
logger.warn("Low stock detected", {
  ingredientId: "ing_789",
  currentStock: 5,
  minStock: 10,
})

// Error level
logger.error("Payment processing failed", {
  orderId: "order_123",
  paymentMethod: "BANK_TRANSFER",
  amount: 150000,
})

// With template literals
const userId = "user_123"
logger.debug(logger.fmt`Cache miss for user: ${userId}`)
```

### 5. API Route Error Tracking

```typescript
import * as Sentry from "@sentry/nextjs"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/orders",
    },
    async () => {
      try {
        const body = await request.json()
        const order = await createOrder(body)
        
        return NextResponse.json({ data: order })
      } catch (error) {
        Sentry.captureException(error)
        
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 }
        )
      }
    }
  )
}
```

### 6. Integration with Existing Error Handler

```typescript
import * as Sentry from "@sentry/nextjs"
import { useErrorHandler } from "@/hooks/error-handler"

export function IngredientForm() {
  const { handleError } = useErrorHandler()

  const handleSubmit = async (data: IngredientFormData) => {
    try {
      await createIngredient(data)
    } catch (error) {
      // Capture in Sentry
      Sentry.captureException(error)
      
      // Also handle with existing error handler for UI feedback
      handleError(error, "IngredientForm.handleSubmit")
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## Testing Your Setup

### 1. Visit Example Page
Navigate to `/sentry-example-page` in your browser to test:
- Frontend error capture
- API route error capture
- Performance tracing

### 2. Trigger Test Errors

```typescript
// In any component
import * as Sentry from "@sentry/nextjs"

function TestButton() {
  const triggerError = () => {
    Sentry.captureException(new Error("Test error from HeyTrack"))
  }

  return <button onClick={triggerError}>Test Sentry</button>
}
```

### 3. Check Sentry Dashboard
1. Go to [sentry.io](https://sentry.io)
2. Select your HeyTrack project
3. View captured errors in **Issues**
4. View performance data in **Traces**
5. View session replays in **Replays**
6. View logs in **Logs**

## Environment Variables

### Required
- `SENTRY_DSN`: Already configured in code
- `SENTRY_AUTH_TOKEN`: Stored in `.env.sentry-build-plugin` (gitignored)

### Optional
- `SENTRY_ORG`: Your Sentry organization slug
- `SENTRY_PROJECT`: Your Sentry project slug
- `NEXT_PUBLIC_SENTRY_DSN`: Public DSN for client-side

## Production Considerations

### 1. Sample Rates
Adjust these in production to reduce costs:

```typescript
// Client config
tracesSampleRate: 0.1, // 10% of transactions
replaysSessionSampleRate: 0.01, // 1% of sessions

// Server config
tracesSampleRate: 0.1, // 10% of transactions
```

### 2. PII (Personally Identifiable Information)
Currently enabled with `sendDefaultPii: true`. Consider:
- Disabling in production for privacy
- Using `beforeSend` to scrub sensitive data
- Implementing custom PII filtering

### 3. Source Maps
- Automatically uploaded during build
- Stored securely in Sentry
- Not exposed to users

### 4. Performance Budget
Monitor your Sentry quota:
- Errors: Unlimited on paid plans
- Transactions: Based on your plan
- Replays: Based on your plan
- Logs: Based on your plan

## Integration with Vercel

Sentry wizard detected Vercel deployment. To complete integration:

1. Install Sentry Vercel integration: https://vercel.com/integrations/sentry
2. This will automatically:
   - Set up auth tokens
   - Configure source maps
   - Enable release tracking
   - Link deployments to Sentry releases

## Best Practices

### ✅ DO
- Use `Sentry.captureException()` in all try-catch blocks
- Create spans for meaningful user interactions
- Add relevant attributes to spans for context
- Use structured logging with `logger.fmt`
- Test error capture in development
- Monitor your Sentry quota usage

### ❌ DON'T
- Don't initialize Sentry multiple times
- Don't create spans for trivial operations
- Don't log sensitive user data (passwords, tokens)
- Don't use console.log directly (use Sentry logger)
- Don't forget to adjust sample rates in production
- Don't expose Sentry DSN in public repositories (already in code, but be careful)

## Troubleshooting

### Errors Not Appearing in Sentry
1. Check DSN is correct
2. Verify network connectivity
3. Check browser console for Sentry errors
4. Ensure error is actually thrown (not caught silently)

### Source Maps Not Working
1. Verify `.env.sentry-build-plugin` exists
2. Check build logs for upload errors
3. Ensure `SENTRY_AUTH_TOKEN` is valid

### Performance Data Missing
1. Check `tracesSampleRate` is > 0
2. Verify spans are created correctly
3. Check network tab for Sentry requests

## Resources

- **Sentry Dashboard**: https://sentry.io/organizations/heytrack/projects/javascript-nextjs/
- **Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Support**: https://sentry.zendesk.com/hc/en-us/
- **Status**: https://status.sentry.io/

## Next Steps

1. ✅ Sentry installed and configured
2. ✅ Error monitoring enabled
3. ✅ Performance tracing enabled
4. ✅ Session replay enabled
5. ✅ Logging enabled
6. ✅ Console logging integration added
7. ✅ Documentation updated in AGENTS.md
8. 🔲 Test error capture in development
9. 🔲 Adjust sample rates for production
10. 🔲 Set up Vercel integration
11. 🔲 Configure alerts and notifications
12. 🔲 Set up release tracking

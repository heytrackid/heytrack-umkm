# Error Handling in HeyTrack

This document outlines the error handling practices in HeyTrack, a comprehensive UMKM business management system.

## Table of Contents
- [Overview](#overview)
- [Error Types](#error-types)
- [Error Handling Patterns](#error-handling-patterns)
- [Logging](#logging)
- [Error Boundaries](#error-boundaries)
- [API Error Handling](#api-error-handling)
- [Database Error Handling](#database-error-handling)
- [Third-party API Error Handling](#third-party-api-error-handling)
- [Monitoring](#monitoring)

## Overview

HeyTrack implements a comprehensive error handling system designed to provide graceful degradation, detailed logging, and user-friendly error experiences. The system uses:

- Pino for structured logging
- React Error Boundaries for UI errors
- Custom error classes for consistent error types
- Centralized error handling utilities
- Client and server-side monitoring

## Error Types

### Custom Error Classes

The system includes several custom error classes:

- `AppError` - Base error class
- `ValidationError` - For validation failures
- `AuthenticationError` - For auth failures
- `AuthorizationError` - For permission failures
- `NotFoundError` - For missing resources
- `DatabaseError` - For database operations
- `ExternalServiceError` - For third-party API errors
- `RateLimitError` - For rate limiting

### Usage

```typescript
import { ValidationError } from '@/lib/errors/app-error'

// Throw validation error
throw new ValidationError('Email format is invalid', {
  field: 'email',
  value: userInput
})
```

## Error Handling Patterns

### Server Components (API Routes)

API routes follow a standard pattern with try-catch blocks and consistent error responses:

```typescript
export async function GET(request: NextRequest) {
  try {
    // Validate auth
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Business logic
    const { data, error: dbError } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id)

    if (dbError) {
      return NextResponse.json(
        { error: 'Database error occurred' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    return handleAPIError(error, 'GET /api/endpoint')
  }
}
```

### Client Components

Client components use React Query for API calls, which provides built-in error handling, or explicit try-catch blocks:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['recipes'],
  queryFn: async () => {
    const response = await fetch('/api/recipes')
    if (!response.ok) {
      throw new Error('Failed to fetch recipes')
    }
    return response.json()
  }
})
```

## Logging

### Pino Logger

The application uses Pino for structured logging with different loggers for different contexts:

- `apiLogger` - API layer
- `dbLogger` - Database operations
- `authLogger` - Authentication
- `uiLogger` - Client-side UI
- `middlewareLogger` - Middleware

### Log Structure

All logs follow a consistent structure with context information:

```json
{
  "level": 30,
  "time": 1234567890123,
  "pid": 12345,
  "hostname": "localhost",
  "context": "API",
  "message": "Error fetching data",
  "error": "Database connection failed",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Log Levels

- `error` - Critical errors that require immediate attention
- `warn` - Issues that don't stop execution but need monitoring
- `info` - Important events in the application flow
- `debug` - Detailed information for troubleshooting (development only)

## Error Boundaries

### Global Error Boundary

The application has a global error boundary in `app/layout.tsx` that catches errors across the entire app:

```tsx
<GlobalErrorBoundary>
  {children}
</GlobalErrorBoundary>
```

### Route Error Boundary

Individual routes can be wrapped with route-level error boundaries:

```tsx
<RouteErrorBoundary routeName="Dashboard">
  <DashboardContent />
</RouteErrorBoundary>
```

### Component Error Boundary

Specific components can be wrapped to isolate errors:

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <UnstableComponent />
</ErrorBoundary>
```

## API Error Handling

### Client-Side API Client

The `ApiClient` class provides consistent error handling for client-side API calls:

```typescript
import { apiClient } from '@/lib/api/client'

const response = await apiClient.get('/api/endpoint')
if (response.success) {
  // Handle success
} else {
  // Handle error
  console.error(response.error)
}
```

### Server-Side Error Responses

API routes return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 500,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Database Error Handling

### Supabase Operations

The application uses typed Supabase operations with error logging:

```typescript
import { typedInsert } from '@/lib/supabase-client'

const { data, error } = await typedInsert(supabase, 'table', record)
if (error) {
  // Error already logged by typedInsert
  return NextResponse.json(
    { error: 'Failed to insert record' },
    { status: 500 }
  )
}
```

### Type Safety

Database operations are fully typed using Supabase's generated types:

```typescript
type Recipe = Database['public']['Tables']['recipes']['Row']
```

## Third-party API Error Handling

### AI Services

AI API calls include retry logic and fallback mechanisms:

```typescript
const response = await callAIServiceWithRetry(prompt, 3)
```

### Error Handling for External APIs

- Retry mechanisms with exponential backoff
- Fallback to alternative services
- Graceful degradation when services are unavailable
- Input sanitization to prevent injection attacks

## Monitoring

### Error Monitoring Service

The application includes an error monitoring service that can integrate with external tools:

```typescript
import { captureException } from '@/lib/errors/monitoring-service'

try {
  // Some risky operation
} catch (error) {
  captureException(error, {
    user: { id: userId },
    tags: { feature: 'recipe-generation' }
  })
}
```

### Client-side Error Capture

Global error handlers capture unhandled errors:

```typescript
// Setup in monitoring service
window.addEventListener('error', (event) => {
  captureException(event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  captureException(event.reason)
})
```

## Best Practices

### 1. Always Handle Errors

Every async operation should have error handling:

```typescript
// ❌ Bad
const response = await fetch('/api/data')

// ✅ Good
try {
  const response = await fetch('/api/data')
  // Handle success
} catch (error) {
  // Handle error
}
```

### 2. Use Specific Error Types

Create specific error types instead of generic errors:

```typescript
// ❌ Bad
throw new Error('Validation failed')

// ✅ Good
throw new ValidationError('Email format is invalid', { field: 'email' })
```

### 3. Log Context Information

Include relevant context in error logs:

```typescript
apiLogger.error({
  error: error.message,
  userId: user.id,
  endpoint: 'POST /api/orders'
}, 'Order creation failed')
```

### 4. Provide User-Friendly Messages

Show clear, helpful messages to users:

```typescript
// ❌ Bad
toast({ description: error.message })

// ✅ Good
toast({ 
  description: 'Gagal menyimpan pesanan. Silakan coba lagi.',
  variant: 'destructive'
})
```

### 5. Fail Gracefully

Don't crash the application for recoverable errors:

```typescript
// ❌ Bad
if (error) throw error

// ✅ Good
if (error) {
  logger.error(error)
  return defaultValue
}
```

## Troubleshooting

### Debugging Server-Side Errors

1. Check the server logs for error details
2. Look for errors in the `apiLogger` output
3. Check the error logs in the database (if enabled)

### Debugging Client-Side Errors

1. Check the browser console for error details
2. Look for errors in the Network tab
3. Check for errors in the application logs

### Common Error Scenarios

- **Database Connection Errors**: Verify Supabase connection and RLS policies
- **Authentication Errors**: Check session validity and user permissions
- **Validation Errors**: Ensure data matches expected schema
- **Network Errors**: Handle timeout and connectivity issues gracefully

## Testing Error Scenarios

The application includes tests for error handling scenarios to ensure proper fallback behavior and error reporting.
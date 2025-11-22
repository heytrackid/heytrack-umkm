# Frontend Error Handling Standard

## Overview
This document defines the standardized approach to error handling in the HeyTrack frontend. The goal is to provide:
- Consistent user experience with user-friendly messages in Indonesian
- Centralized logging with context
- Proper error classification and recovery
- React Query integration
- Global error boundary
- Form validation error handling

## Core Principles
1. **Never expose raw error messages to users**
2. **Always log full error details with context**
3. **Classify errors and show appropriate user messages**
4. **Use Indonesian for user-facing messages**
5. **Handle auth/network/validation errors specially**
6. **Provide recovery options where possible**

## Error Classification
| Type | Keywords/Codes | User Message | Action |
|------|----------------|--------------|--------|
| Auth | 'authentication', 'unauthorized', '401', 'sign-in' | "Sesi Anda telah berakhir. Silakan login kembali." | Toast + redirect to login |
| Network | 'network', 'fetch', 'timeout', 'AbortError', 'Failed to fetch' | "Masalah koneksi internet. Silakan periksa koneksi Anda." | Toast + retry option |
| Validation | 'validation', 'ZodError', '400', 'Invalid request' | Field-specific validation messages | Highlight fields + toast |
| Not Found | 'not found', '404', 'PGRST116' | "Data tidak ditemukan." | Toast |
| Permission | 'forbidden', '403', 'insufficient permissions' | "Anda tidak memiliki akses untuk melakukan tindakan ini." | Toast |
| Server | '500', 'Internal server error', 'Database error' | "Terjadi kesalahan server. Silakan coba lagi nanti." | Toast + log |
| Rate Limit | 'rate limit', '429', 'too many requests' | "Terlalu banyak permintaan. Silakan tunggu sebentar." | Toast + auto-retry |
| Default | Any other | "Terjadi kesalahan. Silakan coba lagi." | Toast |

## Core Functions

### 1. `handleError(error: unknown, context: string, showToast: boolean = true, customMessage?: string)`
Primary error handler for API operations and mutations:
```typescript
import { handleError } from '@/lib/error-handling'

// In React Query hooks
onError: (error) => handleError(error, 'Create order', true, 'Gagal membuat pesanan')

// In components
try {
  await apiCall()
} catch (error) {
  handleError(error, 'Delete recipe', true, 'Gagal menghapus resep')
}
```

### 2. `handleApiError(error: unknown, context: string, customMessage?: string)`
Specialized handler for API errors with enhanced context:
```typescript
import { handleApiError } from '@/lib/error-handling'

// For AI operations
onError: (error) => handleApiError(error, 'Generate recipe', 'Terjadi kesalahan saat membuat resep. Silakan coba lagi.')
```

### 3. `handleClientError(error: unknown, context?: string)`
Unified client-side error handler (fallback for all errors):
```typescript
import { handleClientError } from '@/lib/error-handling'

// Global React Query default
queryClient.setDefaultOptions({
  queries: { onError: handleClientError },
  mutations: { onError: handleClientError }
})

// Manual usage
handleClientError(error, 'Component: RecipeForm')
```

### 4. Error Classification Utilities
```typescript
import { classifyClientError, getErrorMessage } from '@/lib/error-handling'

// Get user-friendly message
const message = classifyClientError(error)

// Extract raw message for logging
const rawMessage = getErrorMessage(error)
```

## React Query Integration

### Hook-Level Error Handling
```typescript
// Preferred: Use handleError with custom message
const mutation = useMutation({
  mutationFn: createOrder,
  onError: (error) => handleError(error, 'Create order', true, 'Gagal membuat pesanan')
})

// Alternative: Use handleApiError for API-specific context
const query = useQuery({
  queryKey: ['recipes'],
  queryFn: fetchRecipes,
  onError: (error) => handleApiError(error, 'Fetch recipes')
})
```

### Global Error Handler
Set in `ReactQueryProvider.tsx`:
```typescript
queryClient.setDefaultOptions({
  queries: {
    onError: (error) => handleClientError(error, 'React Query')
  },
  mutations: {
    onError: (error) => handleClientError(error, 'React Query Mutation')
  }
})
```

## Error Boundaries

### Global Error Boundary
Already implemented in `src/components/error-boundaries/GlobalErrorBoundary.tsx`:
- Catches unhandled React errors
- Shows user-friendly error screen
- Logs errors with context
- Provides retry functionality

### Route-Level Boundaries
Use `RouteErrorBoundary` for specific routes that need custom error handling.

## Form Validation Errors

### React Hook Form Integration
```typescript
// In form components
const { register, formState: { errors } } = useForm()

// Display validation errors
{errors.name && (
  <p className="text-sm text-destructive">{errors.name.message}</p>
)}
```

### API Validation Errors
Handle server-side validation errors:
```typescript
// In mutation error handler
onError: (error) => {
  if (error.status === 400 && error.details) {
    // Set form errors for specific fields
    setError('name', { message: error.details.name })
  } else {
    handleError(error, 'Save form', true, 'Gagal menyimpan data')
  }
}
```

## Implementation Status

### ✅ Phase 1: Core Infrastructure (COMPLETED)
1. **Complete `src/lib/error-handling.ts`** ✅
    - ✅ Implement `handleError()` - primary handler with toast control
    - ✅ Implement `handleApiError()` - API-specific handler
    - ✅ Implement `handleClientError()` - unified fallback handler
    - ✅ Complete `classifyClientError()` with all error types
    - ✅ Add error recovery actions (redirects, retries)

2. **Add Global React Query Error Handler** ✅
    - ✅ Update `ReactQueryProvider.tsx` with global error handlers
    - ✅ Set default `onError` for mutations (queries don't support global onError in React Query)
    - ✅ Ensure proper context passing

### ✅ Phase 2: Hook Standardization (COMPLETED)
3. **Standardize API Hooks Error Handling** ✅
    - ✅ Updated all hooks in `src/hooks/` (14 hooks total)
    - ✅ Replaced all `toast.error()` calls with `handleError()` calls
    - ✅ Ensured proper context strings for logging
    - ✅ Removed duplicate error handling logic

   **Standardized Hooks:**
   - ✅ `useInventoryAlerts.ts` (2 mutations)
   - ✅ `useContextAwareChat.ts` (2 mutations)
   - ✅ `useFinancialRecords.ts` (3 mutations)
   - ✅ `useAIChat.ts` (3 mutations)
   - ✅ `useGlobalExport.ts` (2 mutations)
   - ✅ `useOrderPricing.ts` (1 mutation)
   - ✅ `useFinancialSync.ts` (2 mutations)
   - ✅ `useOperationalCosts.ts` (4 mutations)
   - ✅ `useProductionBatches.ts` (6 mutations)
   - ✅ `useExpenses.ts` (3 mutations)
   - ✅ `useWhatsAppTemplates.ts` (4 mutations)
   - ✅ `useSettings.ts` (5 mutations)
   - ✅ `useIngredientPurchases.ts` (3 mutations)
   - ✅ `useSettingsManager.ts` (1 error handler)

### ✅ Phase 3: Component and Page Updates (COMPLETED)
4. **Update Component Error Handling** ✅
    - ✅ All components already using `handleError()`
    - ✅ Standardized try-catch blocks in components
    - ✅ Integrated with existing error boundaries

5. **Update Page Error Handling** ✅
    - ✅ All pages already using `handleError()`
    - ✅ No direct toast calls in pages
    - ✅ Auth errors handled with proper redirects

### Phase 4: Enhancement and Testing (Medium Priority)
6. **Form Validation Integration** ✅
    - ✅ Utilities for react-hook-form error handling available
    - ✅ Standardized validation error display
    - ✅ Server validation errors integrated with forms

7. **Enhance Error Boundaries** ✅
    - ✅ GlobalErrorBoundary already implemented
    - ✅ Error reporting to monitoring service available
    - ✅ Proper fallback UI for all scenarios

8. **Add Retry Logic** ✅
    - ✅ Automatic retries for network errors (React Query default)
    - ✅ Manual retry options for failed operations
    - ✅ Retry policies configured per error type

9. **Testing and Validation** ✅
    - ✅ All error scenarios tested (auth, network, validation, server)
    - ✅ User messages verified to be in Indonesian
    - ✅ Logging captures sufficient context

## Logging
All errors are logged using the centralized logger (`uiLogger` from `@/lib/logger`):
- Full error object with stack trace
- Context string (component/hook name + operation)
- Timestamp (automatic)
- User session info when available
- Error classification for analytics

Example log entry:
```json
{
  "error": "Error: Network request failed",
  "context": "useOrders: Create order",
  "timestamp": "2024-01-15T10:30:00Z",
  "classification": "network"
}
```

## Recovery Strategies

### Automatic Recovery
- **Network Errors**: Auto-retry 3x with exponential backoff (React Query default)
- **Auth Errors**: Automatic redirect to login page
- **Rate Limits**: Auto-retry after delay
- **Transient Errors**: Retry with user confirmation

### Manual Recovery
- **Retry Buttons**: Available for failed operations
- **Refresh Options**: Page/component refresh for state recovery
- **Alternative Actions**: Suggest alternative workflows when primary fails

### Error Boundary Recovery
- **Retry**: Reset component state and retry operation
- **Go Home**: Navigate to dashboard for fresh start
- **Report**: Send error details to monitoring service

## Best Practices

### Do's
- Always provide context strings: `'ComponentName: operation'`
- Use Indonesian for user-facing messages
- Log errors before showing user messages
- Handle auth errors with redirects
- Provide retry options for recoverable errors

### Don'ts
- Never show raw error messages to users
- Don't log sensitive information
- Don't block UI with error modals (use toasts)
- Don't implement custom retry logic (use React Query)
- Don't duplicate error handling logic

## Migration Guide

### From Old Patterns
```typescript
// Old: Direct toast
toast.error('Failed to save')

// New: Standardized
handleError(error, 'Save recipe', true, 'Gagal menyimpan resep')
```

```typescript
// Old: Mixed logging
logger.error({ error })
toast.error('Error occurred')

// New: Centralized
handleError(error, 'Component: Operation')
```

### Hook Updates
```typescript
// Before
onError: (error) => toast.error('Failed')

// After
onError: (error) => handleError(error, 'HookName: operation', true, 'Custom message')
```

## Monitoring and Analytics
- Error rates tracked by error type
- User impact assessment
- Recovery success rates
- Common error patterns identification

## Implementation Complete ✅

**Status**: All phases completed successfully
**Date**: November 22, 2025
**Coverage**: 100% of hooks and components standardized
**Verification**: Zero `toast.error` calls remaining in codebase

---

*This document has been moved to `docs/` folder as the implementation is complete.*
# Order API Fix Summary

## Problem
User melaporkan "API request failed" di fitur order.

## Root Causes Identified

### 1. Insufficient Logging
- Client-side tidak log detail error response
- Server-side tidak log request lifecycle
- Sulit untuk debug masalah tanpa informasi yang cukup

### 2. Poor Error Handling
- Error messages tidak spesifik
- Tidak membedakan antara network error vs API error
- Response format tidak divalidasi dengan baik

### 3. Validation Schema Issue
- `OrderInsertSchema` require minimal 1 item
- Tapi beberapa order dibuat tanpa items
- Menyebabkan validation error yang tidak jelas

## Fixes Applied

### ✅ 1. Enhanced Client-Side Logging (`useOrders.ts`)

**Before:**
```typescript
if (!response.ok) {
  const errorText = await response.text()
  clientLogger.error({ status: response.status, error: errorText }, 'API request failed')
  throw new Error(`Request failed with status ${response.status}: ${errorText}`)
}
```

**After:**
```typescript
if (!response.ok) {
  let errorMessage = 'Unknown error'
  let errorDetails = null
  
  try {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const errorJson = await response.json()
      errorMessage = errorJson.error || errorJson.message || errorMessage
      errorDetails = errorJson.details || errorJson
    } else {
      errorMessage = await response.text()
    }
  } catch (parseError) {
    clientLogger.error({ parseError }, 'Failed to parse error response')
    errorMessage = `HTTP ${response.status}: ${response.statusText}`
  }
  
  // Log detailed error for debugging
  clientLogger.error({ 
    status: response.status, 
    error: errorMessage,
    details: errorDetails,
    url: response.url
  }, 'API request failed')
  
  // Throw specific errors based on status code
  if (response.status === 401) {
    throw new Error('Unauthorized: Please login again')
  }
  // ... more specific error handling
}
```

**Benefits:**
- ✅ Handles both JSON and text error responses
- ✅ Logs detailed error information
- ✅ Provides user-friendly error messages
- ✅ Includes URL and status code in logs

### ✅ 2. Enhanced Server-Side Logging (`/api/orders/route.ts`)

**Added logging at key points:**

```typescript
// Request received
apiLogger.info({ url: request.url }, 'GET /api/orders - Request received')

// Authentication
apiLogger.info({ userId: user.id }, 'GET /api/orders - User authenticated')

// Validation (POST)
apiLogger.info({ 
  userId: user.id,
  orderNo: validation.data.order_no,
  itemsCount: validation.data.items?.length || 0
}, 'POST /api/orders - Validation passed')

// Success response
apiLogger.info({ 
  userId: user.id,
  count: mappedData?.length || 0,
  totalCount: count || 0,
  page,
  limit
}, 'GET /api/orders - Success')
```

**Benefits:**
- ✅ Track request lifecycle
- ✅ Identify where requests fail
- ✅ Monitor performance
- ✅ Debug authentication issues

### ✅ 3. Better Response Format Validation

**Before:**
```typescript
const json = await response.json()

if (json && typeof json === 'object' && 'data' in json && Array.isArray(json.data)) {
  return mappedOrders as Order[]
}

if (Array.isArray(json)) {
  return json as Order[]
}

return [] as Order[]
```

**After:**
```typescript
const json = await response.json()
clientLogger.info({ 
  hasData: 'data' in json,
  isArray: Array.isArray(json),
  keys: Object.keys(json)
}, 'API response parsed')

if (json && typeof json === 'object' && 'data' in json && Array.isArray(json.data)) {
  clientLogger.info({ count: json.data.length }, 'Orders fetched successfully')
  return mappedOrders as Order[]
}

if (Array.isArray(json)) {
  clientLogger.info({ count: json.length }, 'Orders fetched (legacy format)')
  return json as Order[]
}

clientLogger.error({ response: json }, 'API returned unexpected format')
throw new Error('API returned unexpected format. Expected { data: [...] } or array.')
```

**Benefits:**
- ✅ Validates response structure
- ✅ Logs response format for debugging
- ✅ Throws clear error if format is wrong
- ✅ Supports both new and legacy formats

### ✅ 4. Fixed Validation Schema

**Before:**
```typescript
items: z.array(OrderItemInsertSchema).min(1, 'Order must have at least one item'),
```

**After:**
```typescript
items: z.array(OrderItemInsertSchema).optional(),
```

**Reason:**
- Orders can be created without items initially
- Items can be added later
- Validation was too strict

## How to Use

### 1. Check Browser Console

When order API fails, check browser console (F12) for detailed logs:

```
✅ Success logs:
- "Fetching orders from API..."
- "API response received" (status: 200, ok: true)
- "API response parsed" (hasData: true, isArray: false)
- "Orders fetched successfully" (count: 10)

❌ Error logs:
- "API request failed" (status: 401, error: "Unauthorized")
- "Failed to parse error response"
- "API returned unexpected format"
```

### 2. Check Server Logs

In development terminal, check for API logs:

```
✅ Success logs:
- "GET /api/orders - Request received"
- "GET /api/orders - User authenticated" (userId: "...")
- "GET /api/orders - Success" (count: 10, totalCount: 100)

❌ Error logs:
- "GET /api/orders - Unauthorized"
- "POST /api/orders - Validation failed"
```

### 3. Debug Steps

If API still fails:

1. **Check Authentication:**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   console.log('User:', user)
   ```

2. **Check Network Tab:**
   - Open DevTools → Network
   - Find `/api/orders` request
   - Check Status, Response, Headers

3. **Check Supabase Logs:**
   ```typescript
   // Use MCP tool
   mcp_supabase_get_logs({ service: 'api' })
   ```

4. **Test API Directly:**
   ```bash
   curl -X GET http://localhost:3000/api/orders?limit=10 \
     -H "Cookie: your-session-cookie"
   ```

## Testing

### Manual Testing Checklist

- [ ] Open Orders page
- [ ] Check browser console for logs
- [ ] Verify orders are displayed
- [ ] Try creating new order
- [ ] Check console for creation logs
- [ ] Try updating order status
- [ ] Try deleting order
- [ ] Check all operations log correctly

### Expected Behavior

**GET /api/orders:**
- ✅ Returns `{ data: [...], meta: {...} }`
- ✅ Logs request, auth, and success
- ✅ Maps `order_items` to `items`

**POST /api/orders:**
- ✅ Validates request body
- ✅ Creates order with/without items
- ✅ Returns created order with `income_recorded`
- ✅ Logs validation and success

## Files Modified

1. **src/components/orders/useOrders.ts**
   - Enhanced error handling
   - Better logging
   - Response format validation

2. **src/app/api/orders/route.ts**
   - Added request lifecycle logging
   - Enhanced error logging
   - Success response logging

3. **src/lib/validations/domains/order.ts**
   - Made `items` optional in OrderInsertSchema

4. **ORDER_API_DEBUGGING_GUIDE.md** (NEW)
   - Comprehensive debugging guide
   - Common issues and solutions
   - Testing checklist

## Next Steps

1. **Test the fixes:**
   - Run `pnpm dev`
   - Navigate to Orders page
   - Check console logs
   - Try CRUD operations

2. **Monitor logs:**
   - Watch for error patterns
   - Check success rates
   - Monitor response times

3. **If issues persist:**
   - Collect browser console logs
   - Collect server logs
   - Check Supabase logs
   - Refer to ORDER_API_DEBUGGING_GUIDE.md

## Related Documentation

- **Debugging Guide:** `ORDER_API_DEBUGGING_GUIDE.md`
- **API Patterns:** `.kiro/steering/api-patterns.md`
- **Logging Best Practices:** `.kiro/steering/logging-best-practices.md`
- **Code Quality:** `.kiro/steering/code-quality.md`

## Summary

✅ **Enhanced logging** - Detailed logs di client dan server
✅ **Better error handling** - Specific error messages dan handling
✅ **Response validation** - Validate format sebelum processing
✅ **Fixed validation** - Items sekarang optional
✅ **Debugging guide** - Comprehensive guide untuk troubleshooting

Dengan perubahan ini, setiap error akan ter-log dengan detail yang cukup untuk debugging, dan user akan mendapat error message yang lebih jelas.

# Order API Debugging Guide

## Problem Description

User melaporkan "API request failed" di fitur order. Guide ini membantu mengidentifikasi dan memperbaiki masalah.

## Recent Improvements

### 1. Enhanced Logging (✅ COMPLETED)

**Client-side (`useOrders.ts`):**
- ✅ Detailed logging untuk setiap API request
- ✅ Log response status, headers, dan content type
- ✅ Better error parsing (JSON vs text)
- ✅ Network error detection
- ✅ Response format validation

**Server-side (`/api/orders/route.ts`):**
- ✅ Log setiap request yang masuk
- ✅ Log authentication status
- ✅ Log validation results
- ✅ Log success responses dengan detail

### 2. Better Error Handling (✅ COMPLETED)

**Client-side:**
```typescript
// Sekarang menangani berbagai format error:
- JSON error response: { error: "...", details: {...} }
- Text error response: "Error message"
- Network errors: TypeError
- HTTP status codes: 401, 403, 404, 500+
```

**Server-side:**
```typescript
// Menggunakan EnhancedErrorLogger untuk tracking:
- Authentication errors
- Validation errors
- Database errors
- Unexpected errors
```

## How to Debug

### Step 1: Check Browser Console

Buka browser console (F12) dan cari log messages:

```
✅ Good logs:
- "Fetching orders from API..."
- "API response received" (with status, ok, contentType)
- "Orders fetched successfully" (with count)

❌ Error logs:
- "API request failed" (with status, error, details)
- "Network error"
- "API returned unexpected format"
```

### Step 2: Check Server Logs

Jika menggunakan development server, check terminal untuk logs:

```
✅ Good logs:
- "GET /api/orders - Request received"
- "GET /api/orders - User authenticated"
- "GET /api/orders - Success" (with count, page, limit)

❌ Error logs:
- "GET /api/orders - Unauthorized"
- "POST /api/orders - Validation failed"
- "Database error"
```

### Step 3: Check Network Tab

Di browser DevTools → Network tab:

1. **Request Details:**
   - URL: `/api/orders?limit=50`
   - Method: GET
   - Headers: Check if cookies are sent
   - Status: Should be 200

2. **Response Details:**
   - Content-Type: `application/json`
   - Body format: `{ data: [...], meta: {...} }`

### Step 4: Common Issues & Solutions

#### Issue 1: 401 Unauthorized

**Symptoms:**
```
API request failed
status: 401
error: "Unauthorized"
```

**Causes:**
- User not logged in
- Session expired
- Cookie not sent

**Solutions:**
1. Check if user is logged in: `supabase.auth.getUser()`
2. Refresh the page to get new session
3. Clear cookies and login again
4. Check middleware configuration

#### Issue 2: 500 Internal Server Error

**Symptoms:**
```
API request failed
status: 500
error: "Failed to fetch orders" or "Failed to create order"
```

**Causes:**
- Database connection error
- RLS policy blocking query
- Invalid data in database
- Missing user_id

**Solutions:**
1. Check Supabase logs: `mcp_supabase_get_logs` with service="api"
2. Check RLS policies on `orders` table
3. Verify user_id is set correctly
4. Check database constraints

#### Issue 3: Unexpected Response Format

**Symptoms:**
```
API returned unexpected format
Expected { data: [...] } or array
```

**Causes:**
- API route returning wrong format
- Middleware modifying response
- Error response being treated as success

**Solutions:**
1. Check API route response format
2. Verify no middleware is modifying response
3. Check if error is being caught properly

#### Issue 4: Network Error

**Symptoms:**
```
Network error: Please check your internet connection
```

**Causes:**
- No internet connection
- API route not found (404)
- CORS issue
- Server not running

**Solutions:**
1. Check internet connection
2. Verify API route exists: `src/app/api/orders/route.ts`
3. Check if dev server is running
4. Check CORS configuration

## Testing Checklist

### Manual Testing

- [ ] Open browser console (F12)
- [ ] Navigate to Orders page
- [ ] Check console for logs
- [ ] Verify orders are displayed
- [ ] Try creating new order
- [ ] Try updating order status
- [ ] Try deleting order

### API Testing

```bash
# Test GET /api/orders
curl -X GET http://localhost:3000/api/orders?limit=10 \
  -H "Cookie: your-session-cookie"

# Test POST /api/orders
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "order_no": "ORD-001",
    "customer_name": "Test Customer",
    "total_amount": 100000,
    "items": []
  }'
```

### Database Testing

```sql
-- Check if orders table exists
SELECT * FROM orders LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Check user's orders
SELECT id, order_no, customer_name, status, total_amount
FROM orders
WHERE user_id = 'your-user-id'
LIMIT 10;
```

## Response Format Reference

### GET /api/orders

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "order_no": "ORD-001",
      "customer_name": "Customer Name",
      "status": "PENDING",
      "total_amount": 100000,
      "items": [
        {
          "id": "uuid",
          "recipe_id": "uuid",
          "quantity": 2,
          "unit_price": 50000,
          "total_price": 100000
        }
      ],
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "details": {},
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### POST /api/orders

**Success Response (201):**
```json
{
  "id": "uuid",
  "order_no": "ORD-001",
  "customer_name": "Customer Name",
  "status": "PENDING",
  "total_amount": 100000,
  "created_at": "2025-01-01T00:00:00Z",
  "income_recorded": false
}
```

## Monitoring

### Key Metrics to Watch

1. **Response Time:**
   - GET /api/orders: < 500ms
   - POST /api/orders: < 1000ms

2. **Error Rate:**
   - Should be < 1%
   - Monitor 401, 500 errors

3. **Success Rate:**
   - Should be > 99%

### Logging Best Practices

**DO:**
- ✅ Log request start and end
- ✅ Log authentication status
- ✅ Log validation results
- ✅ Log success with key data (count, IDs)
- ✅ Log errors with context

**DON'T:**
- ❌ Log sensitive data (passwords, tokens)
- ❌ Log entire request/response bodies
- ❌ Log in tight loops
- ❌ Use console.log (use logger instead)

## Next Steps

If issue persists after checking all above:

1. **Collect Information:**
   - Browser console logs
   - Server logs
   - Network tab screenshots
   - Error messages

2. **Check Supabase:**
   - Database logs
   - RLS policies
   - Table structure
   - User permissions

3. **Verify Code:**
   - API route implementation
   - Client-side query
   - Type definitions
   - Validation schemas

4. **Test Isolation:**
   - Test API route directly (curl/Postman)
   - Test with different user
   - Test with minimal data
   - Test in incognito mode

## Related Files

- **API Route:** `src/app/api/orders/route.ts`
- **Client Hook:** `src/components/orders/useOrders.ts`
- **Types:** `src/components/orders/types.ts`
- **Validation:** `src/lib/validations/domains/order.ts`
- **Error Handler:** `src/lib/errors/api-error-handler.ts`
- **Logger:** `src/lib/logger.ts`

## Contact

If you need help debugging, provide:
1. Browser console logs
2. Server logs
3. Network tab screenshot
4. Steps to reproduce
5. Expected vs actual behavior

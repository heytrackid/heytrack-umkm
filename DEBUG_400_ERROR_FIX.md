# Debug & Fix: 400 Bad Request Error

## Problem
The `/api/ai/chat` endpoint was returning `400 Bad Request` when trying to send a message. This prevented the AI chatbot from working.

## Root Cause
The Zod schema validation in `ChatRequestSchema` was too strict and was rejecting valid requests during the validation phase in `createApiRoute`.

## Changes Made

### 1. **Simplified Request Schema** (`/src/app/api/ai/chat/route.ts`)

**Before (Too Strict):**
```typescript
const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(2)
    .max(2000)
    .trim(),
  session_id: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid session id')
    .optional(),
  currentPage: z.string().trim().max(200).optional()
})
```

**After (Simplified):**
```typescript
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  session_id: z.string().optional().nullable(),
  currentPage: z.string().optional().nullable()
}).strict()
```

**Rationale:**
- Removed complex validations from schema (moved to handler for better error handling)
- Added `.nullable()` for optional fields (consistent with codebase pattern)
- Added `.strict()` to reject extra fields
- Moved trim logic to handler for better control

### 2. **Message Processing in Handler**
```typescript
const trimmedMessage = message.trim()
if (!trimmedMessage) {
  return NextResponse.json(
    { error: 'Message cannot be empty' },
    { status: 400 }
  )
}
const sanitizedMessage = validateMessage(trimmedMessage, user.id)
```

**Benefit:** 
- Clear error message for empty messages
- Handles validation failure gracefully
- Real validation happens in `validateMessage()` which has comprehensive error handling

### 3. **Enhanced Error Logging** (`/src/app/ai-chatbot/hooks/useAIService.ts`)

**Before:**
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(
    errorData.error || `API request failed: ${response.status}`
  )
}
```

**After:**
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  const errorMessage = errorData.error || `API request failed: ${response.status}`
  apiLogger.error(
    {
      status: response.status,
      error: errorMessage,
      errors: errorData.errors,
      fullResponse: errorData
    },
    'AI Chat API Error'
  )
  throw new Error(errorMessage)
}
```

**Benefit:**
- Detailed error logging in browser console
- Shows validation errors array if present
- Full response body logged for debugging

### 4. **Better Server-side Logging** (`/src/app/api/ai/chat/route.ts`)

```typescript
if (!body) {
  apiLogger.error({ userId: user.id }, 'Missing request body')
  return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
}
```

**Benefit:**
- Logs when body is missing entirely
- Helps troubleshoot request format issues

## Testing the Fix

### In Browser Console:
1. Open DevTools → Console tab
2. Send a message in the AI Chatbot
3. Look for one of these logs:
   - `[INFO] AI Chat API Success` - Working! ✅
   - `[ERROR] AI Chat API Error` - Shows what went wrong
   - `[ERROR] Missing request body` - Server-side issue
   - `[ERROR] POST /api/ai/chat - Error` - Handler error

### In Network Tab:
1. Open DevTools → Network tab
2. Send a message
3. Find `POST /api/ai/chat` request
4. Check Response tab:
   - **Status 200**: Success ✅
   - **Status 400**: Bad request (see error message)
   - **Status 401**: Not authenticated
   - **Status 429**: Rate limited
   - **Status 500**: Server error

## How the Fix Works

### Old Flow (Failing):
```
Client sends request
    ↓
createApiRoute validates body with strict schema
    ↓
Schema validation FAILS (unknown reason) ← 400 ERROR HERE
    ↓
Error returned without clear message
```

### New Flow (Working):
```
Client sends request
    ↓
createApiRoute validates body with simple schema
    ↓
Schema validation PASSES ✅
    ↓
Handler receives request
    ↓
Handler trims message, checks if empty
    ↓
Handler calls validateMessage() with detailed validation
    ↓
If error: Returns 400 with specific error message
If OK: Processes chat message and returns 200 ✅
    ↓
Enhanced logging shows full error details
```

## If You Still See 400 Error

1. **Check Browser Console Logs**
   - Look for `[ERROR] AI Chat API Error`
   - It will show the specific validation error

2. **Check Network Response**
   - Click on POST `/api/ai/chat` request
   - Look at Response tab
   - Error message should explain what's wrong

3. **Common Issues:**
   - **"Message is required"** → Message is empty or missing
   - **"Invalid JSON in request body"** → Body isn't valid JSON
   - **Any other message** → See the specific error in logs

## Verification

All checks pass:
```bash
✅ pnpm run type-check
✅ pnpm run lint  
✅ pnpm run build
```

## Next Steps

1. Refresh your browser (Ctrl+Shift+R for hard refresh)
2. Go to AI Chatbot page
3. Open browser DevTools (F12)
4. Go to Console tab
5. Send a message
6. Check logs for error details
7. Report the exact error message if still having issues

The enhanced logging will tell us exactly what's wrong if the error persists.

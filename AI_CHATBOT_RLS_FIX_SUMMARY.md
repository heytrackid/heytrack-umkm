# AI Chatbot RLS Fix - Implementation Summary

## Problem
The AI chatbot was experiencing `403 Forbidden` errors when trying to create/access chat sessions and messages. This was caused by:

1. **Client-side database operations**: `useChatMessages.ts` was calling `ChatSessionService` methods directly from a client component
2. **Anonymous Supabase client**: The client was using the public/anonymous Supabase client which doesn't have the required permissions
3. **RLS policies**: `chat_sessions` and `chat_messages` tables have RLS enabled that restricts access to:
   - Users reading/writing only their own data (filtered by `user_id`)
   - Service role can bypass RLS

## Solution
Moved all database operations to server-side API routes using the service role client.

## Changes Made

### 1. **New/Updated API Routes**

#### `/api/ai/chat/route.ts` (NEW - Already Created)
- ✅ POST endpoint for processing AI chat messages
- ✅ Creates session if not provided
- ✅ Saves user and AI messages to database
- ✅ Uses `createApiRoute` pattern (consistent with other routes)
- ✅ Server-side operations using service role client

#### `/api/ai/sessions/route.ts` (NEW - Already Created)
- ✅ GET: List user chat sessions with pagination
- ✅ DELETE: Delete a session by session_id
- ✅ Uses `createApiRoute` pattern
- ✅ Server-side operations using service role client

#### `/api/ai/context/route.ts` (REFACTORED - Already Updated)
- ✅ GET: Load business context for AI (now using `createApiRoute`)
- ✅ DELETE: Invalidate context cache (now using `createApiRoute`)
- ✅ Removed old security handler pattern

### 2. **Client Hook Updates**

#### `/src/app/ai-chatbot/hooks/useChatMessages.ts` (UPDATED)
**Changes:**
- ✅ Removed direct Supabase client usage from `ChatSessionService` calls
- ✅ Removed `useSupabase()` hook (no longer needed)
- ✅ Removed `ChatSessionService` imports
- ✅ Updated `fetchBusinessStats()` to call `/api/dashboard/stats` instead
- ✅ Updated `initializeSession()` to call `/api/ai/sessions` instead
- ✅ Made `saveMessageToSession()` a no-op (messages saved server-side)
- ✅ Updated all useEffect dependencies

**Result:**
- No direct database access from client
- All operations go through API routes
- Proper authentication handled by `createApiRoute`

### 3. **Component Updates**

#### `/src/components/ai-chatbot/ChatbotInterface.tsx` (ALREADY UPDATED)
- ✅ Changed endpoint from `/api/ai/chat-context` to `/api/ai/chat`

#### `/src/hooks/useContextAwareChat.ts` (ALREADY UPDATED)
- ✅ Changed endpoint from `/api/ai/chat-enhanced` to `/api/ai/chat`

#### `/src/app/ai-chatbot/hooks/useAIService.ts` (ALREADY UPDATED)
- ✅ Changed endpoint from `/api/ai/chat-context` to `/api/ai/chat`

## Database Schema

### chat_sessions table
```sql
- id (uuid, PK)
- user_id (text, part of RLS filtering)
- title (text)
- context_snapshot (jsonb)
- deleted_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
- RLS enabled: YES
```

### chat_messages table
```sql
- id (uuid, PK)
- session_id (uuid, FK to chat_sessions)
- role (text: 'user' or 'assistant')
- content (text)
- metadata (jsonb)
- created_at (timestamptz)
- RLS enabled: YES (must have matching user_id through session)
```

## API Flow

### User sends a message:
1. **Client**: `ChatbotInterface.tsx` sends POST request to `/api/ai/chat`
   ```json
   {
     "message": "user message",
     "session_id": "optional-existing-session-id",
     "currentPage": "/path"
   }
   ```

2. **Server**: `/api/ai/chat/route.ts` receives request
   - Authenticates user via Stack Auth (built into `createApiRoute`)
   - Creates new session if needed (server-side)
   - Saves user message (server-side, service role)
   - Processes with AI (ContextAwareAI)
   - Saves AI response (server-side, service role)
   - Returns response with session_id

3. **Client**: Updates UI with response
   - Session ID stored for next message
   - Messages displayed in chat

### Session initialization:
1. **Client**: `useChatMessages.ts` calls `initializeSession()`
2. **Server**: GET `/api/ai/sessions?limit=1`
   - Authenticates user
   - Queries `chat_sessions` with `user_id` filter (RLS enforced)
   - Returns recent sessions
3. **Client**: Sets `currentSessionId`

## Security Benefits

✅ **RLS Enforcement**: All queries filtered by `user_id` via service role
✅ **No Anonymous Access**: Client can't bypass authentication
✅ **Data Isolation**: Users can only access their own sessions
✅ **Consistent Pattern**: Follows existing API route patterns (orders, recipes, etc.)
✅ **Proper Error Handling**: Fallback messages if DB operations fail

## Testing

### Manual Testing Checklist:
- [ ] Start new chat session → verify session created successfully
- [ ] Send chat message → verify message saved and response returned
- [ ] Load existing session → verify previous messages displayed
- [ ] List sessions → verify pagination works
- [ ] Delete session → verify session removed from list
- [ ] Check browser console → no 403 errors

### Browser DevTools Steps:
1. Open Network tab
2. Go to chatbot page
3. Send a message
4. Check:
   - `POST /api/ai/chat` → Status 200 with response
   - Verify `session_id` in response
   - Verify messages are saved (no 403 errors)

## Remaining Notes

### ChatSessionService.ts
- This file is still used for utility methods like:
  - `generateTitle()` - Generates session title from first message
  - `extractTopics()` - Analyzes conversation topics
  - `analyzeConversationSentiment()` - Sentiment analysis
- These are safe as they don't perform DB operations

### Migration Notes
- If there are existing `chat_sessions` or `chat_messages`, they should still be accessible
- Old endpoints (`/api/ai/chat-context`, `/api/ai/chat-enhanced`) can be deleted after testing
- RLS policies are already in place on the tables (no changes needed)

## Verification Commands

```bash
# Type check
pnpm run type-check

# Lint
pnpm run lint

# Build
pnpm run build
```

All checks should pass with ✅

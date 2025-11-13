# Authentication Error Handling

## Overview

This document explains how the application handles authentication errors, particularly the "Invalid Refresh Token: Refresh Token Not Found" error.

## Problem

The error occurs when:
- User's refresh token has expired or been invalidated
- Token was cleared from cookies/localStorage
- There's a mismatch between client and server session state
- User has been inactive for an extended period

## Solution

The application now has comprehensive error handling for authentication issues:

### 1. Global Error Interceptor

**File**: `src/lib/auth/auth-interceptor.ts`

- Catches unhandled promise rejections and global errors
- Automatically detects refresh token errors
- Clears session and redirects to login when needed

### 2. Enhanced AuthProvider

**File**: `src/providers/AuthProvider.tsx`

- Detects refresh token errors during session initialization
- Handles errors in `onAuthStateChange` listener
- Gracefully handles session refresh failures
- Automatically clears invalid sessions

### 3. Session Handler

**File**: `src/lib/auth/session-handler.ts`

- Clears all Supabase-related data from localStorage
- Redirects user to login page with appropriate message
- Includes helper functions to detect refresh token errors

### 4. Auth Error Detection

**File**: `src/lib/auth-errors.ts`

- Comprehensive error message mapping
- Detects various auth error patterns
- Provides user-friendly Indonesian error messages
- Includes `requiresSessionClear()` function for refresh token errors

### 5. Custom Hook

**File**: `src/hooks/useAuthErrorHandler.ts`

Usage in components:

```tsx
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler'

function MyComponent() {
  const { handleError } = useAuthErrorHandler()

  const handleOperation = async () => {
    try {
      await someAuthOperation()
    } catch (error) {
      const { handled, message, requiresLogin } = handleError(error, 'MyComponent')
      
      if (!handled) {
        // Show error message to user
        toast.error(message)
      }
      // If requiresLogin is true, user will be redirected automatically
    }
  }
}
```

## Error Flow

1. **Error Occurs**: Supabase throws "Invalid Refresh Token" error
2. **Detection**: Error is caught by AuthProvider, interceptor, or custom hook
3. **Validation**: `requiresSessionClear()` checks if it's a refresh token error
4. **Cleanup**: `handleSessionExpired()` clears localStorage and cookies
5. **Redirect**: User is redirected to `/auth/login?session_expired=true`
6. **User Action**: User logs in again with fresh credentials

## Configuration

### Supabase Client Settings

**File**: `src/utils/supabase/client.ts`

```typescript
{
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // PKCE flow for better security
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  }
}
```

### Middleware Session Refresh

**File**: `middleware.ts`

The middleware automatically refreshes sessions on each request using `updateSession()` from `src/utils/supabase/middleware.ts`.

## Testing

To test the error handling:

1. **Manually expire token**:
   - Open browser DevTools
   - Go to Application > Local Storage
   - Find Supabase auth token
   - Modify or delete it
   - Refresh the page

2. **Wait for natural expiration**:
   - Leave the app open for extended period
   - Try to perform an authenticated action
   - Should automatically redirect to login

3. **Check logs**:
   - Open browser console
   - Look for "Session expired, clearing local data" message
   - Verify redirect to login page

## Error Messages

All error messages are in Indonesian (Bahasa Indonesia):

- `"Sesi Anda telah berakhir. Silakan login kembali."` - Session expired
- `"Token refresh tidak ditemukan."` - Refresh token not found
- `"Token refresh tidak valid."` - Invalid refresh token

## Best Practices

1. **Always use the auth hook**: Use `useAuth()` from AuthProvider for auth state
2. **Handle errors gracefully**: Use `useAuthErrorHandler()` in components
3. **Don't suppress errors**: Let the interceptor handle auth errors automatically
4. **Check session validity**: Use `isAuthenticated` from `useAuth()` before operations
5. **Provide feedback**: Show user-friendly messages when errors occur

## Related Files

- `src/providers/AuthProvider.tsx` - Main auth context
- `src/providers/SupabaseProvider.tsx` - Supabase client provider
- `src/lib/auth/auth-interceptor.ts` - Global error interceptor
- `src/lib/auth/session-handler.ts` - Session cleanup utilities
- `src/lib/auth-errors.ts` - Error detection and messages
- `src/hooks/useAuthErrorHandler.ts` - Error handling hook
- `src/utils/supabase/client.ts` - Client configuration
- `src/utils/supabase/middleware.ts` - Session refresh middleware
- `middleware.ts` - Next.js middleware with auth checks

## Troubleshooting

### Error still occurs after fix

1. Clear browser cache and localStorage
2. Log out and log in again
3. Check if Supabase project is accessible
4. Verify environment variables are correct

### User gets logged out too frequently

1. Check Supabase project settings for token expiration
2. Verify `autoRefreshToken: true` in client config
3. Check middleware is properly refreshing sessions
4. Review server logs for auth errors

### Redirect loop

1. Check middleware protected routes configuration
2. Verify login page is not in protected routes
3. Check for multiple auth state listeners
4. Review session storage configuration

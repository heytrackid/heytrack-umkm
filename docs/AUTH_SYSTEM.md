# Authentication System

## Overview

HeyTrack uses Supabase Auth with the standard `@supabase/ssr` package for authentication. The system has been reset to a clean, simple implementation following Supabase best practices.

## Architecture

### Client-Side (`src/utils/supabase/client.ts`)
- Uses `createBrowserClient` from `@supabase/ssr`
- Handles cookie-based sessions automatically
- Used in Client Components

### Server-Side (`src/utils/supabase/server.ts`)
- Uses `createServerClient` from `@supabase/ssr`
- Handles cookies via Next.js `cookies()` API
- Used in Server Components and API Routes

### Middleware (`src/utils/supabase/middleware.ts`)
- Updates session on every request
- Refreshes auth cookies automatically
- Returns user object for route protection

## API Routes

### Login: `POST /api/auth/login`
```typescript
// Request
{
  email: string
  password: string
}

// Response (Success)
{
  success: true,
  user: User
}

// Response (Error)
{
  error: string
}
```

### Register: `POST /api/auth/register`
```typescript
// Request
{
  email: string
  password: string
  fullName: string
}

// Response (Success)
{
  success: true,
  user: User,
  needsEmailConfirmation: boolean
}

// Response (Error)
{
  error: string
}
```

### Logout: `POST /api/auth/logout`
```typescript
// Response
{
  success: true
}
```

## Pages

- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/logout` - Logout handler (redirects to login)
- `/auth/callback` - OAuth callback handler

## Using Auth in Components

### Client Components

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>

  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### Server Components

```tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <div>Welcome {user.email}</div>
}
```

### API Routes

```tsx
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ user })
}
```

## Route Protection

Protected routes are defined in `middleware.ts`:

```typescript
const PROTECTED_ROUTES = new Set([
  '/dashboard',
  '/orders',
  '/ingredients',
  '/recipes',
  // ... etc
])
```

The middleware automatically:
1. Refreshes the session
2. Checks if user is authenticated
3. Redirects to `/auth/login` if not authenticated
4. Redirects to `/dashboard` if authenticated user visits auth pages

## Session Management

- Sessions are stored in HTTP-only cookies
- Cookies are automatically refreshed by middleware
- Session expires after inactivity (configured in Supabase)
- No manual session management needed

## Logout Flow

1. User clicks logout button
2. Redirects to `/auth/logout`
3. Calls `POST /api/auth/logout`
4. Supabase clears session cookies
5. Redirects to `/auth/login`

## Best Practices

1. **Always use the helper functions**
   - Client: `createClient()` from `@/utils/supabase/client`
   - Server: `await createClient()` from `@/utils/supabase/server`

2. **Never store tokens manually**
   - Let Supabase handle cookie management

3. **Use middleware for route protection**
   - Don't duplicate auth checks in every page

4. **Handle loading states**
   - Auth state takes time to load on client

5. **Use Server Components when possible**
   - Better performance and security

## Troubleshooting

### "User not found" errors
- Check if cookies are being set correctly
- Verify environment variables are set
- Check browser console for cookie errors

### Infinite redirects
- Check middleware logic
- Verify protected routes list
- Check if session is being refreshed

### Session not persisting
- Verify cookies are HTTP-only and secure (in production)
- Check cookie domain settings
- Verify middleware is running on all routes

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

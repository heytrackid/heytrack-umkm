# Stack Auth Integration Guide

## ✅ Setup Complete

Stack Auth telah berhasil diintegrasikan ke HeyTrack! Berikut adalah ringkasan implementasi dan cara penggunaannya.

## 📁 File Structure

```
src/
├── stack/
│   ├── client.tsx          # Stack client app config
│   └── server.tsx          # Stack server app config
├── lib/
│   └── stack-auth.ts       # Server-side auth helpers
├── hooks/
│   └── useAuth.ts          # Client-side auth hook
├── app/
│   ├── layout.tsx          # Root layout with StackProvider
│   └── handler/
│       └── [...stack]/
│           └── page.tsx    # Stack Auth handler
└── middleware.ts           # Middleware with Stack Auth
```

## 🔧 Configuration

### Environment Variables

Pastikan `.env.local` memiliki Stack Auth credentials:

```env
# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SECRET_SERVER_KEY=your_secret_key
```

### Stack Client Config (`src/stack/client.tsx`)

```tsx
import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
});
```

### Stack Server Config (`src/stack/server.tsx`)

```tsx
import "server-only";
import { StackServerApp } from "@stackframe/stack";
import { stackClientApp } from "./client";

export const stackServerApp = new StackServerApp({
  inheritsFrom: stackClientApp,
});
```

## 📖 Usage

### Client-Side (React Components)

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <p>User ID: {user?.id}</p>
    </div>
  )
}
```

### Server-Side (API Routes)

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getCurrentUser, getUserId } from '@/lib/stack-auth'

// Option 1: Require authentication (throws if not authenticated)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    
    // User is guaranteed to be authenticated here
    return NextResponse.json({
      userId: user.id,
      email: user.email
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// Option 2: Optional authentication
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  // Continue with authenticated user
  const data = await req.json()
  // ... your logic
}

// Option 3: Just get user ID
export async function PUT(req: NextRequest) {
  const userId = await getUserId()
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Use userId for database queries
}
```

### Server Components

```tsx
import { getCurrentUser } from '@/lib/stack-auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  )
}
```

## 🔐 Auth Helpers

### Client-Side Hook: `useAuth()`

```typescript
interface UseAuthReturn {
  user: User | null          // Current user object
  isLoading: boolean         // Loading state
  isAuthenticated: boolean   // Authentication status
}

interface User {
  id: string                 // User ID
  email: string | null       // User email
}
```

### Server-Side Functions

| Function | Description | Returns | Throws |
|----------|-------------|---------|--------|
| `getCurrentUser()` | Get current user | `User \| null` | No |
| `getUserId()` | Get user ID only | `string \| null` | No |
| `requireAuth()` | Require authentication | `User` | Yes (if not authenticated) |
| `isAuthenticated()` | Check auth status | `boolean` | No |

## 🛣️ Auth Routes

Stack Auth menyediakan built-in routes di `/handler/`:

- `/handler/sign-in` - Sign in page
- `/handler/sign-up` - Sign up page
- `/handler/forgot-password` - Password reset
- `/handler/account-settings` - User account settings

## 🔄 Migration dari Supabase Auth

### Before (Supabase Auth)

```tsx
// ❌ Old way
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### After (Stack Auth)

```tsx
// ✅ New way
const user = await requireAuth()
// User is guaranteed to exist here
```

## 🎨 UI Components

Stack Auth menyediakan pre-built UI components:

```tsx
import { UserButton, SignInButton } from '@stackframe/stack'

export function Header() {
  return (
    <header>
      <SignInButton />
      <UserButton />
    </header>
  )
}
```

## 🔒 Protected Routes

Middleware sudah dikonfigurasi untuk handle authentication. Untuk protect specific routes:

```tsx
// src/app/protected-page/page.tsx
import { getCurrentUser } from '@/lib/stack-auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }
  
  return <div>Protected content</div>
}
```

## 📊 Database Integration with RLS

### Automatic RLS Integration

Supabase clients sekarang **otomatis** inject JWT token dari Stack Auth untuk Row Level Security (RLS). Kamu tidak perlu manual pass `user_id` ke queries!

### How It Works

1. **JWT Generation**: Server action `getSupabaseJwt()` mints JWT dengan Stack Auth user ID
2. **Auto Injection**: Supabase client automatically injects JWT ke setiap request
3. **RLS Enforcement**: Supabase RLS policies menggunakan `auth.uid()` dari JWT

### Example: RLS Policies

```sql
-- Enable RLS on table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own orders
CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own orders
CREATE POLICY "Users can insert own orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own orders
CREATE POLICY "Users can update own orders" 
ON orders FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own orders
CREATE POLICY "Users can delete own orders" 
ON orders FOR DELETE 
USING (auth.uid() = user_id);
```

### Usage in Code

```tsx
// ✅ RLS automatically enforced - no need to add .eq('user_id', userId)
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  // RLS policy automatically filters by auth.uid()

// ✅ Insert with user_id automatically from JWT
const { data: newOrder } = await supabase
  .from('orders')
  .insert({
    customer_id: customerId,
    total: 100000,
    // user_id will be set by RLS policy or trigger
  })
```

### Migration from Manual user_id Filtering

```tsx
// ❌ Before (manual filtering - no longer needed)
const userId = await getUserId()
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId) // Redundant with RLS

// ✅ After (RLS handles it automatically)
const { data } = await supabase
  .from('orders')
  .select('*')
  // RLS policy filters by auth.uid() automatically
```

### Setting user_id on Insert

You have two options:

**Option 1: Database Trigger (Recommended)**
```sql
-- Create function to set user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_user_id();
```

**Option 2: Manual in Code**
```tsx
const userId = await getUserId()
const { data } = await supabase
  .from('orders')
  .insert({
    user_id: userId, // Explicitly set
    customer_id: customerId,
    total: 100000
  })
```

## 🚀 Next Steps

1. **Update API Routes**: Replace remaining Supabase auth checks dengan Stack Auth helpers
2. **Update Database**: Pastikan `user_id` columns compatible dengan Stack Auth user IDs
3. **Test Authentication**: Test sign in/sign up flows
4. **Customize UI**: Customize Stack Auth UI sesuai brand HeyTrack

## 📚 Resources

- [Stack Auth Documentation](https://docs.stack-auth.com/)
- [Stack Auth GitHub](https://github.com/stack-auth/stack)
- [Next.js Integration Guide](https://docs.stack-auth.com/getting-started/setup/next)

## ⚠️ Important Notes

- Stack Auth menggunakan cookies untuk session management
- User IDs dari Stack Auth berbeda dengan Supabase Auth user IDs
- Middleware sudah configured untuk skip `/handler/*` routes
- CSP headers sudah configured untuk Stack Auth

## 🐛 Troubleshooting

### Issue: "User is null"
**Solution**: Pastikan user sudah sign in via `/handler/sign-in`

### Issue: "Unauthorized in API routes"
**Solution**: Check cookies are being sent with requests

### Issue: "Middleware redirect loop"
**Solution**: Verify `/handler/*` routes are excluded in middleware config

### Issue: "CSP violations"
**Solution**: Stack Auth domains sudah included in CSP, check browser console for specific violations


## 🔐 Supabase RLS Setup

### Required Environment Variable

Add to `.env.local`:
```env
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase_dashboard
```

Find it in: Supabase Dashboard → Project Settings → API → JWT Secret

### JWT Token Structure

The JWT token includes:
```json
{
  "sub": "stack_auth_user_id",
  "role": "authenticated",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Testing RLS Policies

```tsx
// Test as authenticated user
const supabase = createClient()
const { data } = await supabase.from('orders').select('*')
// Should only return orders where user_id = auth.uid()

// Test as anonymous (no JWT)
// RLS will block access if policy requires authentication
```

## 🔄 Migration Checklist

- [ ] Add `SUPABASE_JWT_SECRET` to `.env.local`
- [ ] Update Supabase client imports (already done)
- [ ] Enable RLS on all tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- [ ] Create RLS policies using `auth.uid()`
- [ ] Remove manual `.eq('user_id', userId)` filters (optional - RLS handles it)
- [ ] Add database triggers to auto-set `user_id` on INSERT (optional)
- [ ] Test with authenticated and anonymous users
- [ ] Update existing data: Set `user_id` for existing rows if needed

## 📝 Example: Complete Table Setup

```sql
-- 1. Create table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view own recipes" 
ON recipes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" 
ON recipes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" 
ON recipes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" 
ON recipes FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create trigger to auto-set user_id
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON recipes
FOR EACH ROW
EXECUTE FUNCTION set_user_id();
```

## 🎯 Benefits of RLS Integration

1. **Security**: Database-level access control, can't be bypassed
2. **Simplicity**: No need to manually filter by `user_id` in every query
3. **Consistency**: All queries automatically filtered by user
4. **Performance**: Database-level filtering is faster than application-level
5. **Multi-tenancy**: Perfect for SaaS applications with multiple users

## 🐛 Troubleshooting RLS

### Issue: "No rows returned"
**Cause**: RLS policy is blocking access
**Solution**: 
1. Check if JWT is being sent: `console.log(await getSupabaseJwt())`
2. Verify RLS policy: `SELECT * FROM pg_policies WHERE tablename = 'your_table'`
3. Check `user_id` in database matches Stack Auth user ID

### Issue: "JWT expired"
**Cause**: Token expired (1 hour lifetime)
**Solution**: Token is automatically refreshed on each request

### Issue: "Permission denied"
**Cause**: Missing RLS policy or incorrect policy
**Solution**: 
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON your_table TO authenticated;
```

### Issue: "auth.uid() returns null"
**Cause**: JWT not being sent or invalid
**Solution**: 
1. Verify `SUPABASE_JWT_SECRET` is correct
2. Check user is authenticated: `const user = await stackServerApp.getUser()`
3. Test JWT: Decode at jwt.io to verify structure

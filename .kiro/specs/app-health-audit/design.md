# Design Document

## Overview

This design document outlines the comprehensive audit and fixes for the HeyTrack UMKM application's authentication system and core features. The solution ensures reliable session management, proper auth integration across all features, consistent error handling, and a maintainable codebase.

The design focuses on:
1. **Session Management**: Reliable auth state across client and server components
2. **Protected Routes**: Proper middleware enforcement with clear redirects
3. **API Security**: Consistent auth validation in all API endpoints
4. **Feature Integration**: Auth-aware CRUD operations for all core features
5. **Error Handling**: User-friendly messages with proper logging
6. **Code Consistency**: Standardized patterns across the application

## Architecture

### Auth Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Authentication                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware Layer                          │
│  - Session validation                                        │
│  - Route protection                                          │
│  - Token refresh                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────┐     ┌───────────────────────┐
│   Client Components   │     │    Server Components  │
│  - useAuth hook       │     │  - Server actions     │
│  - Auth context       │     │  - API routes         │
│  - Session state      │     │  - SSR pages          │
└───────────────────────┘     └───────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Client                           │
│  - Auth management                                           │
│  - Session storage                                           │
│  - Token refresh                                             │
│  - RLS enforcement                                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App Layout
├── Auth Provider (Session Context)
│   ├── Protected Routes
│   │   ├── Dashboard
│   │   ├── Orders
│   │   ├── Ingredients
│   │   ├── Recipes (Resep)
│   │   ├── HPP Tracking
│   │   ├── Customers
│   │   ├── Cash Flow
│   │   ├── Profit
│   │   ├── Reports
│   │   └── Settings
│   └── Public Routes
│       ├── Login
│       ├── Register
│       ├── Reset Password
│       └── Confirm Email
└── API Routes (Server-side Auth)
    ├── /api/orders
    ├── /api/ingredients
    ├── /api/recipes
    ├── /api/hpp
    ├── /api/customers
    └── /api/reports
```

## Components and Interfaces

### 1. Auth Utilities

#### Client-side Auth (`src/utils/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Current Status**: ✅ Already implemented correctly

#### Server-side Auth (`src/utils/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors from Server Components
          }
        },
      },
    }
  )
}
```

**Current Status**: ✅ Already implemented correctly

#### Middleware Auth (`src/utils/supabase/middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}
```

**Current Status**: ✅ Already implemented correctly

### 2. Auth Hook Enhancement

#### Enhanced useAuth Hook
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          })
          return
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('User error:', userError)
        }

        setAuthState({
          user: user || null,
          session: session || null,
          isLoading: false,
          isAuthenticated: !!user,
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChanged(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        setAuthState({
          user: session?.user || null,
          session: session || null,
          isLoading: false,
          isAuthenticated: !!session?.user,
        })

        // Refresh router on auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh()
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    ...authState,
    signOut,
  }
}
```

**Changes Needed**:
- ✅ Add error handling for session/user fetch
- ✅ Add router refresh on auth state changes
- ✅ Add proper error logging
- ✅ Add redirect to login on sign out

### 3. Middleware Enhancement

**Current Implementation Analysis**:
- ✅ Session update is working
- ✅ Protected routes are defined
- ✅ Redirects are implemented
- ⚠️ Need to add session expiry handling
- ⚠️ Need to add better error logging

**Enhanced Middleware**:
```typescript
export async function middleware(request: NextRequest) {
  try {
    // Update session
    let response = await updateSession(request)

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Get user with error handling
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Middleware auth error:', error)
    }

    const protectedRoutes = [
      '/dashboard',
      '/orders',
      '/ingredients',
      '/hpp',
      '/resep',
      '/customers',
      '/cash-flow',
      '/profit',
      '/settings',
      '/ai-chatbot',
      '/categories',
      '/operational-costs',
      '/reports',
    ]

    const isProtectedRoute = protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    )

    // Protect authenticated routes
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    if (
      (request.nextUrl.pathname.startsWith('/auth/login') ||
        request.nextUrl.pathname.startsWith('/auth/register')) &&
      user
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Redirect root based on auth status
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = user ? '/dashboard' : '/auth/login'
      return NextResponse.redirect(url)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow request to proceed
    return NextResponse.next()
  }
}
```

**Changes Needed**:
- ✅ Add try-catch for error handling
- ✅ Add redirectTo parameter for login redirects
- ✅ Add error logging

### 4. API Route Auth Pattern

**Standard Pattern for All API Routes**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()
    
    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Perform database operations
    // RLS policies will automatically filter by user_id
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', user.id) // Explicit filter (RLS also applies)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Current Issues**:
- ❌ `/api/orders/route.ts` uses `createServerSupabaseAdmin()` (bypasses RLS)
- ❌ `/api/ingredients/route.ts` uses `createServerSupabaseAdmin()` (bypasses RLS)
- ❌ No auth validation in API routes
- ❌ No user_id filtering

**Fix Required**: Replace all `createServerSupabaseAdmin()` with proper auth validation

### 5. Database Schema Requirements

**User ID Column**: All user-specific tables must have `user_id` column

**Tables to Audit**:
- ✅ `orders` - needs `user_id`
- ✅ `order_items` - inherits from orders
- ✅ `bahan_baku` (ingredients) - needs `user_id`
- ✅ `recipes` - needs `user_id`
- ✅ `recipe_ingredients` - inherits from recipes
- ✅ `customers` - needs `user_id`
- ✅ `expenses` (financial_records) - needs `user_id`
- ✅ `hpp_snapshots` - needs `user_id`
- ✅ `productions` - needs `user_id`

**Migration Required**:
```sql
-- Add user_id to tables if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE bahan_baku ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE hpp_snapshots ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE productions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bahan_baku_user_id ON bahan_baku(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_user_id ON hpp_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_productions_user_id ON productions(user_id);

-- Update RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bahan_baku ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for each table
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- Repeat for all tables...
```

## Data Models

### Auth State Model
```typescript
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
  created_at: string
}

interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}
```

### API Response Models
```typescript
interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

interface AuthError {
  error: string
  code?: string
  details?: string
}
```

## Error Handling

### Client-side Error Handling
```typescript
// In components
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    if (response.status === 401) {
      // Session expired
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
      router.push('/auth/login')
      return
    }
    throw new Error('Request failed')
  }
  const data = await response.json()
  // Handle success
} catch (error) {
  console.error('Error:', error)
  toast.error('Terjadi kesalahan. Silakan coba lagi.')
}
```

### Server-side Error Handling
```typescript
// In API routes
try {
  // Validate auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    console.error('Auth error:', authError)
    return NextResponse.json(
      { error: 'Authentication failed', code: 'AUTH_ERROR' },
      { status: 401 }
    )
  }
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'NO_USER' },
      { status: 401 }
    )
  }
  
  // Perform operations
  
} catch (error) {
  console.error('API error:', error)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

### Error Messages (Indonesian)
```typescript
const ERROR_MESSAGES = {
  AUTH_ERROR: 'Gagal memverifikasi autentikasi',
  NO_USER: 'Anda harus login untuk mengakses fitur ini',
  SESSION_EXPIRED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  INVALID_CREDENTIALS: 'Email atau password salah',
  EMAIL_NOT_CONFIRMED: 'Silakan konfirmasi email Anda terlebih dahulu',
  WEAK_PASSWORD: 'Password terlalu lemah. Gunakan minimal 8 karakter.',
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  INTERNAL_ERROR: 'Terjadi kesalahan. Silakan coba lagi.',
}
```

## Testing Strategy

### 1. Auth Flow Testing
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Registration with valid data
- ✅ Registration with existing email
- ✅ Password reset flow
- ✅ Email confirmation flow
- ✅ Session persistence across page refreshes
- ✅ Session expiry and refresh
- ✅ Sign out functionality

### 2. Protected Routes Testing
- ✅ Access protected route without auth → redirect to login
- ✅ Access protected route with auth → allow access
- ✅ Access login page with auth → redirect to dashboard
- ✅ Access root path with auth → redirect to dashboard
- ✅ Access root path without auth → redirect to login

### 3. API Routes Testing
- ✅ Call API without auth → 401 response
- ✅ Call API with valid auth → success response
- ✅ Call API with expired session → 401 response
- ✅ Verify RLS policies filter data by user_id

### 4. Feature Integration Testing
- ✅ Create order → verify user_id is set
- ✅ View orders → verify only user's orders shown
- ✅ Create ingredient → verify user_id is set
- ✅ View ingredients → verify only user's ingredients shown
- ✅ Create recipe → verify user_id is set
- ✅ View recipes → verify only user's recipes shown
- ✅ HPP tracking → verify user-specific data
- ✅ Financial reports → verify user-specific data

### 5. Error Handling Testing
- ✅ Network error during auth → show error message
- ✅ Session expired during operation → redirect to login
- ✅ Invalid data submission → show validation errors
- ✅ Database error → show user-friendly message

## Implementation Checklist

### Phase 1: Database & RLS Setup
1. ✅ Audit all tables for user_id column
2. ✅ Create migration to add user_id where missing
3. ✅ Create indexes for user_id columns
4. ✅ Enable RLS on all user-specific tables
5. ✅ Create RLS policies for SELECT, INSERT, UPDATE, DELETE

### Phase 2: Auth Utilities
1. ✅ Enhance useAuth hook with error handling
2. ✅ Add router refresh on auth state changes
3. ✅ Enhance middleware with error handling
4. ✅ Add redirectTo parameter for login redirects

### Phase 3: API Routes
1. ✅ Replace createServerSupabaseAdmin with createClient
2. ✅ Add auth validation to all API routes
3. ✅ Add user_id filtering to database queries
4. ✅ Add consistent error responses
5. ✅ Test RLS policies

### Phase 4: Feature Integration
1. ✅ Update Orders CRUD to use auth
2. ✅ Update Ingredients CRUD to use auth
3. ✅ Update Recipes CRUD to use auth
4. ✅ Update HPP tracking to use auth
5. ✅ Update Customers CRUD to use auth
6. ✅ Update Financial records to use auth

### Phase 5: Testing & Validation
1. ✅ Test auth flows
2. ✅ Test protected routes
3. ✅ Test API endpoints
4. ✅ Test feature integration
5. ✅ Test error handling
6. ✅ Test mobile responsiveness

### Phase 6: Documentation
1. ✅ Document auth patterns
2. ✅ Document API auth requirements
3. ✅ Document error handling
4. ✅ Create developer guide

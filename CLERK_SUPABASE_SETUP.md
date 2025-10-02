# Clerk + Supabase Third-Party Auth Integration

This guide explains how to set up Clerk as a third-party authentication provider with Supabase for the HeyTrack bakery management system.

## 🎯 Overview

This integration allows:
- Clerk to handle all user authentication and management
- Supabase to use Clerk session tokens for database access
- Row Level Security (RLS) policies based on Clerk user claims
- Seamless user experience with enterprise-grade auth

## 🔧 Setup Steps

### 1. Configure Clerk Instance for Supabase

Visit [Clerk's Connect with Supabase page](https://dashboard.clerk.com/setup/supabase) to automatically configure your Clerk instance.

Or manually configure:
1. Go to your Clerk Dashboard
2. Navigate to "Sessions" → "Customize session token"
3. Add the following custom claim:
```json
{
  "role": "authenticated"
}
```

### 2. Configure Supabase Project

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Authentication → Third-party Auth
3. Add a new Clerk integration:
   - **Provider**: Clerk
   - **Issuer URL**: `https://your-clerk-domain.clerk.accounts.dev`
   - **JWKS URL**: Auto-detected from issuer

### 3. Environment Variables

The following environment variables are already configured in `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Clerk-Supabase Integration
SUPABASE_THIRD_PARTY_AUTH_ENABLED=true
CLERK_ISSUER_URL=https://your-clerk-domain.clerk.accounts.dev
```

### 4. Local Development (Optional)

For local development with Supabase CLI, add to `supabase/config.toml`:

```toml
[auth.third_party.clerk]
enabled = true
domain = "your-clerk-domain.clerk.accounts.dev"
```

## 🛠️ Implementation Details

### Supabase Client Integration

The app uses a custom Supabase client that automatically includes Clerk session tokens:

```typescript
// src/hooks/useSupabaseClient.ts
export function useSupabaseClient() {
  const { session } = useSession()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await session?.getToken()
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
      },
    }
  )
}
```

### User Management

The app provides a unified user interface through the `useUser` hook:

```typescript
// src/hooks/useUser.ts
export function useUser() {
  const { user: clerkUser, isSignedIn } = useClerkUser()
  // Returns unified user object with Clerk data
}
```

### Protected Routes

All routes except `/`, `/sign-in`, and `/sign-up` are automatically protected by Clerk middleware.

## 🔐 Row Level Security (RLS) Policies

You can create RLS policies using Clerk JWT claims:

```sql
-- Example: Only allow authenticated users
CREATE POLICY "Only authenticated users can access"
ON your_table
TO authenticated
USING (true);

-- Example: User-specific data access
CREATE POLICY "Users can only access their own data"
ON user_data
TO authenticated
USING (user_id = (auth.jwt()->>'sub'));
```

## 🧪 Testing the Integration

1. Start the development server: `pnpm dev`
2. Visit `http://localhost:3002/sign-in`
3. Create a new account or sign in
4. Access protected routes like `/dashboard`
5. Check that Supabase queries work with Clerk authentication

## 🚀 Deployment

When deploying to production:

1. Update environment variables in your hosting platform
2. Configure Clerk production instance
3. Update Supabase third-party auth settings for production
4. Test the complete authentication flow

## 🔧 Troubleshooting

### Common Issues:

1. **JWT Verification Failed**
   - Check that Clerk issuer URL is correct
   - Ensure Supabase third-party auth is properly configured

2. **Session Token Not Found**
   - Verify Clerk session is properly initialized
   - Check that `useSession` hook is used within ClerkProvider

3. **RLS Policy Errors**
   - Ensure policies are correctly configured for `authenticated` role
   - Check JWT claims are accessible in policies

### Debug Tools:

- Use Clerk's session inspector in development
- Check Supabase logs for authentication errors
- Verify JWT tokens at [jwt.io](https://jwt.io)

## 📚 Resources

- [Clerk + Supabase Integration Guide](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Clerk Session Tokens](https://clerk.com/docs/backend-requests/resources/session-tokens)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
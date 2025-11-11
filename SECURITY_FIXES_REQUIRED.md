# Security Fixes Required Before Production

## 🚨 CRITICAL (Must Fix)

### 1. Remove Development Bypass from Production Code

**Files to fix:**
- `src/utils/supabase/client.ts`
- `src/utils/supabase/server.ts`
- `src/utils/supabase/middleware.ts`
- `src/app/api/auth/login/route.ts`

**Current Issue:**
```typescript
const isDev = process.env.NODE_ENV === 'development'
if (isDev) {
  return mockUser // ❌ DANGEROUS
}
```

**Fix:**
```typescript
// Option 1: Remove all mock user code completely
// Option 2: Use separate environment variable
const ENABLE_DEV_BYPASS = process.env.ENABLE_DEV_BYPASS === 'true'
if (ENABLE_DEV_BYPASS && process.env.NODE_ENV === 'development') {
  // Mock user only if explicitly enabled
}
```

### 2. Secure Service Role Key

**Current Issue:**
- `.env` and `.env.local` contain service role key
- These files might be committed to git

**Fix:**
```bash
# 1. Remove .env and .env.local from git
git rm --cached .env .env.local

# 2. Add to .gitignore (already done, but verify)
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# 3. Rotate service role key in Supabase dashboard
# Go to: https://app.supabase.com/project/_/settings/api
# Generate new service role key

# 4. Update environment variables in Vercel
# Never commit the new key to git
```

### 3. Verify NODE_ENV in Production

**Add to deployment checklist:**
```bash
# Vercel automatically sets NODE_ENV=production
# But verify in your deployment settings:
# Settings > Environment Variables > NODE_ENV = production
```

## ⚠️ HIGH PRIORITY (Recommended)

### 4. Enable Leaked Password Protection

**Fix in Supabase Dashboard:**
1. Go to Authentication > Policies
2. Enable "Leaked Password Protection"
3. This checks passwords against HaveIBeenPwned.org

### 5. Add Session Security Enhancements

**Create new file: `src/lib/auth/session-security.ts`**
```typescript
import { createClient } from '@/utils/supabase/server'

export async function validateSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return { valid: false, session: null }
  }
  
  // Check if token is about to expire (within 5 minutes)
  const expiresAt = session.expires_at ?? 0
  const now = Math.floor(Date.now() / 1000)
  const shouldRefresh = expiresAt - now < 300 // 5 minutes
  
  if (shouldRefresh) {
    const { data: { session: newSession } } = await supabase.auth.refreshSession()
    return { valid: true, session: newSession }
  }
  
  return { valid: true, session }
}

export async function revokeAllSessions(userId: string) {
  const supabase = await createClient()
  // Sign out from all devices
  await supabase.auth.admin.signOut(userId, 'global')
}
```

### 6. Add Rate Limiting for Login

**Update `src/app/api/auth/login/route.ts`:**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Add rate limiting (5 attempts per 15 minutes)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
})

async function loginPOST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429 }
    )
  }
  
  // ... rest of login logic
}
```

## 📋 MEDIUM PRIORITY (Nice to Have)

### 7. Add Security Monitoring

**Create `src/lib/auth/security-monitor.ts`:**
```typescript
import { createServerLogger } from '@/lib/logger'

const logger = createServerLogger('SecurityMonitor')

export function logSecurityEvent(event: {
  type: 'login' | 'logout' | 'failed_login' | 'session_expired'
  userId?: string
  ip?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}) {
  logger.info({
    ...event,
    timestamp: new Date().toISOString(),
  }, `Security event: ${event.type}`)
}

export function logSuspiciousActivity(activity: {
  type: string
  userId?: string
  ip?: string
  reason: string
}) {
  logger.warn({
    ...activity,
    timestamp: new Date().toISOString(),
  }, `Suspicious activity detected: ${activity.type}`)
}
```

### 8. Add CSRF Protection

**Update middleware.ts:**
```typescript
import { generateToken, verifyToken } from '@/lib/csrf'

export async function middleware(request: NextRequest) {
  // Generate CSRF token for forms
  if (request.method === 'GET') {
    const response = NextResponse.next()
    const csrfToken = generateToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
    return response
  }
  
  // Verify CSRF token for mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.cookies.get('csrf-token')?.value
    const csrfHeader = request.headers.get('x-csrf-token')
    
    if (!csrfToken || !csrfHeader || !verifyToken(csrfToken, csrfHeader)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
  }
  
  // ... rest of middleware
}
```

### 9. Add Session Timeout Warning

**Create `src/hooks/useSessionTimeout.ts`:**
```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useSessionTimeout(warningMinutes = 5) {
  const [showWarning, setShowWarning] = useState(false)
  
  useEffect(() => {
    const checkSession = async () => {
      const supabase = await createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const expiresAt = session.expires_at ?? 0
        const now = Math.floor(Date.now() / 1000)
        const minutesLeft = (expiresAt - now) / 60
        
        if (minutesLeft < warningMinutes && minutesLeft > 0) {
          setShowWarning(true)
        }
      }
    }
    
    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [warningMinutes])
  
  return { showWarning }
}
```

## 🔒 Production Deployment Checklist

- [ ] Remove all development bypass code
- [ ] Rotate and secure service role key
- [ ] Verify NODE_ENV=production in deployment
- [ ] Enable leaked password protection in Supabase
- [ ] Add rate limiting for login endpoint
- [ ] Set up security monitoring/logging
- [ ] Test session expiry and refresh
- [ ] Test CORS configuration
- [ ] Test CSP headers
- [ ] Verify RLS policies in Supabase
- [ ] Test logout from all devices
- [ ] Add CSRF protection
- [ ] Add session timeout warnings
- [ ] Set up error alerting (Sentry)
- [ ] Document security incident response plan

## 📚 Additional Resources

- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

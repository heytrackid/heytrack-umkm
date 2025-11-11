# Development CAPTCHA Bypass

## Overview

Untuk mempermudah development, CAPTCHA (Turnstile) dapat di-bypass secara otomatis di environment development tanpa perlu konfigurasi site key.

## How It Works

### 1. Client-Side Bypass

**File**: `src/components/security/TurnstileWidget.tsx`

```typescript
// Jika NODE_ENV === 'development' dan tidak ada TURNSTILE_SITE_KEY
// Widget akan:
// 1. Render placeholder "Dev Mode: CAPTCHA Bypassed"
// 2. Auto-call onVerify() dengan token 'dev-bypass-token'
// 3. Skip rendering Turnstile widget
```

**Visual Indicator**:
```
┌─────────────────────────────────┐
│ 🔧 Dev Mode: CAPTCHA Bypassed   │
└─────────────────────────────────┘
```

### 2. Hook Bypass

**File**: `src/hooks/useTurnstile.ts`

```typescript
// Hook akan detect token 'dev-bypass-token'
// Dan skip API verification call
verifyToken('dev-bypass-token') // Returns true immediately
```

### 3. Server-Side (Optional)

Jika Anda ingin bypass di server juga, tambahkan di API route:

**File**: `src/app/api/verify-turnstile/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'
  const { token } = await request.json()
  
  // Development bypass
  if (isDev && token === 'dev-bypass-token') {
    return NextResponse.json({ success: true })
  }
  
  // Production verification
  // ...
}
```

## Configuration

### Development (Auto-Bypass)

**No configuration needed!** Just don't set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in `.env.local`:

```bash
# .env.local
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=  # Leave empty or comment out
```

### Production (Real CAPTCHA)

Set the site key in `.env.production`:

```bash
# .env.production
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-production-site-key
TURNSTILE_SECRET_KEY=your-secret-key
```

## Usage Example

### Login Page

```tsx
import { TurnstileWidget } from '@/components/security/TurnstileWidget'
import { useTurnstile } from '@/hooks/useTurnstile'

function LoginPage() {
  const { isVerified, handleVerify, verifyToken } = useTurnstile()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Verify CAPTCHA (auto-passes in dev)
    const verified = await verifyToken()
    if (!verified) {
      alert('CAPTCHA verification failed')
      return
    }
    
    // Proceed with login
    // ...
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      {/* CAPTCHA Widget - shows bypass indicator in dev */}
      <TurnstileWidget onVerify={handleVerify} />
      
      <button disabled={!isVerified}>Login</button>
    </form>
  )
}
```

## Benefits

### ✅ Development
- No need to configure Turnstile site key
- No API calls to Cloudflare
- Faster development workflow
- No rate limiting issues
- Visual indicator shows bypass is active

### ✅ Production
- Full CAPTCHA protection
- Real bot detection
- Cloudflare security features
- No bypass possible

## Security Notes

### ⚠️ Important

1. **Never use bypass in production**
   - Bypass only works when `NODE_ENV === 'development'`
   - Production builds automatically use real CAPTCHA

2. **Token validation**
   - Dev token: `'dev-bypass-token'`
   - Production tokens are validated by Cloudflare

3. **Environment detection**
   - Uses `process.env.NODE_ENV` (set by Next.js)
   - Cannot be overridden by client

## Testing

### Test Development Bypass

```bash
# 1. Remove Turnstile key from .env.local
rm .env.local  # or comment out TURNSTILE_SITE_KEY

# 2. Start dev server
pnpm run dev

# 3. Go to login page
# You should see: "🔧 Dev Mode: CAPTCHA Bypassed"

# 4. Login should work without solving CAPTCHA
```

### Test Production CAPTCHA

```bash
# 1. Set Turnstile keys in .env.local
echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-key" >> .env.local

# 2. Restart dev server
pnpm run dev

# 3. Go to login page
# You should see: Real Turnstile widget

# 4. Must solve CAPTCHA to login
```

## Troubleshooting

### Issue: Bypass not working

**Check:**
1. `NODE_ENV` is set to `'development'`
2. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is NOT set in `.env.local`
3. Dev server was restarted after env changes

### Issue: Still seeing real CAPTCHA in dev

**Solution:**
```bash
# Remove the site key
unset NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Or edit .env.local and comment out:
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=...

# Restart dev server
pnpm run dev
```

### Issue: Production bypass (SECURITY RISK!)

**This should NEVER happen because:**
1. Next.js sets `NODE_ENV=production` in production builds
2. Vercel/deployment platforms enforce this
3. Bypass code checks `NODE_ENV === 'development'`

**If it happens, check:**
- Build command uses `next build` (not custom)
- Deployment platform sets `NODE_ENV=production`
- No custom code overriding `NODE_ENV`

## Implementation Checklist

- [x] Client-side bypass in `TurnstileWidget`
- [x] Hook bypass in `useTurnstile`
- [x] Visual indicator for dev mode
- [x] Auto-verify with dummy token
- [x] Skip API calls in development
- [ ] Server-side bypass (optional)
- [x] Documentation
- [x] Security checks

## Related Files

- `src/components/security/TurnstileWidget.tsx` - Widget component
- `src/hooks/useTurnstile.ts` - CAPTCHA hook
- `src/app/api/verify-turnstile/route.ts` - Server verification (optional)
- `src/app/auth/login/page.tsx` - Usage example
- `.env.example` - Environment template

## References

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

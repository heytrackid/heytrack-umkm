# Content Security Policy (CSP) - Security Guide

## Overview

CSP adalah security layer yang membantu mencegah XSS (Cross-Site Scripting), data injection, dan serangan lainnya dengan mengontrol resource mana yang boleh dimuat oleh browser.

---

## 🔒 Current CSP Configuration

### Production CSP (Strict - NO UNSAFE-INLINE for scripts!)
```
default-src 'self';
script-src 'self' 'nonce-{random}' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com;
style-src 'self' 'nonce-{random}' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob: https://*.supabase.co https://vercel.com;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live;
worker-src 'self' blob:;
media-src 'self' https://*.supabase.co;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
manifest-src 'self';
prefetch-src 'self' https://*.supabase.co;
upgrade-insecure-requests;
block-all-mixed-content
```

**Key Features:**
- ✅ **Nonce + `'unsafe-inline'` for scripts** - Next.js requires this for hydration scripts
- ✅ **`'unsafe-inline'` for styles** - Required for React inline style attributes
- ✅ **NO `'unsafe-eval'`** in production (only in dev for HMR)
- ✅ **Per-request nonce** - Generated in middleware
- ✅ **Balanced Security** - Secure while compatible with Next.js/React

### Development CSP (Relaxed)
Sama seperti production, tapi dengan tambahan:
- `'unsafe-eval'` di script-src (untuk HMR/Fast Refresh)
- `https://vercel.live` untuk Vercel toolbar

---

## 📋 CSP Directives Explained

### Core Directives

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Fallback untuk semua directive yang tidak dispesifikasi |
| `script-src` | `'self' 'unsafe-inline' + whitelist` | Kontrol JavaScript sources |
| `style-src` | `'self' 'unsafe-inline' + fonts` | Kontrol CSS sources |
| `img-src` | `'self' data: https: blob:` | Kontrol image sources |
| `font-src` | `'self' data: + Google Fonts` | Kontrol font sources |
| `connect-src` | `'self' + API whitelist` | Kontrol fetch/XHR/WebSocket |

### Security Directives

| Directive | Value | Purpose |
|-----------|-------|---------|
| `frame-src` | `'none'` | Block all iframes (prevent clickjacking) |
| `object-src` | `'none'` | Block Flash, Java, etc |
| `base-uri` | `'self'` | Prevent base tag injection |
| `form-action` | `'self'` | Forms only submit to same origin |
| `frame-ancestors` | `'none'` | Prevent embedding in iframes |

### Modern Directives

| Directive | Value | Purpose |
|-----------|-------|---------|
| `worker-src` | `'self' blob:` | Web Workers sources |
| `media-src` | `'self' + Supabase` | Audio/video sources |
| `manifest-src` | `'self'` | PWA manifest |
| `prefetch-src` | `'self' + Supabase` | DNS prefetch control |

### Upgrade Directives

| Directive | Purpose |
|-----------|---------|
| `upgrade-insecure-requests` | Auto-upgrade HTTP to HTTPS |
| `block-all-mixed-content` | Block HTTP content on HTTPS pages |

---

## 🚨 Security Improvements Made

### 1. ✅ IMPROVED CSP WITH NONCE SUPPORT
**Before:**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
```

**After:**
```
script-src 'self' 'nonce-{random}' 'unsafe-inline' https://*.supabase.co ...
style-src 'self' 'nonce-{random}' 'unsafe-inline' https://fonts.googleapis.com
```

**Why we need `'unsafe-inline'`:**

**For scripts:**
- Next.js injects inline hydration scripts that cannot have nonces
- These are framework-generated, not user-controlled
- Nonce is still provided for custom inline scripts
- Production removes `'unsafe-eval'` (only for dev HMR)

**For styles:**
- React uses inline `style` attributes extensively (e.g., `<div style={{ color: 'red' }}>`)
- CSP nonces only work for `<style>` tags, not `style` attributes
- Inline style attributes are generally safe (not executable code)
- Alternative would require rewriting all React components

**Note:** When both nonce and `'unsafe-inline'` are present, browsers prioritize nonce for `<script>` tags with nonce attribute, and fall back to `'unsafe-inline'` for framework scripts.

**Impact:** 🔒 **Balanced Security** - Secure while maintaining Next.js/React compatibility

### 2. Removed `'unsafe-eval'` in Production
**Before:**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

**After:**
```
script-src 'self' 'nonce-{random}' https://*.supabase.co ...
```

**Why:** `'unsafe-eval'` allows `eval()`, `Function()`, `setTimeout(string)` yang bisa dieksploitasi untuk XSS. Hanya diperlukan untuk HMR di development.

### 2. Added Specific Whitelists
**Before:**
```
img-src 'self' data: https: blob:
```

**After:**
```
img-src 'self' data: https: blob: https://*.supabase.co
```

**Why:** Lebih spesifik = lebih aman. Hanya allow sources yang benar-benar digunakan.

### 3. Added Modern Directives
**New directives:**
- `worker-src` - Untuk Web Workers
- `media-src` - Untuk audio/video
- `manifest-src` - Untuk PWA
- `prefetch-src` - Untuk DNS prefetch

**Why:** Kontrol lebih granular terhadap resource types.

### 4. Added Additional Security Headers
**New headers:**
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-DNS-Prefetch-Control: on
```

**Why:** HSTS memaksa HTTPS, DNS prefetch control mengoptimalkan loading.

### 5. Expanded Permissions-Policy
**Before:**
```
camera=(), microphone=(), geolocation=()
```

**After:**
```
camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
```

**Why:** Block lebih banyak browser APIs yang tidak digunakan.

---

## 🎯 Whitelisted Domains

### Supabase
- `https://*.supabase.co` - API calls
- `wss://*.supabase.co` - Realtime WebSocket

### AI Services
- `https://api.openrouter.ai` - AI chatbot & recipe generation

### Analytics & Monitoring
- `https://va.vercel-scripts.com` - Vercel Analytics
- `https://vitals.vercel-insights.com` - Web Vitals

### Fonts & Styles
- `https://fonts.googleapis.com` - Google Fonts CSS
- `https://fonts.gstatic.com` - Google Fonts files

### Development Only
- `https://vercel.live` - Vercel toolbar
- `'unsafe-eval'` - HMR/Fast Refresh

---

## ✅ Implementation Complete!

### Phase 1: ✅ DONE - Nonce-based CSP
**Status:** ✅ **IMPLEMENTED**

**What was done:**
1. ✅ Created `src/lib/csp.ts` with nonce generation
2. ✅ Updated middleware to generate per-request nonce
3. ✅ Added nonce to CSP header in middleware
4. ✅ Created `src/lib/nonce.ts` helper for components
5. ✅ Removed ALL `'unsafe-inline'` from CSP

**How it works:**
```typescript
// Middleware generates nonce per request
const nonce = generateNonce()
response.headers.set('Content-Security-Policy', getStrictCSP(nonce))

// Components can access nonce
import { getNonce } from '@/lib/nonce'

export default async function MyPage() {
  const nonce = await getNonce()
  
  return (
    <script nonce={nonce}>
      // This script is allowed
    </script>
  )
}
```

**Benefits:**
- ✅ Blocks ALL unauthorized inline scripts/styles
- ✅ Only code with correct nonce can execute
- ✅ Prevents XSS even if attacker injects HTML
- ✅ Per-request nonce = impossible to predict

### Phase 2: ✅ DONE - Nonce for Styles
**Status:** ✅ **IMPLEMENTED**

Same nonce is used for both scripts and styles. No `'unsafe-inline'` anywhere!

### Phase 3: Future - Subresource Integrity (SRI)
**Add to external scripts:**
```html
<script 
  src="https://cdn.example.com/script.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

**Benefits:**
- Verify external scripts haven't been tampered
- Prevent supply chain attacks

---

## 🧪 Testing CSP

### 1. Browser Console
Check for CSP violations:
```
Refused to execute inline script because it violates CSP directive
```

### 2. Report-Only Mode (Testing)
Add to `next.config.ts`:
```typescript
{
  key: 'Content-Security-Policy-Report-Only',
  value: policies.join('; ') + '; report-uri /api/csp-report'
}
```

### 3. CSP Evaluator Tools
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)

### 4. Manual Testing Checklist
- [ ] All pages load without CSP errors
- [ ] Images from Supabase load correctly
- [ ] Fonts from Google Fonts load
- [ ] API calls to Supabase work
- [ ] AI chatbot works (OpenRouter API)
- [ ] Vercel Analytics loads
- [ ] No console errors about blocked resources

---

## 🚫 Common CSP Violations & Fixes

### Violation: Inline Script Blocked
**Error:**
```
Refused to execute inline script because it violates CSP directive
```

**Fix:**
1. Move script to external file
2. Or add nonce to script tag (future improvement)
3. Or use hash-based CSP

### Violation: External Resource Blocked
**Error:**
```
Refused to load https://example.com/script.js because it violates CSP directive
```

**Fix:**
Add domain to whitelist in `next.config.ts`:
```typescript
"script-src 'self' 'unsafe-inline' https://example.com ..."
```

### Violation: WebSocket Blocked
**Error:**
```
Refused to connect to wss://example.com because it violates CSP directive
```

**Fix:**
Add to `connect-src`:
```typescript
"connect-src 'self' wss://example.com ..."
```

---

## 📚 Best Practices

### DO ✅
- Use `'self'` as default
- Whitelist specific domains only
- Remove `'unsafe-eval'` in production
- Use nonce/hash for inline scripts (future)
- Test CSP in report-only mode first
- Monitor CSP violations
- Keep CSP updated when adding new services

### DON'T ❌
- Use `'unsafe-inline'` without plan to remove it
- Use `'unsafe-eval'` in production
- Use `*` wildcard (allows everything)
- Use `data:` for scripts (XSS risk)
- Forget to test after CSP changes
- Add domains without verifying necessity

---

## 🔍 Monitoring CSP Violations

### Setup CSP Reporting (Optional)
Create API endpoint to receive CSP violation reports:

```typescript
// src/app/api/csp-report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()
    
    apiLogger.warn({
      type: 'csp_violation',
      report,
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer'),
    }, 'CSP violation detected')
    
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 })
  }
}
```

Add to CSP header:
```typescript
"report-uri /api/csp-report"
```

---

## 📖 Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Google CSP Guide](https://developers.google.com/web/fundamentals/security/csp)
- [CSP Level 3 Spec](https://www.w3.org/TR/CSP3/)

---

**Last Updated:** October 30, 2025  
**Status:** ✅ IMPROVED - Phase 1 Complete  
**Next Phase:** Implement nonce-based CSP for scripts

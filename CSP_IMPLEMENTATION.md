# Content Security Policy (CSP) Implementation

## ✅ Status: ENABLED

CSP headers telah diimplementasikan dan aktif di production untuk melindungi aplikasi dari XSS, clickjacking, dan serangan injection lainnya.

---

## 🔒 Security Headers Implemented

### 1. **Content-Security-Policy (CSP)**
Melindungi dari XSS attacks dengan membatasi sumber yang diizinkan untuk scripts, styles, images, dll.

### 2. **X-Frame-Options: DENY**
Mencegah clickjacking dengan melarang aplikasi dimuat dalam iframe.

### 3. **X-Content-Type-Options: nosniff**
Mencegah MIME type sniffing yang bisa dieksploitasi.

### 4. **X-XSS-Protection: 1; mode=block**
Mengaktifkan XSS filter browser (legacy support).

### 5. **Referrer-Policy: strict-origin-when-cross-origin**
Mengontrol informasi referrer yang dikirim ke external sites.

### 6. **Permissions-Policy**
Menonaktifkan akses ke camera, microphone, dan geolocation.

### 7. **Strict-Transport-Security (HSTS)** - Production Only
Memaksa HTTPS untuk semua koneksi (1 tahun, includeSubDomains, preload).

---

## 📋 CSP Directives

### Development Mode
```
default-src 'self' https: data: blob:;
script-src 'self' 'nonce-{random}' 'strict-dynamic' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://vercel.live;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' https: data: blob: https://*.supabase.co https://*.vercel.app;
font-src 'self' https://fonts.gstatic.com data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live;
worker-src 'self' blob:;
media-src 'self' https://*.supabase.co;
frame-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
manifest-src 'self';
upgrade-insecure-requests;
block-all-mixed-content;
```

### Production Mode
Same as development but **without** `'unsafe-eval'` in script-src for better security.

---

## 🔑 Nonce-Based CSP

### How It Works

1. **Middleware generates unique nonce** for each request
   ```typescript
   const nonce = generateNonce() // Random 16-byte base64 string
   ```

2. **Nonce added to response headers**
   ```typescript
   response.headers.set('x-nonce', nonce)
   response.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
   ```

3. **Nonce available in Server Components**
   ```typescript
   import { getNonce } from '@/lib/nonce'
   
   const nonce = await getNonce()
   ```

4. **Next.js automatically adds nonce to inline scripts**
   - Next.js reads the `csp-nonce` meta tag
   - Automatically adds nonce to all inline scripts
   - No manual intervention needed

---

## 📁 Implementation Files

### Core Files
```
middleware.ts                 # Main middleware with CSP headers
src/lib/csp.ts               # CSP policy generation
src/lib/nonce.ts             # Nonce utility functions
src/app/layout.tsx           # Root layout with nonce meta tag
```

### Key Functions

#### `generateNonce()` - src/lib/csp.ts
```typescript
export function generateNonce(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
}
```

#### `getStrictCSP()` - src/lib/csp.ts
```typescript
export function getStrictCSP(nonce: string, isDev = false): string {
  // Returns complete CSP policy string
}
```

#### `addSecurityHeaders()` - middleware.ts
```typescript
function addSecurityHeaders(response: NextResponse, nonce: string, isDev: boolean): void {
  response.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
  response.headers.set('x-nonce', nonce)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
}
```

---

## 🌐 Allowed Sources

### Scripts
- `'self'` - Same origin
- `'nonce-{random}'` - Inline scripts with nonce
- `'strict-dynamic'` - Scripts loaded by trusted scripts
- `https://*.supabase.co` - Supabase services
- `https://api.openrouter.ai` - AI API
- `https://va.vercel-scripts.com` - Vercel Analytics
- `https://vercel.live` - Vercel Live (dev only)
- `'unsafe-eval'` - Development only (for HMR)

### Styles
- `'self'` - Same origin
- `'unsafe-inline'` - Inline styles (required for Tailwind)
- `https://fonts.googleapis.com` - Google Fonts

### Images
- `'self'` - Same origin
- `https:` - All HTTPS images
- `data:` - Data URIs
- `blob:` - Blob URLs
- `https://*.supabase.co` - Supabase storage
- `https://*.vercel.app` - Vercel deployments

### Connections (fetch, XHR, WebSocket)
- `'self'` - Same origin
- `https://*.supabase.co` - Supabase API
- `wss://*.supabase.co` - Supabase Realtime
- `https://api.openrouter.ai` - AI API
- `https://fonts.googleapis.com` - Google Fonts
- `https://vitals.vercel-insights.com` - Vercel Analytics
- `https://vercel.live` - Vercel Live

---

## 🧪 Testing CSP

### 1. Check Headers in Browser DevTools
```
Network Tab → Select any request → Headers → Response Headers
```

Look for:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security` (production only)

### 2. Test CSP Violations
Open browser console and check for CSP violation errors:
```
Refused to execute inline script because it violates the following Content Security Policy directive...
```

### 3. Online CSP Validator
- https://csp-evaluator.withgoogle.com/
- Paste your CSP policy to check for issues

### 4. Security Headers Check
- https://securityheaders.com/
- Enter your domain to get security rating

---

## 🔧 Troubleshooting

### Issue: Inline scripts blocked
**Solution:** Ensure nonce is properly set in meta tag:
```html
<meta property="csp-nonce" content="{nonce}" />
```

### Issue: External scripts blocked
**Solution:** Add domain to `script-src` in `src/lib/csp.ts`:
```typescript
script-src 'self' 'nonce-${nonce}' https://trusted-domain.com;
```

### Issue: Images not loading
**Solution:** Add domain to `img-src`:
```typescript
img-src 'self' https: data: blob: https://your-cdn.com;
```

### Issue: WebSocket connection blocked
**Solution:** Add to `connect-src`:
```typescript
connect-src 'self' wss://your-websocket-server.com;
```

---

## 📊 Security Rating

### Before CSP
- Security Headers: **D** or **F**
- Missing critical security headers

### After CSP Implementation
- Security Headers: **A** or **A+**
- All critical headers present
- CSP properly configured
- HSTS enabled (production)

---

## 🚀 Production Checklist

- [x] CSP headers enabled
- [x] Nonce-based script execution
- [x] X-Frame-Options set to DENY
- [x] X-Content-Type-Options set to nosniff
- [x] HSTS enabled (production only)
- [x] Referrer-Policy configured
- [x] Permissions-Policy set
- [x] No 'unsafe-eval' in production
- [x] All external sources whitelisted
- [x] CSP tested and validated

---

## 📝 Maintenance

### Adding New External Service

1. Identify the domain (e.g., `https://new-service.com`)
2. Determine the directive needed:
   - Scripts: `script-src`
   - Styles: `style-src`
   - Images: `img-src`
   - API calls: `connect-src`
3. Update `src/lib/csp.ts`:
   ```typescript
   connect-src 'self' https://new-service.com;
   ```
4. Test in development
5. Deploy to production

### Monitoring CSP Violations

Consider adding CSP reporting:
```typescript
report-uri /api/csp-report;
report-to csp-endpoint;
```

Then create an API endpoint to log violations.

---

## 🔐 Security Benefits

1. **XSS Protection** - Prevents execution of malicious scripts
2. **Clickjacking Protection** - Prevents iframe embedding
3. **MIME Sniffing Protection** - Prevents content type confusion
4. **HTTPS Enforcement** - Forces secure connections (HSTS)
5. **Data Leakage Prevention** - Controls referrer information
6. **Permission Control** - Blocks unnecessary browser features

---

**Implementation Date:** 2025-11-05  
**Status:** ✅ ACTIVE  
**Security Level:** HIGH  
**Compliance:** OWASP Best Practices

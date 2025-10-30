# CSP Nonce Implementation - Strict Security

## ✅ Implemented: Nonce-Based CSP

HeyTrack sekarang menggunakan **nonce-based CSP** untuk maximum security!

---

## 🔒 How It Works (Following Next.js Official Docs)

### 1. Middleware Generates Nonce Per Request

```typescript
// src/middleware.ts
const nonce = generateNonce() // Random base64 string
request.headers.set('x-nonce', nonce) // Pass to app
response.headers.set('Content-Security-Policy', getStrictCSP(nonce))
```

### 2. CSP Policy Uses Nonce

```typescript
// src/lib/csp.ts
script-src 'self' 'nonce-{random}' https://*.supabase.co ...
```

**Result:** Only scripts with matching nonce attribute can execute!

### 3. Layout Accesses Nonce from Headers

```typescript
// src/app/layout.tsx
import { getNonce } from '@/lib/nonce'

const nonce = await getNonce() // Gets from request headers

// Add meta tag for Next.js to use
<meta property="csp-nonce" content={nonce} />
```

### 4. Next.js Automatically Injects Nonce

According to [Next.js CSP docs](https://nextjs.org/docs/app/guides/content-security-policy):

Next.js automatically injects nonce into inline scripts when:
- ✅ Nonce is in request headers (`x-nonce`)
- ✅ CSP meta tag with `property="csp-nonce"` is present
- ✅ Scripts are server-rendered

**No additional configuration needed!** Next.js handles it automatically.

---

## 📋 Files Created/Modified

### New Files:
- `src/lib/nonce.ts` - Helper to get nonce from headers
- `src/components/NonceScript.tsx` - Script component with nonce support

### Modified Files:
- `src/lib/csp.ts` - Uses nonce in script-src
- `src/app/layout.tsx` - Gets and passes nonce
- `src/middleware.ts` - Generates and sets nonce

---

## 🎯 Usage Guide

### For Server Components (Inline Scripts)

```typescript
import { NonceScript } from '@/components/NonceScript'

export default function MyPage() {
  return (
    <div>
      <NonceScript id="my-script">
        {`console.log('This script has nonce!')`}
      </NonceScript>
    </div>
  )
}
```

### For External Scripts

```typescript
import Script from 'next/script'
import { getNonce } from '@/lib/nonce'

export default async function MyPage() {
  const nonce = await getNonce()
  
  return (
    <Script
      src="https://example.com/script.js"
      nonce={nonce || undefined}
    />
  )
}
```

### For Client Components

Client components cannot access nonce directly (server-only). Options:

1. **Move script to Server Component** (recommended)
2. **Use external script file** (no nonce needed for src="...")
3. **Pass nonce as prop** from Server Component parent

---

## 🔍 How Next.js Handles Nonce

### Framework Scripts (Hydration)

Next.js automatically injects nonce into its inline scripts when:

1. `x-nonce` header is present (set by middleware)
2. CSP meta tag exists in `<head>`
3. Scripts are server-rendered

**Example:**
```html
<!-- Next.js automatically adds nonce -->
<script nonce="abc123">
  self.__next_f.push([1,"..."])
</script>
```

### Your Custom Scripts

Use `NonceScript` component or `Script` with nonce prop:

```typescript
<NonceScript id="analytics">
  {`gtag('config', 'GA_ID')`}
</NonceScript>
```

---

## ⚠️ Important Notes

### 1. Nonce is Per-Request

Each request gets a unique nonce. Never hardcode or reuse nonces!

```typescript
// ✅ CORRECT - Generated per request
const nonce = generateNonce()

// ❌ WRONG - Static nonce defeats the purpose
const nonce = 'abc123'
```

### 2. Styles Don't Use Nonce

```typescript
// Styles use 'unsafe-inline' (no nonce)
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```

**Why?**
- React inline `style` attributes cannot have nonce
- Nonce only works for `<style>` tags, not attributes
- Inline style attributes are safe (not executable)

### 3. 'unsafe-inline' is Ignored When Nonce Present

```typescript
// ❌ This doesn't work as expected
script-src 'self' 'nonce-xxx' 'unsafe-inline'
// 'unsafe-inline' is IGNORED because nonce is present!

// ✅ Only scripts with nonce can execute
script-src 'self' 'nonce-xxx'
```

---

## 🧪 Testing

### 1. Check Nonce in Headers

```bash
curl -I http://localhost:3000 | grep Content-Security-Policy
# Should see: script-src 'self' 'nonce-{random}'
```

### 2. Check Nonce in HTML

View page source:
```html
<meta property="csp-nonce" content="abc123..." />
<script nonce="abc123...">...</script>
```

### 3. Check Browser Console

Should see NO CSP violations:
```
✅ No "Refused to execute inline script" errors
```

### 4. Test Inline Script Without Nonce

Try adding script without nonce:
```html
<script>console.log('test')</script>
```

Should be blocked:
```
❌ Refused to execute inline script because it violates CSP
```

---

## 🚀 Benefits

### Security Improvements:

1. **Blocks XSS Attacks**
   - Attacker cannot inject `<script>` tags
   - Even if HTML injection succeeds, scripts won't execute
   - Only scripts with correct nonce can run

2. **Per-Request Nonce**
   - Nonce changes every request
   - Impossible to predict or reuse
   - Prevents replay attacks

3. **No 'unsafe-inline' for Scripts**
   - Strict CSP policy
   - Only whitelisted scripts execute
   - Maximum protection

### What's Protected:

✅ XSS via injected `<script>` tags  
✅ XSS via inline event handlers (`onclick="..."`)  
✅ XSS via `javascript:` URLs  
✅ Malicious third-party scripts  
✅ Script injection attacks  

### What's Still Allowed:

✅ Next.js framework scripts (with nonce)  
✅ External scripts from whitelisted domains  
✅ Your custom scripts (with nonce)  
✅ React inline styles (style attributes)  

---

## 📚 API Reference

### `generateNonce()`

Generate cryptographically secure nonce.

```typescript
import { generateNonce } from '@/lib/csp'

const nonce = generateNonce()
// Returns: base64 string (e.g., "abc123...")
```

### `getNonce()`

Get nonce from request headers (Server Components only).

```typescript
import { getNonce } from '@/lib/nonce'

const nonce = await getNonce()
// Returns: string | null
```

### `requireNonce()`

Get nonce or throw error.

```typescript
import { requireNonce } from '@/lib/nonce'

const nonce = await requireNonce()
// Returns: string
// Throws: Error if nonce not available
```

### `getStrictCSP(nonce, isDev)`

Get CSP header with nonce.

```typescript
import { getStrictCSP } from '@/lib/csp'

const csp = getStrictCSP(nonce, false)
// Returns: CSP header string
```

### `<NonceScript>`

Script component with automatic nonce injection.

```typescript
import { NonceScript } from '@/components/NonceScript'

<NonceScript id="my-script">
  {`console.log('Hello')`}
</NonceScript>
```

---

## 🔧 Troubleshooting

### Issue: "Refused to execute inline script"

**Cause:** Script doesn't have nonce attribute.

**Fix:** Use `NonceScript` component or add nonce manually.

### Issue: Nonce not working

**Checklist:**
- [ ] Middleware is running (check headers)
- [ ] Nonce is in CSP header
- [ ] Nonce meta tag in `<head>`
- [ ] Script has matching nonce attribute
- [ ] Not using 'unsafe-inline' with nonce

### Issue: Next.js scripts blocked

**Cause:** Next.js not detecting nonce.

**Fix:**
1. Ensure `x-nonce` header is set
2. Add CSP meta tag in layout
3. Restart dev server

---

## 📖 Resources

- [CSP Level 3 Spec](https://www.w3.org/TR/CSP3/)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

**Status:** ✅ IMPLEMENTED - Nonce-based CSP Active  
**Security Level:** 🔒 STRICT - Maximum Protection  
**Last Updated:** October 30, 2025

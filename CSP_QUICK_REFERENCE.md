# CSP Nonce - Quick Reference

Based on [Next.js Official CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy)

---

## ✅ Current Implementation

### 1. Middleware (Already Done)
```typescript
// src/middleware.ts
const nonce = generateNonce()
request.headers.set('x-nonce', nonce)
response.headers.set('Content-Security-Policy', getStrictCSP(nonce))
```

### 2. Layout (Already Done)
```typescript
// src/app/layout.tsx
const nonce = await getNonce()

<meta property="csp-nonce" content={nonce} />
```

### 3. CSP Policy (Already Done)
```typescript
// src/lib/csp.ts
script-src 'self' 'nonce-{random}' https://*.supabase.co ...
```

---

## 🎯 How to Use

### For Next.js Framework Scripts
**No action needed!** Next.js automatically injects nonce.

### For Your Custom Inline Scripts
Use `<Script>` component with nonce:

```typescript
import Script from 'next/script'
import { getNonce } from '@/lib/nonce'

export default async function MyPage() {
  const nonce = await getNonce()
  
  return (
    <Script id="my-script" nonce={nonce || undefined}>
      {`console.log('Hello')`}
    </Script>
  )
}
```

### For External Scripts
```typescript
<Script 
  src="https://example.com/script.js"
  nonce={nonce || undefined}
/>
```

---

## 🔍 Verification

### 1. Check Headers
```bash
curl -I http://localhost:3000
# Should see: Content-Security-Policy: script-src 'self' 'nonce-...'
```

### 2. Check HTML Source
```html
<meta property="csp-nonce" content="abc123..." />
<script nonce="abc123...">...</script>
```

### 3. Check Browser Console
✅ No CSP violations = Working correctly!

---

## 📚 Resources

- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Spec](https://www.w3.org/TR/CSP3/)

---

**Status:** ✅ Implemented following Next.js best practices

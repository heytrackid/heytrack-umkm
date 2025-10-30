# CSP Nonce Usage Guide

## Overview

HeyTrack menggunakan **nonce-based CSP** yang strict - TIDAK ADA `'unsafe-inline'`!

Ini berarti semua inline scripts dan styles HARUS memiliki nonce attribute yang valid.

---

## 🎯 Quick Start

### For Server Components (Recommended)

```typescript
import { getNonce } from '@/lib/nonce'

export default async function MyPage() {
  const nonce = await getNonce()
  
  return (
    <div>
      {/* Inline script with nonce */}
      <script nonce={nonce}>
        console.log('This works!')
      </script>
      
      {/* Inline style with nonce */}
      <style nonce={nonce}>
        {`.custom { color: red; }`}
      </style>
    </div>
  )
}
```

### For Client Components

**DON'T use inline scripts in client components!**

Client components run in browser and can't access server-generated nonce securely.

**Instead:**
1. Move logic to external `.ts` file
2. Import and use in component
3. Or use Server Component wrapper

---

## 📋 Common Patterns

### Pattern 1: External Scripts (Preferred)

```typescript
// ✅ BEST - No inline code needed
'use client'

import { myFunction } from '@/lib/my-function'

export function MyComponent() {
  return (
    <button onClick={myFunction}>
      Click me
    </button>
  )
}
```

### Pattern 2: Server Component with Nonce

```typescript
// ✅ GOOD - For server-side inline code
import { getNonce } from '@/lib/nonce'

export default async function MyPage() {
  const nonce = await getNonce()
  const config = { apiKey: process.env.API_KEY }
  
  return (
    <div>
      <script nonce={nonce}>
        {`window.__CONFIG__ = ${JSON.stringify(config)}`}
      </script>
      <ClientComponent />
    </div>
  )
}
```

### Pattern 3: Dynamic Styles

```typescript
// ✅ GOOD - Use Tailwind or CSS modules instead
import styles from './MyComponent.module.css'

export function MyComponent() {
  return <div className={styles.custom}>Content</div>
}
```

```css
/* MyComponent.module.css */
.custom {
  color: red;
}
```

---

## ❌ Common Mistakes

### Mistake 1: Inline Script Without Nonce

```typescript
// ❌ WRONG - Will be blocked by CSP
export default function MyPage() {
  return (
    <script>
      console.log('This will be blocked!')
    </script>
  )
}
```

**Fix:**
```typescript
// ✅ CORRECT
import { getNonce } from '@/lib/nonce'

export default async function MyPage() {
  const nonce = await getNonce()
  
  return (
    <script nonce={nonce}>
      console.log('This works!')
    </script>
  )
}
```

### Mistake 2: Inline Event Handlers

```typescript
// ❌ WRONG - Inline handlers are blocked
<button onClick="alert('hi')">Click</button>
```

**Fix:**
```typescript
// ✅ CORRECT - Use React event handlers
'use client'

export function MyButton() {
  return (
    <button onClick={() => alert('hi')}>
      Click
    </button>
  )
}
```

### Mistake 3: Inline Styles Without Nonce

```typescript
// ❌ WRONG - Will be blocked
<div style={{ color: 'red' }}>Text</div>
```

**Fix:**
```typescript
// ✅ CORRECT - Use Tailwind
<div className="text-red-500">Text</div>

// Or CSS modules
import styles from './styles.module.css'
<div className={styles.red}>Text</div>
```

**Note:** React inline styles (`style={{ }}`) are actually converted to style attributes, not `<style>` tags, so they work fine. But for consistency, prefer Tailwind.

---

## 🔍 Debugging CSP Violations

### Check Browser Console

If you see:
```
Refused to execute inline script because it violates CSP directive
```

**Steps:**
1. Check if script has `nonce` attribute
2. Verify nonce value matches CSP header
3. Check if middleware is running
4. Verify `getNonce()` is called in Server Component

### Verify Nonce in Headers

```bash
# Check CSP header
curl -I https://your-app.com | grep Content-Security-Policy

# Should see: script-src 'self' 'nonce-{random}'
```

### Test Nonce Generation

```typescript
// Add to any page for debugging
import { getNonce } from '@/lib/nonce'

export default async function DebugPage() {
  const nonce = await getNonce()
  
  return (
    <div>
      <p>Nonce: {nonce}</p>
      <script nonce={nonce}>
        console.log('Nonce works:', '{nonce}')
      </script>
    </div>
  )
}
```

---

## 🚀 Best Practices

### DO ✅

1. **Use external files for scripts**
   ```typescript
   // lib/analytics.ts
   export function trackEvent(name: string) { ... }
   
   // component
   import { trackEvent } from '@/lib/analytics'
   ```

2. **Use Tailwind for styles**
   ```typescript
   <div className="text-red-500 font-bold">Text</div>
   ```

3. **Use CSS modules for complex styles**
   ```typescript
   import styles from './Component.module.css'
   <div className={styles.complex}>Text</div>
   ```

4. **Pass config via props, not inline scripts**
   ```typescript
   // ✅ GOOD
   <ClientComponent config={config} />
   
   // ❌ BAD
   <script>window.__CONFIG__ = ...</script>
   ```

5. **Use Server Components for nonce access**
   ```typescript
   // Server Component
   const nonce = await getNonce()
   return <ClientComponent nonce={nonce} />
   ```

### DON'T ❌

1. **Don't use inline event handlers**
   ```html
   <!-- ❌ BAD -->
   <button onclick="doSomething()">Click</button>
   ```

2. **Don't use inline scripts without nonce**
   ```html
   <!-- ❌ BAD -->
   <script>console.log('hi')</script>
   ```

3. **Don't try to access nonce in Client Components**
   ```typescript
   // ❌ BAD - Client components can't access server headers
   'use client'
   const nonce = await getNonce() // Error!
   ```

4. **Don't use `dangerouslySetInnerHTML` with scripts**
   ```typescript
   // ❌ BAD - Scripts won't execute
   <div dangerouslySetInnerHTML={{ __html: '<script>...</script>' }} />
   ```

---

## 📚 API Reference

### `getNonce()`

Get CSP nonce from request headers (Server Components only).

```typescript
import { getNonce } from '@/lib/nonce'

const nonce = await getNonce()
// Returns: string | null
```

### `requireNonce()`

Get nonce or throw error if not available.

```typescript
import { requireNonce } from '@/lib/nonce'

const nonce = await requireNonce()
// Returns: string
// Throws: Error if nonce not available
```

### `generateNonce()`

Generate a new nonce (used in middleware).

```typescript
import { generateNonce } from '@/lib/csp'

const nonce = generateNonce()
// Returns: string (base64 encoded random bytes)
```

### `getStrictCSP(nonce, isDev)`

Get strict CSP header with nonce.

```typescript
import { getStrictCSP } from '@/lib/csp'

const csp = getStrictCSP(nonce, false)
// Returns: string (CSP header value)
```

---

## 🧪 Testing

### Test Checklist

- [ ] All pages load without CSP errors
- [ ] No "Refused to execute inline script" errors
- [ ] Analytics scripts work (if any)
- [ ] Third-party scripts work (Vercel Analytics, etc)
- [ ] Styles render correctly
- [ ] No console warnings about CSP

### Manual Testing

1. Open browser DevTools
2. Go to Console tab
3. Load your page
4. Check for CSP violations
5. Verify nonce in Network tab → Headers

### Automated Testing

```typescript
// test/csp.test.ts
import { generateNonce, getStrictCSP } from '@/lib/csp'

describe('CSP', () => {
  it('generates unique nonces', () => {
    const nonce1 = generateNonce()
    const nonce2 = generateNonce()
    expect(nonce1).not.toBe(nonce2)
  })
  
  it('includes nonce in CSP', () => {
    const nonce = generateNonce()
    const csp = getStrictCSP(nonce)
    expect(csp).toContain(`'nonce-${nonce}'`)
  })
  
  it('does not include unsafe-inline', () => {
    const csp = getStrictCSP(generateNonce())
    expect(csp).not.toContain('unsafe-inline')
  })
})
```

---

## 🔧 Troubleshooting

### Issue: "CSP nonce not available"

**Cause:** Middleware not running or headers not passed correctly.

**Fix:**
1. Check `src/middleware.ts` is present
2. Verify middleware matcher includes your route
3. Check middleware is generating nonce
4. Verify nonce is added to headers

### Issue: Scripts still blocked with nonce

**Cause:** Nonce mismatch or CSP header not set.

**Fix:**
1. Check nonce in script tag matches CSP header
2. Verify CSP header is set in response
3. Check for multiple CSP headers (last one wins)
4. Clear browser cache

### Issue: Third-party scripts blocked

**Cause:** Domain not whitelisted in CSP.

**Fix:**
Add domain to `src/lib/csp.ts`:
```typescript
"script-src 'self' 'nonce-${nonce}' https://new-domain.com ..."
```

---

## 📖 Resources

- [CSP Nonce Spec](https://www.w3.org/TR/CSP3/#security-nonces)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

**Last Updated:** October 30, 2025  
**Status:** ✅ PRODUCTION READY

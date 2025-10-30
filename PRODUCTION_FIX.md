# Production Error Fix - jsdom/DOMPurify Compatibility

## 🐛 Problem

Production deployment on Vercel was failing with error:
```
Error: Failed to load external module jsdom: Error [ERR_REQUIRE_ESM]: 
require() of ES Module parse5 not supported
```

**Root Cause:**
- `isomorphic-dompurify` library uses `jsdom` for HTML sanitization
- `jsdom` is a Node.js-only library that doesn't work in Vercel Edge Runtime
- By default, Next.js 15+ tries to use Edge Runtime for API routes

## ✅ Solution

### 1. Force Node.js Runtime for All API Routes

Added `export const runtime = 'nodejs'` to all 62 API routes in `src/app/api/`.

**Why this works:**
- Forces Vercel to use Node.js runtime instead of Edge Runtime
- Node.js runtime supports `jsdom` and other Node-specific libraries
- Maintains full compatibility with DOMPurify for XSS protection

### 2. Updated Supabase Server Client

Modified `src/utils/supabase/server.ts` to accept both `nodejs` and `edge` runtime:

```typescript
// Before (too strict)
if (runtime && runtime !== 'nodejs') {
  throw new Error('Requires nodejs runtime')
}

// After (flexible)
if (runtime && runtime !== 'nodejs' && runtime !== 'edge') {
  throw new Error('Requires nodejs or edge runtime')
}
```

## 📝 Files Modified

### API Routes (62 files)
All files in `src/app/api/**/route.ts` now have:
```typescript
// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
```

### Core Files
- `src/utils/supabase/server.ts` - Runtime validation fix
- `scripts/add-runtime-config.sh` - Automation script for future routes

## 🚀 Deployment Checklist

Before deploying to production:

- [x] All API routes have `runtime = 'nodejs'`
- [x] Supabase client accepts both runtimes
- [x] Environment variables are set in Vercel
- [ ] Test in Vercel preview deployment
- [ ] Monitor production logs for errors

## 🔍 Verification

Check that all API routes have runtime config:
```bash
grep -r "export const runtime = 'nodejs'" src/app/api --include="route.ts" | wc -l
# Should return: 62
```

## 📚 Alternative Solutions (Not Implemented)

### Option 1: Replace DOMPurify with Edge-Compatible Library
- Use `sanitize-html` or custom sanitization
- **Downside:** Less secure, more maintenance

### Option 2: Move Sanitization to Client-Side
- Use `dompurify` in browser only
- **Downside:** Less secure, can be bypassed

### Option 3: Use Edge-Compatible Subset
- Only sanitize on client, validate on server
- **Downside:** Complex implementation

**Chosen Solution (Force Node.js Runtime) is the best balance of:**
- ✅ Security (full DOMPurify protection)
- ✅ Simplicity (one-line config)
- ✅ Maintainability (no code changes needed)
- ⚠️ Trade-off: Slightly slower cold starts vs Edge Runtime

## 🎯 Performance Impact

**Node.js Runtime vs Edge Runtime:**
- Cold start: ~100-300ms slower
- Warm requests: No difference
- For HeyTrack's use case: Acceptable trade-off for security

**Optimization opportunities:**
- Keep Edge Runtime for static pages
- Use Node.js only for API routes (current setup)
- Consider Edge Runtime for read-only endpoints in future

## 🔐 Security Notes

**Why we need DOMPurify:**
- Sanitizes user input to prevent XSS attacks
- Used in `withSecurity` middleware
- Critical for handling customer names, notes, descriptions

**Security middleware usage:**
```typescript
import { withSecurity, SecurityPresets } from '@/utils/security'

const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
```

## 📖 References

- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Vercel Runtime Docs](https://vercel.com/docs/functions/runtimes)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify)

## 🛠️ Future Improvements

1. **Selective Runtime:** Use Edge Runtime for read-only endpoints
2. **Monitoring:** Add runtime metrics to track performance
3. **Testing:** Add integration tests for production environment
4. **Documentation:** Update API route template with runtime config

---

**Status:** ✅ FIXED  
**Date:** October 30, 2025  
**Tested:** Local ✅ | Preview ⏳ | Production ⏳

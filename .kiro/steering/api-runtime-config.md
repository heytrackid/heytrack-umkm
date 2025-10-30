# API Route Runtime Configuration

## Quick Rule

**ALWAYS add this to every new API route:**

```typescript
// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
```

## Why?

HeyTrack uses `isomorphic-dompurify` for XSS protection, which requires Node.js runtime. Without this config, API routes will fail in production with jsdom errors.

## Template for New API Routes

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'

// ✅ REQUIRED: Force Node.js runtime
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Your logic here
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/your-route')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## When Can You Use Edge Runtime?

Only use `export const runtime = 'edge'` if:
- ✅ Route does NOT use `withSecurity` middleware
- ✅ Route does NOT sanitize HTML input
- ✅ Route does NOT use Node.js-specific libraries
- ✅ Route is read-only (GET only)
- ✅ You need ultra-low latency

**Example edge-compatible route:**
```typescript
// Only for simple, read-only endpoints
export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
```

## Common Mistakes

### ❌ Forgetting Runtime Config
```typescript
// This will fail in production!
export async function POST(request: NextRequest) {
  // Uses withSecurity internally
}
```

### ❌ Using Edge Runtime with Security Middleware
```typescript
export const runtime = 'edge' // ❌ Will fail!

const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
```

### ✅ Correct Usage
```typescript
export const runtime = 'nodejs' // ✅ Works!

const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
```

## Verification

Check if your route has runtime config:
```bash
grep "export const runtime" src/app/api/your-route/route.ts
```

Check all routes:
```bash
grep -r "export const runtime = 'nodejs'" src/app/api --include="route.ts" | wc -l
# Should match total number of API routes
```

## Performance Notes

**Node.js Runtime:**
- Cold start: ~200-500ms
- Warm requests: ~50-100ms
- Full Node.js API support

**Edge Runtime:**
- Cold start: ~0-50ms
- Warm requests: ~10-30ms
- Limited API support

For HeyTrack, security > speed, so we use Node.js runtime.

## References

- Production Fix: `PRODUCTION_FIX.md`
- API Route Template: `.kiro/steering/api-auth-template.md`
- Security Guide: `.kiro/steering/code-quality.md`

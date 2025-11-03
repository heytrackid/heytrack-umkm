# Fix: "Worker has exited" Error in Development

## Problem
Getting repeated "uncaughtException: Error: the worker has exited" errors during development.

## Root Causes
1. **Turbopack Worker Crashes**: Turbopack workers can crash due to:
   - Memory exhaustion
   - Uncaught exceptions in API routes
   - Cache corruption
   - Too many concurrent requests

2. **API Route Issues**:
   - Unhandled promise rejections
   - Database connection pool exhaustion
   - Memory leaks in caching

## Solutions

### 1. Increase Node.js Memory (Quick Fix)
Update `package.json` dev scripts:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev",
    "dev:turbo": "NODE_OPTIONS='--max-old-space-size=4096' next dev --turbo",
    "dev:webpack": "NODE_OPTIONS='--max-old-space-size=4096' NEXT_WEBPACK=1 next dev"
  }
}
```

### 2. Clear Cache and Restart
```bash
# Clean everything
rm -rf .next .turbo node_modules/.cache

# Restart dev server
pnpm dev
```

### 3. Use Webpack Instead of Turbopack
If issue persists, switch to webpack (more stable):
```bash
pnpm dev:webpack
```

### 4. Add Worker Restart Script
Create `scripts/dev-stable.sh`:
```bash
#!/bin/bash
while true; do
  NODE_OPTIONS='--max-old-space-size=4096' pnpm next dev
  echo "Server crashed. Restarting in 2 seconds..."
  sleep 2
done
```

Make executable: `chmod +x scripts/dev-stable.sh`
Run: `./scripts/dev-stable.sh`

### 5. Database Connection Pool Fix
The error often happens with Supabase connection exhaustion. Add this to your API routes:

```typescript
// At the top of problematic API routes
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Add connection cleanup
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    // ... your code
    return response
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    // Cleanup - Supabase client should auto-cleanup but we can help
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
  }
}
```

### 6. Reduce Concurrent API Calls
In your frontend code, add debouncing/throttling:

```typescript
import { debounce } from 'lodash'

// Debounce search/filter operations
const debouncedFetch = debounce(fetchData, 300)
```

## Immediate Actions

1. **Restart with more memory**:
   ```bash
   pnpm dev:clean
   # Then restart
   NODE_OPTIONS='--max-old-space-size=4096' pnpm dev
   ```

2. **Monitor memory usage**:
   ```bash
   # In another terminal
   while true; do
     ps aux | grep "next" | grep -v grep
     sleep 5
   done
   ```

3. **Check for memory leaks in your code**:
   - Look for unclosed database connections
   - Check for event listeners not being cleaned up
   - Verify useEffect cleanup functions

## Long-term Solutions

### Update next.config.ts
```typescript
const nextConfig = {
  // Reduce concurrency
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  
  // Turbopack config
  turbopack: {
    memoryLimit: 4096
  }
}
```

### Add Global Error Handler
Create `middleware.ts` at root:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

export const config = {
  matcher: '/api/:path*'
}
```

## Still Having Issues?

If errors persist:

1. **Switch to Webpack**:
   ```bash
   pnpm dev:webpack
   ```

2. **Downgrade Next.js** (if critical):
   ```bash
   pnpm add next@15.0.3
   ```

3. **Check System Resources**:
   - Close other applications
   - Increase Docker memory (if using Docker)
   - Check disk space

4. **Enable Verbose Logging**:
   ```bash
   DEBUG=* NODE_OPTIONS='--trace-warnings --max-old-space-size=4096' pnpm dev
   ```

## Prevention

1. **Add error boundaries** in React components
2. **Use try-catch** in all API routes
3. **Implement request timeouts**
4. **Monitor memory usage** regularly
5. **Keep dependencies updated**
6. **Use SWR or React Query** for better caching

## Notes
- This is a known issue with Turbopack in Next.js 16
- Will be improved in future Next.js versions
- Webpack mode is more stable but slower

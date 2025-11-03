# 🚨 Quick Fix: "Worker has exited" Errors

## Immediate Solutions (Try in order)

### 1. Quick Cleanup & Restart (60 seconds) ⚡
```bash
# Run the fix script
./scripts/fix-worker-crash.sh

# Then restart
pnpm dev
```

### 2. Use Webpack Instead of Turbopack (Most Reliable) 🔧
Webpack is slower but more stable:
```bash
pnpm dev:webpack
```

### 3. Auto-Restart Mode 🔄
Automatically restart when crashes happen:
```bash
./scripts/dev-stable.sh
```

### 4. Manual Clean Start 🧹
```bash
# Kill everything
pkill -f "next"

# Clean all caches
rm -rf .next .turbo node_modules/.cache

# Restart with more memory
pnpm dev
```

## Why This Happens

The "worker has exited" error occurs because:

1. **Turbopack Issues** (Next.js 16)
   - Turbopack workers crash under heavy load
   - Memory exhaustion
   - Known issue being fixed in future versions

2. **Memory Problems**
   - Too many API requests at once
   - Database connection pool exhaustion
   - Cache memory buildup

3. **Code Issues**
   - Uncaught promise rejections
   - Infinite loops in components
   - Memory leaks

## What Was Fixed

✅ **Updated `package.json`**:
- Added `--max-old-space-size=4096` to dev scripts
- Increased Node.js memory from 512MB to 4GB

✅ **Created Helper Scripts**:
- `scripts/fix-worker-crash.sh` - Quick fix script
- `scripts/dev-stable.sh` - Auto-restart on crash

## Recommended Setup

### For Development (Best Experience)
```bash
# Use webpack (slower but stable)
pnpm dev:webpack
```

### For Quick Iteration (May Crash)
```bash
# Use Turbopack (fast but crashes sometimes)
pnpm dev
```

### For Overnight Development
```bash
# Auto-restart on crashes
./scripts/dev-stable.sh
```

## Performance Tips

### 1. Reduce Memory Usage
- Close Chrome tabs
- Close Docker Desktop
- Close other IDEs
- Restart your Mac if needed

### 2. Optimize API Calls
In your frontend code, add debouncing:
```typescript
import { debounce } from 'lodash'

// Instead of calling API on every keystroke
const handleSearch = debounce((value: string) => {
  fetchData(value)
}, 300)
```

### 3. Monitor Memory
```bash
# In another terminal, watch memory usage
watch -n 1 'ps aux | grep "next" | grep -v grep'
```

### 4. Clear Cache Regularly
```bash
# Add to your workflow
pnpm dev:clean
```

## When to Use Each Mode

| Mode | Speed | Stability | Use When |
|------|-------|-----------|----------|
| `pnpm dev` | ⚡⚡⚡ Fast | ⚠️ May crash | Quick changes, small features |
| `pnpm dev:webpack` | 🐌 Slow | ✅ Very stable | Critical work, debugging |
| `./scripts/dev-stable.sh` | ⚡⚡⚡ Fast | 🔄 Auto-recover | Long sessions, overnight |

## Still Crashing?

### Check These:

1. **Supabase Connection**
   ```bash
   # Test connection
   curl https://vrrjoswzmlhkmmcfhicw.supabase.co/rest/v1/
   ```

2. **Environment Variables**
   ```bash
   # Check .env.local exists and has:
   cat .env.local | grep NEXT_PUBLIC_SUPABASE
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

4. **Disk Space**
   ```bash
   df -h
   # Make sure you have > 5GB free
   ```

### Nuclear Option (Last Resort)
```bash
# Complete reset
rm -rf node_modules .next .turbo pnpm-lock.yaml
pnpm install
pnpm dev:clean
```

## Prevention

### Add to `.vscode/settings.json`:
```json
{
  "files.watcherExclude": {
    "**/.next/**": true,
    "**/.turbo/**": true,
    "**/node_modules/**": true
  }
}
```

### Add to `.gitignore`:
```
.next/
.turbo/
node_modules/.cache/
.swc/
```

## Support

If issues persist after trying all solutions:

1. Switch to webpack permanently: `pnpm dev:webpack`
2. Check Next.js GitHub issues for similar reports
3. Consider downgrading to Next.js 15 if critical

## Summary

**Quick Fix**: Run `./scripts/fix-worker-crash.sh` then `pnpm dev:webpack`

**Long-term Solution**: Use `pnpm dev:webpack` for stable development

**The crashes are a known Turbopack issue in Next.js 16 and will improve in future updates.**

# 🔥 HMR Quick Fix - Cheat Sheet

## 🚨 HMR Not Working? Try These (In Order):

### 1️⃣ Quick Restart (30 seconds)
```bash
# Stop server (Ctrl+C), then:
pnpm dev:clean
```

### 2️⃣ Hard Browser Refresh
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

### 3️⃣ Clear Everything (1 minute)
```bash
pnpm clean
pnpm dev
```

### 4️⃣ Fix File Watchers - macOS Only (2 minutes)
```bash
pnpm fix:hmr
# Enter password when prompted
```

### 5️⃣ Nuclear Option (5 minutes)
```bash
pnpm clean:all
pnpm install
pnpm dev
```

## 💡 Pro Tips

### Disable Browser Cache
1. Open DevTools (F12)
2. Network tab
3. Check "Disable cache"
4. Keep DevTools open

### Use Turbopack (Faster)
```bash
pnpm dev:turbo
```

### Check for Errors
- Browser Console (F12)
- Terminal output
- Look for red error messages

## 🎯 Common Issues

| Issue | Solution |
|-------|----------|
| Changes not showing | `pnpm dev:clean` |
| Full page reload | Check for syntax errors |
| Slow HMR (>2s) | Use dynamic imports |
| Works then stops | Restart dev server |
| Specific file not working | Check import paths |

## 📋 Available Scripts

```bash
pnpm dev              # Normal dev server
pnpm dev:turbo        # Turbopack (faster)
pnpm dev:clean        # Clear cache + start
pnpm dev:verbose      # Debug mode
pnpm clean            # Clear cache only
pnpm clean:all        # Nuclear option
pnpm fix:hmr          # Fix file watchers (macOS)
```

## 🆘 Still Not Working?

Read full guide: `HMR_FIX_GUIDE.md`

---

**Quick Command:**
```bash
# One-liner to fix most issues
rm -rf .next .turbo && pnpm dev
```

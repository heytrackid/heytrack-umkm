# HMR Fix Scripts

Scripts untuk memperbaiki HMR errors di Next.js 16 dengan Turbopack.

## 🚀 Quick Start

### Master Script (Recommended)
```bash
./scripts/fix-all-hmr-issues.sh
```
Menjalankan semua fixes secara otomatis.

## 📋 Available Scripts

### 1. fix-all-hmr-issues.sh
**Master script yang menjalankan semua fixes**
```bash
./scripts/fix-all-hmr-issues.sh
```
- Adds React namespace import
- Fixes duplicate imports
- Fixes React references
- Verifies all fixes

### 2. fix-hmr-imports.sh
**Menambahkan `import * as React from 'react'` ke semua 'use client' files**
```bash
./scripts/fix-hmr-imports.sh
```

### 3. fix-all-react-imports.sh
**Membersihkan duplicate React imports**
```bash
./scripts/fix-all-react-imports.sh
```
Handles:
- `import React from 'react'` duplicates
- `import React, { ... }` duplicates

### 4. fix-react-references.sh
**Menambahkan React import ke files yang menggunakan React.* tapi tidak punya import**
```bash
./scripts/fix-react-references.sh
```

### 5. fix-duplicate-react-imports.sh
**Legacy script untuk fix duplicate imports**
```bash
./scripts/fix-duplicate-react-imports.sh
```

### 6. remove-react-memo-sidebar.sh
**Menghapus React.memo dari sidebar components**
```bash
./scripts/remove-react-memo-sidebar.sh
```
⚠️ **IMPORTANT:** React.memo causes HMR errors with Turbopack!

## 🔄 Typical Workflow

### For New Project Setup:
```bash
# 1. Run master script
./scripts/fix-all-hmr-issues.sh

# 2. Remove React.memo
./scripts/remove-react-memo-sidebar.sh

# 3. Clear cache
rm -rf .next

# 4. Start dev server
pnpm dev
```

### For Ongoing Development:
```bash
# When adding new files
./scripts/fix-hmr-imports.sh

# If duplicate imports appear
./scripts/fix-all-react-imports.sh

# If React reference errors
./scripts/fix-react-references.sh
```

## 📖 What Each Script Does

### fix-hmr-imports.sh
- Finds all 'use client' files
- Checks if they import from 'react'
- Adds `import * as React from 'react'` if missing
- Prevents "module factory not available" errors

### fix-all-react-imports.sh
- Pattern 1: Removes `import React from 'react'` duplicates
- Pattern 2: Converts `import React, { ... }` to `import { ... }`
- Keeps only `import * as React from 'react'`

### fix-react-references.sh
- Finds files using `React.memo`, `React.FC`, `React.FormEvent`, etc
- Adds React import if missing
- Prevents "React is not defined" errors

### remove-react-memo-sidebar.sh
- Removes `React.memo()` from sidebar components
- Removes `displayName` properties
- Uses simple exports instead
- **Critical for Turbopack HMR stability**

## ⚠️ Important Notes

### React.memo Issue
React.memo causes HMR errors in Turbopack:
- ❌ `export default React.memo(Component)`
- ✅ `export default Component`

### Always Keep
- ✅ `import * as React from 'react'` in 'use client' files
- ✅ Named imports: `import { useState } from 'react'`

### After Running Scripts
```bash
# Always clear cache and restart
rm -rf .next
pnpm dev
```

## 🐛 Troubleshooting

### Script doesn't fix all files?
```bash
# Run multiple times if needed
./scripts/fix-all-hmr-issues.sh
./scripts/fix-all-hmr-issues.sh
```

### Still getting errors?
```bash
# Nuclear option
rm -rf .next node_modules
pnpm install
./scripts/fix-all-hmr-issues.sh
./scripts/remove-react-memo-sidebar.sh
pnpm dev
```

### Permission denied?
```bash
chmod +x scripts/*.sh
```

## 📚 Documentation

- **Quick Fix:** `../QUICK_FIX_HMR.md`
- **Final Solution:** `../HMR_FINAL_SOLUTION.md`
- **Root Cause:** `../docs/HMR_ERROR_ROOT_CAUSE.md`
- **Complete Guide:** `../HMR_FIX_COMPLETE.md`

## 🎯 Success Indicators

After running scripts, you should see:
- ✅ No "module factory" errors
- ✅ No "React is not defined" errors
- ✅ HMR updates work automatically
- ✅ Fast refresh indicator appears
- ✅ No manual page refresh needed

## 💡 Tips

1. Run scripts before committing code
2. Add to pre-commit hooks if needed
3. Run after pulling changes from team
4. Clear .next folder if issues persist
5. Restart dev server after running scripts

---

**Maintained for:** Next.js 16.0.0 (Turbopack)  
**Last Updated:** $(date)

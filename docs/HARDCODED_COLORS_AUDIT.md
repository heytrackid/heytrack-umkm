# Hardcoded Colors Audit Report

## Summary

Audit menemukan beberapa kategori hardcoded colors yang masih ada di codebase:

### 1. ❌ Tailwind Gray Colors (CRITICAL)
**Files affected:** ~15 files
**Pattern:** `text-gray-600`, `bg-gray-100`, `border-gray-200`, dll.

**Locations:**
- `src/modules/orders/constants.ts` - Order status colors
- `src/modules/orders/utils/helpers.ts` - Helper functions
- `src/modules/orders/components/OrdersPage/*.tsx` - Progress bars
- `src/modules/recipes/constants.ts` - Recipe difficulty colors
- `src/modules/inventory/components/*.tsx` - Stock visualizations

**Fix:** Replace dengan CSS variables
```tsx
// ❌ Before
color: 'text-gray-600 dark:text-gray-400'
bgColor: 'bg-gray-100 dark:bg-gray-800'

// ✅ After
color: 'text-muted-foreground'
bgColor: 'bg-secondary'
```

### 2. ❌ Hex Colors (MEDIUM)
**Files affected:** ~8 files
**Pattern:** `#3b82f6`, `#10b981`, `#ef4444`, dll.

**Locations:**
- `src/modules/charts/components/*.tsx` - Chart colors (fallbacks)
- `src/lib/shared/theme.ts` - Theme color palette
- `src/lib/validations/api-validations.ts` - Theme settings schema
- `src/lib/performance/image-optimization.tsx` - Placeholder color

**Fix:** Use CSS variables or oklch format
```tsx
// ❌ Before
color: '#3b82f6'

// ✅ After
color: 'hsl(var(--primary))'
// or
color: 'oklch(0.6 0.2 250)'
```

### 3. ⚠️ text-white (NEEDS REVIEW)
**Files affected:** ~20 files
**Pattern:** `text-white` in gradients, badges, icons

**Locations:**
- Icon containers with gradient backgrounds
- Badge text on colored backgrounds
- Timeline elements
- Progress bars

**Context:** Most `text-white` usage is legitimate (text on colored backgrounds)

**Fix:** Review case-by-case
```tsx
// ✅ OK - text on colored background
<div className="bg-primary text-primary-foreground">

// ✅ OK - icon on gradient
<div className="bg-gradient-to-br from-blue-500 to-blue-600">
  <Icon className="text-white" />
</div>

// ❌ NOT OK - should use semantic color
<div className="text-white">Regular text</div>
```

### 4. ⚠️ bg-white (NEEDS REVIEW)
**Files affected:** ~10 files
**Pattern:** `bg-white dark:bg-gray-900`

**Fix:** Replace with `bg-card`
```tsx
// ❌ Before
<div className="bg-white dark:bg-gray-900 rounded-lg border">

// ✅ After
<div className="bg-card rounded-lg border border-border">
```

### 5. ⚠️ RGB/RGBA Colors (LOW)
**Files affected:** 2 files
**Pattern:** `rgb(0 0 0 / 0.1)`, `rgba(255, 255, 255, 0.5)`

**Locations:**
- `src/lib/shared/theme.ts` - Shadow definitions
- `src/lib/shared/theme.ts` - Color utilities

**Status:** These are in utility functions and theme definitions, acceptable for now.

## Priority Fixes

### High Priority (Do First)

1. **Order Status Colors** (`src/modules/orders/constants.ts`)
   - Replace all gray colors with semantic colors
   - Use `text-muted-foreground` and `bg-secondary`

2. **Recipe Constants** (`src/modules/recipes/constants.ts`)
   - Replace gray colors with semantic colors

3. **Chart Fallback Colors** (`src/modules/charts/components/*.tsx`)
   - Use CSS variables instead of hex fallbacks

### Medium Priority

4. **bg-white dark:bg-gray-900** patterns
   - Replace with `bg-card` throughout codebase

5. **Progress bars** with hardcoded `bg-gray-200`
   - Replace with `bg-muted` or `bg-secondary`

### Low Priority (Review Only)

6. **text-white** in icon containers
   - Most are OK, review for consistency

7. **Theme utility file** (`src/lib/shared/theme.ts`)
   - Keep as-is (utility functions need explicit colors)

## Automated Fix Script

Run the script to fix most issues automatically:

```bash
chmod +x scripts/fix-hardcoded-colors.sh
./scripts/fix-hardcoded-colors.sh
```

**⚠️ Warning:** Review all changes before committing!

## Manual Fixes Required

### 1. Order Constants
File: `src/modules/orders/constants.ts`

Replace status colors:
```typescript
// All status configs
color: 'text-muted-foreground'
bgColor: 'bg-secondary'

// Special cases (keep these)
READY: {
  color: 'text-orange-600'  // Keep - specific status color
  bgColor: 'bg-orange-100'  // Keep - specific status color
}
```

### 2. Chart Colors
Files: `src/modules/charts/components/*.tsx`

```typescript
// ❌ Before
color: CHART_COLORS.success[0] || '#10b981'

// ✅ After
color: CHART_COLORS.success[0] || 'hsl(var(--chart-1))'
```

### 3. Theme Validation
File: `src/lib/validations/api-validations.ts`

```typescript
// ❌ Before
primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6')

// ✅ After
primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('hsl(var(--primary))')
```

## Testing Checklist

After fixes, test:

- [ ] Light mode - all components visible
- [ ] Dark mode - all components visible
- [ ] Order status badges - correct colors
- [ ] Charts - correct colors
- [ ] Forms - correct input colors
- [ ] Cards - correct background colors
- [ ] Borders - visible in both modes
- [ ] Progress bars - correct colors
- [ ] Icons - visible on backgrounds

## Prevention

To prevent future hardcoded colors:

1. ✅ Steering rules added (`.kiro/steering/css-theming.md`)
2. ✅ Documentation created (`docs/CSS_VARIABLES_GUIDE.md`)
3. ✅ Themed components available (`src/components/ui/themed-elements.tsx`)
4. 🔄 TODO: Add ESLint rule to warn about hardcoded colors
5. 🔄 TODO: Add pre-commit hook to check for hardcoded colors

## ESLint Rule (TODO)

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "no-restricted-syntax": [
      "warn",
      {
        "selector": "Literal[value=/text-gray-[0-9]/]",
        "message": "Use semantic color classes (text-foreground, text-muted-foreground) instead of hardcoded gray colors"
      },
      {
        "selector": "Literal[value=/bg-gray-[0-9]/]",
        "message": "Use semantic color classes (bg-background, bg-card, bg-muted) instead of hardcoded gray colors"
      },
      {
        "selector": "Literal[value=/#[0-9a-fA-F]{3,6}/]",
        "message": "Use CSS variables or oklch format instead of hex colors"
      }
    ]
  }
}
```

## Conclusion

**Total files with hardcoded colors:** ~30 files
**Critical fixes needed:** ~15 files
**Estimated time:** 2-3 hours for complete cleanup

**Recommendation:** 
1. Run automated script first
2. Manually fix order constants and chart colors
3. Review and test thoroughly
4. Add ESLint rules to prevent future issues

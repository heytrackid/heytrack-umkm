# Fix Dynamic Imports - Action Plan

## Problem Summary

Banyak file menggunakan pattern **SALAH** untuk dynamic import named exports:

```tsx
// ❌ SALAH
const Component = dynamic(() => 
  import('./module').then(mod => ({ default: mod.Component }))
)

// ✅ BENAR
const Component = dynamic(() => 
  import('./module').then(mod => mod.Component)
)
```

## Files yang Perlu Diperbaiki

### 1. Settings Components
- `src/app/settings/components/tabs/SettingsTabs.tsx`
  - BusinessInfoSettings
  - RegionalSettings
- `src/app/settings/page.tsx`
  - SettingsTabs

### 2. Dashboard Components
- `src/app/dashboard/components/DashboardClient.tsx`
  - OnboardingWizard

### 3. Profit Page
- `src/app/profit/page.tsx`
  - ProductProfitabilityChart

### 4. Recipes Pages
- `src/app/recipes/[id]/edit/page.tsx`
  - RecipeFormPage
- `src/app/recipes/page.tsx`
  - EnhancedRecipesPage

### 5. Ingredients Page
- `src/app/ingredients/page.tsx`
  - EnhancedIngredientsPage
  - IngredientFormDialog
  - ImportDialog

### 6. Chart Components (Recharts)
- `src/components/ui/charts/area-chart.tsx`
  - Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
- `src/components/ui/charts/bar-chart.tsx`
  - Bar, BarChart, CartesianGrid

## Pattern to Fix

### Find and Replace Pattern:

**Find**: `.then(mod => ({ default: mod.COMPONENT_NAME }))`
**Replace**: `.then(mod => mod.COMPONENT_NAME)`

## Special Case: Recharts

Untuk Recharts, ini adalah **named exports** dari library, jadi pattern yang benar adalah:

```tsx
// ❌ SALAH
const Area = lazy(() => import('recharts').then(mod => ({ default: mod.Area })))

// ✅ BENAR
const Area = lazy(() => import('recharts').then(mod => mod.Area))
```

## Verification

Setelah fix, verify dengan:
1. TypeScript compilation: `pnpm type-check`
2. Build test: `pnpm build`
3. Runtime test: Load halaman yang menggunakan dynamic imports

## Next.js Documentation Reference

From: https://nextjs.org/docs/app/guides/lazy-loading#importing-named-exports

> To dynamically import a named export, you can return it from the Promise returned by import() function:
> 
> ```jsx
> const ClientComponent = dynamic(() =>
>   import('../components/hello').then((mod) => mod.Hello)
> )
> ```

**Key Point**: Return `mod.ComponentName` directly, NOT `{ default: mod.ComponentName }`

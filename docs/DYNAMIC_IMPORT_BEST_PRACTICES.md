# Dynamic Import Best Practices for HeyTrack

## Quick Reference

### ✅ Correct Pattern (Use This)

```typescript
import dynamic from 'next/dynamic'

const MyComponent = dynamic(
  () => import(/* webpackChunkName: "my-component" */ './MyComponent'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />
  }
)
```

### ❌ Avoid These Patterns

```typescript
// ❌ No chunk name - unstable HMR
const MyComponent = dynamic(() => import('./MyComponent'))

// ❌ Redundant .then() transformation
const MyComponent = dynamic(
  () => import('./MyComponent').then(mod => ({ default: mod.default }))
)

// ❌ No loading state
const MyComponent = dynamic(() => import('./MyComponent'), { ssr: false })
```

## Why This Matters

### The Problem
Without webpack magic comments, dynamic imports can fail after HMR updates with "missing module factory" errors. This happens because:

1. Webpack generates random chunk names
2. HMR updates invalidate module references
3. New chunks aren't found by the old references

### The Solution
Webpack magic comments provide stable chunk names that survive HMR updates.

## Chunk Naming Convention

Use descriptive, kebab-case names that reflect the component's purpose:

```typescript
// ✅ Good chunk names
/* webpackChunkName: "sidebar-navigation" */
/* webpackChunkName: "order-form" */
/* webpackChunkName: "hpp-calculator" */
/* webpackChunkName: "recipe-list" */

// ❌ Bad chunk names
/* webpackChunkName: "component1" */
/* webpackChunkName: "MyComponent" */
/* webpackChunkName: "comp" */
```

## Common Use Cases

### 1. Heavy Components (Charts, Tables)

```typescript
const HppChart = dynamic(
  () => import(/* webpackChunkName: "hpp-chart" */ '@/components/charts/HppChart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
)
```

### 2. Modal/Dialog Content

```typescript
const OrderFormDialog = dynamic(
  () => import(/* webpackChunkName: "order-form-dialog" */ './OrderFormDialog'),
  {
    ssr: false,
    loading: () => <DialogSkeleton />
  }
)
```

### 3. Mobile-Only Components

```typescript
const MobileBottomNav = dynamic(
  () => import(/* webpackChunkName: "mobile-nav" */ './MobileBottomNav'),
  {
    ssr: false,
    loading: () => <NavSkeleton />
  }
)
```

### 4. Feature Modules

```typescript
const AIRecipeGenerator = dynamic(
  () => import(/* webpackChunkName: "ai-recipe-generator" */ '@/modules/recipes/AIGenerator'),
  {
    ssr: false,
    loading: () => <GeneratorSkeleton />
  }
)
```

## Loading States

Always provide meaningful loading states:

```typescript
// ✅ Good - Matches component layout
loading: () => (
  <div className="h-64 w-full">
    <Skeleton className="h-full w-full" />
  </div>
)

// ❌ Bad - Generic spinner
loading: () => <Spinner />

// ❌ Bad - No loading state
// (omitted)
```

## SSR Considerations

### Client-Only Components
Use `ssr: false` for components that:
- Use browser APIs (window, document)
- Depend on client-side state
- Are heavy and not needed for initial render

```typescript
const ClientOnlyComponent = dynamic(
  () => import(/* webpackChunkName: "client-component" */ './ClientComponent'),
  { ssr: false }
)
```

### SSR-Compatible Components
Omit `ssr: false` for components that:
- Should be in initial HTML
- Are critical for SEO
- Don't use browser APIs

```typescript
const SSRComponent = dynamic(
  () => import(/* webpackChunkName: "ssr-component" */ './SSRComponent')
)
```

## Preloading

For better UX, preload components before they're needed:

```typescript
// Preload on hover
<button
  onMouseEnter={() => {
    import(/* webpackChunkName: "order-form" */ './OrderForm')
  }}
  onClick={() => setShowForm(true)}
>
  Create Order
</button>

// Preload on route change
useEffect(() => {
  router.prefetch('/orders')
  import(/* webpackChunkName: "order-list" */ './OrderList')
}, [router])
```

## Bundle Analysis

Check your chunk sizes regularly:

```bash
pnpm build:analyze
```

Look for:
- Chunks larger than 200KB (consider splitting further)
- Duplicate code across chunks (adjust cache groups)
- Unused chunks (remove unnecessary dynamic imports)

## Troubleshooting

### "Missing module factory" Error

**Symptoms:**
- Component fails to load after HMR update
- Console shows "missing module factory" error
- Full page refresh fixes it

**Solution:**
1. Add webpack magic comment with chunk name
2. Ensure chunk name is unique
3. Check webpack config has named module IDs in dev

### Chunk Not Loading

**Symptoms:**
- 404 error for chunk file
- Component never renders
- Loading state persists

**Solution:**
1. Check chunk name doesn't have special characters
2. Verify import path is correct
3. Check build output for chunk generation
4. Clear `.next` folder and rebuild

### Slow Loading

**Symptoms:**
- Long delay before component appears
- Poor user experience

**Solution:**
1. Implement preloading on hover/route change
2. Optimize component size (check bundle analyzer)
3. Consider splitting into smaller chunks
4. Add better loading states

## Testing

### Manual Testing
1. Start dev server: `pnpm dev`
2. Make changes to dynamically imported component
3. Save and verify HMR works
4. Check console for errors
5. Test loading states

### Production Testing
1. Build: `pnpm build`
2. Check build output for chunk names
3. Start: `pnpm start`
4. Test chunk loading in Network tab
5. Verify no 404s or errors

## Migration Guide

### Updating Existing Dynamic Imports

1. **Find all dynamic imports:**
   ```bash
   grep -r "dynamic(" src/
   ```

2. **Add chunk names:**
   ```typescript
   // Before
   const Component = dynamic(() => import('./Component'))
   
   // After
   const Component = dynamic(
     () => import(/* webpackChunkName: "component-name" */ './Component')
   )
   ```

3. **Add loading states:**
   ```typescript
   const Component = dynamic(
     () => import(/* webpackChunkName: "component-name" */ './Component'),
     {
       loading: () => <ComponentSkeleton />
     }
   )
   ```

4. **Test HMR:**
   - Edit the component
   - Verify it updates without errors

## Related Configuration

### Webpack Config (next.config.ts)

```typescript
webpack: (config, { dev }) => {
  if (dev) {
    // Stable module IDs for HMR
    config.optimization = {
      ...config.optimization,
      moduleIds: 'named',
      chunkIds: 'named'
    }
  }
  return config
}
```

### TypeScript Config

Ensure dynamic imports are supported:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

## Examples in Codebase

Good examples to reference:
- `src/components/layout/sidebar/LazySidebar.tsx` - Multiple dynamic imports
- `src/components/lazy/index.tsx` - Lazy loading utilities
- `src/components/layout/sidebar.tsx` - Parent component pattern

## Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Webpack Magic Comments](https://webpack.js.org/api/module-methods/#magic-comments)
- [Code Splitting Best Practices](https://web.dev/code-splitting-suspense/)

## Questions?

- Check `docs/SIDEBAR_HMR_FIX.md` for detailed technical explanation
- Review webpack configuration in `next.config.ts`
- Test with `pnpm dev` and monitor browser console

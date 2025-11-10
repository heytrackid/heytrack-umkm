# Export Strategy Guide

## Current Status

Codebase menggunakan **mixed exports**:
- Some components use `export const ComponentName`
- Some components use `export default ComponentName`
- Utilities and constants use named exports

## Target Strategy (Based on AGENTS.md)

### ✅ Use Default Exports For:

1. **React Components** (`.tsx` files)
```tsx
// ✅ CORRECT
function MyComponent() {
  return <div>...</div>
}

export default MyComponent
```

2. **Page Components** (Next.js pages)
```tsx
// ✅ CORRECT
function HomePage() {
  return <div>...</div>
}

export default HomePage
```

3. **Layout Components**
```tsx
// ✅ CORRECT
function DashboardLayout({ children }) {
  return <div>{children}</div>
}

export default DashboardLayout
```

### ✅ Use Named Exports For:

1. **Utilities & Helpers** (`.ts` files)
```ts
// ✅ CORRECT
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID').format(amount)
}
```

2. **Constants**
```ts
// ✅ CORRECT
export const API_URL = 'https://api.example.com'
export const MAX_ITEMS = 100
export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
}
```

3. **Types & Interfaces**
```ts
// ✅ CORRECT
export interface User {
  id: string
  name: string
}

export type OrderStatus = 'pending' | 'completed'
```

4. **Hooks**
```ts
// ✅ CORRECT
export function useAuth() {
  // hook logic
}

export function useOrders() {
  // hook logic
}
```

5. **Multiple Related Functions**
```ts
// ✅ CORRECT - when exporting multiple related functions
export function createOrder(data: OrderData) { }
export function updateOrder(id: string, data: OrderData) { }
export function deleteOrder(id: string) { }
```

## Migration Strategy

### Phase 1: Components (High Priority)

Convert all React components to default exports:

**Before:**
```tsx
export const MyComponent = () => {
  return <div>...</div>
}
```

**After:**
```tsx
function MyComponent() {
  return <div>...</div>
}

export default MyComponent
```

### Phase 2: Update Imports

Update all imports to use default imports:

**Before:**
```tsx
import { MyComponent } from './MyComponent'
```

**After:**
```tsx
import MyComponent from './MyComponent'
```

### Phase 3: Index Files

Update index.ts files to re-export defaults:

**Before:**
```ts
export { MyComponent } from './MyComponent'
export { OtherComponent } from './OtherComponent'
```

**After:**
```ts
export { default as MyComponent } from './MyComponent'
export { default as OtherComponent } from './OtherComponent'
```

## Why Default Exports for Components?

1. **Tree Shaking**: Better tree shaking with default exports
2. **Code Splitting**: Easier dynamic imports with `React.lazy()`
3. **Consistency**: Standard React convention
4. **Refactoring**: Easier to rename components
5. **Bundle Size**: Slightly smaller bundle size

## Why Named Exports for Utilities?

1. **Multiple Exports**: Can export multiple functions from one file
2. **Explicit Imports**: Clear what's being imported
3. **Auto-complete**: Better IDE support
4. **No Naming Conflicts**: Import with exact name

## Exceptions

### ❌ Don't Use Default Export For:

1. **Utility Files with Multiple Functions**
```ts
// ❌ WRONG
export default {
  calculateTotal,
  formatCurrency,
  validateEmail
}

// ✅ CORRECT
export function calculateTotal() { }
export function formatCurrency() { }
export function validateEmail() { }
```

2. **Constant Files**
```ts
// ❌ WRONG
export default {
  API_URL: '...',
  MAX_ITEMS: 100
}

// ✅ CORRECT
export const API_URL = '...'
export const MAX_ITEMS = 100
```

3. **Type-Only Files**
```ts
// ❌ WRONG
export default interface User { }

// ✅ CORRECT
export interface User { }
export type OrderStatus = '...'
```

## Current Files That Need Migration

### Components (Need Default Export):
- `src/modules/orders/components/OrdersPage/DashboardView.tsx`
- `src/modules/orders/components/OrdersPage/OrderFilters.tsx`
- `src/modules/orders/components/OrdersPage/StatsCards.tsx`
- `src/modules/orders/components/OrderForm/CustomerSection.tsx`
- `src/modules/orders/components/OrderForm/PaymentSection.tsx`
- `src/modules/orders/components/OrderForm/ItemsSection.tsx`
- `src/modules/orders/components/OrderForm/DeliverySection.tsx`
- `src/modules/orders/components/OrdersTableView.tsx`
- `src/modules/orders/components/OrderCard.tsx`
- `src/modules/orders/components/OrdersList.tsx`
- `src/modules/orders/components/OrderDetailView.tsx`
- And many more...

### Already Correct (Keep As Is):
- `src/modules/orders/constants.ts` - Named exports ✅
- `src/modules/orders/utils/helpers.ts` - Named exports ✅
- `src/modules/orders/types.ts` - Named exports ✅
- `src/hooks/**/*.ts` - Named exports ✅

## Automated Migration Script

See `scripts/convert-to-default-exports.sh` for automated conversion.

## Testing After Migration

1. ✅ Run `pnpm type-check` - Ensure no type errors
2. ✅ Run `pnpm lint` - Ensure no linting errors
3. ✅ Run `pnpm build` - Ensure build succeeds
4. ✅ Test all pages manually - Ensure no runtime errors
5. ✅ Check bundle size - Should be same or smaller

## References

- [React Docs - Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components)
- [Next.js Docs - Pages and Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)

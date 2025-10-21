# 🔄 Hooks Migration Guide

## Overview

Database hooks telah dikonsolidasi menjadi **single source of truth** di `useSupabase.ts`. File-file lama masih ada untuk backward compatibility tetapi akan dihapus di versi mendatang.

---

## ✅ New Unified API

### Import dari `useSupabase.ts`

```typescript
import {
  useSupabaseQuery,      // Generic query hook
  useSupabaseMutation,   // Generic mutation hook
  useSupabaseCRUD,       // Combined query + mutation
  useIngredients,        // Specific entity hooks
  useRecipes,
  useOrders,
  useCustomers,
  useFinancialRecords,
  useProductions,
  useRecipesWithIngredients,
  useOrdersWithItems,
  useHPPCalculations,
  useFinancialAnalytics,
  useSupabaseBulkOperations
} from '@/hooks/useSupabase'
```

---

## 📋 Migration Examples

### 1. Basic Query Migration

**❌ Old Way (useDatabase.ts):**
```typescript
import { useIngredients } from '@/hooks/useDatabase'

const { data, loading, error, refetch } = useIngredients({ realtime: true })
```

**✅ New Way (useSupabase.ts):**
```typescript
import { useIngredients } from '@/hooks/useSupabase'

const { data, loading, error, refetch } = useIngredients()
// Realtime is enabled by default
```

### 2. CRUD Operations Migration

**❌ Old Way (useSupabaseCRUD.ts):**
```typescript
import { useIngredients } from '@/hooks/useSupabaseCRUD'

const { data, loading, create, update, remove } = useIngredients()

await create({ name: 'Flour', unit: 'kg' })
await update('id-123', { price: 15000 })
await remove('id-123')
```

**✅ New Way (useSupabase.ts):**
```typescript
import { useIngredients } from '@/hooks/useSupabase'

const { data, loading, create, update, remove } = useIngredients()

// Same API!
await create({ name: 'Flour', unit: 'kg' })
await update('id-123', { price: 15000 })
await remove('id-123')
```

### 3. Optimized Queries Migration

**❌ Old Way (useOptimizedDatabase.ts):**
```typescript
import { useOptimizedIngredients } from '@/hooks/useOptimizedDatabase'

const { 
  data, 
  loading, 
  lowStockCount, 
  totalValue 
} = useOptimizedIngredients()
```

**✅ New Way (useSupabase.ts + useMemo):**
```typescript
import { useIngredients } from '@/hooks/useSupabase'
import { useMemo } from 'react'

const { data, loading } = useIngredients()

const { lowStockCount, totalValue } = useMemo(() => {
  const lowStockCount = data.filter(item => 
    item.current_stock <= (item.min_stock || 0)
  ).length
  
  const totalValue = data.reduce((sum, item) => 
    sum + ((item.current_stock || 0) * (item.price_per_unit || 0)), 0
  )
  
  return { lowStockCount, totalValue }
}, [data])
```

### 4. Generic Table Hook Migration

**❌ Old Way (useDatabase.ts):**
```typescript
import { useTable } from '@/hooks/useDatabase'

const { data, loading, insert, update, remove } = useTable('ingredients', {
  filter: { is_active: true },
  orderBy: { column: 'name' }
})
```

**✅ New Way (useSupabase.ts):**
```typescript
import { useSupabaseCRUD } from '@/hooks/useSupabase'

const { data, loading, create, update, remove } = useSupabaseCRUD('ingredients', {
  filter: { is_active: true },
  orderBy: { column: 'name' }
})
```

### 5. Complex Queries Migration

**❌ Old Way (useDatabase.ts):**
```typescript
import { useRecipesWithIngredients } from '@/hooks/useDatabase'

const { data, loading, error } = useRecipesWithIngredients()
```

**✅ New Way (useSupabase.ts):**
```typescript
import { useRecipesWithIngredients } from '@/hooks/useSupabase'

// Same API!
const { data, loading, error } = useRecipesWithIngredients()
```

### 6. Bulk Operations Migration

**❌ Old Way (useSupabaseCRUD.ts):**
```typescript
import { useSupabaseBulkOperations } from '@/hooks/useSupabaseCRUD'

const { bulkCreate, bulkDelete } = useSupabaseBulkOperations('ingredients')

await bulkCreate([
  { name: 'Flour', unit: 'kg' },
  { name: 'Sugar', unit: 'kg' }
])

await bulkDelete(['id-1', 'id-2', 'id-3'])
```

**✅ New Way (useSupabase.ts):**
```typescript
import { useSupabaseBulkOperations } from '@/hooks/useSupabase'

// Same API!
const { bulkCreate, bulkDelete } = useSupabaseBulkOperations('ingredients')

await bulkCreate([
  { name: 'Flour', unit: 'kg' },
  { name: 'Sugar', unit: 'kg' }
])

await bulkDelete(['id-1', 'id-2', 'id-3'])
```

---

## 🎯 Key Benefits

### 1. **Single Source of Truth**
- Semua database operations di satu tempat
- Konsisten API across the app
- Easier to maintain

### 2. **Better Performance**
- Realtime subscriptions by default
- Automatic cleanup
- Optimized re-renders

### 3. **Type Safety**
- Full TypeScript support
- Inferred types from database schema
- Better IDE autocomplete

### 4. **Simpler API**
- Less boilerplate
- Consistent naming
- Easier to learn

---

## 🗑️ Deprecated Files

These files are deprecated and will be removed in future versions:

- ❌ `src/hooks/useDatabase.ts`
- ❌ `src/hooks/useOptimizedDatabase.ts`
- ❌ `src/hooks/useSupabaseCRUD.ts` (merged into useSupabase.ts)
- ❌ `src/hooks/useSupabaseData.ts`

**Action Required:**
- Update imports to use `@/hooks/useSupabase`
- Test your components
- Remove old imports

---

## 📚 Advanced Usage

### Custom Query with Filters

```typescript
import { useSupabaseQuery } from '@/hooks/useSupabase'

const { data, loading } = useSupabaseQuery('orders', {
  filter: { status: 'PENDING' },
  orderBy: { column: 'created_at', ascending: false },
  limit: 50,
  realtime: true
})
```

### Mutation with Callbacks

```typescript
import { useSupabaseMutation } from '@/hooks/useSupabase'
import { toast } from 'sonner'

const { create, loading } = useSupabaseMutation('ingredients', {
  onSuccess: () => {
    toast.success('Ingredient created!')
  },
  onError: (error) => {
    toast.error(`Failed: ${error}`)
  }
})
```

### Combined CRUD with Initial Data

```typescript
import { useSupabaseCRUD } from '@/hooks/useSupabase'

const { data, loading, create, update, remove } = useSupabaseCRUD('ingredients', {
  initial: serverData, // SSR data
  refetchOnMount: false, // Don't refetch if we have initial data
  realtime: true
})
```

---

## 🚀 Migration Checklist

- [ ] Update all imports to use `@/hooks/useSupabase`
- [ ] Replace `useTable` with `useSupabaseCRUD`
- [ ] Replace `insert` with `create` (naming consistency)
- [ ] Test all CRUD operations
- [ ] Test realtime subscriptions
- [ ] Remove old hook imports
- [ ] Update tests if any
- [ ] Deploy and monitor

---

## 💡 Tips

1. **Start with one component at a time** - Don't migrate everything at once
2. **Test thoroughly** - Especially CRUD operations and realtime updates
3. **Use TypeScript** - Let the types guide you
4. **Check console** - Look for deprecation warnings
5. **Ask for help** - If migration is unclear, ask the team

---

## 📞 Need Help?

If you encounter issues during migration:
1. Check this guide first
2. Look at examples in the codebase
3. Ask in team chat
4. Create an issue if it's a bug

---

**Last Updated:** October 21, 2025

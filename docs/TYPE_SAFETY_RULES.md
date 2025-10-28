# Type Safety Rules - WAJIB DIIKUTI! 🔥

## ATURAN UTAMA

### ✅ SELALU Pakai Generated Types dari Supabase

```typescript
// ✅ BENAR - Pakai generated types
import type { Database } from '@/types/supabase-generated'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']
```

### ❌ JANGAN PERNAH Bikin Type Manual untuk Database Tables

```typescript
// ❌ SALAH - Bikin type manual
interface Customer {
  id: string
  name: string
  email: string
  // ... JANGAN KAYAK GINI!
}

// ❌ SALAH - Bikin type alias manual
type Customer = {
  id: string
  name: string
  // ... INI JUGA SALAH!
}
```

## Kapan Boleh Bikin Interface/Type Sendiri?

### ✅ BOLEH: Extended Types untuk UI/Logic

```typescript
// ✅ BOLEH - Extend untuk tambah relasi
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

// Extend untuk UI needs
interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
  }>
}
```

### ✅ BOLEH: Calculation Results / Response Types

```typescript
// ✅ BOLEH - Bukan table, tapi hasil kalkulasi
interface ProfitMetrics {
  totalRevenue: number
  totalCOGS: number
  grossProfit: number
  netProfit: number
}

// ✅ BOLEH - API response structure
interface DashboardStats {
  orders: number
  revenue: number
  customers: number
}
```

### ✅ BOLEH: External API Response

```typescript
// ✅ BOLEH - Response dari AI/external API
interface AIGeneratedRecipe {
  name: string
  ingredients: string[]
  instructions: string[]
}
```

### ❌ JANGAN: Duplicate Table Types

```typescript
// ❌ SALAH - Ini duplicate dari generated types
interface Order {
  id: string
  order_no: string
  customer_name: string
  // ... JANGAN!
}

// ✅ BENAR - Pakai generated
type Order = Database['public']['Tables']['orders']['Row']
```

## Pattern yang Benar

### 1. Import Generated Types

```typescript
import type { Database } from '@/types/supabase-generated'

// Extract table types
type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

// Extract enum types
type OrderStatus = Database['public']['Enums']['order_status']
```

### 2. Extend untuk UI Needs

```typescript
// Base type dari generated
type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']

// Extend untuk relasi
interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}
```

### 3. Helper Types untuk Reusability

```typescript
// Helper untuk extract types
export type TablesRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Usage
type Recipe = TablesRow<'recipes'>
type RecipeInsert = TablesInsert<'recipes'>
```

## Checklist Sebelum Commit

- [ ] Semua table types pakai `Database['public']['Tables']['...']`
- [ ] Tidak ada interface/type manual untuk database tables
- [ ] Extended types hanya untuk UI/logic needs
- [ ] Import dari `@/types/supabase-generated`
- [ ] Tidak ada duplicate type definitions

## Cara Regenerate Types

Kalau ada perubahan di database schema:

```bash
# Generate types dari Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase-generated.ts

# Atau dari local
npx supabase gen types typescript --local > src/types/supabase-generated.ts
```

## Kenapa Ini Penting?

1. **Single Source of Truth** - Schema database adalah satu-satunya sumber kebenaran
2. **Type Safety** - TypeScript akan error kalau ada mismatch dengan database
3. **Auto-sync** - Perubahan schema langsung reflect di types
4. **No Drift** - Tidak ada perbedaan antara code dan database
5. **Maintainability** - Gampang maintain, tidak perlu update manual

## Common Mistakes

### ❌ Mistake 1: Manual Type untuk Table

```typescript
// ❌ SALAH
interface Recipe {
  id: string
  name: string
}

// ✅ BENAR
type Recipe = Database['public']['Tables']['recipes']['Row']
```

### ❌ Mistake 2: Partial Manual Type

```typescript
// ❌ SALAH - Ambil sebagian field manual
type RecipeBasic = {
  id: string
  name: string
}

// ✅ BENAR - Pakai Pick kalau perlu subset
type RecipeBasic = Pick<
  Database['public']['Tables']['recipes']['Row'],
  'id' | 'name'
>
```

### ❌ Mistake 3: Hardcode Enum Values

```typescript
// ❌ SALAH
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED'

// ✅ BENAR
type OrderStatus = Database['public']['Enums']['order_status']
```

## Enforcement

Kalau ketemu code yang bikin type manual untuk database tables:

1. **STOP** - Jangan merge PR
2. **FIX** - Ganti dengan generated types
3. **REVIEW** - Pastikan tidak ada duplicate lainnya
4. **EDUCATE** - Kasih tau team member tentang aturan ini

---

**INGAT: GENERATED TYPES ADALAH SATU-SATUNYA SUMBER KEBENARAN!**

Kalau ada yang bikin type manual untuk database tables, itu adalah **CODE SMELL** dan harus diperbaiki immediately.

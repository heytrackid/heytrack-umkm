# 📚 Single Source of Truth - Quick Reference

**Panduan cepat untuk developer:** Dimana harus import apa

---

## 🗄️ Database & Supabase

### ✅ Client Creation

```typescript
// ✅ CLIENT-SIDE (React Components, Client Components)
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

// ✅ SERVER-SIDE (API Routes, Server Components, Server Actions)
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()

// ❌ JANGAN GUNAKAN
import { supabase } from '@/lib/supabase' // DEPRECATED
import { useSupabaseClient } from '@/hooks/useSupabaseClient' // DEPRECATED
```

### ✅ Database Hooks

```typescript
// ✅ GUNAKAN INI
import {
  useSupabaseQuery,      // Query dengan realtime
  useSupabaseMutation,   // Create, update, delete
  useSupabaseCRUD,       // Combined CRUD
  useIngredients,        // Convenience hook
  useRecipes,            // Convenience hook
  useOrders,             // Convenience hook
  useCustomers,          // Convenience hook
} from '@/hooks/useSupabase'

// ❌ JANGAN GUNAKAN
import { useRealtimeData } from '@/hooks/useSupabaseData' // DEPRECATED
import { useCustomers } from '@/hooks/useSupabaseData' // DEPRECATED
```

### ✅ Database Helpers

```typescript
// ✅ UNTUK HELPER FUNCTIONS (coming soon after refactor)
import { dbService } from '@/lib/db-helpers'
import { subscribeToTable } from '@/lib/realtime-helpers'

// ❌ JANGAN GUNAKAN
import { dbService } from '@/lib/supabase' // DEPRECATED
```

---

## 📝 Type Definitions

### ✅ Core Types

```typescript
// ✅ GUNAKAN INI - Single source of truth
import {
  // Database types
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  
  // Entity types
  Recipe,
  RecipeWithIngredients,
  Order,
  OrderWithItems,
  Ingredient,
  Customer,
  Supplier,
  
  // HPP types
  HPPSnapshot,
  HPPAlert,
  HPPComparison,
  CostBreakdown,
  
  // Enums
  OrderStatus,
  PaymentMethod,
  UserRole,
} from '@/types'

// ❌ JANGAN DEFINE LOCAL INTERFACES
// ❌ interface Recipe { ... }  // JANGAN!
// ❌ interface Order { ... }   // JANGAN!
```

### ✅ Extending Types

```typescript
// ✅ OK untuk extend base types
import { Recipe } from '@/types'

interface RecipeWithCalculations extends Recipe {
  hpp: number
  margin: number
  profitPercentage: number
}

// ✅ OK untuk Pick/Omit
type RecipeFormData = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
type RecipeSummary = Pick<Recipe, 'id' | 'name' | 'selling_price'>
```

---

## 🎨 UI & Responsive

### ✅ Responsive Hooks

```typescript
// ✅ GUNAKAN INI
import {
  useResponsive,    // Main hook
  useMediaQuery,    // Custom media queries
  useScreenSize,    // Get screen dimensions
  useOrientation,   // Portrait/landscape
  useTouchDevice,   // Touch detection
} from '@/hooks/useResponsive'

// Usage
const { isMobile, isTablet, isDesktop, width } = useResponsive()

// ❌ JANGAN GUNAKAN
import { useMobile } from '@/hooks/use-mobile' // DEPRECATED
```

### ✅ Breakpoints

```typescript
// ✅ GUNAKAN INI
import { BREAKPOINTS } from '@/hooks/useResponsive'

// BREAKPOINTS = {
//   sm: 640,
//   md: 768,
//   lg: 1024,
//   xl: 1280,
//   '2xl': 1536,
// }
```

---

## ✅ Validation & Schemas

### ✅ Zod Schemas

```typescript
// ✅ API VALIDATION SCHEMAS
import {
  PaginationQuerySchema,
  DateRangeQuerySchema,
  IdParamSchema,
  OrderFormSchema,
  CustomerFormSchema,
  IngredientFormSchema,
  RecipeFormSchema,
} from '@/lib/validations/api-validations'

// ✅ DATABASE VALIDATION SCHEMAS
import {
  OrderInsertSchema,
  OrderUpdateSchema,
  CustomerInsertSchema,
  IngredientInsertSchema,
  RecipeInsertSchema,
} from '@/lib/validations/database-validations'

// ✅ VALIDATION HELPERS
import {
  validateInput,
  sanitizeSQL,
} from '@/lib/validations'

// ❌ JANGAN IMPORT DARI
import { PaginationSchema } from '@/lib/api-validation' // DEPRECATED
```

### ✅ Validation Middleware

```typescript
// ✅ GUNAKAN INI (after refactor)
import {
  withValidation,
  withQueryValidation,
  withRateLimit,
  withAuth,
} from '@/lib/api-middleware'

// ❌ SEMENTARA MASIH BISA DARI
import { withValidation } from '@/lib/api-validation' // Will be moved
```

---

## 🔧 Utilities

### ✅ Currency & Formatting

```typescript
// ✅ GUNAKAN INI
import {
  formatCurrency,
  parseCurrency,
  formatNumber,
  formatDate,
} from '@/lib/currency'
```

### ✅ Error Handling

```typescript
// ✅ CLIENT-SIDE ERRORS
import { handleClientError } from '@/lib/client-error-handler'

// ✅ SERVER-SIDE ERRORS
import { handleServerError } from '@/lib/server-error-handler'

// ✅ ERROR TYPES
import { AppError, ValidationError } from '@/types/errors'
```

### ✅ Logging

```typescript
// ✅ GUNAKAN INI
import {
  apiLogger,    // For API routes
  dbLogger,     // For database operations
  uiLogger,     // For UI components
} from '@/lib/logger'

// Usage
apiLogger.info('Processing request', { userId, action })
dbLogger.error({ err }, 'Database query failed')
uiLogger.debug('Component rendered', { props })
```

---

## 📊 HPP & Analytics

### ✅ HPP Calculation

```typescript
// ✅ GUNAKAN INI
import {
  calculateHPP,
  calculateRecipeHPP,
  HPPCalculator,
} from '@/lib/hpp-calculator'

// ✅ HPP HOOKS
import {
  useHPPAlerts,
  useHPPComparison,
  useHPPExport,
} from '@/hooks/api/useHPPAlerts'
```

### ✅ HPP Types

```typescript
// ✅ GUNAKAN INI
import {
  HPPSnapshot,
  HPPAlert,
  HPPComparison,
  HPPRecommendation,
  CostBreakdown,
  TimePeriod,
} from '@/types/hpp-tracking'
```

---

## 🎯 Best Practices

### ✅ DO

```typescript
// ✅ Import from single source
import { Recipe, Order } from '@/types'

// ✅ Use barrel exports
import { useSupabase, useResponsive } from '@/hooks'

// ✅ Use type-safe queries
const { data, loading } = useSupabaseQuery('recipes', {
  filter: { is_active: true },
  orderBy: { column: 'name' }
})

// ✅ Extend types when needed
interface RecipeWithHPP extends Recipe {
  hpp: number
}
```

### ❌ DON'T

```typescript
// ❌ Don't define local interfaces for DB entities
interface Recipe {
  id: string
  name: string
}

// ❌ Don't create duplicate Supabase clients
const supabase = createClient(url, key)

// ❌ Don't use deprecated hooks
import { useMobile } from '@/hooks/use-mobile'

// ❌ Don't import from deprecated files
import { useCustomers } from '@/hooks/useSupabaseData'
```

---

## 🗺️ Import Map

### Quick Reference Table

| What You Need | Import From |
|---------------|-------------|
| Supabase Client (Browser) | `@/utils/supabase/client` |
| Supabase Client (Server) | `@/utils/supabase/server` |
| Database Hooks | `@/hooks/useSupabase` |
| Types | `@/types` |
| Responsive Hooks | `@/hooks/useResponsive` |
| Validation Schemas | `@/lib/validations/api-validations` |
| DB Schemas | `@/lib/validations/database-validations` |
| Currency Utils | `@/lib/currency` |
| Error Handling | `@/lib/client-error-handler` or `@/lib/server-error-handler` |
| Logging | `@/lib/logger` |
| HPP Calculator | `@/lib/hpp-calculator` |
| HPP Hooks | `@/hooks/api/useHPPAlerts` |

---

## 🚫 Deprecated Files

**JANGAN IMPORT DARI FILE INI:**

- ❌ `src/hooks/useSupabaseClient.ts` → Use `@/utils/supabase/client`
- ❌ `src/hooks/useSupabaseData.ts` → Use `@/hooks/useSupabase`
- ❌ `src/hooks/use-mobile.ts` → Use `@/hooks/useResponsive`
- ❌ `src/lib/supabase.ts` (partial) → Use `@/utils/supabase/*`
- ❌ `src/lib/api-validation.ts` (schemas) → Use `@/lib/validations/*`

---

## 📖 Additional Resources

- **Full Audit Report:** `DUPLIKASI_AUDIT_REPORT.md`
- **Action Plan:** `DUPLIKASI_ACTION_PLAN.md`
- **Migration Guide:** `MIGRATION_GUIDE.md` (coming soon)
- **Type System Docs:** `src/types/README.md`
- **Hooks Docs:** `src/hooks/README.md`

---

## 💡 Tips

1. **Always check this guide** before creating new files
2. **Search existing code** before defining new types
3. **Use barrel exports** (`@/hooks`, `@/types`) for cleaner imports
4. **Follow the single source of truth** principle
5. **Update this guide** when adding new patterns

---

## 🆘 Need Help?

If you're unsure where to import something:

1. Check this guide first
2. Search in `src/types/index.ts`
3. Search in `src/hooks/index.ts`
4. Ask the team
5. Update this guide if you find something missing


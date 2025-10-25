# 🗺️ Visual Map: Duplikasi Codebase

**Peta visual untuk memahami struktur duplikasi**

---

## 🔴 Problem: Current State (Duplikasi)

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENTS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ src/utils/supabase/client.ts                           │
│  ❌ src/utils/supabase/server.ts                           │
│  ❌ src/lib/supabase.ts                                    │
│  ❌ src/hooks/useSupabaseClient.ts                         │
│                                                             │
│  → 4 different ways to create client!                      │
│  → Confusion for developers                                │
│  → Maintenance nightmare                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TYPE DEFINITIONS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  interface Recipe {                                         │
│    ❌ src/types/index.ts                                   │
│    ❌ src/lib/data-synchronization/types.ts                │
│    ❌ src/modules/recipes/types/index.ts                   │
│    ❌ src/modules/recipes/utils.ts                         │
│    ❌ src/services/excel-export-lazy.service.ts            │
│    ❌ src/lib/automation/hpp-automation.ts                 │
│  }                                                          │
│                                                             │
│  interface Order {                                          │
│    ❌ src/types/orders.ts                                  │
│    ❌ src/lib/data-synchronization/types.ts                │
│    ❌ src/services/production/ProductionDataIntegration.ts │
│    ❌ src/services/excel-export-lazy.service.ts            │
│    ❌ src/lib/whatsapp-service.ts                          │
│  }                                                          │
│                                                             │
│  → 20+ duplicate interfaces!                               │
│  → Type conflicts possible                                 │
│  → Hard to maintain                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATABASE HOOKS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ src/hooks/useSupabase.ts                               │
│     - useSupabaseQuery()                                   │
│     - useSupabaseMutation()                                │
│     - useIngredients()                                     │
│     - useRecipes()                                         │
│                                                             │
│  ❌ src/hooks/useSupabaseData.ts (DEPRECATED)              │
│     - useRealtimeData()                                    │
│     - useIngredients()  ← DUPLICATE!                       │
│     - useRecipes()      ← DUPLICATE!                       │
│                                                             │
│  → 2 different implementations!                            │
│  → Which one to use?                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RESPONSIVE HOOKS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ src/hooks/useResponsive.ts                             │
│     - useResponsive()                                      │
│     - useMobile()                                          │
│     - useMediaQuery()                                      │
│                                                             │
│  ❌ src/hooks/use-mobile.ts                                │
│     - useMobile()  ← DUPLICATE!                            │
│                                                             │
│  → Same functionality, different files!                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ZOD SCHEMAS                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ src/lib/validations/api-validations.ts                 │
│     - PaginationQuerySchema                                │
│     - DateRangeQuerySchema                                 │
│     - IdParamSchema                                        │
│                                                             │
│  ❌ src/lib/api-validation.ts                              │
│     - PaginationSchema      ← DUPLICATE!                   │
│     - DateRangeSchema       ← DUPLICATE!                   │
│     - IdParamSchema         ← DUPLICATE!                   │
│                                                             │
│  → 10+ duplicate schemas!                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🟢 Solution: Target State (Single Source)

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENTS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ src/utils/supabase/                                    │
│     ├── client.ts    → For browser/client components      │
│     └── server.ts    → For API routes/server components   │
│                                                             │
│  ✅ src/lib/                                               │
│     ├── db-helpers.ts      → Database helper functions    │
│     └── realtime-helpers.ts → Realtime subscriptions      │
│                                                             │
│  → Clear separation of concerns                            │
│  → Easy to understand                                      │
│  → Single source of truth                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TYPE DEFINITIONS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ src/types/                                             │
│     ├── index.ts          → Main exports                  │
│     ├── recipes.ts        → Recipe types                  │
│     ├── orders.ts         → Order types                   │
│     ├── inventory.ts      → Ingredient types              │
│     ├── customers.ts      → Customer types                │
│     └── hpp-tracking.ts   → HPP types                     │
│                                                             │
│  All other files import from @/types                       │
│                                                             │
│  → Single source of truth                                  │
│  → No type conflicts                                       │
│  → Easy to maintain                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATABASE HOOKS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ src/hooks/useSupabase.ts                               │
│     ├── useSupabaseQuery()    → Query with realtime       │
│     ├── useSupabaseMutation() → Create/Update/Delete      │
│     ├── useSupabaseCRUD()     → Combined CRUD             │
│     ├── useIngredients()      → Convenience hook          │
│     ├── useRecipes()          → Convenience hook          │
│     ├── useOrders()           → Convenience hook          │
│     └── useCustomers()        → Convenience hook          │
│                                                             │
│  → One unified hook system                                 │
│  → Consistent API                                          │
│  → Well documented                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RESPONSIVE HOOKS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ src/hooks/useResponsive.ts                             │
│     ├── useResponsive()   → Main hook                     │
│     ├── useMediaQuery()   → Custom queries                │
│     ├── useScreenSize()   → Screen dimensions             │
│     ├── useOrientation()  → Portrait/landscape            │
│     └── useTouchDevice()  → Touch detection               │
│                                                             │
│  → Comprehensive solution                                  │
│  → All responsive needs covered                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ZOD SCHEMAS                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ src/lib/validations/                                   │
│     ├── api-validations.ts      → API schemas             │
│     ├── database-validations.ts → DB schemas              │
│     └── common.ts               → Shared schemas          │
│                                                             │
│  ✅ src/lib/api-middleware.ts                              │
│     ├── withValidation()   → Validation middleware        │
│     ├── withAuth()         → Auth middleware              │
│     └── withRateLimit()    → Rate limit middleware        │
│                                                             │
│  → Clear separation                                        │
│  → No duplicates                                           │
│  → Easy to find                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Import Flow Diagram

### ❌ Before (Confusing)

```
Component A
    ↓
    ├─→ @/lib/supabase
    ├─→ @/hooks/useSupabaseClient
    └─→ @/utils/supabase/client
         ↓
    Which one to use? 🤔

Component B
    ↓
    ├─→ local interface Recipe { ... }
    ├─→ @/types (Recipe)
    └─→ @/lib/data-sync/types (Recipe)
         ↓
    Type conflicts! ⚠️
```

### ✅ After (Clear)

```
Component A
    ↓
    └─→ @/utils/supabase/client
         ↓
    Clear! ✅

Component B
    ↓
    └─→ @/types (Recipe)
         ↓
    Single source! ✅

Component C
    ↓
    └─→ @/hooks/useSupabase
         ↓
    Unified! ✅
```

---

## 🎯 Decision Tree

```
Need Supabase Client?
    ├─ Client-side? → @/utils/supabase/client
    └─ Server-side? → @/utils/supabase/server

Need Types?
    └─ Always → @/types

Need Database Hook?
    └─ Always → @/hooks/useSupabase

Need Responsive Hook?
    └─ Always → @/hooks/useResponsive

Need Validation Schema?
    ├─ API validation? → @/lib/validations/api-validations
    └─ DB validation?  → @/lib/validations/database-validations
```

---

## 📈 Impact Visualization

```
BEFORE                          AFTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duplicate Files: 5              Duplicate Files: 0
████████████████████            ░░░░░░░░░░░░░░░░░░░░

Duplicate Types: 20+            Duplicate Types: 0
████████████████████            ░░░░░░░░░░░░░░░░░░░░
████████████████████
████████████████████
████████████████████

Maintenance: High               Maintenance: Low
████████████████████            ████░░░░░░░░░░░░░░░░

Type Safety: 80%                Type Safety: 100%
████████████████░░░░            ████████████████████

Bundle Size: 100%               Bundle Size: 96%
████████████████████            ███████████████████░

Developer Confusion: High       Developer Confusion: None
████████████████████            ░░░░░░░░░░░░░░░░░░░░
```

---

## 🗂️ File Structure Comparison

### ❌ Before (Scattered)

```
src/
├── hooks/
│   ├── useSupabaseClient.ts    ← Duplicate
│   ├── useSupabaseData.ts      ← Duplicate
│   ├── useSupabase.ts          ← Which one?
│   ├── use-mobile.ts           ← Duplicate
│   └── useResponsive.ts        ← Which one?
├── lib/
│   ├── supabase.ts             ← Duplicate
│   ├── api-validation.ts       ← Duplicate schemas
│   └── validations/
│       └── api-validations.ts  ← Original
└── types/
    └── index.ts                ← But types everywhere!
```

### ✅ After (Organized)

```
src/
├── utils/
│   └── supabase/
│       ├── client.ts           ← Client-side only
│       └── server.ts           ← Server-side only
├── hooks/
│   ├── useSupabase.ts          ← Single source
│   └── useResponsive.ts        ← Single source
├── lib/
│   ├── db-helpers.ts           ← Extracted helpers
│   ├── realtime-helpers.ts     ← Extracted helpers
│   ├── api-middleware.ts       ← Middleware only
│   └── validations/
│       ├── api-validations.ts  ← API schemas
│       └── database-validations.ts ← DB schemas
└── types/
    ├── index.ts                ← Main exports
    ├── recipes.ts              ← Recipe types
    ├── orders.ts               ← Order types
    └── ...                     ← Other types
```

---

## 🎯 Quick Reference

| Need | Import From | Status |
|------|-------------|--------|
| Supabase (Client) | `@/utils/supabase/client` | ✅ |
| Supabase (Server) | `@/utils/supabase/server` | ✅ |
| Database Hooks | `@/hooks/useSupabase` | ✅ |
| Types | `@/types` | ✅ |
| Responsive | `@/hooks/useResponsive` | ✅ |
| Validation | `@/lib/validations/*` | ✅ |

---

## 💡 Remember

```
┌─────────────────────────────────────────┐
│  ONE SOURCE TO RULE THEM ALL            │
│                                         │
│  ✅ One place for each thing           │
│  ✅ Clear import paths                 │
│  ✅ No confusion                       │
│  ✅ Easy maintenance                   │
│  ✅ Better DX                          │
└─────────────────────────────────────────┘
```


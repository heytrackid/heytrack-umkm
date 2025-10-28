# Operational Costs UI/UX Improvements

## Current Issues

1. **Struktur tidak konsisten**: Tidak menggunakan pattern yang sama dengan ingredients/recipes
2. **Hook terlalu kompleks**: Semua logic ada di satu hook yang besar
3. **Tidak ada empty state yang baik**: Empty state kurang informatif
4. **Tidak ada detail page**: Semua dalam list/form saja
5. **Toast library inconsistent**: Menggunakan react-hot-toast, harusnya use-toast
6. **Loading state kurang optimal**: Skeleton tidak konsisten
7. **Mobile UX kurang baik**: Layout mobile bisa lebih baik

## Proposed Improvements

### 1. Simplified Page Structure
```
/operational-costs              → List semua biaya operasional
/operational-costs/new          → Form tambah biaya baru
/operational-costs/[id]         → Detail biaya (optional)
/operational-costs/[id]/edit    → Edit biaya
```

### 2. Component Structure (Consistent with Ingredients/Recipes)
```
src/components/operational-costs/
├── EnhancedOperationalCostsPage.tsx  → Main list component
├── OperationalCostForm.tsx           → Form component
├── OperationalCostStats.tsx          → Stats cards
├── MobileOperationalCostCard.tsx     → Mobile card
├── EnhancedEmptyState.tsx            → Empty state
└── index.ts                          → Barrel export
```

### 3. Key Improvements

#### Better Data Structure
- Use Supabase types directly
- Consistent with database schema
- Type-safe operations

#### Improved UX
- ✅ Breadcrumb navigation
- ✅ Better empty state with guidance
- ✅ Stats cards showing: Total costs, Fixed costs, Variable costs, Monthly total
- ✅ Search & filter by category
- ✅ Mobile-optimized cards
- ✅ Quick actions (edit, delete, duplicate)

#### Better Logic
- Use `useSupabaseCRUD` hook for consistency
- Separate business logic from UI
- Better error handling
- Consistent toast notifications

### 4. Implementation Plan

#### Phase 1: Core Improvements
- ✅ Create EnhancedOperationalCostsPage with better UX
- ✅ Add proper empty state
- ✅ Add stats cards
- ✅ Improve search & filter
- ✅ Mobile-responsive layout

#### Phase 2: Form & CRUD
- ✅ Create separate form page
- ✅ Better validation
- ✅ Consistent with other forms
- ✅ Loading states

#### Phase 3: Polish
- Category-based filtering
- Date range filtering
- Export functionality
- Bulk operations improvement

## Technical Notes

- Use `operational_costs` table from Supabase
- Follow same pattern as ingredients/recipes
- Use `useSupabaseCRUD` for CRUD operations
- Use `useToast` from shadcn/ui
- Consistent error handling

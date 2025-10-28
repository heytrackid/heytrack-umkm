# Ingredients Feature - Architecture Overview

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    IngredientsPage                          │
│                  (src/app/ingredients/page.tsx)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EnhancedIngredientsPage                        │
│        (Main orchestrator component)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State Management                                    │  │
│  │  - Search term                                       │  │
│  │  - Stock filter                                      │  │
│  │  - Sort options                                      │  │
│  │  - Selected IDs (bulk)                               │  │
│  │  - Modal states                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Data Layer                                          │  │
│  │  - useIngredients() hook                            │  │
│  │  - useSupabaseCRUD() hook                           │  │
│  │  - Real-time subscriptions                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Filters   │  │   Display   │  │   Modals    │
└─────────────┘  └─────────────┘  └─────────────┘
```

## 📦 Component Hierarchy

```
EnhancedIngredientsPage
├── IngredientFilters
│   ├── Search Input
│   ├── Quick Segments (Chips)
│   └── Advanced Filter Popover
│       ├── Sort Options
│       └── Reset Button
│
├── BulkActions (Desktop only)
│   ├── Select All Checkbox
│   ├── Selected Count Badge
│   └── Actions Dropdown
│       ├── Bulk Export
│       ├── Bulk Edit
│       └── Bulk Delete
│
├── Data Display (Conditional)
│   │
│   ├── Mobile View (< 768px)
│   │   └── MobileIngredientList
│   │       └── MobileIngredientCard (per item)
│   │           ├── Header (name, price)
│   │           ├── Stock Indicator
│   │           ├── Expandable Details
│   │           └── Action Buttons
│   │
│   └── Desktop View (>= 768px)
│       └── Table
│           ├── Header Row
│           │   └── Column Headers
│           └── Data Rows
│               ├── SelectableRow (checkbox)
│               ├── Data Cells
│               │   └── StockBadge
│               └── Actions Dropdown
│
├── Modals
│   ├── CreateModal
│   │   └── EnhancedIngredientForm (mode: create)
│   │       ├── Basic Info Section
│   │       ├── Price & Stock Section
│   │       ├── Optional Info Section
│   │       └── Smart Suggestions
│   │
│   ├── EditModal
│   │   └── EnhancedIngredientForm (mode: edit)
│   │       ├── Summary Panel
│   │       ├── Validation Warnings
│   │       ├── Form Sections
│   │       └── Change Detection
│   │
│   └── DeleteModal
│       └── Confirmation Dialog
│
└── Empty State (when no data)
    └── EnhancedEmptyState
        ├── Icon & Title
        ├── Benefits Grid
        ├── Primary CTA
        ├── Secondary Actions
        └── Quick Start Guide
```

## 🔄 Data Flow

```
┌─────────────┐
│   User      │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Component Event Handler            │
│  (handleCreate, handleEdit, etc)    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Form Validation                    │
│  (React Hook Form + Zod)            │
└──────┬──────────────────────────────┘
       │
       ├─── Valid ───┐
       │             ▼
       │      ┌─────────────────────┐
       │      │  API Call           │
       │      │  (useSupabaseCRUD)  │
       │      └──────┬──────────────┘
       │             │
       │             ├─── Success ───┐
       │             │                ▼
       │             │         ┌─────────────┐
       │             │         │  Toast      │
       │             │         │  Success    │
       │             │         └─────────────┘
       │             │                │
       │             │                ▼
       │             │         ┌─────────────┐
       │             │         │  Realtime   │
       │             │         │  Update     │
       │             │         └─────────────┘
       │             │                │
       │             │                ▼
       │             │         ┌─────────────┐
       │             │         │  UI         │
       │             │         │  Refresh    │
       │             │         └─────────────┘
       │             │
       │             └─── Error ───┐
       │                           ▼
       │                    ┌─────────────┐
       │                    │  Toast      │
       │                    │  Error      │
       │                    └─────────────┘
       │
       └─── Invalid ───┐
                       ▼
                ┌─────────────┐
                │  Show       │
                │  Errors     │
                └─────────────┘
```

## 🎨 State Management

```
┌─────────────────────────────────────────────────────────┐
│                    Component State                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  UI State (useState)                                    │
│  ├── searchTerm: string                                │
│  ├── stockFilter: StockFilter                          │
│  ├── sortBy: SortOption                                │
│  ├── sortOrder: 'asc' | 'desc'                         │
│  ├── selectedIds: string[]                             │
│  ├── isCreateModalOpen: boolean                        │
│  ├── isEditModalOpen: boolean                          │
│  ├── isDeleteDialogOpen: boolean                       │
│  └── selectedIngredient: Ingredient | null             │
│                                                         │
│  Form State (useForm)                                   │
│  ├── createForm: UseFormReturn                         │
│  └── editForm: UseFormReturn                           │
│                                                         │
│  Server State (React Query via useIngredients)          │
│  ├── data: Ingredient[]                                │
│  ├── loading: boolean                                  │
│  ├── error: Error | null                               │
│  └── refetch: () => void                               │
│                                                         │
│  Computed State (useMemo)                              │
│  └── processedData: Ingredient[]                       │
│      └── filtered + sorted                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔌 API Integration

```
┌──────────────────────────────────────────────────────┐
│                  API Layer                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Endpoints                                           │
│  ├── GET    /api/ingredients                        │
│  │   └── Query: page, limit, search, sort          │
│  │                                                  │
│  ├── POST   /api/ingredients                        │
│  │   └── Body: IngredientInsertSchema              │
│  │                                                  │
│  ├── PATCH  /api/ingredients/[id]                   │
│  │   └── Body: Partial<IngredientInsertSchema>     │
│  │                                                  │
│  └── DELETE /api/ingredients/[id]                   │
│                                                      │
│  Hooks (Abstraction)                                │
│  ├── useIngredients()                               │
│  │   ├── Fetches data                              │
│  │   ├── Real-time subscription                    │
│  │   └── Returns: { data, loading, error }         │
│  │                                                  │
│  └── useSupabaseCRUD('ingredients')                 │
│      ├── create(data)                               │
│      ├── update(id, data)                           │
│      └── delete(id)                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 📱 Responsive Behavior

```
┌─────────────────────────────────────────────────────┐
│              Responsive Breakpoints                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Mobile (< 768px)                                   │
│  ├── Card layout (MobileIngredientCard)            │
│  ├── Expandable details                            │
│  ├── Stacked filters                               │
│  ├── Full-width buttons                            │
│  └── Bottom sheet modals                           │
│                                                     │
│  Tablet (768px - 1024px)                           │
│  ├── Hybrid layout                                 │
│  ├── Some columns visible                          │
│  ├── Compact filters                               │
│  └── Standard modals                               │
│                                                     │
│  Desktop (> 1024px)                                │
│  ├── Full table layout                             │
│  ├── All columns visible                           │
│  ├── Inline filters                                │
│  ├── Bulk actions toolbar                          │
│  └── Large modals                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🎯 User Flows

### Create Ingredient Flow
```
Start
  │
  ├─→ Click "Tambah Bahan Baku"
  │
  ├─→ Modal opens (EnhancedIngredientForm)
  │
  ├─→ Fill form fields
  │   ├─ Name (required)
  │   ├─ Unit (required)
  │   ├─ Price (required)
  │   ├─ Current Stock (required)
  │   ├─ Min Stock (required)
  │   └─ Description (optional)
  │
  ├─→ Real-time validation
  │   ├─ Show errors if invalid
  │   └─ Show warnings if needed
  │
  ├─→ Submit form
  │
  ├─→ API call (POST /api/ingredients)
  │
  ├─→ Success?
  │   ├─ Yes → Toast success
  │   │       → Close modal
  │   │       → Refresh list
  │   │       → Check stock warning
  │   │
  │   └─ No  → Toast error
  │           → Keep modal open
  │           → Show error details
  │
End
```

### Filter & Search Flow
```
Start
  │
  ├─→ Type in search box
  │   └─ Debounced (300ms)
  │
  ├─→ Click stock filter chip
  │   ├─ All
  │   ├─ Stok Rendah
  │   ├─ Habis
  │   └─ Normal
  │
  ├─→ Open advanced filter
  │   ├─ Select sort option
  │   └─ Toggle sort order
  │
  ├─→ Process data (useMemo)
  │   ├─ Filter by search
  │   ├─ Filter by stock status
  │   └─ Sort by selected option
  │
  ├─→ Update display
  │   ├─ Show filtered count
  │   └─ Render items
  │
  └─→ Reset filters (optional)
      └─ Clear all filters
```

### Bulk Operations Flow
```
Start
  │
  ├─→ Select items (checkbox)
  │   ├─ Individual selection
  │   └─ Select all
  │
  ├─→ Bulk actions toolbar appears
  │   └─ Shows selected count
  │
  ├─→ Choose action
  │   ├─ Export
  │   │   └─ Generate CSV
  │   │       → Download file
  │   │
  │   ├─ Edit (future)
  │   │   └─ Bulk edit modal
  │   │
  │   └─ Delete
  │       └─ Confirmation dialog
  │           ├─ Cancel → Close
  │           └─ Confirm → Delete all
  │                       → Toast success
  │                       → Clear selection
  │
End
```

## 🔐 Security & Validation

```
┌─────────────────────────────────────────────────────┐
│              Security Layers                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Client-Side Validation                         │
│     ├── React Hook Form                            │
│     ├── Zod Schema                                 │
│     └── Real-time feedback                         │
│                                                     │
│  2. API Validation                                 │
│     ├── Request body validation                    │
│     ├── Query parameter validation                 │
│     └── Type checking                              │
│                                                     │
│  3. Database Security                              │
│     ├── Row Level Security (RLS)                   │
│     ├── User isolation (user_id)                   │
│     └── Type constraints                           │
│                                                     │
│  4. Authentication                                 │
│     ├── Supabase Auth                              │
│     ├── Session validation                         │
│     └── Token refresh                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## ⚡ Performance Optimizations

```
┌─────────────────────────────────────────────────────┐
│           Performance Strategies                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Memoization                                    │
│     ├── useMemo for filtered data                 │
│     ├── useCallback for handlers                  │
│     └── React.memo for components                 │
│                                                     │
│  2. Debouncing                                     │
│     ├── Search input (300ms)                       │
│     └── Filter changes (100ms)                     │
│                                                     │
│  3. Lazy Loading                                   │
│     ├── Code splitting                             │
│     ├── Dynamic imports                            │
│     └── Virtual scrolling (optional)               │
│                                                     │
│  4. Optimistic Updates                             │
│     ├── Update UI immediately                      │
│     ├── Rollback on error                          │
│     └── Better perceived performance               │
│                                                     │
│  5. Caching                                        │
│     ├── React Query cache                          │
│     ├── Filter presets (localStorage)              │
│     └── API response cache                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🧪 Testing Strategy

```
┌─────────────────────────────────────────────────────┐
│              Testing Pyramid                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  E2E Tests (10%)                                   │
│  ├── Full user workflows                           │
│  ├── Critical paths                                │
│  └── Cross-browser testing                         │
│                                                     │
│  Integration Tests (30%)                           │
│  ├── Component interactions                        │
│  ├── API integration                               │
│  └── State management                              │
│                                                     │
│  Unit Tests (60%)                                  │
│  ├── Individual components                         │
│  ├── Utility functions                             │
│  ├── Validation logic                              │
│  └── Toast helpers                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**Last Updated:** 2025-10-27  
**Version:** 1.0  
**Status:** ✅ Complete

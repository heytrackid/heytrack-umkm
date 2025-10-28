# Ingredients Components - Quick Reference

## 🚀 Quick Start

```tsx
import { EnhancedIngredientsPage } from '@/components/ingredients/EnhancedIngredientsPage'

export default function Page() {
  return <EnhancedIngredientsPage />
}
```

## 📦 Component Imports

```tsx
import {
  EnhancedEmptyState,
  StockBadge,
  CompactStockIndicator,
  EnhancedIngredientForm,
  IngredientFilters,
  MobileIngredientCard,
  MobileIngredientList,
  BulkActions,
  SelectableRow
} from '@/components/ingredients'

import {
  ingredientCreatedToast,
  ingredientUpdatedToast,
  ingredientDeletedToast,
  duplicateNameErrorToast,
  lowStockWarningToast
} from '@/lib/ingredients-toast'
```

## 🎨 Common Patterns

### Empty State
```tsx
<EnhancedEmptyState 
  onAdd={() => setModalOpen(true)}
  showTutorial={true}
/>
```

### Stock Badge
```tsx
// Full
<StockBadge
  currentStock={10}
  minStock={20}
  unit="kg"
  showIcon={true}
/>

// Compact
<StockBadge
  currentStock={10}
  minStock={20}
  unit="kg"
  compact
/>

// Mobile
<CompactStockIndicator
  currentStock={10}
  minStock={20}
  unit="kg"
/>
```

### Form
```tsx
const form = useForm<SimpleIngredientFormData>({
  resolver: zodResolver(IngredientFormSchema)
})

<EnhancedIngredientForm
  form={form}
  mode="create" // or "edit"
  initialData={ingredient} // for edit
/>
```

### Filters
```tsx
const [search, setSearch] = useState('')
const [filter, setFilter] = useState<StockFilter>('all')
const [sort, setSort] = useState<SortOption>('name')
const [order, setOrder] = useState<'asc' | 'desc'>('asc')

<IngredientFilters
  searchTerm={search}
  onSearchChange={setSearch}
  stockFilter={filter}
  onStockFilterChange={setFilter}
  sortBy={sort}
  onSortChange={setSort}
  sortOrder={order}
  onSortOrderChange={setOrder}
  totalCount={100}
  filteredCount={25}
  onReset={() => {
    setSearch('')
    setFilter('all')
    setSort('name')
    setOrder('asc')
  }}
/>
```

### Mobile Cards
```tsx
// Single
<MobileIngredientCard
  ingredient={item}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onQuickBuy={handleBuy}
/>

// List
<MobileIngredientList
  ingredients={items}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onQuickBuy={handleBuy}
/>
```

### Bulk Actions
```tsx
const [selected, setSelected] = useState<string[]>([])

<BulkActions
  selectedIds={selected}
  onSelectionChange={setSelected}
  allIds={items.map(i => i.id)}
  onBulkDelete={async (ids) => {
    await Promise.all(ids.map(deleteItem))
  }}
  onBulkExport={(ids) => {
    const data = items.filter(i => ids.includes(i.id))
    exportToCSV(data)
  }}
/>

// In table
<SelectableRow
  id={item.id}
  isSelected={selected.includes(item.id)}
  onToggle={(id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }}
/>
```

### Toast Notifications
```tsx
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

// Success
toast(ingredientCreatedToast('Tepung Terigu'))
toast(ingredientUpdatedToast('Tepung Terigu', ['stok', 'harga']))

// Error
toast(duplicateNameErrorToast('Tepung Terigu'))
toast(genericErrorToast('menambahkan bahan'))

// Warning
toast(lowStockWarningToast('Tepung', 5, 10, 'kg'))
toast(outOfStockErrorToast('Tepung'))

// With undo
toast(ingredientDeletedToast('Tepung', () => {
  // Undo logic
}))
```

## 🎯 Type Definitions

```tsx
type StockFilter = 'all' | 'low' | 'out' | 'normal'
type SortOption = 'name' | 'stock' | 'price' | 'updated'

interface SimpleIngredientFormData {
  name: string
  unit: string
  price_per_unit: number
  current_stock: number
  min_stock: number
  description?: string
}

interface Ingredient {
  id: string
  name: string
  unit: string
  price_per_unit: number
  current_stock: number
  min_stock: number
  description?: string
  created_at: string
  updated_at?: string
}
```

## 🎨 Color Scheme

```tsx
// Stock Status
const stockColors = {
  out: 'bg-red-100 text-red-800 border-red-200',
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  normal: 'bg-green-100 text-green-800 border-green-200'
}

// Buttons
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700',
  secondary: 'variant="outline"',
  destructive: 'bg-red-600 hover:bg-red-700'
}
```

## 📱 Responsive Breakpoints

```tsx
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large screens
}

// Usage
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

## 🔧 Utility Functions

```tsx
// Filter ingredients
const filterIngredients = (
  items: Ingredient[],
  search: string,
  filter: StockFilter
) => {
  return items.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase())
    
    let matchesFilter = true
    if (filter === 'low') {
      matchesFilter = item.current_stock > 0 && 
                     item.current_stock <= item.min_stock
    } else if (filter === 'out') {
      matchesFilter = item.current_stock <= 0
    } else if (filter === 'normal') {
      matchesFilter = item.current_stock > item.min_stock
    }
    
    return matchesSearch && matchesFilter
  })
}

// Sort ingredients
const sortIngredients = (
  items: Ingredient[],
  sortBy: SortOption,
  order: 'asc' | 'desc'
) => {
  return [...items].sort((a, b) => {
    let aVal: any, bVal: any
    
    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        break
      case 'stock':
        aVal = a.current_stock
        bVal = b.current_stock
        break
      case 'price':
        aVal = a.price_per_unit
        bVal = b.price_per_unit
        break
      case 'updated':
        aVal = new Date(a.updated_at || a.created_at)
        bVal = new Date(b.updated_at || b.created_at)
        break
    }
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// Export to CSV
const exportToCSV = (items: Ingredient[], filename: string) => {
  const csv = [
    ['Nama', 'Satuan', 'Harga', 'Stok', 'Min'].join(','),
    ...items.map(i => [
      i.name,
      i.unit,
      i.price_per_unit,
      i.current_stock,
      i.min_stock
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
```

## 🧪 Testing Helpers

```tsx
// Mock data
const mockIngredient: Ingredient = {
  id: '1',
  name: 'Tepung Terigu',
  unit: 'kg',
  price_per_unit: 15000,
  current_stock: 10,
  min_stock: 20,
  description: 'Tepung protein tinggi',
  created_at: new Date().toISOString()
}

// Test utilities
import { render, screen, fireEvent } from '@testing-library/react'

test('renders stock badge', () => {
  render(
    <StockBadge
      currentStock={10}
      minStock={20}
      unit="kg"
    />
  )
  expect(screen.getByText(/stok rendah/i)).toBeInTheDocument()
})
```

## 📊 Performance Tips

```tsx
// Memoize filtered data
const filtered = useMemo(
  () => filterIngredients(items, search, filter),
  [items, search, filter]
)

// Debounce search
const debouncedSearch = useDebounce(search, 300)

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Virtual scrolling for long lists
import { VirtualizedList } from '@/components/optimized'
```

## 🔗 Related Files

- Components: `/src/components/ingredients/`
- Types: `/src/types/inventory.ts`
- API: `/src/app/api/ingredients/route.ts`
- Hooks: `/src/hooks/useIngredients.ts`
- Validation: `/src/lib/validations/form-validations.ts`

## 📚 Documentation

- [Full Evaluation](./INGREDIENTS_UX_EVALUATION.md)
- [Implementation Guide](./INGREDIENTS_UX_IMPLEMENTATION.md)
- [Migration Checklist](./INGREDIENTS_MIGRATION_CHECKLIST.md)
- [Summary](./INGREDIENTS_UX_SUMMARY.md)

---

**Quick Links:**
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)

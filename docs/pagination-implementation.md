# Pagination Implementation Documentation

## Overview

HeyTrack telah mengimplementasikan **server-side pagination** yang konsisten di seluruh aplikasi. Implementasi ini menggantikan client-side pagination yang tidak efisien dengan server-side pagination yang scalable dan performa tinggi.

## Architecture

### API Layer
Semua API endpoints mendukung pagination dengan parameter standar:

```typescript
GET /api/resource?page=1&limit=20&search=query
```

**Response Format:**
```typescript
{
  "data": [...], // Array of items
  "pagination": {
    "total": 150,      // Total items
    "page": 1,         // Current page
    "limit": 20,       // Items per page
    "pages": 8,        // Total pages
    "hasNext": true,   // Has next page
    "hasPrev": false   // Has previous page
  }
}
```

### Frontend Layer

#### Hooks

##### useCustomers
```typescript
// Server-side pagination
const { data, isLoading } = useCustomers({
  page: 1,
  limit: 20,
  search: 'john'
})
// Returns: { data: Customer[], pagination: {...} }

// Backward compatibility
const { data } = useCustomersList()
// Returns: Customer[]
```

##### useIngredients
```typescript
// Server-side pagination
const { data, isLoading } = useIngredients({
  page: 1,
  limit: 12,
  search: 'ayam'
})
// Returns: { data: Ingredient[], pagination: {...} }

// Backward compatibility
const { data } = useIngredientsList()
// Returns: Ingredient[]
```

##### useOrders
```typescript
// Server-side pagination
const { data, isLoading } = useOrders({
  page: 1,
  limit: 20,
  search: 'customer name'
})
// Returns: { data: Order[], pagination: {...} }

// Backward compatibility
const { data } = useOrdersList()
// Returns: Order[]
```

#### Components

##### ServerPagination
Komponen pagination reusable untuk server-side pagination.

```typescript
import { ServerPagination } from '@/components/ui/server-pagination'

<ServerPagination
  pagination={pagination}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(limit) => {
    setLimit(limit)
    setPage(1) // Reset to first page
  }}
  pageSizeOptions={[10, 20, 50, 100]}
  className="mt-4"
/>
```

**Props:**
- `pagination`: Pagination metadata dari API
- `onPageChange`: Callback untuk page change
- `onPageSizeChange`: Callback untuk page size change
- `pageSizeOptions`: Array of available page sizes (default: [10, 20, 50, 100])
- `showPageSizeSelector`: Show/hide page size selector (default: true)
- `className`: Additional CSS classes

## Implementation Examples

### Customers Page

```typescript
// src/app/customers/components/CustomersLayout.tsx
const CustomersLayout = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch with pagination
  const { data: response, isLoading } = useCustomers({
    page,
    limit,
    search: searchTerm.trim() || undefined
  })

  const customers = response?.data || []
  const pagination = response?.pagination

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  return (
    <div>
      {/* Content */}
      <CustomersTable customers={customers} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && customers.length > 0 && (
        <ServerPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
```

### Ingredients Page

```typescript
// src/components/ingredients/IngredientsList.tsx
const IngredientsListComponent = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: response, isLoading } = useIngredients({
    page,
    limit,
    search: searchTerm.trim() || undefined
  })

  const ingredients = response?.data || []
  const pagination = response?.pagination

  return (
    <div>
      {/* Filters and search */}
      <div className="mb-4">
        <Input
          placeholder="Cari bahan baku..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table/List */}
      <IngredientsTable ingredients={ingredients} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && ingredients.length > 0 && (
        <ServerPagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit)
            setPage(1)
          }}
          pageSizeOptions={[12, 24, 48, 96]}
        />
      )}
    </div>
  )
}
```

## Migration Guide

### From Client-side to Server-side Pagination

#### Before (Client-side)
```typescript
// Old way - loads all data
const { data: allItems = [] } = useItems()

// Client-side pagination
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(20)

const paginatedItems = useMemo(() => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return allItems.slice(start, end)
}, [allItems, page, pageSize])
```

#### After (Server-side)
```typescript
// New way - server-side pagination
const [page, setPage] = useState(1)
const [limit, setLimit] = useState(20)

const { data: response, isLoading } = useItems({
  page,
  limit,
  search: searchTerm
})

const items = response?.data || []
const pagination = response?.pagination

// Use ServerPagination component
<ServerPagination
  pagination={pagination}
  onPageChange={setPage}
  onPageSizeChange={(newLimit) => {
    setLimit(newLimit)
    setPage(1)
  }}
/>
```

### Backward Compatibility

Untuk komponen yang belum dimigrasi, gunakan hooks dengan suffix `List`:

```typescript
// Instead of useCustomers() - use this for full data
const { data: customers } = useCustomersList()

// Instead of useIngredients() - use this for full data
const { data: ingredients } = useIngredientsList()

// Instead of useOrders() - use this for full data
const { data: orders } = useOrdersList()
```

## Performance Benefits

### Before (Client-side Pagination)
- ❌ Loads all data at once
- ❌ High memory usage
- ❌ Slow initial load
- ❌ Inefficient for large datasets

### After (Server-side Pagination)
- ✅ Loads only displayed data
- ✅ Low memory usage
- ✅ Fast initial load
- ✅ Scalable for large datasets
- ✅ Better user experience

## Best Practices

### 1. Page Size Selection
- **Customers**: 20 items per page (balanced)
- **Ingredients**: 12 items per page (compact cards)
- **Orders**: 20 items per page (detailed rows)
- **Reports**: 50-100 items per page (data-heavy)

### 2. Search Implementation
```typescript
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

// Reset to page 1 when searching
useEffect(() => {
  setPage(1)
}, [debouncedSearch])

const { data } = useItems({
  page,
  limit,
  search: debouncedSearch.trim() || undefined
})
```

### 3. Loading States
```typescript
const { data: response, isLoading } = useItems({ page, limit })

if (isLoading && !response?.data?.length) {
  return <SkeletonLoader />
}
```

### 4. Error Handling
```typescript
const { data: response, error } = useItems({ page, limit })

if (error) {
  return <ErrorMessage error={error} />
}
```

## API Endpoints

All endpoints support pagination:

- `GET /api/customers?page=1&limit=20&search=john`
- `GET /api/ingredients?page=1&limit=12&search=ayam`
- `GET /api/orders?page=1&limit=20&search=customer`

## Troubleshooting

### Common Issues

1. **"Cannot read property 'data' of undefined"**
   - Check if response is loaded: `response?.data || []`

2. **Pagination not updating**
   - Ensure `setPage(1)` when changing filters/search

3. **TypeScript errors**
   - Use `response?.data || []` for safe array access
   - Use `response?.pagination` for pagination metadata

4. **Performance issues**
   - Use appropriate page sizes
   - Implement debounced search
   - Consider virtualization for very large lists

## Future Enhancements

- [ ] Infinite scroll for mobile views
- [ ] Cursor-based pagination for real-time data
- [ ] Smart page size based on screen size
- [ ] Export functionality with pagination
- [ ] Bulk operations across pages
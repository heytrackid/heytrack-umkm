# 🦴 Skeleton Components Implementation Guide

**Status:** ✅ Complete skeleton system implemented  
**Last Updated:** Oct 23, 2024

---

## 📋 Available Skeleton Components

All skeletons are in `src/components/ui/skeleton-loader.tsx` and exported from `@/components/ui`:

### Basic Skeletons

```typescript
import {
  CardSkeleton,        // Card with title + content lines
  TableSkeleton,       // Table structure with rows & columns
  ListSkeleton,        // List items with avatars
  GridSkeleton,        // Grid layout items
  FormSkeleton,        // Form with labeled inputs
  HeroSkeleton,        // Hero section header
  ProfileSkeleton,     // Profile card with avatar
  StatsSkeleton,       // Stat cards grid
  CommentSkeleton,     // Comment threads
  ProductCardSkeleton, // Product card grid
  BreadcrumbSkeleton   // Breadcrumb navigation
} from '@/components/ui'
```

---

## 🎯 Quick Reference

### For Data Tables
```typescript
// ❌ OLD - Generic Skeleton
{isLoading && <Skeleton className="h-10 w-full" />}

// ✅ NEW - Proper TableSkeleton
{isLoading && <TableSkeleton rows={10} columns={4} />}
```

### For Cards/Lists
```typescript
// ❌ OLD - Multiple Skeleton children
{isLoading && (
  <>
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </>
)}

// ✅ NEW - Single component
{isLoading && <CardSkeleton rows={3} />}
```

### For Forms
```typescript
// ❌ OLD - Manual skeleton layout
{isLoading && (
  <div className="space-y-4">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    {/* ... repeat for each field */}
  </div>
)}

// ✅ NEW - Proper FormSkeleton
{isLoading && <FormSkeleton fields={3} hasSubmit />}
```

### For Dynamic Components
```typescript
// ✅ With next/dynamic
const MyTable = dynamic(() => import('./MyTable'), {
  loading: () => <TableSkeleton rows={10} columns={5} />,
  ssr: false
})

// ✅ With Suspense
<Suspense fallback={<CardSkeleton rows={4} />}>
  <MyCard />
</Suspense>
```

---

## 📍 Where to Use Each Skeleton

| Component Type | Skeleton | Example |
|---|---|---|
| **Data Tables** | `TableSkeleton` | Customer lists, order tables |
| **Card Lists** | `CardSkeleton` | Product cards, notification cards |
| **User Lists** | `ListSkeleton` | Team members, customer list |
| **Forms** | `FormSkeleton` | Login, registration, filters |
| **Stats Dashboard** | `StatsSkeleton` | KPI cards, analytics |
| **Profiles** | `ProfileSkeleton` | User profiles, account pages |
| **Product Grids** | `ProductCardSkeleton` | Product catalog, inventory |
| **Hero Sections** | `HeroSkeleton` | Page headers, welcome sections |
| **Comments** | `CommentSkeleton` | Reviews, feedback sections |
| **Breadcrumbs** | `BreadcrumbSkeleton` | Navigation, page hierarchy |
| **Grid Layouts** | `GridSkeleton` | Flexible grid items |

---

## ✅ Implementation Checklist

### Page Level (pages/)
```typescript
// ✅ Dashboard page
<Suspense fallback={<StatsSkeleton count={4} />}>
  <StatsSection />
</Suspense>

// ✅ Table pages (customers, orders, ingredients)
const CustomersTable = dynamic(() => import('./components/Table'), {
  loading: () => <TableSkeleton rows={10} columns={5} />
})

// ✅ Form pages
<Suspense fallback={<FormSkeleton fields={4} />}>
  <FormComponent />
</Suspense>
```

### Component Level (components/)
```typescript
// ✅ Loading state in component
export function MyDataComponent() {
  const { data, isLoading } = useData()
  
  if (isLoading) return <TableSkeleton rows={8} columns={4} />
  
  return <Table data={data} />
}

// ✅ Multiple sections
export function Dashboard() {
  return (
    <>
      {/* Stats */}
      <Suspense fallback={<StatsSkeleton count={4} />}>
        <StatsSection />
      </Suspense>
      
      {/* Table */}
      <Suspense fallback={<TableSkeleton rows={5} columns={3} />}>
        <TableSection />
      </Suspense>
    </>
  )
}
```

---

## 🔄 Migration Pattern

### Before (Generic Skeletons)
```typescript
import { Skeleton } from '@/components/ui/skeleton'

function MyComponent() {
  return (
    <>
      {isLoading && (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
```

### After (Proper Skeletons)
```typescript
import { ListSkeleton } from '@/components/ui'

function MyComponent() {
  return isLoading ? <ListSkeleton items={5} /> : <Content />
}
```

**Benefits:**
- ✅ Cleaner code
- ✅ Consistent patterns
- ✅ Faster development
- ✅ Better maintainability
- ✅ Standardized UX

---

## 🎨 Customization

### Adjusting Skeleton Count
```typescript
// More rows
<TableSkeleton rows={20} columns={4} />

// Fewer items
<ListSkeleton items={3} />

// Custom grid
<GridSkeleton columns={4} items={12} />
```

### With Container Styling
```typescript
<div className="p-6">
  <CardSkeleton rows={4} className="rounded-lg" />
</div>

<div className="w-full">
  <FormSkeleton fields={5} hasSubmit />
</div>
```

---

## 📝 Common Use Cases

### 1. Dashboard with Multiple Sections
```typescript
function Dashboard() {
  return (
    <>
      {/* Header stats */}
      <Suspense fallback={<StatsSkeleton count={4} />}>
        <StatsCards />
      </Suspense>

      {/* Recent orders */}
      <Suspense fallback={<TableSkeleton rows={5} columns={3} />}>
        <RecentOrders />
      </Suspense>

      {/* Stock alerts */}
      <Suspense fallback={<ListSkeleton items={4} />}>
        <AlertsList />
      </Suspense>
    </>
  )
}
```

### 2. Form Page
```typescript
function EditCustomerPage() {
  const { customer, isLoading } = useCustomer(id)

  if (isLoading) return <FormSkeleton fields={6} hasSubmit />

  return <CustomerForm customer={customer} />
}
```

### 3. Data Table Page
```typescript
const OrdersTable = dynamic(() => import('./OrdersTable'), {
  loading: () => <TableSkeleton rows={10} columns={5} />,
  ssr: false
})

export default function OrdersPage() {
  return (
    <AppLayout>
      <OrdersTable />
    </AppLayout>
  )
}
```

### 4. Dynamic Imports
```typescript
const ExpensiveComponent = dynamic(
  () => import('./Expensive'),
  {
    loading: () => <CardSkeleton rows={5} />,
    ssr: false
  }
)
```

### 5. Error Boundary with Fallback
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<ListSkeleton items={6} />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

---

## 🚫 What NOT to Do

```typescript
// ❌ DON'T: Mix skeleton types
isLoading ? <CardSkeleton /> : <TableSkeleton />

// ❌ DON'T: Custom Skeleton for existing type
isLoading && (
  <div className="space-y-4">
    {/* Manual skeleton for list */}
  </div>
)

// ❌ DON'T: Forget Suspense/loading prop
<MyExpensiveComponent /> {/* No fallback! */}

// ❌ DON'T: Use wrong dimensions
<TableSkeleton rows={1000} /> {/* Too many */}
```

---

## ✅ Quick Audit Checklist

When reviewing components, check:

- [ ] All `isLoading` states use proper skeleton
- [ ] Dynamic imports have `loading` prop with skeleton
- [ ] Suspense has `fallback` with skeleton
- [ ] Skeleton type matches component type
- [ ] Skeleton count is reasonable (5-10 items typically)
- [ ] No generic `<Skeleton>` lines repeated
- [ ] Forms use `FormSkeleton`
- [ ] Tables use `TableSkeleton`
- [ ] Lists use `ListSkeleton`
- [ ] Stats use `StatsSkeleton`

---

## 🎯 Priority Pages to Update

**High Priority (Core Pages):**
- [ ] Dashboard page
- [ ] Customers page
- [ ] Orders page
- [ ] Ingredients page
- [ ] Products page

**Medium Priority (Feature Pages):**
- [ ] HPP page
- [ ] Recipe page
- [ ] Reports page
- [ ] Analytics page

**Low Priority (Settings/Admin):**
- [ ] Settings pages
- [ ] User management
- [ ] System pages

---

## 📚 Examples by Page Type

### Data Table Page Template
```typescript
'use client'
import { TableSkeleton } from '@/components/ui'
import dynamic from 'next/dynamic'

const DataTable = dynamic(() => import('./DataTable'), {
  loading: () => <TableSkeleton rows={10} columns={5} />,
  ssr: false
})

export default function Page() {
  return <DataTable />
}
```

### Form Page Template
```typescript
'use client'
import { FormSkeleton } from '@/components/ui'
import { useAsyncError } from '@/hooks'

export default function Page() {
  const { executeAsync, isLoading } = useAsyncError()

  if (isLoading) return <FormSkeleton fields={4} hasSubmit />

  return <MyForm onSubmit={executeAsync} />
}
```

### Dashboard Template
```typescript
'use client'
import { StatsSkeleton, TableSkeleton, ListSkeleton } from '@/components/ui'
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <>
      <Suspense fallback={<StatsSkeleton count={4} />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={8} columns={4} />}>
        <RecentOrders />
      </Suspense>

      <Suspense fallback={<ListSkeleton items={5} />}>
        <Alerts />
      </Suspense>
    </>
  )
}
```

---

## 📖 Summary

**Key Rules:**
1. ✅ Always use skeleton when data is loading
2. ✅ Choose skeleton type matching component
3. ✅ Keep skeleton count realistic (5-10 typically)
4. ✅ Use Suspense + fallback or dynamic + loading
5. ✅ Update counts/columns as needed

**Never:**
- Mix unrelated skeleton types
- Leave loading states without fallback
- Use too many items in skeleton
- Create custom skeletons if one exists

---

**Implementation Status: Ready to Audit & Update** ✅

Use this guide to ensure all components are using appropriate skeleton loaders.

# ✅ useSupabaseCRUD Hook - Full CRUD Support

## 📋 Overview
Hook `useSupabaseCRUD` sekarang sudah support **full CRUD operations** dengan RLS (Row Level Security) enforcement.

## 🎯 Supported Operations

### 1. **CREATE** - Tambah data baru
```typescript
const { create } = useSupabaseCRUD('table_name')

const newRecord = await create({
  name: 'Example',
  description: 'Test'
})
```

### 2. **READ** - Baca single record by ID
```typescript
const { read } = useSupabaseCRUD('table_name')

const record = await read('record-id-here')
```

### 3. **UPDATE** - Update existing record
```typescript
const { update } = useSupabaseCRUD('table_name')

const updated = await update('record-id', {
  name: 'Updated Name'
})
```

### 4. **DELETE** - Hapus record
```typescript
const { remove } = useSupabaseCRUD('table_name')

await remove('record-id')
```

## 📊 Return Values

```typescript
interface UseSupabaseCRUDReturn<Row, Insert, Update> {
  // Data & State
  data: Row[] | null           // List of records
  loading: boolean             // Loading state
  error: Error | null          // Error state
  
  // Operations
  read: (id: string) => Promise<Row | null>
  create: (data: Partial<Insert>) => Promise<Row | null>
  update: (id: string, data: Partial<Update>) => Promise<Row | null>
  remove: (id: string) => Promise<void>
  
  // Utilities
  refetch: () => Promise<void>  // Refresh data
  clearError: () => void        // Clear error state
}
```

## 🔒 Security Features

### Automatic RLS Enforcement
- ✅ Semua operations automatically filter by `user_id`
- ✅ User authentication check di setiap operation
- ✅ Prevents unauthorized access

### Example:
```typescript
// User A (id: user-123) calls:
const { data } = useSupabaseCRUD('orders')

// Automatically filters:
// SELECT * FROM orders WHERE user_id = 'user-123'
```

## 📝 Usage Examples

### Example 1: List with Auto-fetch
```typescript
function OrdersList() {
  const { data: orders, loading, error } = useSupabaseCRUD('orders', {
    orderBy: { column: 'created_at', ascending: false }
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {orders?.map(order => (
        <li key={order.id}>{order.order_no}</li>
      ))}
    </ul>
  )
}
```

### Example 2: CRUD Operations
```typescript
function OrderForm() {
  const { create, update, remove, read } = useSupabaseCRUD('orders')

  const handleCreate = async () => {
    const newOrder = await create({
      order_no: 'ORD-001',
      customer_name: 'John Doe',
      total_amount: 100000
    })
    console.log('Created:', newOrder)
  }

  const handleUpdate = async (id: string) => {
    const updated = await update(id, {
      status: 'completed'
    })
    console.log('Updated:', updated)
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    console.log('Deleted')
  }

  const handleRead = async (id: string) => {
    const order = await read(id)
    console.log('Order:', order)
  }

  return (
    <div>
      <button onClick={handleCreate}>Create</button>
      <button onClick={() => handleUpdate('order-id')}>Update</button>
      <button onClick={() => handleDelete('order-id')}>Delete</button>
      <button onClick={() => handleRead('order-id')}>Read</button>
    </div>
  )
}
```

### Example 3: With Filters
```typescript
const { data: activeOrders } = useSupabaseCRUD('orders', {
  filter: {
    status: 'active',
    payment_status: 'paid'
  },
  orderBy: { column: 'created_at', ascending: false }
})
```

### Example 4: Error Handling
```typescript
function OrderManager() {
  const { create, error, clearError } = useSupabaseCRUD('orders')

  const handleSubmit = async (data: OrderInsert) => {
    try {
      clearError() // Clear previous errors
      await create(data)
      toast.success('Order created!')
    } catch (err) {
      toast.error('Failed to create order')
    }
  }

  return (
    <div>
      {error && <Alert>{error.message}</Alert>}
      <OrderForm onSubmit={handleSubmit} />
    </div>
  )
}
```

## 🔄 Auto-refresh Behavior

Operations that modify data automatically trigger `refetch()`:
- ✅ `create()` → auto refetch
- ✅ `update()` → auto refetch
- ✅ `remove()` → auto refetch
- ℹ️ `read()` → no auto refetch (doesn't modify list)

## ⚙️ Options

```typescript
useSupabaseCRUD('table_name', {
  select?: string                    // Custom select query
  filter?: Partial<Record<...>>      // Filter conditions
  orderBy?: {                        // Sort order
    column: string
    ascending?: boolean
  }
})
```

## 🎯 Type Safety

Hook is fully typed with Supabase generated types:

```typescript
// Automatically inferred from table name
const { 
  data,      // Order[] | null
  create,    // (data: OrderInsert) => Promise<Order | null>
  update,    // (id: string, data: OrderUpdate) => Promise<Order | null>
  read,      // (id: string) => Promise<Order | null>
  remove     // (id: string) => Promise<void>
} = useSupabaseCRUD('orders')
```

## ✅ Best Practices

### 1. Use for List + Operations
```typescript
// ✅ Good - One hook for list and operations
const { data, create, update, remove } = useSupabaseCRUD('orders')
```

### 2. Separate Query for Complex Fetching
```typescript
// ✅ Good - Use useSupabaseQuery for complex queries
const { data: orders } = useSupabaseQuery('orders', {
  select: '*, customer:customers(*), items:order_items(*)',
  orderBy: { column: 'created_at', ascending: false }
})

// Use CRUD for operations only
const { create, update, remove } = useSupabaseCRUD('orders')
```

### 3. Handle Errors Properly
```typescript
// ✅ Good - Always handle errors
const { create, error, clearError } = useSupabaseCRUD('orders')

const handleCreate = async (data: OrderInsert) => {
  try {
    clearError()
    await create(data)
  } catch (err) {
    // Error is already set in hook state
    console.error('Create failed:', error)
  }
}
```

## 🚫 Common Mistakes

### ❌ Don't use for single record fetch on mount
```typescript
// ❌ Bad - Hook fetches all records
const { data } = useSupabaseCRUD('orders')
const order = data?.find(o => o.id === orderId)
```

```typescript
// ✅ Good - Use read() method
const { read } = useSupabaseCRUD('orders')
const order = await read(orderId)
```

### ❌ Don't forget user authentication
```typescript
// ❌ Bad - Will throw error if user not authenticated
const { create } = useSupabaseCRUD('orders')
await create(data) // Error: User not authenticated
```

```typescript
// ✅ Good - Check auth first
const { user } = await supabase.auth.getUser()
if (!user) {
  router.push('/login')
  return
}

const { create } = useSupabaseCRUD('orders')
await create(data)
```

## 📚 Related Hooks

- **useSupabaseQuery** - For complex queries with relations
- **useSupabaseBulk** - For bulk operations
- **useAuth** - For authentication state

## 🎉 Summary

Hook `useSupabaseCRUD` sekarang:
- ✅ Support full CRUD (Create, Read, Update, Delete)
- ✅ Auto RLS enforcement
- ✅ Type-safe dengan generated types
- ✅ Auto-refresh after mutations
- ✅ Error handling built-in
- ✅ Clear error utility
- ✅ Flexible filtering & sorting

**Ready to use in production!** 🚀

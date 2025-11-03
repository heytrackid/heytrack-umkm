# Guide: Making Type Definitions More Specific

## Problem: Generic Types

```typescript
// ❌ Too generic - no type safety
function processData(data: unknown): unknown {
  return data
}

// ❌ Still too generic
function processOrder(order: Record<string, unknown>): void {
  // TypeScript doesn't know what properties exist
}
```

## Solution: Use Specific Types

### 1. Use Database Types (Best for DB operations)

```typescript
import type { OrdersTable, OrdersInsert, OrdersUpdate } from '@/types/database'

// ✅ Specific type from database
function processOrder(order: OrdersTable): void {
  console.log(order.order_no) // TypeScript knows this exists!
  console.log(order.total_amount) // Type-safe!
}

// ✅ For creating new orders
function createOrder(data: OrdersInsert): Promise<OrdersTable> {
  // TypeScript knows exactly what fields are required/optional
}

// ✅ For updating orders
function updateOrder(id: string, data: OrdersUpdate): Promise<OrdersTable> {
  // Only allows fields that exist in the table
}
```

### 2. Use Type Utilities for Transformations

```typescript
import type { OrdersTable } from '@/types/database'

// ✅ Pick only specific fields
type OrderSummary = Pick<OrdersTable, 'id' | 'order_no' | 'total_amount' | 'status'>

// ✅ Make some fields required
type OrderWithCustomer = OrdersTable & {
  customer_name: string // Override to make it required
}

// ✅ Omit sensitive fields
type PublicOrder = Omit<OrdersTable, 'user_id' | 'created_by'>

// ✅ Partial for optional updates
type OrderPartialUpdate = Partial<Pick<OrdersTable, 'status' | 'notes'>>
```

### 3. Create Domain-Specific Types

```typescript
// src/types/orders.ts
import type { OrdersTable, OrderItemsTable, CustomersTable } from '@/types/database'

// ✅ Combine types for specific use cases
export interface OrderWithItems extends OrdersTable {
  items: OrderItemsTable[]
}

export interface OrderWithCustomer extends OrdersTable {
  customer: CustomersTable | null
}

export interface OrderWithRelations extends OrdersTable {
  items: OrderItemsTable[]
  customer: CustomersTable | null
}

// ✅ Use in functions
function displayOrder(order: OrderWithRelations): void {
  console.log(order.order_no)
  console.log(order.customer?.name) // Type-safe!
  console.log(order.items.length) // Type-safe!
}
```

### 4. Use Type Guards for Runtime Safety

```typescript
import type { OrdersTable } from '@/types/database'
import { isRecord } from '@/lib/type-guards'

// ✅ Type guard to narrow unknown to specific type
export function isOrder(value: unknown): value is OrdersTable {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.order_no === 'string' &&
    typeof value.total_amount === 'number'
  )
}

// ✅ Use it to safely handle unknown data
function processUnknownData(data: unknown): void {
  if (isOrder(data)) {
    // Now TypeScript knows it's an OrdersTable!
    console.log(data.order_no)
  }
}
```

### 5. API Response Types

```typescript
import type { OrdersTable } from '@/types/database'

// ✅ Specific API response type
export interface ApiResponse<T> {
  data: T
  error: string | null
  meta?: {
    page: number
    limit: number
    total: number
  }
}

// ✅ Use with specific data type
type OrdersResponse = ApiResponse<OrdersTable[]>
type SingleOrderResponse = ApiResponse<OrdersTable>

// ✅ Type-safe API function
async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch('/api/orders')
  return response.json() // TypeScript knows the shape!
}
```

### 6. Form Data Types

```typescript
import type { OrdersInsert } from '@/types/database'

// ✅ Form-specific type (may differ from DB type)
export interface OrderFormData {
  customer_name: string
  customer_phone: string
  items: Array<{
    recipe_id: string
    quantity: number
    unit_price: number
  }>
  delivery_date: string
  notes?: string
}

// ✅ Convert form data to DB insert type
function formToInsert(form: OrderFormData, userId: string): OrdersInsert {
  return {
    user_id: userId,
    customer_name: form.customer_name,
    customer_phone: form.customer_phone,
    delivery_date: form.delivery_date,
    notes: form.notes,
    // ... other fields
  }
}
```

## Real-World Examples

### Example 1: API Route Handler

```typescript
// ❌ Before: Generic types
export async function POST(req: Request) {
  const body = await req.json() // unknown type
  // No type safety!
}

// ✅ After: Specific types
import type { OrdersInsert } from '@/types/database'
import { OrderInsertSchema } from '@/lib/validations/domains/order'

export async function POST(req: Request) {
  const body = await req.json()
  
  // Validate and get typed data
  const validatedData = OrderInsertSchema.parse(body) // Type: OrdersInsert
  
  // Now fully type-safe!
  const order = await createOrder(validatedData)
  return Response.json({ data: order })
}
```

### Example 2: React Component Props

```typescript
import type { OrdersTable } from '@/types/database'

// ❌ Before: Generic
interface OrderCardProps {
  order: Record<string, unknown>
}

// ✅ After: Specific
interface OrderCardProps {
  order: OrdersTable
  onEdit?: (order: OrdersTable) => void
  onDelete?: (orderId: string) => void
}

export const OrderCard = ({ order, onEdit, onDelete }: OrderCardProps) => {
  // Fully type-safe!
  return (
    <div>
      <h3>{order.order_no}</h3>
      <p>{order.customer_name}</p>
      <button onClick={() => onEdit?.(order)}>Edit</button>
    </div>
  )
}
```

### Example 3: Service Functions

```typescript
import type { OrdersTable, OrdersInsert, OrdersUpdate } from '@/types/database'

// ✅ Specific input and output types
export class OrderService {
  async getById(id: string): Promise<OrdersTable | null> {
    // Implementation
  }
  
  async create(data: OrdersInsert): Promise<OrdersTable> {
    // Implementation
  }
  
  async update(id: string, data: OrdersUpdate): Promise<OrdersTable> {
    // Implementation
  }
  
  async delete(id: string): Promise<void> {
    // Implementation
  }
}
```

## Best Practices

### ✅ DO:
1. **Use database types** for DB operations
2. **Create domain types** for business logic
3. **Use type guards** for runtime validation
4. **Combine types** with `&` and `|` for specific cases
5. **Use generics** when truly reusable

### ❌ DON'T:
1. **Don't use `any`** - always use `unknown` if unsure
2. **Don't use `Record<string, unknown>`** everywhere - be specific
3. **Don't create duplicate types** - reuse database types
4. **Don't skip validation** - validate unknown data at boundaries

## Type Hierarchy

```
unknown (most generic)
  ↓
Record<string, unknown> (object, but unknown properties)
  ↓
Partial<OrdersTable> (optional Order properties)
  ↓
Pick<OrdersTable, 'id' | 'order_no'> (specific properties)
  ↓
OrdersTable (full type from database)
  ↓
OrderWithItems (extended with relations)
  ↓
Branded types (most specific)
```

## Tools Available

### From `@/types/database`:
- `OrdersTable`, `RecipesTable`, etc. - Row types
- `OrdersInsert`, `RecipesInsert`, etc. - Insert types
- `OrdersUpdate`, `RecipesUpdate`, etc. - Update types
- `Row<'orders'>`, `Insert<'orders'>` - Generic helpers

### From `@/types/type-utilities`:
- `isRecord()` - Check if value is object
- `hasKey()` - Check if object has key
- `typed()` - Type-safe Supabase client
- `safeGet()` - Safe property access

### From TypeScript:
- `Pick<T, K>` - Select specific properties
- `Omit<T, K>` - Exclude specific properties
- `Partial<T>` - Make all properties optional
- `Required<T>` - Make all properties required
- `Record<K, V>` - Object with specific key/value types

## Migration Strategy

1. **Start with API boundaries** - Type request/response
2. **Add database types** - Use generated types
3. **Create domain types** - For business logic
4. **Add type guards** - For runtime safety
5. **Refactor gradually** - One module at a time

## Example: Complete Type Flow

```typescript
// 1. Database type (auto-generated)
import type { OrdersTable, OrdersInsert } from '@/types/database'

// 2. Domain type (business logic)
export interface OrderWithItems extends OrdersTable {
  items: Array<{
    recipe_id: string
    quantity: number
    unit_price: number
  }>
}

// 3. Form type (UI)
export interface OrderFormData {
  customer_name: string
  items: Array<{ recipe_id: string; quantity: number }>
}

// 4. API type (network)
export interface CreateOrderRequest {
  order: OrderFormData
}

export interface CreateOrderResponse {
  data: OrderWithItems
  error: string | null
}

// 5. Type guard (validation)
export function isOrderFormData(value: unknown): value is OrderFormData {
  return (
    isRecord(value) &&
    typeof value.customer_name === 'string' &&
    Array.isArray(value.items)
  )
}

// 6. Usage (fully type-safe!)
export async function createOrder(formData: OrderFormData): Promise<OrderWithItems> {
  // Convert form to insert type
  const insertData: OrdersInsert = {
    user_id: getCurrentUserId(),
    customer_name: formData.customer_name,
    // ...
  }
  
  // Call API
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ order: insertData })
  })
  
  const result: CreateOrderResponse = await response.json()
  
  if (result.error) {
    throw new Error(result.error)
  }
  
  return result.data // Type: OrderWithItems
}
```

## Conclusion

**Key Principle**: Start generic (`unknown`), validate at boundaries, then use specific types everywhere else.

This gives you:
- ✅ Type safety throughout the app
- ✅ Better IDE autocomplete
- ✅ Catch errors at compile time
- ✅ Self-documenting code
- ✅ Easier refactoring

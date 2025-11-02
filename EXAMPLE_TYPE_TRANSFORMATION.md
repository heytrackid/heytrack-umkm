# Example: Type Transformation (Generic → Specific)

## Real Example from Codebase

### Before: Generic Unknown Types

```typescript
// ❌ Generic - no type safety
async function fetchData(url: string): Promise<unknown> {
  const response = await fetch(url)
  return response.json()
}

function processData(data: unknown): void {
  // Have to check everything manually
  if (typeof data === 'object' && data !== null) {
    // Still don't know what properties exist
  }
}
```

### After: Specific Database Types

```typescript
import type { OrdersTable } from '@/types/database'

// ✅ Specific return type
async function fetchOrders(): Promise<OrdersTable[]> {
  const response = await fetch('/api/orders')
  const json = await response.json()
  return json.data // TypeScript validates this!
}

// ✅ Specific parameter type
function processOrder(order: OrdersTable): void {
  console.log(order.order_no) // ✅ Type-safe!
  console.log(order.total_amount) // ✅ Autocomplete works!
  console.log(order.status) // ✅ TypeScript knows this exists!
}
```

## Step-by-Step Transformation

### Step 1: Identify the Data Structure

```typescript
// What data are we working with?
// - Orders from database
// - Has order_no, customer_name, total_amount, etc.
```

### Step 2: Find or Create the Type

```typescript
// Option A: Use existing database type
import type { OrdersTable } from '@/types/database'

// Option B: Create domain-specific type
import type { OrdersTable, OrderItemsTable } from '@/types/database'

export interface OrderWithItems extends OrdersTable {
  items: OrderItemsTable[]
}

// Option C: Create form-specific type
export interface OrderFormData {
  customer_name: string
  customer_phone: string
  items: Array<{
    recipe_id: string
    quantity: number
  }>
}
```

### Step 3: Apply the Type

```typescript
// ❌ Before
function handleSubmit(data: unknown) {
  // No type safety
}

// ✅ After
function handleSubmit(data: OrderFormData) {
  // Fully type-safe!
  console.log(data.customer_name) // ✅ Works!
  console.log(data.items[0].recipe_id) // ✅ Works!
}
```

### Step 4: Add Type Guards for Runtime Safety

```typescript
import { isRecord } from '@/lib/type-guards'

// ✅ Type guard for validation
export function isOrderFormData(value: unknown): value is OrderFormData {
  return (
    isRecord(value) &&
    typeof value.customer_name === 'string' &&
    typeof value.customer_phone === 'string' &&
    Array.isArray(value.items) &&
    value.items.every(item => 
      isRecord(item) &&
      typeof item.recipe_id === 'string' &&
      typeof item.quantity === 'number'
    )
  )
}

// ✅ Use it to safely handle unknown data
function handleUnknownData(data: unknown) {
  if (isOrderFormData(data)) {
    // Now TypeScript knows it's OrderFormData!
    processOrder(data)
  } else {
    throw new Error('Invalid order data')
  }
}
```

## Complete Real-World Example

### File: `src/app/api/orders/route.ts`

```typescript
// ❌ BEFORE: Generic types
export async function POST(req: Request) {
  try {
    const body = await req.json() // Type: unknown
    
    // No type safety - have to check everything manually
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid data' }, { status: 400 })
    }
    
    // Still no autocomplete or type checking
    const result = await createOrder(body)
    
    return Response.json({ data: result })
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
```

```typescript
// ✅ AFTER: Specific types
import type { OrdersInsert, OrdersTable } from '@/types/database'
import { OrderInsertSchema } from '@/lib/validations/domains/order'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // ✅ Validate with Zod - gets typed data
    const validatedData: OrdersInsert = OrderInsertSchema.parse(body)
    
    // ✅ Type-safe function call
    const result: OrdersTable = await createOrder(validatedData)
    
    // ✅ Type-safe response
    return createSuccessResponse(result)
  } catch (error) {
    return createErrorResponse(error)
  }
}
```

### File: `src/components/orders/OrderCard.tsx`

```typescript
// ❌ BEFORE: Generic props
interface OrderCardProps {
  order: Record<string, unknown>
  onEdit?: (order: Record<string, unknown>) => void
}

export const OrderCard = ({ order, onEdit }: OrderCardProps) => {
  // No type safety - have to cast or check everything
  const orderNo = order.order_no as string
  const amount = order.total_amount as number
  
  return (
    <div>
      <h3>{orderNo}</h3>
      <p>{amount}</p>
    </div>
  )
}
```

```typescript
// ✅ AFTER: Specific types
import type { OrdersTable } from '@/types/database'

interface OrderCardProps {
  order: OrdersTable
  onEdit?: (order: OrdersTable) => void
}

export const OrderCard = ({ order, onEdit }: OrderCardProps) => {
  // ✅ Fully type-safe - autocomplete works!
  return (
    <div>
      <h3>{order.order_no}</h3>
      <p>{order.total_amount}</p>
      <span>{order.status}</span>
      <button onClick={() => onEdit?.(order)}>Edit</button>
    </div>
  )
}
```

### File: `src/hooks/useOrders.ts`

```typescript
// ❌ BEFORE: Generic return type
export function useOrders() {
  const [orders, setOrders] = useState<unknown[]>([])
  
  const fetchOrders = async () => {
    const response = await fetch('/api/orders')
    const data = await response.json()
    setOrders(data) // No type checking
  }
  
  return { orders, fetchOrders }
}
```

```typescript
// ✅ AFTER: Specific types
import type { OrdersTable } from '@/types/database'
import { useQuery } from '@tanstack/react-query'

export function useOrders() {
  const { data: orders = [], isLoading, error } = useQuery<OrdersTable[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders')
      const json = await response.json()
      return json.data // TypeScript validates this is OrdersTable[]
    }
  })
  
  return { orders, isLoading, error }
}

// ✅ Usage is type-safe
function OrdersList() {
  const { orders } = useOrders()
  
  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          {order.order_no} {/* ✅ Autocomplete works! */}
        </div>
      ))}
    </div>
  )
}
```

## Pattern: API Response Wrapper

```typescript
// Create a generic API response type
export interface ApiResponse<T> {
  data: T
  error: string | null
  meta?: {
    page: number
    total: number
  }
}

// ✅ Use with specific types
type OrdersResponse = ApiResponse<OrdersTable[]>
type SingleOrderResponse = ApiResponse<OrdersTable>
type StatsResponse = ApiResponse<{ total: number; pending: number }>

// ✅ Type-safe fetch function
async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch('/api/orders')
  return response.json() // TypeScript knows the shape!
}

// ✅ Usage
const result = await fetchOrders()
if (result.error) {
  console.error(result.error)
} else {
  result.data.forEach(order => {
    console.log(order.order_no) // ✅ Type-safe!
  })
}
```

## Pattern: Form to Database Conversion

```typescript
import type { OrdersInsert } from '@/types/database'

// ✅ Form type (what user enters)
export interface OrderFormData {
  customer_name: string
  customer_phone: string
  items: Array<{
    recipe_id: string
    quantity: number
  }>
}

// ✅ Conversion function with specific types
export function formToInsert(
  form: OrderFormData,
  userId: string
): OrdersInsert {
  return {
    user_id: userId,
    customer_name: form.customer_name,
    customer_phone: form.customer_phone,
    order_no: generateOrderNo(),
    status: 'PENDING',
    total_amount: calculateTotal(form.items),
    // TypeScript ensures all required fields are present!
  }
}
```

## Quick Reference: When to Use What

| Situation | Type to Use | Example |
|-----------|-------------|---------|
| Database query result | `OrdersTable` | `const order: OrdersTable = await db.query()` |
| Creating new record | `OrdersInsert` | `const data: OrdersInsert = { ... }` |
| Updating record | `OrdersUpdate` | `const updates: OrdersUpdate = { status: 'COMPLETED' }` |
| Form data | Custom interface | `interface OrderFormData { ... }` |
| API response | Generic wrapper | `ApiResponse<OrdersTable>` |
| With relations | Extended type | `interface OrderWithItems extends OrdersTable { items: ... }` |
| Unknown external data | `unknown` + type guard | `if (isOrder(data)) { ... }` |
| Function parameters | Most specific possible | `function process(order: OrdersTable)` |
| Function returns | Most specific possible | `function fetch(): Promise<OrdersTable>` |

## Benefits Summary

### ✅ With Specific Types:
- IDE autocomplete works perfectly
- Catch errors at compile time
- Self-documenting code
- Easier refactoring
- Better developer experience

### ❌ With Generic Types:
- No autocomplete
- Errors only at runtime
- Need to check documentation
- Risky refactoring
- Poor developer experience

## Action Items

1. **Audit your code**: Find `unknown` and `Record<string, unknown>`
2. **Check if database type exists**: Use `OrdersTable`, `RecipesTable`, etc.
3. **Create domain types if needed**: Extend database types
4. **Add type guards**: For runtime validation
5. **Update function signatures**: Use specific types
6. **Test**: TypeScript will catch issues!

Remember: **Start generic at boundaries (API, user input), validate, then use specific types everywhere else!**

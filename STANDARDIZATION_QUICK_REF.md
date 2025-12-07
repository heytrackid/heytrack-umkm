# Standardization Quick Reference

## 🎯 Single Sources of Truth

### Constants
```typescript
import { 
  ORDER_STATUSES,
  PAYMENT_METHODS,
  CUSTOMER_TYPES,
  getOrderStatusLabel,
  getOrderStatusColor
} from '@/lib/shared/constants'
```

### Validation Schemas
```typescript
import { 
  PaginationQuerySchema,
  UUIDSchema,
  OrderStatusEnum,
  CustomerSchema
} from '@/lib/validations/common'
```

### Currency Formatting
```typescript
import { formatCurrentCurrency } from '@/lib/currency'
```

### API Routes
```typescript
import { createApiRoute } from '@/lib/api/route-factory'
```

## ✅ Do This

### Constants
```typescript
// ✅ Use centralized constants
import { ORDER_STATUSES } from '@/lib/shared/constants'
const pending = ORDER_STATUSES[0].value // 'PENDING'

// ✅ Use helper functions
import { getOrderStatusLabel } from '@/lib/shared/constants'
const label = getOrderStatusLabel('PENDING') // 'Menunggu'
```

### Validation
```typescript
// ✅ Use centralized schemas
import { PaginationQuerySchema } from '@/lib/validations/common'
const validated = PaginationQuerySchema.parse(query)

// ✅ Use enum schemas
import { OrderStatusEnum } from '@/lib/validations/common'
const schema = z.object({ status: OrderStatusEnum })
```

### Types
```typescript
// ✅ Import types from constants
import { type OrderStatus, type PaymentMethod } from '@/lib/shared/constants'

function process(status: OrderStatus, method: PaymentMethod): void {
  // Type-safe
}
```

## ❌ Don't Do This

### Constants
```typescript
// ❌ Hardcoded strings
if (order.status === 'PENDING') { }

// ❌ Hardcoded labels
const label = status === 'PENDING' ? 'Menunggu' : 'Unknown'

// ❌ Hardcoded colors
const color = status === 'PENDING' ? 'bg-yellow-100' : 'bg-gray-100'
```

### Validation
```typescript
// ❌ Inline schemas
const schema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

// ❌ Inline enums
const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS'])
})
```

### Types
```typescript
// ❌ Using any
function process(data: any): any { }

// ❌ Missing return types
function calculate(x: number, y: number) {
  return x + y
}
```

## 🔧 Common Patterns

### Order Status Check
```typescript
import { ORDER_STATUSES } from '@/lib/shared/constants'

// Filter by status
const pending = orders.filter(o => 
  o.status === ORDER_STATUSES.find(s => s.value === 'PENDING')?.value
)

// Get status info
const statusInfo = ORDER_STATUSES.find(s => s.value === order.status)
const label = statusInfo?.label || 'Unknown'
const color = statusInfo?.color || 'bg-gray-100'
```

### API Route with Validation
```typescript
import { createApiRoute } from '@/lib/api/route-factory'
import { PaginationQuerySchema, OrderStatusEnum } from '@/lib/validations/common'

export const runtime = 'nodejs'

const QuerySchema = PaginationQuerySchema.extend({
  status: OrderStatusEnum.optional()
})

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/orders',
    querySchema: QuerySchema,
    requireAuth: true
  },
  async (context, query) => {
    // query is fully typed and validated
    const { page, limit, status } = query
    // ...
  }
)
```

### Form with Validation
```typescript
import { CustomerSchema } from '@/lib/validations/common'
import { CUSTOMER_TYPES } from '@/lib/shared/constants'

const form = useForm({
  resolver: zodResolver(CustomerSchema),
  defaultValues: {
    type: CUSTOMER_TYPES[0].value
  }
})
```

### Status Badge Component
```typescript
import { getOrderStatusLabel, getOrderStatusColor } from '@/lib/shared/constants'

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('px-2 py-1 rounded', getOrderStatusColor(status))}>
      {getOrderStatusLabel(status)}
    </span>
  )
}
```

## 📦 Available Constants

| Constant | Usage |
|----------|-------|
| `ORDER_STATUSES` | Order status options |
| `PAYMENT_STATUSES` | Payment status options |
| `PAYMENT_METHODS` | Payment methods |
| `CUSTOMER_TYPES` | Customer classifications |
| `RECIPE_DIFFICULTIES` | Recipe difficulty levels |
| `INGREDIENT_UNITS` | Measurement units |
| `PRIORITY_LEVELS` | Priority classifications |
| `BUSINESS_UNITS` | Business departments |
| `USER_ROLES` | User roles |

## 📋 Available Schemas

| Schema | Usage |
|--------|-------|
| `PaginationQuerySchema` | API pagination |
| `DateRangeSchema` | Date range filtering |
| `UUIDSchema` | UUID validation |
| `EmailSchema` | Email validation |
| `OrderStatusEnum` | Order status enum |
| `CustomerSchema` | Customer form |
| `OrderSchema` | Order form |
| `RecipeSchema` | Recipe form |

## 🔍 Quick Commands

```bash
# Find hardcoded status values
grep -r "=== 'PENDING'" src/

# Find inline Zod schemas
grep -r "z\.object({" src/app/api/

# Type check
pnpm run type-check:all

# Lint
pnpm run lint:all

# Validate
pnpm run validate:all
```

## 📚 Full Documentation

See `STANDARDIZATION_GUIDE.md` for complete details.

# HeyTrack Code Consolidation - Migration Guide

## Overview
This guide helps developers migrate from duplicate constants and utilities to the new single source of truth pattern.

---

## Phase 1: Constants Migration ✅ COMPLETED

### What Changed?

**Single Source of Truth:** `src/lib/shared/constants.ts`

All business constants (ORDER_STATUSES, PAYMENT_METHODS, CUSTOMER_TYPES, etc.) are now centralized in one file with:
- Uppercase values (database standard)
- Color mappings for UI
- Helper functions for easy access
- TypeScript types

### Migration Examples

#### Before (Multiple Sources)
```typescript
// ❌ OLD - from form-utils.ts (lowercase)
import { ORDER_STATUSES } from '@/lib/shared/form-utils'
const status = ORDER_STATUSES.find(s => s.value === 'pending')

// ❌ OLD - from shared/index.ts (object format)
import { ORDER_STATUSES } from '@/shared'
const status = ORDER_STATUSES.PENDING // 'pending'
```

#### After (Single Source)
```typescript
// ✅ NEW - from constants.ts (uppercase with helpers)
import { 
  ORDER_STATUSES, 
  getOrderStatusLabel, 
  getOrderStatusColor 
} from '@/lib/shared/constants'

// Use the array for dropdowns
<Select>
  {ORDER_STATUSES.map(status => (
    <option key={status.value} value={status.value}>
      {status.label}
    </option>
  ))}
</Select>

// Use helper functions for display
const label = getOrderStatusLabel('PENDING') // 'Menunggu'
const color = getOrderStatusColor('PENDING') // 'bg-yellow-100 text-yellow-800'
```

### Available Constants

```typescript
// Order Management
ORDER_STATUSES // Array with value, label, color
PAYMENT_STATUSES // Array with value, label, color
PAYMENT_METHODS // Array with value, label

// Products & Recipes
RECIPE_DIFFICULTIES // Array with value, label
INGREDIENT_UNITS // Array with value, label

// Customers & Business
CUSTOMER_TYPES // Array with value, label
BUSINESS_UNITS // Array with value, label
USER_ROLES // Array with value, label

// UI & System
PRIORITY_LEVELS // Array with value, label, color
EXPORT_FORMATS // Array with value, label, extension
MODAL_SIZES // Object with size keys
TOAST_DURATION // Object with duration keys
TABLE_CONFIG // Object with table settings

// Validation & Storage
VALIDATION_MESSAGES // Object with message functions
STORAGE_KEYS // Object with key names
API_STATUS // Object with HTTP status codes
```

### Available Helper Functions

```typescript
// Status Helpers
getOrderStatusLabel(status: string): string
getOrderStatusColor(status: string): string
getPaymentStatusLabel(status: string): string
getPaymentStatusColor(status: string): string

// Other Helpers
getPaymentMethodLabel(method: string): string
getCustomerTypeLabel(type: string): string
getRecipeDifficultyLabel(difficulty: string): string
getPriorityLevelLabel(priority: string): string
getPriorityLevelColor(priority: string): string
```

### TypeScript Types

```typescript
import type { 
  OrderStatus,      // 'PENDING' | 'CONFIRMED' | ...
  PaymentStatus,    // 'PENDING' | 'PAID' | ...
  PaymentMethod,    // 'CASH' | 'BANK_TRANSFER' | ...
  CustomerType,     // 'REGULAR' | 'VIP' | ...
  RecipeDifficulty, // 'EASY' | 'MEDIUM' | 'HARD'
  PriorityLevel     // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
} from '@/lib/shared/constants'
```

### Common Migration Patterns

#### Pattern 1: Dropdown/Select Components
```typescript
// ❌ OLD
const statuses = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'confirmed', label: 'Dikonfirmasi' }
]

// ✅ NEW
import { ORDER_STATUSES } from '@/lib/shared/constants'
// Use ORDER_STATUSES directly
```

#### Pattern 2: Status Display
```typescript
// ❌ OLD
const getStatusLabel = (status: string) => {
  switch(status) {
    case 'pending': return 'Menunggu'
    case 'confirmed': return 'Dikonfirmasi'
    // ...
  }
}

// ✅ NEW
import { getOrderStatusLabel } from '@/lib/shared/constants'
const label = getOrderStatusLabel(status)
```

#### Pattern 3: Status Badge Colors
```typescript
// ❌ OLD
const getColor = (status: string) => {
  if (status === 'pending') return 'bg-yellow-100'
  // ...
}

// ✅ NEW
import { getOrderStatusColor } from '@/lib/shared/constants'
const color = getOrderStatusColor(status)
```

#### Pattern 4: Type Safety
```typescript
// ❌ OLD
function updateOrder(status: string) { }

// ✅ NEW
import type { OrderStatus } from '@/lib/shared/constants'
function updateOrder(status: OrderStatus) { }
```

---

## Phase 2: Currency Migration 🚧 UPCOMING

### What's Changing?

**Single Source of Truth:** `src/lib/currency.ts`

All currency formatting will use the robust currency.ts implementation with:
- Multi-currency support
- Type-safe Currency interface
- Locale-aware formatting
- Input parsing capabilities

### Migration Examples

#### Before
```typescript
// ❌ OLD - from utilities.ts
import { formatCurrency } from '@/lib/shared/utilities'
const formatted = formatCurrency(1000, 'IDR', 'id-ID')
```

#### After
```typescript
// ✅ NEW - from currency.ts
import { formatCurrentCurrency } from '@/lib/currency'
const formatted = formatCurrentCurrency(1000) // Uses user's currency setting

// OR with specific currency
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
const formatted = formatCurrency(1000, DEFAULT_CURRENCY)
```

### Available Functions

```typescript
// Basic Formatting
formatCurrency(amount: number, currency: Currency): string
formatCurrentCurrency(amount: number): string
formatCurrencyInput(value: string, currencyCode?: string): string

// Currency Info
getCurrentCurrency(): Currency
getCurrencySymbol(currencyCode: string): string
getCurrencyName(currencyCode: string): string
getSupportedCurrencies(): Currency[]

// Parsing & Validation
parseCurrencyString(currencyString: string, currency: Currency): number
isValidCurrencyAmount(amount: number): boolean

// Advanced
convertCurrency(amount: number, from: string, to: string, rate: number): number
createCurrencyFormatter(currency: Currency): (amount: number) => string
```

### Migration Checklist

- [ ] Find all `formatCurrency` imports from utilities.ts
- [ ] Replace with `formatCurrentCurrency` from currency.ts
- [ ] Update function signatures if needed
- [ ] Test currency display across app
- [ ] Verify multi-currency support works

---

## Phase 3: API Route Template 📋 PLANNED

### What's Coming?

**New Pattern:** `src/lib/api/route-template.ts`

Standardized API route creation with:
- Automatic error handling
- Auth middleware
- Response formatting
- Runtime configuration

### Preview

```typescript
// ✅ NEW Pattern
import { createApiRoute } from '@/lib/api/route-template'

export const GET = createApiRoute({
  auth: true,
  handler: async (req, context) => {
    // Your logic here
    return { data: result }
  }
})

export const runtime = 'nodejs' // Auto-configured
```

---

## Phase 4: Validation Schema 📋 PLANNED

### What's Coming?

**New Pattern:** Common validation schemas

```typescript
// ✅ NEW Pattern
import { 
  paginationSchema, 
  dateRangeSchema, 
  currencyAmountSchema 
} from '@/lib/validations/common'

const mySchema = z.object({
  ...paginationSchema.shape,
  amount: currencyAmountSchema
})
```

---

## Quick Reference

### Import Paths

| What | Where | Status |
|------|-------|--------|
| ORDER_STATUSES | `@/lib/shared/constants` | ✅ Use this |
| PAYMENT_METHODS | `@/lib/shared/constants` | ✅ Use this |
| CUSTOMER_TYPES | `@/lib/shared/constants` | ✅ Use this |
| formatCurrency | `@/lib/currency` | ✅ Use this |
| formatCurrency | `@/lib/shared/utilities` | ⚠️ Deprecated |
| ORDER_STATUSES | `@/lib/shared/form-utils` | ⚠️ Deprecated |
| ORDER_STATUSES | `@/shared` | ⚠️ Deprecated |

### Backward Compatibility

All deprecated imports still work but show deprecation warnings. They re-export from the new locations, so your code won't break. However, you should migrate to the new imports for:
- Better type safety
- Consistent behavior
- Future-proofing

### Need Help?

1. Check this guide first
2. Look at `CONSOLIDATION_PLAN.md` for detailed strategy
3. Search codebase for examples of new pattern
4. Ask team for clarification

---

**Last Updated:** 2025-11-22  
**Version:** 1.0  
**Status:** Phase 1 Complete, Phase 2-4 Planned

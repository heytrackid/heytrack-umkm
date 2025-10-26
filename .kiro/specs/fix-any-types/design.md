# Design Document: Fix Any Types

## Overview

This document outlines the design for systematically eliminating all `any` types from the codebase and replacing them with proper TypeScript types. The approach will be incremental, prioritizing high-impact areas first, and will leverage existing type definitions while creating new ones where needed.

## Architecture

### Type System Organization

The codebase already has a well-organized type system in `src/types/`:
- `index.ts` - Central export point
- `database.ts` - Database schema types
- `orders.ts` - Order-related types
- `inventory.ts` - Inventory types
- `recipes.ts` - Recipe types
- `hpp-tracking.ts` - HPP tracking types
- `common.ts` - Shared utility types
- `guards.ts` - Type guard functions
- `utils.ts` - Utility types

### Categorization of Any Types

Based on the search results, `any` types fall into these categories:

1. **Function Parameters** - Most common, found in services and components
2. **State Variables** - React state with `any` type
3. **Type Assertions** - `as any` casts
4. **Array/Object Data** - Generic data structures
5. **Event Handlers** - Event parameters
6. **API Responses** - Untyped API data
7. **Third-party Library Gaps** - Missing type definitions

## Components and Interfaces

### 1. Type Definition Strategy

#### New Type Interfaces Needed

```typescript
// src/types/forms.ts
export interface FormFieldUpdate<T> {
  field: keyof T
  value: T[keyof T]
}

export interface OrderItemUpdate {
  index: number
  field: keyof OrderItem
  value: string | number | boolean
}

// src/types/notifications.ts
export interface NotificationData {
  type: string
  priority: 'low' | 'medium' | 'high'
  metadata?: Record<string, unknown>
}

// src/types/analytics.ts
export interface InventoryAnalysis {
  ingredient_id: string
  status: 'critical' | 'low' | 'adequate' | 'overstocked'
  recommendation: string
  metrics: {
    current_stock: number
    min_stock: number
    usage_rate: number
  }
}

// src/types/export.ts
export interface ExportData<T = unknown> {
  headers?: string[]
  data: T[]
  filename?: string
}

export interface ExportOptions {
  format?: 'csv' | 'excel'
  includeHeaders?: boolean
  dateFormat?: string
}

// src/types/charts.ts
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}
```

### 2. Generic Type Patterns

Replace `any` with generics where appropriate:

```typescript
// Before
function updateItem(index: number, field: string, value: any) { }

// After
function updateItem<T extends Record<string, unknown>>(
  index: number,
  field: keyof T,
  value: T[keyof T]
) { }
```

### 3. Type Guards and Predicates

Create type guards for runtime validation:

```typescript
// src/types/guards.ts additions
export function isOrderItem(value: unknown): value is OrderItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'recipe_id' in value &&
    'quantity' in value
  )
}

export function isValidMetric(value: unknown): value is Metric {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'value' in value
  )
}
```

## Data Models

### Priority Areas for Type Fixes

#### High Priority (Core Business Logic)
1. **Order Services** (`src/modules/orders/services/`)
   - OrderPricingService.ts
   - InventoryUpdateService.ts
   - OrderValidationService.ts
   - ProductionTimeService.ts

2. **Recipe Components** (`src/modules/recipes/components/`)
   - RecipesPage.tsx
   - SmartPricingAssistant.tsx
   - AdvancedHPPCalculator.tsx

3. **Automation Components** (`src/components/automation/`)
   - smart-notifications.tsx
   - smart-inventory-manager.tsx
   - smart-pricing-assistant.tsx

#### Medium Priority (UI Components)
4. **Order Components** (`src/modules/orders/components/`)
   - OrderForm.tsx
   - OrderDetailView.tsx
   - OrdersTableView.tsx

5. **Form Components** (`src/components/forms/`)
   - Various form components with generic handlers

#### Low Priority (Utilities)
6. **Export Services** (`src/services/`)
   - excel-export-lazy.service.ts

7. **Chart Components** (`src/modules/charts/`)
   - Various chart components

### Type Replacement Patterns

#### Pattern 1: Recipe Type Assertions
```typescript
// Before
const recipe = recipes.find((r: any) => r.id === item.recipe_id)
const recipeName = (recipe as any).name

// After
import type { Recipe } from '@/types'
const recipe = recipes.find((r: Recipe) => r.id === item.recipe_id)
const recipeName = recipe?.name
```

#### Pattern 2: Form Update Handlers
```typescript
// Before
const updateFormData = (field: keyof FormData, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}

// After
const updateFormData = <K extends keyof FormData>(
  field: K,
  value: FormData[K]
) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}
```

#### Pattern 3: Array Operations
```typescript
// Before
items.map((item: any) => item.quantity)

// After
import type { OrderItem } from '@/types'
items.map((item: OrderItem) => item.quantity)
```

#### Pattern 4: State with Complex Types
```typescript
// Before
const [analysis, setAnalysis] = useState<any>(null)

// After
import type { PricingAnalysis } from '@/types'
const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null)
```

## Error Handling

### Type-Safe Error Handling

```typescript
// src/types/errors.ts additions
export interface TypedError<T = unknown> extends Error {
  code: string
  data?: T
}

export function isTypedError(error: unknown): error is TypedError {
  return error instanceof Error && 'code' in error
}
```

### Validation Errors

```typescript
export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}
```

## Testing Strategy

### Type Safety Verification

1. **Compilation Tests**
   - Enable `strict: true` in tsconfig.json
   - Enable `noImplicitAny: true`
   - Verify zero type errors

2. **Runtime Validation**
   - Add type guards where needed
   - Test edge cases with invalid data
   - Ensure proper error messages

3. **Incremental Validation**
   - Fix one module at a time
   - Run type check after each module
   - Verify no regressions in functionality

### Testing Approach

```typescript
// Example type test
import type { OrderItem } from '@/types'

function testOrderItemType() {
  const item: OrderItem = {
    id: '123',
    order_id: '456',
    recipe_id: '789',
    quantity: 2,
    unit_price: 50000,
    total_price: 100000,
    product_name: 'Test Product',
    special_requests: null
  }
  
  // TypeScript will catch any type mismatches
  return item
}
```

## Implementation Phases

### Phase 1: Core Types (High Priority)
- Fix order services
- Fix recipe components
- Fix automation components
- Create missing type definitions

### Phase 2: UI Components (Medium Priority)
- Fix form components
- Fix order UI components
- Fix chart components

### Phase 3: Utilities (Low Priority)
- Fix export services
- Fix helper utilities
- Fix remaining edge cases

### Phase 4: Configuration
- Update tsconfig.json to strict mode
- Add ESLint rules to prevent `any`
- Document type patterns

## Migration Strategy

### Safe Migration Process

1. **Identify** - Scan file for all `any` occurrences
2. **Analyze** - Determine correct type for each usage
3. **Create** - Add new type definitions if needed
4. **Replace** - Replace `any` with proper type
5. **Verify** - Run TypeScript compiler
6. **Test** - Ensure functionality unchanged

### Backward Compatibility

- Maintain existing API contracts
- Use union types for gradual migration
- Add type guards for runtime safety
- Document breaking changes if any

## Design Decisions

### Decision 1: Generic vs Specific Types
**Choice**: Use specific types where possible, generics for reusable patterns
**Rationale**: Specific types provide better IDE support and catch more errors

### Decision 2: Strict Mode Timing
**Choice**: Enable strict mode after all fixes complete
**Rationale**: Allows incremental progress without blocking development

### Decision 3: Type Organization
**Choice**: Keep types organized by domain in separate files
**Rationale**: Maintains existing structure, easier to navigate

### Decision 4: Type Assertions
**Choice**: Eliminate `as any`, use type guards instead
**Rationale**: Type guards provide runtime safety, not just compile-time

### Decision 5: Unknown vs Any
**Choice**: Use `unknown` for truly dynamic data, never `any`
**Rationale**: `unknown` forces type checking before use

## Performance Considerations

- Type checking is compile-time only, no runtime impact
- Type guards add minimal runtime overhead
- Better types enable better optimization by bundlers
- Improved IDE performance with proper types

## Security Considerations

- Type safety prevents many injection vulnerabilities
- Proper validation at type boundaries
- No implicit type coercion
- Clear data flow with typed interfaces

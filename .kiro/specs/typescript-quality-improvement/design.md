# Design Document

## Overview

Dokumen ini menjelaskan strategi komprehensif untuk meningkatkan kualitas TypeScript di seluruh codebase. Pendekatan ini akan dilakukan secara bertahap untuk meminimalkan breaking changes dan memastikan setiap perubahan dapat diverifikasi.

## Architecture

### Phased Approach

Perbaikan akan dilakukan dalam 4 fase utama:

1. **Phase 1: Type Infrastructure** - Memperbaiki type definitions dan interfaces dasar
2. **Phase 2: Core Libraries** - Memperbaiki lib/ dan utils/ directories
3. **Phase 3: Components & Hooks** - Memperbaiki React components dan custom hooks
4. **Phase 4: API Routes & Pages** - Memperbaiki API routes dan page components

### Type System Strategy

```
┌─────────────────────────────────────────┐
│         Type Definitions Layer          │
│  (src/types/*.ts - Base Interfaces)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Utility Types Layer             │
│  (Generic helpers, type guards)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Business Logic Layer               │
│  (lib/, services/ - Typed functions)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Presentation Layer                 │
│  (components/, hooks/ - Typed UI)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         API Layer                       │
│  (app/api/ - Typed routes)              │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Type Definitions Enhancement

#### Database Types
```typescript
// src/types/database.ts - Enhanced
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
  }
}

// Specific table types
export type Ingredient = Database['public']['Tables']['ingredients']['Row']
export type IngredientInsert = Database['public']['Tables']['ingredients']['Insert']
export type IngredientUpdate = Database['public']['Tables']['ingredients']['Update']
```

#### API Response Types
```typescript
// src/types/api.ts - New file
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  success: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

#### Component Props Types
```typescript
// src/types/components.ts - New file
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface DataTableProps<T> extends BaseComponentProps {
  data: T[]
  columns: ColumnDef<T>[]
  onRowClick?: (row: T) => void
  isLoading?: boolean
}
```

### 2. Utility Type Helpers

```typescript
// src/types/utils.ts - New file

// Make all properties required and non-nullable
export type RequiredNonNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}

// Extract function return type
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = 
  T extends (...args: unknown[]) => Promise<infer R> ? R : never

// Type-safe object keys
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// Strict Omit that checks keys exist
export type StrictOmit<T, K extends keyof T> = Omit<T, K>

// Type guard helper
export type TypeGuard<T> = (value: unknown) => value is T
```

### 3. Generic Patterns for Common Use Cases

#### API Client Pattern
```typescript
// src/lib/api/client.ts
export class TypedApiClient {
  async get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    // Implementation
  }
  
  async post<T, D = unknown>(
    url: string, 
    data: D, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    // Implementation
  }
}
```

#### Hook Return Type Pattern
```typescript
// Pattern for custom hooks
export interface UseDataResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useData<T>(fetcher: () => Promise<T>): UseDataResult<T> {
  // Implementation
}
```

## Data Models

### Core Entity Types

```typescript
// src/types/entities.ts - New consolidated file

export interface Ingredient {
  id: string
  name: string
  unit: string
  current_stock: number
  min_stock: number
  price_per_unit: number
  supplier_id: string | null
  category: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  category: string | null
  selling_price: number
  hpp_value: number | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface Order {
  id: string
  customer_id: string | null
  order_date: string
  total_amount: number
  status: OrderStatus
  payment_status: PaymentStatus
  notes: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
```

### Relationship Types

```typescript
// Types with relationships
export interface RecipeWithIngredients extends Recipe {
  ingredients: Array<{
    ingredient_id: string
    ingredient: Ingredient
    quantity: number
    unit: string
  }>
}

export interface OrderWithItems extends Order {
  items: Array<{
    recipe_id: string
    recipe: Recipe
    quantity: number
    unit_price: number
    subtotal: number
  }>
  customer: Customer | null
}
```

## Error Handling

### Typed Error System

```typescript
// src/lib/errors/types.ts
export class TypedError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'TypedError'
  }
}

export class ValidationError extends TypedError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends TypedError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}
```

### Error Handler with Types

```typescript
// src/lib/errors/handler.ts
export function handleError(error: unknown): ApiError {
  if (error instanceof TypedError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    }
  }
  
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred'
  }
}
```

## Testing Strategy

### Type Testing

```typescript
// src/types/__tests__/type-tests.ts
import { expectType, expectError } from 'tsd'

// Test that types are correctly inferred
expectType<Ingredient>({
  id: '123',
  name: 'Sugar',
  unit: 'kg',
  // ... all required fields
})

// Test that invalid types are caught
expectError<Ingredient>({
  id: 123, // Should be string
  name: 'Sugar'
})
```

### Runtime Type Guards

```typescript
// src/lib/type-guards.ts
export function isIngredient(value: unknown): value is Ingredient {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'unit' in value &&
    typeof (value as Ingredient).id === 'string' &&
    typeof (value as Ingredient).name === 'string'
  )
}

export function assertIngredient(value: unknown): asserts value is Ingredient {
  if (!isIngredient(value)) {
    throw new ValidationError('Invalid ingredient data')
  }
}
```

## Migration Strategy

### Step-by-Step Approach

1. **Create Type Infrastructure**
   - Add new type definition files
   - Create utility types
   - Set up type guards

2. **Fix Core Libraries (lib/)**
   - Replace `any` with proper types
   - Add generic type parameters
   - Fix function signatures

3. **Fix Utilities (utils/)**
   - Type all utility functions
   - Add proper return types
   - Fix parameter types

4. **Fix Hooks (hooks/)**
   - Type all custom hooks
   - Add proper return types
   - Fix dependency arrays

5. **Fix Components (components/)**
   - Add prop interfaces
   - Type event handlers
   - Fix children types

6. **Fix API Routes (app/api/)**
   - Type request bodies
   - Type response bodies
   - Add proper error types

7. **Fix Pages (app/)**
   - Type page props
   - Type server components
   - Fix async component types

### Verification at Each Step

```bash
# Run type check after each file/group of files
npm run type-check

# Check for any remaining
grep -r "any" src/ --include="*.ts" --include="*.tsx"
```

## Performance Considerations

### Type Compilation Performance

- Use `skipLibCheck: true` untuk external libraries
- Use `incremental: true` untuk faster rebuilds
- Avoid overly complex conditional types
- Use type aliases untuk reusable complex types

### Runtime Performance

- Type guards should be lightweight
- Avoid unnecessary type assertions
- Use discriminated unions untuk better type narrowing

## Security Considerations

### Type Safety for Security

```typescript
// Prevent SQL injection with typed queries
export interface QueryParams {
  [key: string]: string | number | boolean | null
}

export function buildQuery(
  table: string,
  params: QueryParams
): { query: string; values: unknown[] } {
  // Type-safe query building
}

// Sanitize user input with types
export function sanitizeInput<T extends Record<string, unknown>>(
  input: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(input)
}
```

## Implementation Notes

### Priority Files to Fix

High priority (most `any` usage):
1. `src/lib/supabase.ts` - Core database client
2. `src/lib/automation-engine.ts` - Business logic
3. `src/lib/hpp-alert-detector.ts` - Alert system
4. `src/lib/optimized-api.ts` - API client
5. `src/lib/enhanced-api.ts` - Enhanced API client

Medium priority:
6. `src/hooks/useSupabaseCRUD.ts`
7. `src/services/production/*.ts`
8. `src/lib/api/cache.ts`

### Common Patterns to Replace

```typescript
// ❌ Bad: Using any
function processData(data: any) {
  return data.map((item: any) => item.value)
}

// ✅ Good: Using generics
function processData<T extends { value: unknown }>(data: T[]): unknown[] {
  return data.map(item => item.value)
}

// ❌ Bad: Type assertion to any
const result = (await fetch(url)) as any

// ✅ Good: Proper typing
interface ApiResult {
  data: unknown
  error: string | null
}
const result = await fetch(url).then(r => r.json()) as ApiResult

// ❌ Bad: Implicit any in callbacks
items.map(item => item.process())

// ✅ Good: Explicit types
items.map((item: ProcessableItem) => item.process())
```

### TypeScript Config Enhancements

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Dependencies

- TypeScript 5.9.3 (already installed)
- Zod 4.1.11 (already installed) - for runtime validation
- No additional dependencies needed

## Rollback Plan

Jika ada masalah:
1. Setiap file diperbaiki dalam commit terpisah
2. Dapat rollback per-file jika needed
3. Type errors tidak akan break runtime (hanya compile time)
4. Dapat temporary disable strict checks untuk specific files dengan `// @ts-nocheck`

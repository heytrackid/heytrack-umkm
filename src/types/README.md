# Type Infrastructure

This directory contains the core type definitions for the application, providing type safety across the entire codebase.

## Files Overview

### `database.ts`
Contains all database entity types, including:
- Table row types (e.g., `Ingredient`, `Recipe`, `Order`)
- Insert types for creating new records
- Update types for modifying records
- Relationship types for joined data
- Helper types for type-safe table operations

**Usage:**
```typescript
import type { Ingredient, IngredientInsert, Recipe } from '@/types';

const ingredient: Ingredient = {
  id: '123',
  name: 'Sugar',
  unit: 'kg',
  // ... other required fields
};

const newIngredient: IngredientInsert = {
  name: 'Salt',
  unit: 'kg',
  // ... no id, created_at, updated_at needed
};
```

### `api.ts`
Contains API-related types:
- `ApiResponse<T>` - Standard response wrapper
- `ApiError` - Error structure
- `PaginatedResponse<T>` - Paginated data
- `QueryParams` - Query parameters for list endpoints

**Usage:**
```typescript
import type { ApiResponse, PaginatedResponse } from '@/types';

async function fetchIngredients(): Promise<ApiResponse<Ingredient[]>> {
  // Implementation
}

async function fetchPaginatedOrders(): Promise<PaginatedResponse<Order>> {
  // Implementation
}
```

### `components.ts`
Contains React component prop types:
- `BaseComponentProps` - Common props (className, children)
- `DataTableProps<T>` - Data table component props
- `FormFieldProps` - Form field props
- `ButtonProps` - Button component props
- And more...

**Usage:**
```typescript
import type { BaseComponentProps, DataTableProps } from '@/types';

interface MyComponentProps extends BaseComponentProps {
  title: string;
  onSave: () => void;
}

function MyTable<T>(props: DataTableProps<T>) {
  // Implementation
}
```

### `utils.ts`
Contains utility types for common patterns:
- `RequiredNonNull<T>` - Make all properties required and non-null
- `AsyncReturnType<T>` - Extract async function return type
- `StrictOmit<T, K>` - Type-safe Omit
- `PartialBy<T, K>` - Make specific properties optional
- And many more...

**Usage:**
```typescript
import type { RequiredNonNull, AsyncReturnType, PartialBy } from '@/types';

type RequiredIngredient = RequiredNonNull<Ingredient>;

async function fetchData() {
  return { id: 1, name: 'Test' };
}
type FetchResult = AsyncReturnType<typeof fetchData>;

type IngredientWithOptionalStock = PartialBy<Ingredient, 'current_stock' | 'min_stock'>;
```

### `guards.ts`
Contains type guards and assertions for runtime type checking:
- Type guards (e.g., `isIngredient`, `isOrder`)
- Type assertions (e.g., `assertIngredient`, `assertOrder`)
- Generic guards (e.g., `isArrayOf`, `isNonNull`)

**Usage:**
```typescript
import { isIngredient, assertIngredient, isArrayOf } from '@/types';

function processData(data: unknown) {
  if (isIngredient(data)) {
    // data is now typed as Ingredient
    console.log(data.name);
  }
}

function requireIngredient(data: unknown) {
  assertIngredient(data); // Throws if not an Ingredient
  // data is now typed as Ingredient
  return data.name;
}

function processArray(data: unknown) {
  if (isArrayOf(data, isIngredient)) {
    // data is now typed as Ingredient[]
    data.forEach(item => console.log(item.name));
  }
}
```

### `errors.ts`
Contains typed error classes for better error handling:
- `TypedError` - Base error class
- `ValidationError` - For invalid input
- `NotFoundError` - For missing resources
- `AuthenticationError` - For auth failures
- `AuthorizationError` - For permission failures
- And more...

**Usage:**
```typescript
import { ValidationError, NotFoundError, handleError } from '@/types';

function validateIngredient(data: unknown) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid ingredient data', { received: data });
  }
}

function getIngredient(id: string) {
  const ingredient = findIngredient(id);
  if (!ingredient) {
    throw new NotFoundError('Ingredient', id);
  }
  return ingredient;
}

// In error handlers
try {
  // Some operation
} catch (error) {
  const apiError = handleError(error);
  return Response.json(apiError, { status: apiError.statusCode });
}
```

### `index.ts`
Central export point for all types. Import from here for convenience:

```typescript
// Instead of:
import type { Ingredient } from '@/types/database';
import type { ApiResponse } from '@/types/api';
import { isIngredient } from '@/types/guards';

// Use:
import type { Ingredient, ApiResponse } from '@/types';
import { isIngredient } from '@/types';
```

## Best Practices

### 1. Always Use Explicit Types
```typescript
// ❌ Bad
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ Good
function processData<T extends { value: unknown }>(data: T[]): unknown[] {
  return data.map(item => item.value);
}
```

### 2. Use Type Guards for Runtime Checks
```typescript
// ❌ Bad
function processIngredient(data: unknown) {
  const ingredient = data as Ingredient; // Unsafe
  return ingredient.name;
}

// ✅ Good
function processIngredient(data: unknown) {
  if (!isIngredient(data)) {
    throw new ValidationError('Invalid ingredient');
  }
  return data.name; // Type-safe
}
```

### 3. Use Proper Insert/Update Types
```typescript
// ❌ Bad
function createIngredient(data: Ingredient) {
  // Requires id, created_at, updated_at which shouldn't be provided
}

// ✅ Good
function createIngredient(data: IngredientInsert) {
  // Only requires fields that should be provided
}
```

### 4. Use Typed Errors
```typescript
// ❌ Bad
throw new Error('Not found');

// ✅ Good
throw new NotFoundError('Ingredient', id);
```

### 5. Leverage Utility Types
```typescript
// ❌ Bad
interface UpdateIngredientParams {
  name?: string;
  unit?: string;
  current_stock?: number;
  // ... manually making everything optional
}

// ✅ Good
type UpdateIngredientParams = Partial<IngredientInsert>;
```

## Migration Guide

When fixing existing code:

1. **Replace `any` with proper types**
   ```typescript
   // Before
   function getData(): any { }
   
   // After
   function getData(): ApiResponse<Ingredient[]> { }
   ```

2. **Add type guards where needed**
   ```typescript
   // Before
   const data = await fetch(url).then(r => r.json());
   
   // After
   const data = await fetch(url).then(r => r.json());
   if (!isArrayOf(data, isIngredient)) {
     throw new ValidationError('Invalid response');
   }
   ```

3. **Use typed errors**
   ```typescript
   // Before
   if (!found) throw new Error('Not found');
   
   // After
   if (!found) throw new NotFoundError('Ingredient', id);
   ```

## Type Checking

Run type checking with:
```bash
npm run type-check
```

Check specific files:
```bash
npx tsc --noEmit src/types/*.ts
```

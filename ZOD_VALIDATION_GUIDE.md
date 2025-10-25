# 🛡️ Zod Validation Guide - HeyTrack

**Tanggal:** 25 Oktober 2025  
**Status:** ✅ READY TO USE

---

## 📚 Overview

Saya sudah membuat comprehensive Zod validation schemas untuk semua API endpoints di HeyTrack. Ini akan meningkatkan:

- ✅ **Type Safety** - TypeScript types dari Zod schemas
- ✅ **Runtime Validation** - Validate data saat runtime
- ✅ **Better Error Messages** - User-friendly validation errors
- ✅ **Code Quality** - Consistent validation across all APIs

---

## 📁 Files Created

### 1. `src/lib/validations/api-schemas.ts`
**Comprehensive Zod schemas untuk semua API endpoints:**

- Ingredient schemas (Create, Update, Purchase)
- Recipe schemas (Create, Update, with ingredients)
- Customer schemas (Create, Update)
- Order schemas (Create, Update, Status update)
- Operational Cost schemas
- Expense schemas
- Production Batch schemas
- Supplier schemas
- HPP Automation schemas
- AI Recipe Generation schemas
- Error Logging schemas

**Total: 20+ schemas** covering all API endpoints!

### 2. `src/lib/validations/validate-request.ts`
**Helper functions untuk validate requests:**

- `validateRequest()` - Validate request body
- `validateRequestOrRespond()` - Validate and auto-respond on error
- `validateQueryParams()` - Validate URL query parameters
- `validatePathParams()` - Validate path parameters
- `validationErrorResponse()` - Create error responses
- `safeParseWithDefault()` - Safe parsing with fallback

---

## 🚀 How to Use

### Basic Usage

```typescript
// src/app/api/ingredients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CreateIngredientSchema } from '@/lib/validations/api-schemas'
import { validateRequestOrRespond } from '@/lib/validations/validate-request'

export async function POST(request: NextRequest) {
  // Validate request body
  const data = await validateRequestOrRespond(request, CreateIngredientSchema)
  
  // If validation fails, error response is returned automatically
  if (data instanceof NextResponse) {
    return data
  }
  
  // Use validated data (fully typed!)
  const ingredient = await createIngredient(data)
  
  return NextResponse.json(ingredient)
}
```

### Advanced Usage

```typescript
// Manual validation with custom error handling
import { validateRequest } from '@/lib/validations/validate-request'

export async function POST(request: NextRequest) {
  const result = await validateRequest(request, CreateIngredientSchema)
  
  if (!result.success) {
    // Custom error handling
    console.error('Validation failed:', result.error)
    
    return NextResponse.json(
      {
        error: result.error.message,
        details: result.error.errors,
      },
      { status: 400 }
    )
  }
  
  // Use validated data
  const data = result.data
  // ...
}
```

### Query Parameters Validation

```typescript
import { z } from 'zod'
import { validateQueryParams } from '@/lib/validations/validate-request'

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const result = validateQueryParams(request, QuerySchema)
  
  if (!result.success) {
    return NextResponse.json(result.error, { status: 400 })
  }
  
  const { page, limit, search } = result.data
  // ...
}
```

### Path Parameters Validation

```typescript
import { z } from 'zod'
import { validatePathParams } from '@/lib/validations/validate-request'

const ParamsSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const result = validatePathParams(resolvedParams, ParamsSchema)
  
  if (!result.success) {
    return NextResponse.json(result.error, { status: 400 })
  }
  
  const { id } = result.data
  // ...
}
```

---

## 📊 Available Schemas

### Ingredients

```typescript
import {
  CreateIngredientSchema,
  UpdateIngredientSchema,
  IngredientPurchaseSchema,
} from '@/lib/validations/api-schemas'

// Create ingredient
const data = CreateIngredientSchema.parse({
  name: 'Tepung Terigu',
  unit: 'kg',
  price_per_unit: 15000,
  current_stock: 50,
  min_stock: 10,
})

// Update ingredient (all fields optional)
const updateData = UpdateIngredientSchema.parse({
  price_per_unit: 16000,
})

// Purchase ingredient
const purchaseData = IngredientPurchaseSchema.parse({
  ingredient_id: 'uuid-here',
  quantity: 25,
  unit_price: 16500,
  total_price: 412500,
})
```

### Recipes

```typescript
import {
  CreateRecipeSchema,
  UpdateRecipeSchema,
} from '@/lib/validations/api-schemas'

// Create recipe with ingredients
const data = CreateRecipeSchema.parse({
  name: 'Roti Tawar Premium',
  category: 'Roti',
  servings: 2,
  selling_price: 85000,
  ingredients: [
    {
      ingredient_id: 'uuid-1',
      quantity: 500,
      unit: 'gram',
    },
    {
      ingredient_id: 'uuid-2',
      quantity: 120,
      unit: 'gram',
    },
  ],
})
```

### Orders

```typescript
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
} from '@/lib/validations/api-schemas'

// Create order
const data = CreateOrderSchema.parse({
  order_no: 'ORD-2025-001',
  customer_name: 'Ibu Siti',
  customer_phone: '08123456789',
  total_amount: 255000,
  items: [
    {
      recipe_id: 'uuid-1',
      quantity: 3,
      unit_price: 85000,
      total_price: 255000,
    },
  ],
})

// Update order status
const statusData = UpdateOrderStatusSchema.parse({
  status: 'DELIVERED',
  notes: 'Delivered successfully',
})
```

### Customers

```typescript
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from '@/lib/validations/api-schemas'

// Create customer
const data = CreateCustomerSchema.parse({
  name: 'Ibu Siti',
  phone: '08123456789',
  email: 'siti@email.com',
  address: 'Jl. Contoh No. 123',
})
```

### Operational Costs

```typescript
import {
  CreateOperationalCostSchema,
} from '@/lib/validations/api-schemas'

// Create operational cost
const data = CreateOperationalCostSchema.parse({
  category: 'Utilities',
  amount: 500000,
  description: 'Electricity bill for January',
  recurring: true,
  frequency: 'monthly',
})
```

---

## 🎯 Migration Plan

### Priority 1: Critical APIs (High Traffic)

1. **Orders API** - `/api/orders/*`
   - POST /api/orders
   - PUT /api/orders/[id]
   - PATCH /api/orders/[id]/status

2. **Ingredients API** - `/api/ingredients/*`
   - POST /api/ingredients
   - PUT /api/ingredients/[id]
   - POST /api/ingredient-purchases

3. **Recipes API** - `/api/recipes/*`
   - POST /api/recipes
   - PUT /api/recipes/[id]

### Priority 2: Important APIs

4. **Customers API** - `/api/customers/*`
5. **Operational Costs API** - `/api/operational-costs/*`
6. **Expenses API** - `/api/expenses/*`

### Priority 3: Supporting APIs

7. **Production Batches API** - `/api/production-batches/*`
8. **Suppliers API** - `/api/suppliers/*`
9. **HPP Automation API** - `/api/hpp/*`
10. **AI Recipe Generation** - `/api/ai/generate-recipe`

---

## 📝 Example: Migrate Existing API

### Before (No Validation)

```typescript
// src/app/api/ingredients/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // No validation! 😱
    const { name, unit, price_per_unit } = body
    
    // Create ingredient
    const ingredient = await supabase
      .from('ingredients')
      .insert({ name, unit, price_per_unit })
    
    return NextResponse.json(ingredient)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### After (With Zod Validation)

```typescript
// src/app/api/ingredients/route.ts
import { CreateIngredientSchema } from '@/lib/validations/api-schemas'
import { validateRequestOrRespond } from '@/lib/validations/validate-request'

export async function POST(request: NextRequest) {
  try {
    // Validate request body ✅
    const data = await validateRequestOrRespond(request, CreateIngredientSchema)
    
    // Auto-return error response if validation fails
    if (data instanceof NextResponse) {
      return data
    }
    
    // Data is fully typed and validated! 🎉
    const ingredient = await supabase
      .from('ingredients')
      .insert(data)
    
    return NextResponse.json(ingredient)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### Benefits

**Before:**
- ❌ No type safety
- ❌ No runtime validation
- ❌ Poor error messages
- ❌ Potential security issues

**After:**
- ✅ Full type safety
- ✅ Runtime validation
- ✅ Clear error messages
- ✅ Secure by default

---

## 🔍 Validation Error Format

When validation fails, users get clear error messages:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "price_per_unit",
      "message": "Must be a positive number"
    }
  ]
}
```

---

## 💡 Best Practices

### 1. Always Validate User Input

```typescript
// ✅ Good
const data = await validateRequestOrRespond(request, CreateIngredientSchema)
if (data instanceof NextResponse) return data

// ❌ Bad
const body = await request.json()
// No validation!
```

### 2. Use Type Inference

```typescript
import { CreateIngredientInput } from '@/lib/validations/api-schemas'

// ✅ Good - Type is inferred from schema
function createIngredient(data: CreateIngredientInput) {
  // data is fully typed!
}

// ❌ Bad - Manual typing
function createIngredient(data: any) {
  // No type safety
}
```

### 3. Validate Query Parameters

```typescript
// ✅ Good
const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
})
const result = validateQueryParams(request, QuerySchema)

// ❌ Bad
const page = request.nextUrl.searchParams.get('page')
// No validation, could be null or invalid
```

### 4. Custom Error Messages

```typescript
// ✅ Good - Clear error messages
const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
})

// ❌ Bad - Generic error messages
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
})
```

---

## 🎉 Summary

### What You Get:

1. ✅ **20+ Zod schemas** for all API endpoints
2. ✅ **Helper functions** for easy validation
3. ✅ **Type safety** with TypeScript
4. ✅ **Better error messages** for users
5. ✅ **Consistent validation** across all APIs

### Files to Use:

- `src/lib/validations/api-schemas.ts` - All schemas
- `src/lib/validations/validate-request.ts` - Helper functions

### Next Steps:

1. Start migrating high-traffic APIs (Orders, Ingredients, Recipes)
2. Use `validateRequestOrRespond()` for quick migration
3. Test validation with invalid data
4. Update API documentation with validation rules

---

**Created:** 25 Oktober 2025  
**Status:** ✅ READY FOR IMPLEMENTATION  
**Impact:** 🚀 MAJOR IMPROVEMENT IN CODE QUALITY

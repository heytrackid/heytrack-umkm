# Type Guards - Usage Guide

Type guards help you validate data at runtime and provide type safety.

## 📚 Table of Contents

1. [Why Use Type Guards?](#why-use-type-guards)
2. [Basic Usage](#basic-usage)
3. [API Routes](#api-routes)
4. [Supabase Queries](#supabase-queries)
5. [Form Validation](#form-validation)
6. [Error Handling](#error-handling)

---

## Why Use Type Guards?

### ❌ Without Type Guards
```typescript
// Runtime error waiting to happen!
const { data } = await supabase.from('recipes').select('*').single()
console.log(data.name.toUpperCase()) // Error if data is null!

// Unsafe type assertion
const body = await request.json()
const recipe = body as Recipe // No validation!
```

### ✅ With Type Guards
```typescript
// Safe and type-checked
const { data } = await supabase.from('recipes').select('*').single()
if (isRecipe(data)) {
  console.log(data.name.toUpperCase()) // TypeScript knows data is valid
}

// Validated before use
const body = await request.json()
if (isRecipe(body)) {
  await saveRecipe(body) // Type-safe!
} else {
  return NextResponse.json({ error: 'Invalid recipe data' }, { status: 400 })
}
```

---

## Basic Usage

### Import Type Guards
```typescript
import { 
  isRecipe, 
  isIngredient, 
  isOrder,
  isString,
  isNumber,
  isUUID 
} from '@/lib/type-guards'
```

### Check Basic Types
```typescript
const value: unknown = getUserInput()

if (isString(value)) {
  console.log(value.toUpperCase()) // value is string
}

if (isNumber(value)) {
  console.log(value.toFixed(2)) // value is number
}

if (isUUID(value)) {
  await fetchById(value) // value is valid UUID
}
```

---

## API Routes

### Validate Request Body
```typescript
// src/app/api/recipes/route.ts
import { isRecipe } from '@/lib/type-guards'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // ✅ Validate before processing
    if (!isRecipe(body)) {
      return NextResponse.json(
        { error: 'Invalid recipe data' },
        { status: 400 }
      )
    }
    
    // Now body is typed as Recipe
    const { data, error } = await supabase
      .from('recipes')
      .insert(body)
      .select()
      .single()
    
    return NextResponse.json(data)
  } catch (error: unknown) {
    // ✅ Safe error handling
    if (isError(error)) {
      apiLogger.error({ error: error.message })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Validate Query Results
```typescript
// src/app/api/recipes/[id]/route.ts
import { isRecipe } from '@/lib/type-guards'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // ✅ Validate response structure
  if (!isRecipe(data)) {
    return NextResponse.json({ error: 'Invalid data structure' }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

---

## Supabase Queries

### Handle Nullable Results
```typescript
import { isRecipe, isRecipeWithIngredients } from '@/lib/type-guards'

// ✅ Safe single query
const { data } = await supabase
  .from('recipes')
  .select('*')
  .eq('id', recipeId)
  .single()

if (isRecipe(data)) {
  console.log(data.name) // Safe!
} else {
  console.log('Recipe not found')
}
```

### Handle Join Results
```typescript
// Supabase returns arrays for joins!
const { data } = await supabase
  .from('recipes')
  .select(`
    *,
    recipe_ingredients (
      *,
      ingredient:ingredients (*)
    )
  `)
  .eq('id', recipeId)
  .single()

// ✅ Validate structure
if (isRecipeWithIngredients(data)) {
  // Access nested data safely
  data.recipe_ingredients?.forEach(ri => {
    const ingredient = ri.ingredient?.[0] // Array!
    if (ingredient) {
      console.log(ingredient.name)
    }
  })
}
```

### Validate Array Results
```typescript
import { isRecipeArray } from '@/lib/type-guards'

const { data } = await supabase
  .from('recipes')
  .select('*')

// ✅ Validate array
if (isRecipeArray(data)) {
  data.forEach(recipe => {
    console.log(recipe.name) // Type-safe!
  })
}
```

---

## Form Validation

### Client-Side Validation
```typescript
import { isEmail, isPositiveNumber } from '@/lib/type-guards'

function validateForm(formData: FormData) {
  const email = formData.get('email')
  const price = formData.get('price')
  
  // ✅ Validate email
  if (!isEmail(email)) {
    return { error: 'Invalid email address' }
  }
  
  // ✅ Validate number
  const priceNum = Number(price)
  if (!isPositiveNumber(priceNum)) {
    return { error: 'Price must be positive' }
  }
  
  return { success: true }
}
```

### Server-Side Validation
```typescript
import { isUUID, isDateString } from '@/lib/type-guards'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // ✅ Validate UUID
  if (!isUUID(body.recipe_id)) {
    return NextResponse.json(
      { error: 'Invalid recipe ID' },
      { status: 400 }
    )
  }
  
  // ✅ Validate date
  if (!isDateString(body.order_date)) {
    return NextResponse.json(
      { error: 'Invalid date format (YYYY-MM-DD)' },
      { status: 400 }
    )
  }
  
  // Process valid data...
}
```

---

## Error Handling

### Safe Error Logging
```typescript
import { isError } from '@/lib/type-guards'

try {
  await riskyOperation()
} catch (error: unknown) {
  // ✅ Safe error handling
  if (isError(error)) {
    apiLogger.error({ 
      message: error.message,
      stack: error.stack 
    })
  } else {
    apiLogger.error({ error: String(error) })
  }
}
```

### API Error Responses
```typescript
import { isError } from '@/lib/type-guards'

export async function POST(request: NextRequest) {
  try {
    // ... operation
  } catch (error: unknown) {
    // ✅ Type-safe error response
    if (isError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
```

---

## Advanced Patterns

### Custom Type Guards
```typescript
// Create your own type guards
interface CustomData {
  id: string
  value: number
  tags: string[]
}

function isCustomData(value: unknown): value is CustomData {
  if (!isObject(value)) return false
  
  return (
    isString(value.id) &&
    isNumber(value.value) &&
    isStringArray(value.tags)
  )
}
```

### Combining Type Guards
```typescript
import { isRecipe, isSuccessResponse } from '@/lib/type-guards'

const response = await supabase
  .from('recipes')
  .select('*')
  .single()

// ✅ Check both response and data
if (isSuccessResponse(response) && isRecipe(response.data)) {
  console.log(response.data.name) // Fully type-safe!
}
```

### Enum Validation
```typescript
import { isOrderStatus } from '@/lib/type-guards'

export async function PUT(request: NextRequest) {
  const body = await request.json()
  
  // ✅ Validate enum value
  if (!isOrderStatus(body.status)) {
    return NextResponse.json(
      { error: 'Invalid order status' },
      { status: 400 }
    )
  }
  
  // body.status is now typed as OrderStatus
  await updateOrderStatus(orderId, body.status)
}
```

---

## Best Practices

### ✅ DO

1. **Use type guards for external data**
   ```typescript
   const body = await request.json()
   if (isRecipe(body)) {
     // Safe to use
   }
   ```

2. **Validate Supabase responses**
   ```typescript
   const { data } = await supabase.from('recipes').select('*').single()
   if (isRecipe(data)) {
     // Safe to use
   }
   ```

3. **Handle errors safely**
   ```typescript
   catch (error: unknown) {
     if (isError(error)) {
       console.log(error.message)
     }
   }
   ```

### ❌ DON'T

1. **Don't use type assertions without validation**
   ```typescript
   // ❌ Unsafe
   const recipe = body as Recipe
   
   // ✅ Safe
   if (isRecipe(body)) {
     const recipe = body
   }
   ```

2. **Don't skip validation for "trusted" sources**
   ```typescript
   // ❌ Even Supabase can return unexpected data
   const data = await supabase.from('recipes').select('*').single()
   console.log(data.name) // Might be null!
   
   // ✅ Always validate
   if (isRecipe(data)) {
     console.log(data.name)
   }
   ```

3. **Don't create overly complex type guards**
   ```typescript
   // ❌ Too complex
   function isComplexType(value: unknown): value is ComplexType {
     // 50 lines of validation...
   }
   
   // ✅ Use Zod for complex validation
   const ComplexSchema = z.object({ ... })
   const validation = ComplexSchema.safeParse(value)
   ```

---

## When to Use Type Guards vs Zod

### Use Type Guards When:
- ✅ Simple runtime type checking
- ✅ Validating Supabase responses
- ✅ Checking error types
- ✅ Quick type narrowing

### Use Zod When:
- ✅ Complex validation rules
- ✅ API request validation
- ✅ Form validation
- ✅ Need detailed error messages

### Example: Combining Both
```typescript
import { z } from 'zod'
import { isRecipe } from '@/lib/type-guards'

// Zod for input validation
const RecipeInputSchema = z.object({
  name: z.string().min(1).max(255),
  servings: z.number().positive(),
  // ... complex rules
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // ✅ Zod for detailed validation
  const validation = RecipeInputSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 400 }
    )
  }
  
  // Insert to database
  const { data } = await supabase
    .from('recipes')
    .insert(validation.data)
    .select()
    .single()
  
  // ✅ Type guard for response validation
  if (!isRecipe(data)) {
    return NextResponse.json(
      { error: 'Invalid response from database' },
      { status: 500 }
    )
  }
  
  return NextResponse.json(data)
}
```

---

## Summary

Type guards are essential for:
- ✅ Runtime type safety
- ✅ Validating external data
- ✅ Safe error handling
- ✅ Better developer experience

Use them whenever you're dealing with `unknown` or `any` types!

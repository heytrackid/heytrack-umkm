# Data Validation System Documentation

## Overview

This document describes the comprehensive data validation system implemented in the HeyTrack Bakery Management application using **Zod** for schema validation and **React Hook Form** for form handling.

## 🎯 Key Benefits

- **Type Safety**: End-to-end type validation from forms to API to database
- **User Experience**: Real-time validation with Indonesian error messages
- **Developer Experience**: Reusable schemas, standardized patterns
- **Security**: Server-side validation prevents malicious data
- **Maintainability**: Centralized validation logic

## 📁 File Structure

```
src/
├── lib/
│   ├── validations.ts          # Zod schemas and validation utilities
│   └── api-validation.ts       # API middleware and response utilities
├── components/forms/
│   └── enhanced-forms.tsx      # Form components with validation
├── hooks/
│   ├── useSupabaseCRUD.ts      # Standard CRUD operations
│   ├── useEnhancedCRUD.ts      # Enhanced CRUD with error handling
│   └── use-toast.ts            # Toast notification system
└── app/
    ├── api/ingredients/        # Example validated API routes
    └── validation-demo/        # Demo and testing page
```

## 🔧 Core Components

### 1. Zod Validation Schemas (`src/lib/validations.ts`)

#### Base Validation Utilities
```typescript
export const requiredString = z.string().min(1, 'Field ini wajib diisi')
export const positiveNumber = z.number().positive('Harus berupa angka positif')
export const rupiah = z.number().min(0).transform(val => Math.round(val))
export const indonesianName = z.string().min(2).max(100)
```

#### Entity Schemas
- `IngredientSchema` - Ingredient validation with business rules
- `RecipeSchema` - Recipe with instructions array validation
- `CustomerSchema` - Customer data with contact requirements
- `OrderSchema` - Order management with status workflows
- `ProductionSchema` - Production batch tracking
- `FinancialRecordSchema` - Financial transactions
- `StockTransactionSchema` - Inventory movements

#### Example Usage
```typescript
import { IngredientSchema, validateFormData } from '@/lib/validations'

const result = validateFormData(IngredientSchema, formData)
if (result.success) {
  // Data is valid, proceed
  console.log(result.data)
} else {
  // Handle validation errors
  console.log(result.errors)
}
```

### 2. API Validation Middleware (`src/lib/api-validation.ts`)

#### Request Validation
```typescript
import { withValidation, IngredientSchema } from '@/lib/validations'

export const POST = withValidation(
  IngredientSchema,
  async (req: NextRequest, validatedData) => {
    // Data is already validated and typed
    const result = await createIngredient(validatedData)
    return createSuccessResponse(result, 'Ingredient created successfully')
  }
)
```

#### Query Parameter Validation
```typescript
import { withQueryValidation, PaginationSchema } from '@/lib/api-validation'

export const GET = withQueryValidation(
  PaginationSchema,
  async (req: NextRequest, query) => {
    // Query parameters are validated and typed
    const { page, limit, search } = query
    // ... fetch data with pagination
  }
)
```

#### Response Utilities
```typescript
// Success response
return createSuccessResponse(data, 'Operation successful')

// Error response  
return createErrorResponse('Validation failed', 400, ['Field error'])

// Database error handling
return handleDatabaseError(error)
```

### 3. Enhanced Form Components (`src/components/forms/enhanced-forms.tsx`)

#### Form with Validation
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IngredientSchema } from '@/lib/validations'

export function IngredientForm({ onSubmit }: Props) {
  const form = useForm<IngredientFormData>({
    resolver: zodResolver(IngredientSchema) as any,
    defaultValues: {
      name: '',
      unit: 'kg',
      price_per_unit: 0,
      current_stock: 0,
      min_stock: 0,
      is_active: true
    }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)}>
      <FormField 
        label="Nama Bahan" 
        required 
        error={form.formState.errors.name?.message}
      >
        <Input {...form.register('name')} />
      </FormField>
      {/* More fields... */}
    </form>
  )
}
```

### 4. Enhanced CRUD Hooks (`src/hooks/useEnhancedCRUD.ts`)

#### Usage Example
```typescript
import { useEnhancedCRUD } from '@/hooks/useEnhancedCRUD'

function IngredientManager() {
  const ingredientCRUD = useEnhancedCRUD('ingredients', {
    showSuccessToast: true,
    showErrorToast: true,
    successMessages: {
      create: 'Ingredient berhasil ditambahkan!',
      update: 'Ingredient berhasil diperbarui!',
      delete: 'Ingredient berhasil dihapus!'
    }
  })

  const handleCreate = async (data) => {
    try {
      const result = await ingredientCRUD.create(data)
      // Success toast shown automatically
    } catch (error) {
      // Error toast shown automatically
    }
  }

  return (
    <div>
      <button onClick={() => handleCreate(data)} disabled={ingredientCRUD.loading}>
        {ingredientCRUD.loading ? 'Creating...' : 'Create Ingredient'}
      </button>
      {ingredientCRUD.error && (
        <div className="error">{ingredientCRUD.error}</div>
      )}
    </div>
  )
}
```

## 📋 Validation Rules

### Ingredient Validation
- **Name**: 2-100 characters, required
- **Unit**: Enum (kg, gram, liter, ml, pcs, pack)
- **Price**: Positive number, converted to Rupiah
- **Stock**: Non-negative numbers
- **Business Rule**: min_stock ≤ current_stock

### Recipe Validation
- **Name**: 2-100 characters, required
- **Servings**: 1-1000 portions
- **Prep Time**: 1-1440 minutes (24 hours max)
- **Instructions**: Array of non-empty strings, minimum 1
- **Difficulty**: Enum (EASY, MEDIUM, HARD)

### Customer Validation
- **Name**: 2-100 characters, required
- **Contact**: At least email OR phone required
- **Email**: Valid email format
- **Phone**: Minimum 10 digits
- **Loyalty Points**: Non-negative number

### Order Validation
- **Order Number**: Required string
- **Status**: Enum workflow (PENDING → CONFIRMED → IN_PROGRESS → READY → DELIVERED)
- **Payment Method**: Enum (CASH, TRANSFER, CREDIT_CARD, E_WALLET)
- **Amounts**: Non-negative numbers in Rupiah

### Financial Record Validation
- **Type**: Enum (INCOME, EXPENSE)
- **Amount**: Positive number in Rupiah
- **Date**: ISO datetime string
- **Recurring**: Optional with period (DAILY, WEEKLY, MONTHLY, YEARLY)

## 🌐 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "name: Nama minimal 2 karakter",
    "price_per_unit: Harus berupa angka positif"
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "ingredients": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🧪 Testing

### Unit Testing
Navigate to `/validation-demo` to access the testing interface:

1. **Unit Tests**: Direct validation function testing
2. **Form Examples**: Interactive form validation
3. **API Examples**: Server-side validation examples
4. **Live Data**: Real database integration

### Manual Testing Commands
```bash
# Run type checking
pnpm type-check

# Build project
pnpm build

# Start development server
pnpm dev

# Navigate to validation demo
open http://localhost:3000/validation-demo
```

## 🚀 Advanced Features

### 1. Pagination Support
```typescript
// API endpoint with pagination
export const GET = withQueryValidation(
  PaginationSchema.partial(),
  async (req: NextRequest, query) => {
    const { page = 1, limit = 10, search, sort, order } = query
    // ... implement pagination
  }
)
```

### 2. Bulk Operations
```typescript
const ingredientCRUD = useEnhancedCRUD('ingredients')

// Bulk create
await ingredientCRUD.bulkCreate([ingredient1, ingredient2, ingredient3])

// Bulk update
await ingredientCRUD.bulkUpdate([
  { id: 'id1', data: updates1 },
  { id: 'id2', data: updates2 }
])

// Bulk delete
await ingredientCRUD.bulkDelete(['id1', 'id2', 'id3'])
```

### 3. Custom Validation Rules
```typescript
export const IngredientSchema = z.object({
  // ... fields
}).refine(data => {
  // Custom business rule
  return data.min_stock <= data.current_stock
}, {
  message: 'Stok minimum tidak boleh lebih besar dari stok saat ini',
  path: ['min_stock']
})
```

### 4. Middleware Composition
```typescript
export const POST = withMiddleware(
  async (req: NextRequest, validatedData, userId) => {
    // Handler with validation, auth, and rate limiting
  },
  [
    withRateLimit(100, 60000),
    withAuth,
    withValidation(IngredientSchema),
    withCors()
  ]
)
```

## 🔒 Security Features

1. **Server-side Validation**: All data validated on server
2. **Type Safety**: TypeScript prevents runtime errors
3. **Input Sanitization**: Zod transforms and sanitizes data
4. **Rate Limiting**: Prevents abuse of API endpoints
5. **CORS Configuration**: Controlled cross-origin requests
6. **Database Constraints**: Additional validation at DB level

## 🌍 Internationalization

All error messages are in Indonesian for better user experience:
- Form validation errors in Indonesian
- API error responses in Indonesian
- Toast notifications in Indonesian
- Business-specific terminology (Rupiah, Indonesian units)

## 🔄 Migration Guide

### From Old System
1. Replace manual validation with Zod schemas
2. Update API routes to use validation middleware
3. Replace forms with enhanced form components
4. Update CRUD operations to use enhanced hooks

### Adding New Entities
1. Create Zod schema in `validations.ts`
2. Create form component in `enhanced-forms.tsx`
3. Create API routes with validation middleware
4. Add CRUD hooks if needed

## 📊 Performance Considerations

- **Client-side**: Real-time validation without server calls
- **Server-side**: Efficient validation with early returns
- **Caching**: Validation results cached where appropriate
- **Bundle Size**: Zod is tree-shakeable and optimized
- **Database**: Reduced invalid data reaching database

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript Errors**: Use `as any` for complex generic types
2. **Form Not Validating**: Check resolver and schema imports
3. **API Validation Failing**: Verify schema matches request data
4. **Toast Not Showing**: Ensure Toaster component is in layout

### Debug Mode
```typescript
// Enable validation debugging
const result = validateFormData(schema, data)
console.log('Validation result:', result)
if (!result.success) {
  console.log('Errors:', formatValidationErrors(result.errors))
}
```

## 📈 Future Enhancements

- [ ] Real-time collaborative validation
- [ ] Custom validation rule builder UI
- [ ] Validation performance monitoring
- [ ] A/B testing for validation messages
- [ ] Integration with external validation services
- [ ] Automatic schema generation from database
- [ ] Validation rule versioning and migration

---

**Built with ❤️ for HeyTrack Bakery Management System**  
*Comprehensive validation system ensuring data integrity and user experience*
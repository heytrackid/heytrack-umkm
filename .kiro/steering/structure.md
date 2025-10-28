---
inclusion: always
---

# Project Structure & Architecture

## Directory Organization

### Core Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature
- `src/modules/` - Self-contained feature modules with services
- `src/lib/` - Shared utilities and business logic
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `supabase/` - Database migrations and Edge Functions

### Path Aliases
```typescript
@/*           → ./src/*
@/modules/*   → ./src/modules/*
@/shared/*    → ./src/shared/*
```

## Architecture Patterns

### 1. Module-Based Architecture
Feature modules in `src/modules/` are self-contained with:
- `components/` - Feature-specific UI components
- `services/` - Business logic (e.g., HppCalculatorService, OrderPricingService)
- `hooks/` - Feature-specific React hooks
- `types/` - Feature-specific TypeScript types
- `index.ts` - Public API exports only

**When to use modules vs components:**
- Use `src/modules/[feature]/` for complex features with business logic
- Use `src/components/[feature]/` for simpler UI-focused features
- Services always go in modules, never in components

### 2. Server/Client Component Split
- **Default to Server Components** - Use for data fetching, static content
- **Client Components only when needed** - Use `"use client"` for interactivity, hooks, browser APIs
- **API routes for mutations** - Never call Supabase directly from Client Components

### 3. Data Flow Pattern
```
Component → API Route → Service → Supabase
         ← JSON Response ←
```
- Components call API routes via fetch or TanStack Query
- API routes validate with Zod schemas from `@/lib/validations`
- Services contain business logic and database operations
- All database access uses typed Supabase client from `@/lib/supabase-client`

### 4. Type Safety
- Import types from `@/types` or `@/types/[feature]`
- Use `@/types/supabase-generated.ts` as source of truth (auto-generated)
- Create type guards in `@/types/guards.ts` for runtime validation
- Use `import type` for type-only imports

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `OrderForm.tsx`, `RecipeCard.tsx` |
| Services | PascalCase | `HppCalculatorService.ts` |
| Utilities | kebab-case | `hpp-calculator.ts`, `currency-formatter.ts` |
| Hooks | camelCase with `use` | `useOrders.ts`, `useAuth.ts` |
| Types | kebab-case | `order-types.ts`, `hpp-tracking.ts` |
| API routes | `route.ts` | `src/app/api/orders/route.ts` |
| Pages | `page.tsx` | `src/app/orders/page.tsx` |

## Code Organization Rules

### Import Order
1. External packages (React, Next.js, third-party)
2. Internal aliases (`@/components`, `@/lib`, `@/modules`)
3. Relative imports (`./`, `../`)
4. Type imports last (use `import type`)

### Component Structure
```typescript
// 1. Imports
import { useState } from "react"
import type { Recipe } from "@/types"

// 2. Types/Interfaces
interface RecipeFormProps {
  recipe?: Recipe
}

// 3. Component
export function RecipeForm({ recipe }: RecipeFormProps) {
  // 4. Hooks
  const [isLoading, setIsLoading] = useState(false)
  
  // 5. Handlers
  const handleSubmit = async () => {}
  
  // 6. Render
  return <form>...</form>
}
```

### Service Structure
```typescript
// Services are classes with static methods
export class HppCalculatorService {
  static async calculateHpp(recipeId: string): Promise<HppResult> {
    // Business logic here
  }
}
```

## API Route Conventions

### Structure
```typescript
// src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { validateRequest } from "@/lib/validations/validate-request"
import { recipeSchema } from "@/lib/validations/api-schemas"

export async function POST(request: NextRequest) {
  // 1. Validate request
  const validation = await validateRequest(request, recipeSchema)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }
  
  // 2. Get authenticated user
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // 3. Business logic
  const result = await SomeService.doSomething(validation.data, user.id)
  
  // 4. Return response
  return NextResponse.json(result)
}
```

### REST Conventions
- `GET /api/recipes` - List recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/[id]` - Get single recipe
- `PATCH /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe

## Performance Patterns

### Lazy Loading
Use for heavy components (charts, AI features, exports):
```typescript
const HeavyChart = dynamic(() => import("@/components/charts/HeavyChart"), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### Data Fetching
- Use TanStack Query for client-side data fetching
- Use Server Components for initial data load
- Cache API responses with appropriate stale times
- Use `useOptimizedQuery` hook for common patterns

## Security Rules

### Row Level Security (RLS)
- All tables have `user_id` column for data isolation
- RLS policies enforce user can only access their own data
- Never bypass RLS in application code
- API routes must validate user ownership before mutations

### Authentication
- Use `createClient()` from `@/lib/supabase-client` for auth checks
- Protected routes use middleware in `src/middleware.ts`
- Auth pages in `src/app/auth/` (login, register, reset-password)
- Use `useAuth()` hook for client-side auth state

## Logging & Error Handling

### Logging
```typescript
import { logger } from "@/lib/logger"

// NEVER use console.log, console.error, etc.
logger.info("User created order", { orderId, userId })
logger.error("Failed to calculate HPP", { error, recipeId })
```

### Error Handling
```typescript
import { ApiError } from "@/lib/errors"

// Throw typed errors
throw new ApiError("Recipe not found", 404)

// Wrap features in error boundaries
import { RouteErrorBoundary } from "@/components/error-boundaries"
```

## Key Locations Reference

### When adding new features:
- **Page**: `src/app/[feature]/page.tsx`
- **API**: `src/app/api/[feature]/route.ts`
- **Components**: `src/components/[feature]/` or `src/modules/[feature]/components/`
- **Business Logic**: `src/modules/[feature]/services/`
- **Types**: `src/types/[feature].ts`
- **Validation**: `src/lib/validations/[feature]-schemas.ts`

### Common utilities:
- **Logger**: `@/lib/logger` (use instead of console)
- **Currency**: `@/lib/currency` for IDR formatting
- **Supabase**: `@/lib/supabase-client` for typed client
- **Validation**: `@/lib/validations/validate-request` for API validation
- **Auth**: `@/hooks/useAuth` for authentication state

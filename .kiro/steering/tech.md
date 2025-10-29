---
inclusion: always
---

# Technology Stack & Standards

## Core Stack

**Framework:** Next.js 16 (App Router) + React 18.3 + TypeScript 5.9 (strict mode)  
**Package Manager:** pnpm 9.15 (required - do not use npm/yarn)  
**Database:** Supabase (PostgreSQL + Auth + Real-time + Edge Functions)  
**UI:** Tailwind CSS 4 + shadcn/ui (Radix UI) + Lucide icons  
**State:** TanStack Query (server) + Zustand (client)  
**Forms:** React Hook Form + Zod validation  
**Logging:** Pino structured logger (NEVER use console.log/error/warn)

## Critical Import Patterns

### Supabase Client (MUST USE CORRECT IMPORT)

```typescript
// ✅ API Routes (server-side)
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()

// ✅ Client Components
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

// ✅ Admin/Service Role (SERVER-ONLY - Add 'server-only' import)
import 'server-only' // REQUIRED
import { createServiceRoleClient } from '@/utils/supabase/service-role'
const supabase = createServiceRoleClient()

// ❌ NEVER USE - This does not exist
import supabase from '@/utils/supabase'
```

### Logging (REQUIRED)

```typescript
// ✅ ALWAYS use structured logging
import { apiLogger, dbLogger } from '@/lib/logger'
apiLogger.info({ userId, orderId }, 'Order created')
apiLogger.error({ error, context }, 'Operation failed')

// ❌ NEVER use console
console.log() // Will fail ESLint
```

### Types (USE GENERATED TYPES)

```typescript
// ✅ Use generated Supabase types
import type { Database } from '@/types/supabase-generated'
type Recipe = Database['public']['Tables']['recipes']['Row']

// ❌ Don't create manual interfaces for DB tables
interface Recipe { id: string; name: string } // Wrong
```

## Path Aliases

```typescript
@/*           → ./src/*
@/components  → ./src/components/*
@/lib         → ./src/lib/*
@/modules     → ./src/modules/*
@/types       → ./src/types/*
@/hooks       → ./src/hooks/*
```

## Essential Commands

```bash
pnpm dev              # Start dev (Turbopack)
pnpm build            # Production build
pnpm type-check       # TypeScript validation
pnpm lint             # ESLint check
pnpm build:analyze    # Bundle analysis
```

## Code Quality Enforcement

1. **No console usage** - Use `logger` from `@/lib/logger` (enforced by ESLint)
2. **No explicit any** - Use proper types or `eslint-disable-next-line` with reason
3. **Type-only imports** - Use `import type` for types
4. **Server-only code** - Import `'server-only'` at top of server-only files
5. **Strict TypeScript** - All strict flags enabled, no implicit any

## Database Rules (RLS CRITICAL)

- **All tables have RLS** - User data isolation enforced at DB level
- **user_id required** - All user-owned tables MUST have user_id column
- **Always filter by user_id** - Include `.eq('user_id', user.id)` in queries
- **Timestamps** - created_at, updated_at on all tables
- **Soft deletes** - Use deleted_at column, not hard deletes

## API Route Standards

```typescript
// Standard structure for ALL API routes
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // 2. Validate
    const body = await request.json()
    const validation = Schema.safeParse(body)
    if (!validation.success) {
      throw new APIError('Invalid data', 400, 'VALIDATION_ERROR')
    }

    // 3. Execute with RLS
    const { data, error } = await supabase
      .from('table')
      .insert({ ...validation.data, user_id: user.id })
      .select()

    if (error) throw error

    // 4. Return
    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

## Service Pattern (MUST FOLLOW)

```typescript
// Services MUST accept supabase client and user_id as parameters
export class MyService {
  static async doSomething(
    supabase: SupabaseClient<Database>,
    userId: string,
    params: Params
  ): Promise<Result> {
    const { data } = await supabase
      .from('table')
      .select()
      .eq('user_id', userId) // Always filter by user_id
    return data
  }
}

// ❌ NEVER create services with hardcoded supabase import
```

## Validation Pattern

```typescript
// Domain schemas are source of truth
// File: src/lib/validations/domains/order.ts
export const OrderInsertSchema = z.object({
  order_no: z.string().min(1),
  customer_name: z.string().min(1),
  // ... all fields
})

// API schemas extend domain schemas
// File: src/lib/validations/api/order.ts
export const CreateOrderAPISchema = OrderInsertSchema.extend({
  client_timestamp: z.string().datetime().optional(),
})
```

## Key Libraries Reference

| Purpose | Library | Import |
|---------|---------|--------|
| Date handling | date-fns | `import { format } from 'date-fns'` |
| Currency | Custom | `import { formatCurrency } from '@/lib/currency'` |
| Excel export | ExcelJS | `import { ExcelExportService } from '@/services/excel-export-lazy.service'` |
| Charts | Recharts | `import { LineChart, BarChart } from 'recharts'` |
| Icons | Lucide | `import { Plus, Edit } from 'lucide-react'` |
| Forms | React Hook Form | `import { useForm } from 'react-hook-form'` |

## Performance Patterns

```typescript
// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/charts/Heavy'), {
  loading: () => <Skeleton />,
  ssr: false
})

// Use TanStack Query for caching
const { data } = useQuery({
  queryKey: ['recipes', userId],
  queryFn: () => fetchRecipes(),
  staleTime: 5 * 60 * 1000 // 5 minutes
})
```

## Common Pitfalls to Avoid

1. **Wrong Supabase import** - Use correct client for context (server/client/service-role)
2. **Missing user_id** - Always pass and filter by user_id for RLS
3. **Console logging** - Use structured logger instead
4. **Manual types** - Use generated types from supabase-generated.ts
5. **Magic numbers** - Use constants from `@/lib/constants/`
6. **Inconsistent error handling** - Always use `error: unknown` in catch blocks

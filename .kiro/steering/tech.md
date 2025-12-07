# Technology Stack

## Core Framework
- **Next.js 16** with App Router (React Server Components by default)
- **TypeScript** (strict mode enabled)
- **React 19** with concurrent features

## Backend & Database
- **Supabase**: PostgreSQL database with real-time features
- **Stack Auth**: Authentication and user management
- **Next.js API Routes**: RESTful API with `createApiRoute()` factory pattern
- **Row Level Security (RLS)**: Database-level access control

## Frontend Libraries
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Component library built on Radix UI
- **React Query (TanStack Query)**: Data fetching and caching
- **Zod**: Schema validation
- **React Hook Form**: Form management
- **Recharts**: Data visualization

## Build & Development Tools
- **pnpm**: Package manager
- **Turbo**: Build system and caching
- **ESLint**: Linting with flat config
- **TypeScript**: Type checking
- **Vitest**: Unit testing

## Performance Optimizations
- **Web Workers**: Heavy calculations (HPP, reports)
- **Code Splitting**: Lazy loading and dynamic imports
- **Image Optimization**: Next.js Image component
- **React Query**: Intelligent caching and background updates

## Common Commands

### Development
```bash
pnpm run dev              # Start dev server with Turbo
pnpm run dev:clean        # Clear cache and start
pnpm run dev:verbose      # Start with tracing enabled
```

### Build & Production
```bash
pnpm run build            # Production build
pnpm run build:fast       # Fast build (skip checks)
pnpm run build:validate   # Build with full validation
pnpm run build:analyze    # Build with bundle analysis
```

### Type Checking
```bash
pnpm run type-check       # Check current files
pnpm run type-check:all   # Check entire project
```

### Linting
```bash
pnpm run lint             # Lint current files
pnpm run lint:all         # Lint entire project
pnpm run lint:fix         # Auto-fix issues
```

### Validation
```bash
pnpm run validate         # Type check + lint
pnpm run validate:all     # Full project validation
pnpm run validate:quick   # Quick validation check
```

### Testing
```bash
npx vitest                        # Run all tests
npx vitest path/to/test.test.ts   # Run specific test
npx vitest --watch                # Watch mode
npx vitest --coverage             # With coverage report
```

### Database
```bash
pnpm run supabase:types         # Generate types from local DB
pnpm run supabase:types:remote  # Generate types from remote DB
```

### Maintenance
```bash
pnpm run clean      # Clear cache
pnpm run clean:all  # Full reset (node_modules + cache)
```

## Git Hooks
Pre-commit hook automatically runs `pnpm run validate` (lint + type-check) via Husky.

## Runtime Configuration
- **Node.js Runtime**: API routes use `export const runtime = 'nodejs'`
- **Edge Runtime**: Available for specific routes requiring edge deployment
- **Environment Variables**: Managed via `.env.local` (see `.env.example`)


## Code Organization - Single Source of Truth ✅

### Constants & Enums
**Import from:** `@/lib/shared/constants`
```typescript
import { 
  ORDER_STATUSES,
  PAYMENT_METHODS,
  CUSTOMER_TYPES,
  getOrderStatusLabel,
  getOrderStatusColor,
  type OrderStatus,
  type PaymentMethod
} from '@/lib/shared/constants'
```

**Available:**
- ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS
- CUSTOMER_TYPES, RECIPE_DIFFICULTIES, INGREDIENT_UNITS
- PRIORITY_LEVELS, BUSINESS_UNITS, USER_ROLES
- Helper functions: `getOrderStatusLabel()`, `getOrderStatusColor()`, etc.
- TypeScript types for all enums

**⚠️ NEVER hardcode status values or create duplicate constants!**

### Validation Schemas
**Import from:** `@/lib/validations/common`
```typescript
import { 
  PaginationQuerySchema,
  UUIDSchema,
  DateRangeSchema,
  EmailSchema,
  OrderStatusEnum
} from '@/lib/validations/common'
```

**Available:**
- Pagination: PaginationQuerySchema, PaginationSchema
- Date/Time: DateRangeSchema, DateStringSchema
- Files: FileUploadSchema, ImageUploadSchema
- IDs: UUIDSchema, IdParamSchema, IdsParamSchema
- Bulk: BulkDeleteSchema, BulkUpdateSchema
- Reports: ReportQuerySchema, SalesQuerySchema
- Base: EmailSchema, PhoneSchema, PositiveNumberSchema
- Enums: OrderStatusEnum, PaymentMethodEnum, UserRoleEnum
- Forms: CustomerSchema, OrderSchema, RecipeSchema
- API: HPPCalculationInputSchema, SalesCalculationSchema

**⚠️ NEVER create inline Zod schemas in API routes!**

### Currency Formatting
**Import from:** `@/lib/currency`
```typescript
import { 
  formatCurrentCurrency,
  getCurrentCurrency,
  type Currency
} from '@/lib/currency'
```

### API Routes
**Import from:** `@/lib/api/route-factory`
```typescript
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'

export const runtime = 'nodejs'

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/resource',
    querySchema: MyQuerySchema,
    requireAuth: true,
  },
  async (context, validatedQuery) => {
    // Handler logic
  }
)
```

**Pattern:** All API routes use `createApiRoute()` for consistency
- Built-in auth, validation, error handling, logging
- Always add `export const runtime = 'nodejs'` at top
- Use security presets from `@/utils/security/api-middleware`

### Standardization Documentation
- **Complete Guide:** `STANDARDIZATION_GUIDE.md` - Full migration instructions
- **Quick Reference:** `STANDARDIZATION_QUICK_REF.md` - Quick reference card
- **Summary:** `STANDARDIZATION_SUMMARY.md` - Current status and progress
- **Migration Tool:** `scripts/migrate-constants.sh` - Scan for issues

### Best Practices
1. **Always** import from centralized locations
2. **Never** hardcode status values or labels
3. **Never** create inline Zod schemas
4. **Use** helper functions for labels and colors
5. **Follow** TypeScript strict mode guidelines

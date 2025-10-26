---
inclusion: always
---

# Project Structure

## Root Organization

```
/
├── src/                    # Application source code
├── supabase/              # Database migrations and Edge Functions
├── public/                # Static assets
├── docs/                  # Documentation
└── .kiro/                 # Kiro AI configuration
```

## Source Directory (`src/`)

### App Router (`src/app/`)

Next.js 16 App Router with route groups and API routes:

```
src/app/
├── (dashboard)/           # Protected dashboard routes
├── auth/                  # Authentication pages (login, register, etc)
├── api/                   # API route handlers
│   ├── ai/               # AI-related endpoints
│   ├── hpp/              # HPP calculation endpoints
│   ├── ingredients/      # Ingredient CRUD
│   ├── recipes/          # Recipe CRUD
│   ├── orders/           # Order management
│   └── reports/          # Financial reports
├── dashboard/            # Main dashboard page
├── hpp/                  # HPP tracking pages
├── ingredients/          # Ingredient management pages
├── orders/               # Order management pages
├── recipes/              # Recipe management pages
├── customers/            # Customer management pages
├── reports/              # Reporting pages
├── layout.tsx            # Root layout
├── page.tsx              # Home page
└── globals.css           # Global styles
```

**Conventions:**
- Route groups use `(name)` for organization without affecting URL
- Each feature has its own folder with page.tsx and components/
- API routes follow REST conventions in route.ts files

### Components (`src/components/`)

Organized by feature and type:

```
src/components/
├── ui/                    # shadcn/ui components (Button, Card, etc)
├── forms/                 # Reusable form components
├── shared/                # Shared business components
├── automation/            # Automation feature components
├── dashboard/             # Dashboard-specific components
├── orders/                # Order-related components
├── production/            # Production management components
├── lazy/                  # Lazy-loaded components for performance
└── error-boundaries/      # Error boundary components
```

**Conventions:**
- UI primitives in `ui/` folder
- Feature-specific components in feature folders
- Shared components in `shared/`
- Use lazy loading for heavy components

### Types (`src/types/`)

Centralized type definitions:

```
src/types/
├── database.ts            # Re-exports from supabase-generated
├── supabase-generated.ts  # Auto-generated from Supabase
├── index.ts               # Main type exports
├── hpp-tracking.ts        # HPP-specific types
├── inventory.ts           # Inventory types
├── orders.ts              # Order types
├── finance.ts             # Financial types
├── guards.ts              # Type guard functions
└── common.ts              # Common utility types
```

**Conventions:**
- Import from `@/types` or `@/types/[specific]`
- Use generated types from Supabase as source of truth
- Create type guards for runtime validation

### Library (`src/lib/`)

Shared utilities and business logic:

```
src/lib/
├── supabase-client.ts     # Typed Supabase client utilities
├── validations/           # Zod schemas for validation
├── automation/            # Automation engine
├── hpp/                   # HPP calculation logic
├── business-services/     # Business logic services
├── logger.ts              # Structured logging (use instead of console)
├── errors.ts              # Error handling utilities
├── currency.ts            # Currency formatting
└── utils.ts               # General utilities
```

**Conventions:**
- Business logic goes in `lib/`, not components
- Use logger instead of console
- Validation schemas in `validations/`

### Hooks (`src/hooks/`)

Custom React hooks:

```
src/hooks/
├── api/                   # API data fetching hooks
├── supabase/              # Supabase-specific hooks
├── shared/                # Shared utility hooks
├── useAuth.ts             # Authentication hook
├── useDebounce.ts         # Debounce utility
└── useResponsive.ts       # Responsive design hook
```

**Conventions:**
- Prefix with `use`
- API hooks use TanStack Query
- Keep hooks focused and composable

### Modules (`src/modules/`)

Feature modules with encapsulated logic:

```
src/modules/
├── orders/
│   ├── components/        # Order-specific components
│   ├── services/          # Order business logic
│   └── types/             # Order types
├── recipes/
├── production/
└── reports/
```

**Conventions:**
- Self-contained feature modules
- Services contain business logic
- Components are feature-specific

## Supabase Directory (`supabase/`)

Database and serverless functions:

```
supabase/
├── functions/             # Edge Functions (Deno)
│   ├── hpp-daily-snapshots/
│   ├── hpp-alert-detection/
│   └── hpp-data-archival/
└── schema.sql             # Database schema and migrations
```

**Conventions:**
- Edge Functions use Deno runtime
- Each function has index.ts as entry point
- Include types.ts for function-specific types

## Path Aliases

Configured in `tsconfig.json`:

```typescript
"@/*"           → "./src/*"
"@/modules/*"   → "./src/modules/*"
"@/shared/*"    → "./src/shared/*"
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `OrderForm.tsx`)
- **Utilities**: kebab-case (e.g., `hpp-calculator.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useOrders.ts`)
- **Types**: kebab-case (e.g., `order-types.ts`)
- **API routes**: `route.ts` (Next.js convention)
- **Pages**: `page.tsx` (Next.js convention)

## Import Order

1. External packages (React, Next.js, etc)
2. Internal aliases (`@/components`, `@/lib`, etc)
3. Relative imports (`./`, `../`)
4. Type imports (use `import type`)

## Key Architectural Patterns

1. **Server/Client Component Split**: Use Server Components by default, Client Components only when needed
2. **API Layer**: All database access through API routes, not direct from components
3. **Type Safety**: Leverage Supabase generated types throughout
4. **Error Boundaries**: Wrap features in error boundaries for graceful failures
5. **Lazy Loading**: Use dynamic imports for heavy components
6. **RLS Enforcement**: All data access respects user_id isolation at database level

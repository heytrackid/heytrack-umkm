# Project Structure

## Architecture Pattern

The project follows a **modular monolith** architecture with domain-driven design principles:

- **Feature Modules**: Self-contained domains in `src/modules/` (orders, recipes, inventory, hpp, production, reports)
- **Shared Infrastructure**: Common utilities in `src/lib/`, `src/hooks/`, `src/components/`
- **Next.js App Router**: File-based routing in `src/app/`
- **Type-First Design**: Centralized type definitions in `src/types/`

## Directory Structure

```
src/
├── app/                      # Next.js App Router (pages, layouts, API routes)
│   ├── (dashboard)/         # Dashboard route group
│   ├── api/                 # API route handlers
│   │   ├── ingredients/     # Ingredient CRUD endpoints
│   │   ├── orders/          # Order management endpoints
│   │   ├── recipes/         # Recipe endpoints
│   │   ├── hpp/             # HPP calculation endpoints
│   │   └── ...              # Other domain endpoints
│   ├── auth/                # Authentication pages
│   ├── ingredients/         # Ingredient management pages
│   ├── orders/              # Order management pages
│   ├── recipes/             # Recipe management pages
│   ├── hpp/                 # HPP calculator pages
│   └── ...                  # Other feature pages
│
├── modules/                  # Feature modules (domain logic)
│   ├── orders/              # Order domain
│   │   ├── components/      # Order-specific components
│   │   ├── services/        # Business logic services
│   │   ├── hooks/           # Order-specific hooks
│   │   ├── types/           # Order type definitions
│   │   ├── constants.ts     # Order constants and config
│   │   └── index.ts         # Public API exports
│   ├── recipes/             # Recipe domain
│   ├── inventory/           # Inventory domain
│   ├── hpp/                 # HPP calculation domain
│   ├── production/          # Production planning domain
│   └── reports/             # Reporting domain
│
├── components/               # Shared UI components
│   ├── ui/                  # Base UI components (shadcn/ui)
│   ├── forms/               # Reusable form components
│   ├── layout/              # Layout components
│   ├── error-boundaries/    # Error boundary components
│   └── ...                  # Domain-specific shared components
│
├── lib/                      # Shared utilities and services
│   ├── api-core.ts          # API response helpers
│   ├── error-handler.ts     # Error handling utilities
│   ├── logger.ts            # Logging utilities
│   ├── supabase-client.ts   # Supabase client utilities
│   ├── validations/         # Zod schemas
│   ├── database/            # Database query helpers
│   ├── auth/                # Authentication utilities
│   └── ...                  # Other shared utilities
│
├── hooks/                    # Shared React hooks
│   ├── api/                 # API data fetching hooks
│   ├── supabase/            # Supabase-specific hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── useDebounce.ts       # Debounce utility hook
│   └── ...                  # Other shared hooks
│
├── types/                    # TypeScript type definitions
│   ├── database.ts          # Database table types (re-exports)
│   ├── supabase-generated.ts # Auto-generated Supabase types
│   ├── domain/              # Domain-specific types
│   ├── features/            # Feature-specific types
│   └── common.ts            # Common shared types
│
├── utils/                    # Utility functions
│   ├── supabase/            # Supabase utilities
│   │   ├── client.ts        # Client-side Supabase client
│   │   ├── server.ts        # Server-side Supabase client
│   │   ├── middleware.ts    # Supabase middleware
│   │   └── helpers.ts       # Supabase helper functions
│   └── security/            # Security utilities
│
├── services/                 # Business logic services
│   ├── hpp/                 # HPP calculation services
│   ├── inventory/           # Inventory management services
│   ├── orders/              # Order processing services
│   ├── production/          # Production planning services
│   └── recipes/             # Recipe management services
│
├── providers/                # React context providers
│   ├── QueryProvider.tsx    # TanStack Query provider
│   └── SupabaseProvider.tsx # Supabase client provider
│
└── workers/                  # Web Workers
    └── hpp-calculator.worker.ts # HPP calculation worker

supabase/
├── migrations/               # Database migrations
└── functions/                # Edge functions (Deno runtime)
```

## Key Conventions

### Module Structure

Each feature module follows this pattern:
```
modules/[domain]/
├── components/          # UI components specific to this domain
├── services/           # Business logic and data operations
├── hooks/              # Domain-specific React hooks
├── types/              # Type definitions
├── constants.ts        # Configuration and constants
├── utils/              # Helper functions
└── index.ts            # Public API (exports only what's needed)
```

### API Routes

API routes follow RESTful conventions:
- `GET /api/[resource]` - List resources with pagination
- `POST /api/[resource]` - Create new resource
- `GET /api/[resource]/[id]` - Get single resource
- `PUT /api/[resource]/[id]` - Update resource
- `DELETE /api/[resource]/[id]` - Delete resource

All API routes:
- Use `runtime = 'nodejs'` export for Node.js runtime
- Apply security middleware with `withSecurity()`
- Validate input with Zod schemas
- Use centralized error handling from `@/lib/api-core`
- Return standardized responses via `createSuccessResponse()` / `createErrorResponse()`

### Type Definitions

- **Database Types**: Auto-generated from Supabase schema in `src/types/supabase-generated.ts`
- **Domain Types**: Defined in `src/types/database.ts` (re-exports with cleaner names)
- **Feature Types**: Defined in module-specific `types/` directories
- **Naming Convention**: 
  - Table rows: `[TableName]Table` (e.g., `IngredientsTable`)
  - Insert types: `[TableName]Insert` (e.g., `IngredientsInsert`)
  - Update types: `[TableName]Update` (e.g., `IngredientsUpdate`)

### Import Aliases

Use absolute imports with path aliases:
- `@/*` - Root src directory
- `@/modules/*` - Feature modules
- `@/shared/*` - Shared utilities
- `@/inventory`, `@/orders`, `@/recipes`, etc. - Direct module access

**Never use relative imports** beyond the same directory (enforced by ESLint).

### Component Patterns

- **Server Components**: Default for pages and layouts (no hooks)
- **Client Components**: Mark with `'use client'` directive
- **Lazy Loading**: Use dynamic imports for heavy components
- **Error Boundaries**: Wrap async components with error boundaries
- **Function Components**: Use arrow functions (enforced by ESLint)

### Error Handling

- Use `try-catch` blocks in API routes and async operations
- Catch parameter must be named `error` (enforced by custom ESLint rule)
- Use `handleAPIError()` from `@/lib/api-core` for consistent error responses
- Log errors with `apiLogger` from `@/lib/logger`
- Never use `console.log/error/warn` (enforced by ESLint)

### Database Access

- **Client-side**: Use `createClient()` from `@/utils/supabase/client`
- **Server-side**: Use `createClient()` from `@/utils/supabase/server`
- **Type-safe queries**: Use helper functions from `@/lib/supabase-client`
- **Field selection**: Use constants from `@/lib/database/query-fields` instead of `SELECT *`
- **RLS**: All queries automatically filtered by user_id via Row Level Security

### Validation

- Define Zod schemas in `@/lib/validations/domains/[domain]`
- Validate API inputs with `withQueryValidation()` helper
- Validate form inputs with React Hook Form + Zod resolver
- Sanitize user input with DOMPurify in API middleware

### Logging

- Server-side: Use `apiLogger` from `@/lib/logger` (Pino-based)
- Client-side: Use `clientLogger` from `@/lib/client-logger`
- Never use `console.*` methods (enforced by ESLint)
- Log format: Structured JSON with context

## File Naming

- **Components**: PascalCase (e.g., `OrderForm.tsx`)
- **Utilities**: kebab-case (e.g., `api-helpers.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useOrders.ts`)
- **Types**: kebab-case (e.g., `order-types.ts`)
- **Constants**: kebab-case (e.g., `order-constants.ts`)

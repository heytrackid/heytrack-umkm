# Project Structure

## Root Directory Layout

```
├── src/                    # Source code
├── supabase/              # Database migrations and config
├── public/                # Static assets
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
└── .kiro/                 # Kiro configuration
```

## Source Directory (`src/`)

### Application Routes (`src/app/`)
Next.js App Router structure with file-based routing:
- `page.tsx` - Route pages (Server Components by default)
- `layout.tsx` - Shared layouts
- `loading.tsx` - Loading states
- `error.tsx` - Error boundaries
- `route.ts` - API route handlers
- `(dashboard)/` - Route groups (URL not affected)

**Key Routes:**
- `/` - Dashboard/home
- `/orders/` - Order management
- `/recipes/` - Recipe management with AI generator
- `/ingredients/` - Inventory management
- `/hpp/calculator/` - HPP cost calculator
- `/production/` - Production planning
- `/cash-flow/` - Financial transactions
- `/reports/` - Analytics and reports
- `/customers/` - Customer management
- `/suppliers/` - Supplier management
- `/api/` - API endpoints

### Components (`src/components/`)
Reusable UI components organized by feature:
- `shared/` - Generic reusable components (DataTable, Form, etc.)
- `layout/` - Layout components (AppLayout, Navigation)
- `navigation/` - Navigation components (SmartNavigation)
- `dashboard/` - Dashboard-specific widgets
- `orders/`, `recipes/`, `ingredients/` - Feature-specific components
- `ui/` - Shadcn/ui base components

### Modules (`src/modules/`)
Feature modules with encapsulated logic:
- `orders/` - Order management module
- `recipes/` - Recipe management module
- `hpp/` - HPP calculation module

**Module Structure:**
```
module-name/
├── components/     # Module-specific components
├── hooks/          # Module-specific hooks
├── utils.ts        # Module utilities
└── index.ts        # Public API exports
```

### Services (`src/services/`)
Business logic and data access layer:
- `reports/ReportService.ts` - Report generation
- `hpp/HppService.ts` - HPP calculations
- `production/ProductionService.ts` - Production logic
- Organized by domain (reports, hpp, production, etc.)

### Hooks (`src/hooks/`)
Custom React hooks for data fetching and state management:
- `useOrders.ts`, `useRecipes.ts`, `useIngredients.ts` - Data hooks
- `useAIChat.ts` - AI integration
- `usePreloading.ts` - Performance optimization
- `index.ts` - Centralized exports

### Library (`src/lib/`)
Core utilities and configurations:
- `api/route-factory.ts` - API route creation helper
- `validations/common.ts` - Zod validation schemas
- `shared/constants.ts` - Application constants and enums
- `currency.ts` - Currency formatting utilities
- `services/` - Shared service classes
- `automation/` - Background automation logic

### Types (`src/types/`)
TypeScript type definitions:
- `database.ts` - Database schema types
- `supabase-generated.ts` - Auto-generated Supabase types
- `shared/guards.ts` - Type guard functions
- Feature-specific types (orders, recipes, production, etc.)

### Utilities (`src/utils/`)
Helper functions and utilities:
- `supabase/client.ts` - Supabase client initialization
- `security/` - Security utilities and middleware
- Domain-specific utilities

### Other Directories
- `src/contexts/` - React Context providers
- `src/providers/` - App-level providers
- `src/stack/` - Stack Auth configuration
- `src/styles/` - Global styles
- `src/workers/` - Web Workers for heavy computations

## Path Aliases

TypeScript path mapping configured in `tsconfig.json`:
- `@/` → `src/`
- `@/modules/*` → `src/modules/*`
- `@/shared/*` → `src/shared/*`

**Usage:**
```typescript
import { formatCurrency } from '@/lib/currency'
import { OrdersPage } from '@/modules/orders'
import { Button } from '@/components/ui/button'
```

## Database (`supabase/`)

```
supabase/
├── migrations/        # SQL migration files
├── .branches/         # Branch-specific migrations
└── *.sql             # Utility SQL scripts
```

## Key Conventions

### File Naming
- **Components**: PascalCase (`OrdersList.tsx`, `RecipeForm.tsx`)
- **Utilities**: camelCase (`dateUtils.ts`, `formatters.ts`)
- **API Routes**: kebab-case folders, `route.ts` file
- **Types**: camelCase with `.d.ts` or `.ts` extension

### Component Organization
- One component per file (except tightly coupled sub-components)
- Co-locate related files (component + styles + tests)
- Use `index.ts` for clean exports from directories

### Import Order
1. External dependencies (React, Next.js, etc.)
2. Internal absolute imports (`@/lib`, `@/components`)
3. Relative imports (`./`, `../`)
4. Type imports (use `import type`)

### API Routes
All API routes use the `createApiRoute()` factory pattern:
```typescript
// src/app/api/resource/route.ts
export const runtime = 'nodejs'

export const GET = createApiRoute(
  { method: 'GET', path: '/api/resource', requireAuth: true },
  async (context) => { /* handler */ }
)
```

## Single Source of Truth

**Always import from these centralized locations:**
- Constants & Enums: `@/lib/shared/constants`
- Validation Schemas: `@/lib/validations/common`
- Currency Formatting: `@/lib/currency`
- API Route Factory: `@/lib/api/route-factory`

See `CONSOLIDATION_COMPLETE.md` for full consolidation guide.

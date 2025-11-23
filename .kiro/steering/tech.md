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

---
inclusion: always
---

# Technology Stack

## Framework & Runtime

- **Next.js 16**: React framework with App Router architecture
- **React 18.3**: UI library with Server/Client Components
- **TypeScript 5.9**: Strict type checking enabled
- **Node.js**: Runtime environment
- **pnpm 9.15**: Package manager (required)

## Backend & Database

- **Supabase**: PostgreSQL database with real-time capabilities
- **Supabase Auth**: Authentication and authorization
- **Row Level Security (RLS)**: Enforced on all tables
- **Edge Functions**: Deno-based serverless functions for automation
- **pg_cron**: Scheduled jobs for daily snapshots and alerts

## UI & Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Component library built on Radix
- **Lucide React**: Icon library
- **Recharts**: Data visualization

## State & Data Management

- **TanStack Query (React Query)**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form handling with Zod validation
- **Zod**: Schema validation

## Key Libraries

- **date-fns**: Date manipulation
- **ExcelJS**: Excel export functionality
- **Pino**: Structured logging (use instead of console)
- **next-themes**: Dark/light mode support

## Development Tools

- **ESLint**: Code linting with strict rules
- **TypeScript**: Strict mode with no implicit any
- **Bundle Analyzer**: Performance monitoring

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server (uses Turbopack)
pnpm dev:webpack           # Start dev with webpack

# Building
pnpm build                 # Production build
pnpm build:analyze         # Build with bundle analysis
pnpm type-check            # TypeScript type checking

# Quality
pnpm lint                  # Run ESLint
```

## Code Quality Rules

1. **No console usage**: Use `logger` from `@/lib/logger` instead
2. **No explicit any**: Must use proper types or add eslint-disable with reason
3. **Strict TypeScript**: All strict flags enabled
4. **Type imports**: Use `import type` for type-only imports
5. **Server-only imports**: Use `server-only` package for server code

## API Conventions

- **Route handlers**: Located in `src/app/api/[feature]/route.ts`
- **Validation**: Use Zod schemas from `@/lib/validations`
- **Error handling**: Use typed errors from `@/lib/errors`
- **Supabase client**: Use typed client from `@/lib/supabase-client`

## Database Conventions

- **All tables have RLS**: User isolation enforced at database level
- **user_id column**: Required on all user-owned tables
- **Timestamps**: created_at, updated_at on all tables
- **Soft deletes**: Use deleted_at instead of hard deletes where applicable

# Technology Stack

## Core Framework

- **Next.js 16**: React framework with App Router, Server Components, and Server Actions
- **React 18.3**: UI library with hooks and concurrent features
- **TypeScript 5.9**: Strict type checking enabled across the entire codebase

## Backend & Database

- **Supabase**: PostgreSQL database with real-time subscriptions, authentication, and Row Level Security (RLS)
- **Supabase Auth**: User authentication and session management
- **PostgreSQL Views**: Materialized views for complex queries (inventory_status, recipe_availability, order_summary)

## State Management & Data Fetching

- **TanStack Query (React Query)**: Server state management, caching, and data synchronization
- **Zustand**: Lightweight client state management
- **React Hook Form**: Form state and validation

## UI & Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled component primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Recharts**: Data visualization and charting
- **Lucide React**: Icon library

## Validation & Type Safety

- **Zod**: Runtime schema validation for API requests and forms
- **TypeScript Strict Mode**: All strict compiler options enabled

## Development Tools

- **ESLint 9**: Strict linting rules for code quality and consistency
- **Prettier**: Code formatting
- **pnpm**: Fast, disk-efficient package manager
- **Vitest**: Unit testing framework

## Performance & Optimization

- **Next.js Image Optimization**: Automatic image optimization with WebP/AVIF
- **Dynamic Imports**: Code splitting for lazy-loaded components
- **Web Workers**: Background processing for HPP calculations
- **API Response Caching**: In-memory caching for frequently accessed data

## Security

- **Content Security Policy (CSP)**: Strict CSP headers with nonce-based script execution
- **DOMPurify**: XSS protection for user-generated content
- **API Middleware**: Rate limiting, input sanitization, and security headers
- **Row Level Security**: Database-level access control via Supabase RLS policies

## Logging & Monitoring

- **Pino**: Structured JSON logging for server-side operations
- **Client Logger**: Browser-based logging with error tracking
- **Vercel Analytics**: Performance and usage analytics

## Common Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm dev:turbo             # Start with Turbopack (faster)
pnpm dev:clean             # Clean cache and start fresh

# Building
pnpm build                 # Production build
pnpm build:analyze         # Build with bundle analysis
pnpm start                 # Start production server

# Code Quality
pnpm lint                  # Run ESLint (strict, no warnings allowed)
pnpm lint:fix              # Auto-fix linting issues
pnpm type-check            # Run TypeScript compiler checks

# Database
pnpm supabase:types        # Generate TypeScript types from local Supabase
pnpm supabase:types:remote # Generate types from remote Supabase project

# Maintenance
pnpm clean                 # Remove build artifacts and cache
pnpm clean:all             # Full clean including node_modules
```

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-only)
- `NEXT_PUBLIC_APP_DOMAIN`: Application domain for CORS

## Runtime Configuration

- **Node.js Runtime**: Required for API routes (DOMPurify/jsdom dependency)
- **Standalone Output**: Optimized for containerized deployments
- **Turbopack**: Enabled for faster development builds

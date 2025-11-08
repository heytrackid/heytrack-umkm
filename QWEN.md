# HeyTrack UMKM - Comprehensive Culinary Business Management System

## Project Overview

HeyTrack is a comprehensive culinary business management system designed specifically for Indonesian UMKM (Usaha Mikro Kecil Menengah - Small Medium Enterprises). The application provides end-to-end business management solutions for culinary businesses, including:

- **Order Management**: Comprehensive order tracking, customer management, and order lifecycle
- **Inventory Management**: Stock tracking, ingredient management, and supplier coordination
- **Recipe Management**: Recipe creation, pricing, and cost calculation (HPP - Harga Pokok Penjualan)
- **Production Planning**: Production scheduling and tracking
- **Financial Analytics**: Revenue tracking, profit/loss calculations, and financial reporting
- **AI Assistant**: AI-powered chatbot for business insights and recommendations
- **Real-time Dashboard**: Analytics with charts and key business metrics

The application is built as a Next.js 16 application with TypeScript, using Supabase as the backend/database, and follows modern development practices with strict type safety, security measures, and comprehensive error handling.

## Technologies Stack

- **Framework**: Next.js 16 (React 18.3.1)
- **Language**: TypeScript 5.9.3 (strict mode)
- **Database**: Supabase (PostgreSQL backend)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand, React Query, SWR
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Packaging**: pnpm
- **Security**: CSP (Content Security Policy), Rate limiting

## Building and Running

### Prerequisites
- Node.js 18+
- pnpm package manager
- Access to Supabase project (with generated database types)

### Setup Commands

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Development server**:
   ```bash
   pnpm dev
   # Or with turbo mode:
   pnpm dev:turbo
   # Or with webpack:
   pnpm dev:webpack
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

4. **Start production server**:
   ```bash
   pnpm start
   ```

5. **Code quality checks**:
   ```bash
   # Type checking
   pnpm type-check
   
   # Linting
   pnpm lint
   # Or fix linting issues:
   pnpm lint:fix
   
   # Validation (type + lint)
   pnpm validate
   ```

6. **Supabase integration**:
   ```bash
   # Generate types from local Supabase schema
   pnpm supabase:types
   
   # Generate types from remote Supabase project
   pnpm supabase:types:remote
   ```

7. **Clean operations**:
   ```bash
   # Clean cache and build artifacts
   pnpm clean
   
   # Clean all (including node_modules)
   pnpm clean:all
   ```

## Development Conventions

### Code Style
- **TypeScript**: Strict mode enabled with no `any` types allowed
- **Naming**: camelCase for functions/variables, PascalCase for components/types, SCREAMING_SNAKE_CASE for constants
- **Imports**: Absolute imports using `@/` alias only (no relative imports)
- **Formatting**: No semicolons, single quotes, 100 character line limit, trailing commas, no enums (use union types instead)

### Security Practices
- All API endpoints must use security middleware (`withSecurity()`)
- Input validation with Zod schemas before processing
- Content Security Policy (CSP) with strict policies
- Multi-tenancy enforced with `user_id` filtering
- Rate limiting applied to all endpoints
- No direct console usage (use proper loggers)

### Error Handling
- Centralized error handling using `handleAPIError()` helper
- Comprehensive logging with request IDs for tracing
- Fail-fast approach with early validation
- Graceful degradation patterns

### API Development Standards
- Runtime declaration: `export const runtime = 'nodejs'`
- All endpoints follow standard template with authentication, validation, and error handling
- Response format consistency using helper functions
- Mandatory security middleware on all endpoints
- Type-safe throughout (no `any` types)

### Database Access
- All database operations go through Supabase client
- User isolation with `eq('user_id', user.id)` filter
- Generated TypeScript types from Supabase schema
- Input validation with Zod before database operations

### Testing
- Unit tests with Vitest
- Component testing with React Testing Library
- API integration tests for all endpoints
- End-to-end tests for critical user flows

## Key Architecture Components

### Project Structure
- `src/app/` - Next.js 13+ App Router pages and API routes
- `src/components/` - Reusable UI components
- `src/modules/` - Domain-specific modules (orders, recipes, inventory, etc.)
- `src/lib/` - Core libraries and utilities
- `src/utils/` - Helper functions and utility modules
- `src/types/` - TypeScript type definitions
- `src/services/` - Business logic services
- `src/providers/` - React context providers

### Core Modules
1. **Orders**: Order lifecycle management (pending → confirmed → in production → ready → delivered)
2. **Recipes**: Recipe creation, pricing, and HPP (cost calculation)
3. **Inventory**: Ingredient tracking, stock management, supplier integration
4. **Production**: Production planning and batch tracking
5. **Reports**: Analytics, charts, and business insights
6. **Finance**: Revenue tracking, expense management, financial reporting

### Security & Middleware
- Custom middleware for authentication and authorization
- Content Security Policy with nonce-based script protection
- Rate limiting using Upstash
- CORS configuration for secure API access
- Request validation and sanitization

This system is designed for production use with comprehensive monitoring, logging, and security measures in place.
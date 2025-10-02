# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Testing
```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI interface
pnpm test:e2e:ui

# Run tests in headed mode (visible browser)
pnpm test:e2e:headed

# Run specific test file
npx playwright test tests/automation-engine.spec.js

# Generate test report
npx playwright show-report
```

### Database & Supabase
```bash
# Run migrations
supabase migration up

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/database.ts

# Reset local database
supabase db reset
```

## Architecture Overview

### Tech Stack
- **Next.js 15.5.4** with App Router and Turbopack
- **TypeScript** for type safety
- **Supabase** for PostgreSQL database with real-time features
- **TailwindCSS 4.0** + **ShadCN/UI** for styling
- **Recharts** for data visualization
- **Playwright** for E2E testing (115+ tests)
- **React Hook Form + Zod** for form handling
- **Lucide React** for icons

### Database Schema
Core tables include:
- `ingredients` - Raw materials with stock tracking
- `recipes` - Product recipes with servings and instructions  
- `recipe_ingredients` - Junction table linking recipes to ingredients
- `customers` - Customer data with loyalty tracking
- `orders` + `order_items` - Order management system
- `productions` - Batch production tracking
- `stock_transactions` - Inventory movement history
- `financial_records` - Income/expense tracking

### Smart Automation Engine (`src/lib/automation-engine.ts`)
Central business logic engine providing:
- **HPP Calculation**: Automatic cost calculation with profit margin suggestions
- **Inventory Management**: Smart reorder points, EOQ calculations, stock alerts
- **Production Planning**: Batch optimization, timeline calculation, resource checking
- **Financial Analytics**: Profit analysis, trend detection, automated alerts
- **Smart Notifications**: Context-aware alerts for critical business events

Configuration via `UMKM_CONFIG` with Indonesian F&B industry defaults (60% margin, 7-day reorder points).

### App Structure
```
src/app/
├── (dashboard)/           # Main dashboard with KPIs
├── recipes/              # Recipe management with HPP
├── hpp/                  # Dedicated HPP calculator
├── ingredients/          # Ingredient CRUD with stock alerts
├── inventory/           # Advanced inventory with trends
├── orders/              # Order management system
├── customers/           # Customer database
├── production/          # Production planning
├── finance/             # Financial dashboard with charts
├── expenses/            # Smart expense automation ⭐
├── reports/             # Analytics & reporting
└── settings/            # System configuration
```

### Component Architecture
- **UI Components** (`src/components/ui/`): ShadCN/UI based system
- **Layout Components** (`src/components/layout/`): Sidebar, app layout
- **Automation Components** (`src/components/automation/`): Smart features
- **Chart Components** (`src/components/charts/`): Recharts wrappers
- **CRUD Components** (`src/components/crud/`): Reusable data management

### Data Management
- **Custom Hooks** (`src/hooks/`): 
  - `useSupabaseCRUD`: Generic CRUD operations with real-time
  - `useSupabaseData`: Data fetching with subscriptions
  - `useExpenses`: Expense management logic
  - `useResponsive`: Mobile-responsive utilities

### Key Business Logic Files
- `src/lib/hpp-calculator.ts`: HPP calculation engine
- `src/lib/automation-engine.ts`: Smart business automation
- `src/lib/supabase.ts`: Database client configuration
- `src/types/database.ts`: Generated TypeScript types

## Development Guidelines

### Database Operations
- Use the automation engine for business calculations rather than manual math
- HPP calculations should use `HPPCalculator.calculateRecipeHPP()`
- Inventory management should leverage `AutomationEngine.analyzeInventoryNeeds()`
- Always check ingredient availability before production planning

### Testing Strategy
- E2E tests focus on business automation features
- Tests verify smart notifications, HPP calculations, and production planning
- Each major feature has dedicated test coverage in `tests/`
- Run tests against local dev server (`http://localhost:3000`)

### Component Development
- Use ShadCN/UI components from `src/components/ui/`
- Follow the established CRUD pattern for data management
- Implement responsive design using custom hooks
- Chart components should be interactive with Recharts

### API Integration
- Supabase client is configured with real-time subscriptions
- CRUD operations use the generic `useSupabaseCRUD` hook
- Financial automation integrates with the MCP server
- Use TypeScript types from `src/types/database.ts`

### Smart Features Implementation
- Leverage the automation engine for business logic
- Implement progressive notifications using the notification system
- Use the financial analysis engine for insights and recommendations
- Production planning should integrate with ingredient availability checking

## Special Features

### Expense Automation (Flagship Feature)
The smart expense automation system provides:
- Automated recurring payment tracking
- Budget optimization suggestions (saves up to Rp 450,000/month)
- Real-time progress bars and alerts
- 8 detailed expense categories with intelligent analysis
- Cost spike detection and overdue payment notifications

### Mobile-First Design
- Responsive sidebar with overlay behavior on mobile
- Touch-optimized interface with mobile-friendly charts
- Progressive Web App capabilities
- Mobile viewport testing included in Playwright suite

### Indonesian Localization
- Business logic configured for Indonesian F&B industry standards
- Currency formatting in Rupiah
- Local business practices integrated (profit margins, reorder cycles)
- Indonesian language support in UI components

## Production Deployment

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_ACCESS_TOKEN=your_access_token  # For MCP server
```

### Build Configuration
- TypeScript and ESLint errors are ignored in builds (configured in `next.config.ts`)
- Turbopack enabled for development performance
- Production builds use standard Next.js optimization

### Testing in CI/CD
- Playwright configured for CI environments
- Retry logic built into test configuration
- HTML reports generated for test results
- Cross-browser testing (Chrome, Firefox, Safari, Mobile)
# HeyTrack Agent Guidelines

## Commands
- **Development**: `pnpm run dev` (with Turbo), `pnpm run dev:clean` (clear cache), `pnpm run dev:verbose` (with tracing)
- **Build**: `pnpm run build`, `pnpm run build:fast`, `pnpm run build:validate`, `pnpm run build:analyze` (bundle analysis)
- **Type Checking**: `pnpm run type-check` (current), `pnpm run type-check:all` (full project)
- **Linting**: `pnpm run lint` (current), `pnpm run lint:all` (full), `pnpm run lint:fix` (auto-fix)
- **Validation**: `pnpm run validate` (type + lint), `pnpm run validate:all` (full project), `pnpm run validate:quick` (quick check)
- **Testing**: `npx vitest` (all), `npx vitest path/to/test.test.ts` (single), `npx vitest --watch` (watch mode), `npx vitest --coverage` (with coverage)
- **Database**: `pnpm run supabase:types` (generate types), `pnpm run supabase:types:remote` (from remote)
- **Maintenance**: `pnpm run clean` (cache), `pnpm run clean:all` (full reset)
- **Git Hooks**: Pre-commit hook runs `pnpm run validate` (lint + type-check) automatically

## Code Style & Conventions

### TypeScript Configuration
- **Strict Mode**: All strict options enabled (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, etc.)
- **Path Mapping**: `@/` for `src/`, `@/modules/*` for modules, `@/shared/*` for shared code
- **Import Types**: Use `import type { Type }` for type-only imports
- **Explicit Returns**: All functions must have explicit return types
- **No Any**: Never use `any` type, use `unknown` or proper types
- **Interface vs Type**: Use `interface` for object types, `type` for unions/aliases

### React Patterns
- **Components**: Functional components only, arrow functions, TypeScript interfaces for props
- **Hooks**: Custom hooks prefixed with `use`, follow Rules of Hooks
- **Server Components**: Default for pages/layouts, mark client components with `'use client'`
- **Props**: Destructure props, use `...props` for rest props, no prop-types package
- **Event Handlers**: Prefix with `handle` or `on`, use proper typing

### Naming Conventions
- **Functions/Variables**: camelCase (`getUserData`, `isValidEmail`)
- **Components/Types**: PascalCase (`UserProfile`, `ApiResponse`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_TIMEOUT`)
- **Files**: kebab-case for components (`user-profile.tsx`), camelCase for utilities (`dateUtils.ts`)
- **Hooks**: `use` prefix (`useAuth`, `useDebounce`)
- **Services**: PascalCase with `Service` suffix (`UserService`, `EmailService`)

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

### Documentation
- **Full Guide:** `CONSOLIDATION_COMPLETE.md`
- **Quick Reference:** `QUICK_CONSOLIDATION_REFERENCE.md`
- **Migration:** `MIGRATION_GUIDE.md`


## HeyTrack Application Features & Logic

### Core Business Logic

HeyTrack is a comprehensive culinary business management system designed to help food businesses optimize operations, maximize profits, and streamline workflows. The application focuses on three main pillars: **Cost Management**, **Operations**, and **Analytics**.

### 1. Dashboard (Beranda)
**Purpose**: Central hub providing real-time business overview and quick actions.

**Key Features**:
- **Real-time Statistics**: Revenue, orders, customers, and inventory metrics
- **Onboarding Wizard**: Automated setup for new users with guided tour
- **Quick Actions**: Direct access to create orders, generate recipes, manage inventory
- **Stock Alerts**: Automatic notifications for low-stock items
- **Financial Trends**: 90-day revenue and inventory trend charts

**Logic**:
- Fetches aggregated data from `/api/dashboard/stats`
- Triggers onboarding for users with no data
- Uses React Query for efficient data caching and background updates
- Implements progressive disclosure pattern for new users

### 2. HPP (Harga Pokok Penjualan) Calculator
**Purpose**: Advanced cost calculation system for food pricing optimization.

**Key Features**:
- **Recipe Cost Analysis**: Detailed breakdown of ingredient costs per recipe
- **Scenario Planning**: What-if analysis for pricing strategies
- **Cost Trend Monitoring**: Historical cost tracking and alerts
- **Pricing Recommendations**: AI-powered optimal pricing suggestions
- **Worker-based Calculations**: High-performance background processing

**Logic**:
- Uses Web Workers for complex calculations to avoid blocking UI
- Implements cost allocation algorithms (direct vs indirect costs)
- Supports multiple pricing scenarios with profit margin calculations
- Real-time cost updates when ingredient prices change

### 3. Order Management (Pesanan)
**Purpose**: Complete order lifecycle management from creation to fulfillment.

**Key Features**:
- **Multi-step Order Creation**: Customer selection → Items → Delivery → Payment
- **WhatsApp Integration**: Automated order confirmations and updates
- **Order Status Tracking**: Real-time status updates with notifications
- **Customer Management**: Integrated customer database with order history
- **Payment Processing**: Multiple payment method support

**Logic**:
- State machine pattern for order status transitions
- Real-time inventory validation during order creation
- Automatic stock reservation system
- Integration with WhatsApp Business API for notifications

### 4. Recipe Management (Resep)
**Purpose**: Recipe database with AI-powered generation and cost analysis.

**Key Features**:
- **AI Recipe Generator**: Create recipes using natural language prompts
- **Ingredient Cost Tracking**: Automatic cost calculation per recipe
- **Production Scaling**: Batch size adjustments with proportional costing
- **Recipe Categories**: Organized recipe library with search and filters
- **Cost Optimization**: Identify most profitable recipes

**Logic**:
- AI integration for recipe generation using Openrouter API
- Ingredient-based cost calculation with waste factor consideration
- Recipe versioning system for iterative improvements
- Cross-referencing with inventory for availability checking

### 5. Inventory Management (Bahan Baku)
**Purpose**: Comprehensive ingredient and raw material tracking.

**Key Features**:
- **Stock Level Monitoring**: Real-time inventory with low-stock alerts
- **Purchase Tracking**: Supplier management and purchase history
- **Cost Tracking**: Price per unit with historical pricing
- **Bulk Import/Export**: CSV import for mass data updates
- **Supplier Management**: Multi-supplier support with pricing comparison

**Logic**:
- (Weighted Average Cost) inventory valuation
- Automatic reorder point calculations
- Supplier performance tracking (delivery time, quality)
- Integration with purchase orders and recipe consumption

### 6. Production Management (Produksi)
**Purpose**: Production planning and batch tracking for food manufacturing.

**Key Features**:
- **Batch Production**: Track production batches with quality control
- **Production Scheduling**: Plan production based on orders and inventory
- **Quality Assurance**: Production checklists and quality metrics
- **Yield Tracking**: Monitor production efficiency and waste
- **Cost Allocation**: Allocate overhead costs to production batches

**Logic**:
- Production batch lifecycle management
- Integration with recipes for ingredient consumption
- Quality control checkpoints with pass/fail criteria
- Cost roll-up from ingredients to finished products

### 7. Cash Flow Management (Arus Kas)
**Purpose**: Financial transaction tracking and cash flow analysis.

**Key Features**:
- **Transaction Categorization**: Income/expense classification
- **Category Management**: Customizable transaction categories
- **Period Filtering**: Flexible date range analysis
- **Trend Analysis**: Visual cash flow trends and projections
- **Budget Tracking**: Budget vs actual spending analysis

**Logic**:
- Double-entry accounting principles
- Category-based budgeting and variance analysis
- Cash flow forecasting using historical patterns
- Integration with sales and expense data

### 8. Reports & Analytics (Laporan)
**Purpose**: Comprehensive business intelligence and reporting.

**Key Features**:
- **Profit Reports**: Detailed profit/loss analysis by period
- **Sales Reports**: Revenue analysis by product, category, customer
- **Inventory Reports**: Stock movement and valuation reports
- **Financial Trends**: Long-term business performance visualization
- **Export Functionality**: PDF/Excel export for external reporting

**Logic**:
- Multi-dimensional data aggregation
- Time-series analysis with growth calculations
- Comparative period analysis (YoY, MoM)
- Automated report generation with scheduled delivery

### 9. Customer Management (Pelanggan)
**Purpose**: Customer relationship management integrated with sales.

**Key Features**:
- **Customer Profiles**: Complete customer information and history
- **VIP Classification**: Customer segmentation and loyalty programs
- **Order History**: Complete purchase history per customer
- **Communication Tracking**: Customer interaction logs
- **Analytics**: Customer lifetime value and retention metrics

**Logic**:
- Customer segmentation algorithms
- RFM (Recency, Frequency, Monetary) analysis
- Automated VIP status based on purchase thresholds
- Integration with order management for seamless data flow

### 10. Supplier Management (Pemasok)
**Purpose**: Supplier relationship management for procurement optimization.

**Key Features**:
- **Supplier Profiles**: Complete supplier information and performance history
- **Supplier Classification**: Preferred/standard/trial/blacklisted categorization
- **Performance Tracking**: Delivery time, quality ratings, and cost analysis
- **Procurement Analytics**: Supplier comparison and optimization metrics
- **Contract Management**: Payment terms, credit limits, and lead time tracking

**Logic**:
- Supplier classification algorithms based on performance metrics
- Automated supplier scoring (quality, timeliness, cost)
- Preferred supplier prioritization for procurement
- Integration with inventory management for seamless supply chain

### 11. Settings & Configuration
**Purpose**: System configuration and user preferences.

**Key Features**:
- **User Profile Management**: Personal settings and preferences
- **Business Settings**: Company information and branding
- **Notification Preferences**: Customizable alert settings
- **Security Settings**: Password management and access controls
- **Data Management**: Import/export and data backup options

**Logic**:
- Role-based access control (RBAC)
- User preference persistence
- Business rule configuration
- Data validation and sanitization

### Technical Architecture

**Frontend**:
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Query for data management
- Shadcn/ui component library

**Backend**:
- Next.js API routes
- Supabase for database and real-time features
- Row Level Security (RLS) for data protection
- Web Workers for heavy calculations

**Database Design**:
- Normalized schema with proper relationships
- JSON columns for flexible data storage
- Indexing strategy for performance optimization
- Migration system for schema evolution

**Security**:
- Authentication via Supabase Auth
- API route protection with middleware
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries

**Performance**:
- Code splitting and lazy loading
- Image optimization and caching
- Database query optimization
- CDN integration for static assets

### Business Rules & Validation

**Pricing Logic**:
- HPP calculation: (Ingredient Cost + Overhead) / (1 - Profit Margin)
- Minimum markup validation (typically 30-50%)
- Competitive pricing analysis

**Inventory Logic**:
- Reorder point: (Average Daily Usage × Lead Time) + Safety Stock
- Stock valuation: FIFO method
- Low stock alerts: Current Stock ≤ Reorder Point

**Order Logic**:
- Stock validation before order confirmation
- Automatic status progression
- Payment deadline enforcement
- Cancellation policies based on order status

**Production Logic**:
- Batch size optimization based on demand forecasting
- Quality control checkpoints
- Waste tracking and cost allocation
- Production efficiency metrics

This comprehensive system enables food businesses to optimize their operations, reduce costs, and increase profitability through data-driven decision making.

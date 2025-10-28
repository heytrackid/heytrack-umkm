# Types Directory Structure

Organized TypeScript type definitions for the HeyTrack application.

## 📁 Structure

```
src/types/
├── supabase/              # Supabase-generated types (modular)
│   ├── common.ts          # Json, shared types
│   ├── enums.ts           # Database enums
│   ├── tables/            # Table definitions by domain
│   └── index.ts           # Main export
│
├── supabase-generated.ts  # Auto-generated (70KB monolith)
│
├── domain/                # Domain-specific types
│   ├── recipes.ts         # Recipe types
│   ├── orders.ts          # Order types
│   ├── inventory.ts       # Inventory types
│   ├── customers.ts       # Customer types
│   ├── suppliers.ts       # Supplier types
│   ├── finance.ts         # Financial types
│   └── operational-costs.ts
│
├── features/              # Feature-specific types
│   ├── auth.ts            # Authentication
│   ├── chat.ts            # AI Chat
│   ├── analytics.ts       # Analytics
│   ├── export.ts          # Export functionality
│   └── notifications.ts   # Notifications
│
├── ui/                    # UI-related types
│   ├── components.ts      # Component props
│   ├── forms.ts           # Form types
│   ├── charts.ts          # Chart types
│   └── responsive.ts      # Responsive design
│
├── shared/                # Shared utility types
│   ├── common.ts          # Common types
│   ├── api.ts             # API types
│   ├── errors.ts          # Error types
│   ├── guards.ts          # Type guards
│   ├── utils.ts           # Utility types
│   └── functions.ts       # Function types
│
├── database.ts            # Database helper types
└── index.ts               # Main export (re-exports everything)
```

## 🎯 Import Guidelines

### Supabase Types
```typescript
// Database types
import type { Database, Tables } from '@/types/supabase-generated'

// Or modular (future)
import type { OrderStatus } from '@/types/supabase/enums'
```

### Domain Types
```typescript
// Specific domain
import type { Recipe, RecipeIngredient } from '@/types/recipes'
import type { Order, OrderItem } from '@/types/orders'
```

### Feature Types
```typescript
// Feature-specific
import type { ChatMessage } from '@/types/chat'
import type { AnalyticsData } from '@/types/analytics'
```

### UI Types
```typescript
// UI components
import type { ButtonProps } from '@/types/components'
import type { ChartConfig } from '@/types/charts'
```

### Shared Types
```typescript
// Utilities
import type { ApiResponse } from '@/types/api'
import type { AppError } from '@/types/errors'
```

## 📝 File Descriptions

### Core Files
- **supabase-generated.ts** (70KB) - Auto-generated from Supabase CLI
- **database.ts** - Database helper types and re-exports
- **index.ts** - Main barrel export

### Domain Types (Business Logic)
- **recipes.ts** - Recipe management types
- **orders.ts** - Order processing types
- **inventory.ts** - Inventory and stock types
- **customers.ts** - Customer management
- **suppliers.ts** - Supplier management
- **finance.ts** - Financial records
- **operational-costs.ts** - Operational cost tracking
- **ingredient-purchases.ts** - Purchase tracking
- **inventory-reorder.ts** - Reorder rules

### Feature Types (Application Features)
- **auth.ts** - Authentication & authorization
- **chat.ts** - AI chatbot types
- **analytics.ts** - Analytics and metrics
- **export.ts** - Export functionality (Excel, PDF)
- **notifications.ts** - Notification system
- **sync.ts** - Data synchronization

### UI Types (Interface)
- **components.ts** - React component props
- **forms.ts** - Form validation types
- **charts.ts** - Chart configurations
- **responsive.ts** - Responsive design types

### Shared Types (Utilities)
- **common.ts** - Common shared types
- **api.ts** - API request/response types
- **errors.ts** - Error handling types
- **guards.ts** - Type guard functions
- **utils.ts** - Utility type helpers
- **functions.ts** - Function type definitions

## 🔄 Type Generation

```bash
# Generate Supabase types
pnpm supabase:types

# This updates supabase-generated.ts
# Optionally extract to modular structure
```

## ✅ Best Practices

1. **Import from specific files** when possible
   ```typescript
   // ✅ Good
   import type { Recipe } from '@/types/recipes'
   
   // ❌ Avoid (slow)
   import type { Recipe } from '@/types'
   ```

2. **Use type imports** for type-only imports
   ```typescript
   import type { Recipe } from '@/types/recipes'
   ```

3. **Keep domain types close to features**
   - Domain types in `/types/domain/`
   - Feature-specific in `/types/features/`

4. **Don't duplicate Supabase types**
   - Use generated types as source of truth
   - Create helper types if needed

## 🚀 Migration Status

- ✅ Removed duplicate `enums.ts`
- ✅ Removed unused `guards.examples.ts`
- ✅ Created modular supabase structure
- ⏳ TODO: Organize remaining files into folders

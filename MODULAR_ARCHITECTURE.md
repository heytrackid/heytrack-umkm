# Modular Architecture Documentation

## Overview

Proyek bakery management telah di-refactor menggunakan **Domain-Driven Design (DDD)** dengan modular architecture untuk meningkatkan maintainability, scalability, dan code organization.

## Struktur Modular Baru

```
src/
├── modules/                     # Domain Modules
│   ├── inventory/              # Inventory Domain
│   │   ├── components/         # UI Components
│   │   ├── hooks/              # Custom Hooks
│   │   ├── services/           # Business Logic Services
│   │   ├── types.ts            # Type Definitions
│   │   ├── utils.ts            # Utility Functions
│   │   ├── constants.ts        # Domain Constants
│   │   └── index.ts            # Barrel Exports
│   ├── orders/                 # Orders Domain
│   ├── recipes/                # Recipes Domain  
│   ├── finance/                # Finance Domain
│   ├── production/             # Production Domain
│   ├── reports/                # Reports Domain
│   └── index.ts                # Main Module Export
├── shared/                     # Shared Resources
│   ├── components/             # Reusable UI Components
│   ├── hooks/                  # Common Hooks
│   ├── utils/                  # Utility Functions
│   ├── api/                    # API Layer
│   └── types/                  # Shared Types
└── index.ts                    # Root Barrel Export
```

## Domain Modules

### 1. Inventory Module (`@/inventory`)
**Purpose**: Mengelola stok, bahan baku, dan inventory tracking

**Key Components**:
- `InventoryPage` - Main inventory dashboard
- `IngredientForm` - Form untuk add/edit ingredients
- `SmartInventoryManager` - AI-powered inventory management

**Services**:
- `InventoryService` - CRUD operations & data fetching
- `StockCalculationService` - Advanced stock calculations (EOQ, forecasting)

**Key Features**:
- Smart reorder point calculation
- Stock alerts & notifications
- Usage rate analysis
- Inventory optimization scoring

### 2. Orders Module (`@/orders`)
**Purpose**: Mengelola pesanan, customer, dan order lifecycle

**Key Components**:
- `OrdersPage` - Order management dashboard
- `OrderForm` - Create/edit orders
- `CustomerList` - Customer management

**Services**:
- `OrdersService` - Order CRUD operations
- `CustomersService` - Customer management
- `OrderCalculationService` - Order calculations

### 3. Recipes Module (`@/recipes`)
**Purpose**: Mengelola resep, HPP calculation, dan recipe optimization

**Key Components**:
- `RecipesPage` - Recipe management
- `HPPCalculator` - Cost calculation tool
- `RecipeSteps` - Step-by-step instructions

**Services**:
- `RecipesService` - Recipe CRUD operations
- `HPPCalculationService` - Advanced costing
- `RecipeOptimizationService` - Recipe optimization

### 4. Finance Module (`@/finance`)
**Purpose**: Mengelola keuangan, expenses, dan financial analytics

**Key Components**:
- `FinancePage` - Financial dashboard
- `ExpensesPage` - Expense management
- `SmartExpenseAutomation` - Automated expense tracking

**Services**:
- `ExpensesService` - Expense operations
- `FinancialAnalyticsService` - Financial calculations
- `BudgetService` - Budget management

## Shared Resources

### Shared Components (`@/shared/components`)
Reusable UI components yang digunakan across domains:

**Layout Components**:
- `AppLayout` - Main application layout
- `Sidebar` - Navigation sidebar
- `MobileHeader` - Mobile navigation

**Data Components**:
- `DataTable` - Advanced data table
- `StatsCard` - Metrics display card
- `LoadingSpinner` - Loading states

**Form Components**:
- `FormField` - Reusable form field
- `SearchInput` - Search functionality
- `DateRangePicker` - Date selection

### Shared Hooks (`@/shared/hooks`)
Custom hooks yang reusable:

**Data Hooks**:
- `useSupabaseCRUD` - Generic CRUD operations
- `useDebounce` - Debounced values
- `usePagination` - Pagination logic

**UI Hooks**:
- `useResponsive` - Responsive breakpoints
- `useToast` - Toast notifications
- `useDisclosure` - Modal/drawer states

### Shared Utils (`@/shared/utils`)
Utility functions yang common:

**Format Utils**:
- `formatCurrency` - Currency formatting
- `formatDate` - Date formatting
- `formatNumber` - Number formatting

**Validation Utils**:
- `validateEmail` - Email validation
- `validateRequired` - Required field validation

## Import Aliases

TypeScript path aliases untuk cleaner imports:

```typescript
// Domain-specific imports
import { InventoryService } from '@/inventory'
import { OrdersModule } from '@/orders'
import { RecipesService } from '@/recipes'

// Shared imports
import { DataTable } from '@/shared/components'
import { useResponsive } from '@/shared/hooks'
import { formatCurrency } from '@/shared/utils'

// Root imports (most common)
import { InventoryModule, useToast, formatDate } from '@/index'
```

## Business Logic Extraction

### Before Refactoring:
```typescript
// Component dengan mixed concerns
const InventoryPage = () => {
  // UI state
  const [loading, setLoading] = useState(false)
  
  // Business logic mixed in component
  const calculateReorderPoint = (ingredient) => {
    // Complex calculation logic here...
  }
  
  const analyzeStock = (ingredients) => {
    // Analysis logic here...
  }
  
  return <div>...</div>
}
```

### After Refactoring:
```typescript
// Clean component with separated concerns
const InventoryPage = () => {
  // Only UI state and hooks
  const { ingredients, loading } = useInventoryData()
  const { alerts } = useInventoryAlerts()
  
  return <div>...</div>
}

// Business logic in service
class StockCalculationService {
  static calculateReorderPoint(ingredient, usageHistory) {
    // Pure business logic
  }
  
  static analyzeStockLevels(ingredients, transactions) {
    // Complex analysis logic
  }
}
```

## API Layer Organization

### Modular API Structure:
```typescript
// Base API Client
class ApiClient {
  static async get(url: string) { }
  static async post(url: string, data: any) { }
  // ...
}

// Domain-specific API services
class InventoryService extends ApiClient {
  static async getIngredients() {
    return this.get('/api/ingredients')
  }
}
```

## Type Safety

### Domain Types:
```typescript
// Domain-specific types
export interface Ingredient {
  id: string
  name: string
  current_stock: number
  // ...
}

// Extended types for business logic
export interface IngredientWithStats extends Ingredient {
  totalValue: number
  usageRate: number
  alertLevel: 'safe' | 'warning' | 'critical'
}
```

## Usage Examples

### Using Inventory Module:
```typescript
import { 
  InventoryModule,
  useInventoryData,
  calculateStockValue 
} from '@/inventory'

const MyComponent = () => {
  const { ingredients, loading } = useInventoryData()
  const totalValue = ingredients.reduce((sum, ing) => 
    sum + calculateStockValue(ing), 0
  )
  
  return <div>Total: {formatCurrency(totalValue)}</div>
}
```

### Using Shared Components:
```typescript
import { DataTable, StatsCard } from '@/shared/components'
import { useResponsive } from '@/shared/hooks'

const Dashboard = () => {
  const { isMobile } = useResponsive()
  
  return (
    <div>
      <StatsCard title="Total Stock" value={1000} />
      <DataTable data={ingredients} columns={columns} />
    </div>
  )
}
```

## Benefits

### 1. **Better Code Organization**
- Clear separation of concerns
- Domain-driven structure
- Easier navigation and maintenance

### 2. **Improved Reusability**
- Shared components across domains
- Reusable business logic services
- Common utility functions

### 3. **Enhanced Maintainability**
- Isolated domain logic
- Easier testing and debugging
- Better code discoverability

### 4. **Scalability**
- Easy to add new domains
- Modular development approach
- Team collaboration friendly

### 5. **Type Safety**
- Strong TypeScript support
- Domain-specific types
- Better IDE support

## Migration Guide

### 1. **Update Imports**
```typescript
// Old
import { SmartInventoryManager } from '@/components/automation/smart-inventory-manager'

// New  
import { SmartInventoryManager } from '@/inventory'
```

### 2. **Use Domain Services**
```typescript
// Old - logic in component
const calculateTotal = (items) => { /* ... */ }

// New - use service
import { OrderCalculationService } from '@/orders'
const total = OrderCalculationService.calculateTotal(items)
```

### 3. **Leverage Shared Components**
```typescript
// Old - custom component
import { CustomTable } from './components/table'

// New - shared component
import { DataTable } from '@/shared/components'
```

## Development Workflow

### Adding New Features:
1. Identify the domain (inventory, orders, recipes, etc.)
2. Add components to appropriate domain module
3. Extract business logic to services
4. Use shared components when possible
5. Update domain module exports

### Creating Shared Components:
1. Identify reusability across domains
2. Add to `shared/components`
3. Update shared exports
4. Document component props and usage

## Performance Considerations

- **Lazy Loading**: Domain modules can be lazy-loaded
- **Tree Shaking**: Barrel exports support tree shaking
- **Code Splitting**: Natural boundaries for code splitting
- **Bundle Size**: Modular imports reduce bundle size

## Testing Strategy

- **Unit Tests**: Test services independently
- **Integration Tests**: Test module interactions
- **Component Tests**: Test UI components in isolation
- **E2E Tests**: Test complete user workflows

## Future Enhancements

- **Micro-frontends**: Each domain as separate deployable unit
- **Module Federation**: Share modules across applications  
- **Plugin Architecture**: Loadable domain plugins
- **Dynamic Imports**: Runtime module loading
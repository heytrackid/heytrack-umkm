# Modular Architecture - Usage Examples

## Contoh Penggunaan Struktur Modular Baru

### 1. Import dan Export Patterns

#### Sebelum Refactoring:
```typescript
// Import yang panjang dan tidak konsisten
import { SmartInventoryManager } from '../../../components/automation/smart-inventory-manager'
import { InventoryTrendsChart } from '../../../components/charts/inventory-trends-chart'
import { useIngredients } from '../../../hooks/useSupabaseData'
import { calculateStockValue } from '../../../lib/utils'
```

#### Setelah Refactoring:
```typescript
// Clean dan konsistent imports
import { 
  SmartInventoryManager,
  InventoryTrendsChart,
  useInventoryData,
  calculateStockValue
} from '@/inventory'

// Atau import dari main module
import { InventoryModule } from '@/modules'
const { SmartInventoryManager, useInventoryData } = InventoryModule
```

### 2. Component Organization

#### Sebelum - Mixed Concerns:
```typescript
// src/app/inventory/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Business logic mixed dengan UI logic
  const calculateReorderPoint = (ingredient) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    // Complex calculation logic...
    return reorderPoint
  }
  
  const analyzeStockLevels = () => {
    // Analysis logic directly in component
  }
  
  const fetchIngredients = async () => {
    // Direct API call in component
    const { data } = await supabase.from('ingredients').select('*')
    setIngredients(data)
  }
  
  useEffect(() => {
    fetchIngredients()
  }, [])
  
  return (
    <div>
      {/* Complex JSX with mixed concerns */}
    </div>
  )
}
```

#### Setelah - Clean Separation:
```typescript
// src/modules/inventory/components/InventoryPage.tsx
'use client'

import { 
  useInventoryData,
  useInventoryAlerts,
  SmartInventoryManager,
  InventoryTrendsChart
} from '@/inventory'
import { DataTable, StatsCard } from '@/shared/components'
import { useResponsive } from '@/shared/hooks'

export default function InventoryPage() {
  // Only UI-related hooks
  const { isMobile } = useResponsive()
  const { ingredients, loading, error } = useInventoryData()
  const { alerts } = useInventoryAlerts()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  
  return (
    <div className="space-y-6">
      <StatsCard 
        title="Total Ingredients" 
        value={ingredients.length} 
      />
      
      <SmartInventoryManager ingredients={ingredients} />
      
      <InventoryTrendsChart />
      
      <DataTable 
        data={ingredients}
        columns={inventoryColumns}
        responsive={isMobile}
      />
    </div>
  )
}
```

### 3. Business Logic Services

#### Service Class Example:
```typescript
// src/modules/inventory/services/StockCalculationService.ts
export class StockCalculationService {
  static analyzeStockLevels(ingredients, transactions) {
    return ingredients.map(ingredient => {
      const usageRate = this.calculateUsageRate(ingredient, transactions)
      const alertLevel = this.getAlertLevel(ingredient)
      const forecast = this.forecastStockNeeds(ingredient, transactions)
      
      return {
        ...ingredient,
        usageRate,
        alertLevel,
        forecast,
        recommendations: this.generateRecommendations(ingredient, { usageRate, alertLevel })
      }
    })
  }
  
  private static generateRecommendations(ingredient, analysis) {
    const recommendations = []
    
    if (analysis.alertLevel === 'critical') {
      recommendations.push({
        type: 'urgent',
        message: 'Stock kritis - segera lakukan pembelian',
        action: 'order_immediately'
      })
    }
    
    return recommendations
  }
}
```

#### Usage in Component:
```typescript
// Component hanya fokus pada UI
const InventoryAnalysis = () => {
  const { ingredients } = useInventoryData()
  const { transactions } = useStockTransactions()
  
  // Business logic di-delegate ke service
  const analysis = StockCalculationService.analyzeStockLevels(
    ingredients, 
    transactions
  )
  
  return (
    <div>
      {analysis.map(item => (
        <AnalysisCard 
          key={item.id}
          ingredient={item}
          recommendations={item.recommendations}
        />
      ))}
    </div>
  )
}
```

### 4. Custom Hooks Pattern

#### Domain-Specific Hook:
```typescript
// src/modules/inventory/hooks/useInventoryData.ts
export function useInventoryData(params?: InventorySearchParams) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Service handles business logic
      const result = await InventoryService.getIngredients(params)
      setIngredients(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params])

  const createIngredient = useCallback(async (data) => {
    await InventoryService.createIngredient(data)
    fetchIngredients() // Refresh data
  }, [fetchIngredients])

  return {
    ingredients,
    loading,
    error,
    refresh: fetchIngredients,
    createIngredient,
    updateIngredient: async (id, data) => {
      await InventoryService.updateIngredient(id, data)
      fetchIngredients()
    }
  }
}
```

### 5. Type-Safe Domain Types

#### Domain Types Definition:
```typescript
// src/modules/inventory/types.ts
export interface IngredientWithStats extends Ingredient {
  totalValue: number
  usageRate: number
  alertLevel: 'safe' | 'warning' | 'critical'
  daysUntilReorder: number
  recommendations: StockRecommendation[]
}

export interface StockRecommendation {
  type: 'urgent' | 'warning' | 'info'
  message: string
  action: string
  priority: number
}
```

#### Usage with Full Type Safety:
```typescript
const InventoryDashboard = () => {
  // Fully typed data
  const { ingredients }: { ingredients: IngredientWithStats[] } = useIngredientsWithStats()
  
  // Type-safe calculations
  const criticalIngredients = ingredients.filter(ing => ing.alertLevel === 'critical')
  const totalValue = ingredients.reduce((sum, ing) => sum + ing.totalValue, 0)
  
  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <StatsCard 
          title="Critical Stock" 
          value={criticalIngredients.length}
          variant="danger" 
        />
        <StatsCard 
          title="Total Value" 
          value={formatCurrency(totalValue)} 
        />
        <StatsCard 
          title="Total Ingredients" 
          value={ingredients.length} 
        />
      </div>
      
      {criticalIngredients.map(ingredient => (
        <AlertCard 
          key={ingredient.id}
          ingredient={ingredient}
          recommendations={ingredient.recommendations}
        />
      ))}
    </div>
  )
}
```

### 6. Cross-Domain Integration

#### Contoh: Recipe yang butuh Inventory data
```typescript
// src/modules/recipes/hooks/useRecipeValidation.ts
import { useInventoryData } from '@/inventory'

export function useRecipeValidation(recipe: Recipe) {
  const { ingredients } = useInventoryData()
  
  const validateRecipe = useCallback((recipe) => {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    }
    
    // Check ingredient availability
    recipe.recipe_ingredients.forEach(ri => {
      const ingredient = ingredients.find(ing => ing.id === ri.ingredient_id)
      
      if (!ingredient) {
        validation.errors.push(`Ingredient ${ri.ingredient_id} not found`)
      } else if (ingredient.current_stock < ri.quantity) {
        validation.warnings.push(`Insufficient stock for ${ingredient.name}`)
      }
    })
    
    validation.isValid = validation.errors.length === 0
    return validation
  }, [ingredients])
  
  return { validateRecipe }
}
```

### 7. Shared Component Usage

#### Reusable Data Table:
```typescript
// src/shared/components/data/DataTable.tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  onRowClick?: (row: T) => void
  responsive?: boolean
}

export function DataTable<T>({ 
  data, 
  columns, 
  loading, 
  onRowClick,
  responsive 
}: DataTableProps<T>) {
  if (loading) return <TableSkeleton />
  
  return (
    <div className={responsive ? 'overflow-x-auto' : ''}>
      {/* Table implementation */}
    </div>
  )
}
```

#### Usage Across Domains:
```typescript
// Inventory domain
const InventoryTable = () => {
  const { ingredients, loading } = useInventoryData()
  
  return (
    <DataTable 
      data={ingredients}
      columns={ingredientColumns}
      loading={loading}
      onRowClick={(ingredient) => router.push(`/inventory/${ingredient.id}`)}
    />
  )
}

// Orders domain  
const OrdersTable = () => {
  const { orders, loading } = useOrdersData()
  
  return (
    <DataTable 
      data={orders}
      columns={orderColumns}
      loading={loading}
      onRowClick={(order) => setSelectedOrder(order)}
    />
  )
}
```

### 8. API Integration Pattern

#### Service dengan Base API:
```typescript
// src/shared/api/client/ApiClient.ts
export class ApiClient {
  static async get<T>(url: string): Promise<T> {
    const response = await fetch(url)
    return response.json()
  }
  
  static async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

// Domain service extends base
export class InventoryService extends ApiClient {
  static async getIngredients(params?: InventorySearchParams) {
    const queryString = new URLSearchParams(params).toString()
    return this.get<{ data: Ingredient[], count: number }>(`/api/ingredients?${queryString}`)
  }
}
```

### 9. Performance Optimizations

#### Lazy Loading Domain:
```typescript
// src/app/inventory/page.tsx
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/shared/components'

// Lazy load heavy inventory components
const InventoryDashboard = lazy(() => import('@/inventory/components/InventoryPage'))
const SmartInventoryManager = lazy(() => import('@/inventory/components/SmartInventoryManager'))

export default function InventoryPage() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <InventoryDashboard />
      </Suspense>
      
      <Suspense fallback={<div>Loading smart features...</div>}>
        <SmartInventoryManager />
      </Suspense>
    </div>
  )
}
```

### 10. Testing dengan Modular Structure

#### Unit Test Domain Service:
```typescript
// src/modules/inventory/services/__tests__/StockCalculationService.test.ts
import { StockCalculationService } from '../StockCalculationService'
import { mockIngredients, mockTransactions } from './fixtures'

describe('StockCalculationService', () => {
  it('should calculate EOQ correctly', () => {
    const eoq = StockCalculationService.calculateEOQ(1000, 50, 2)
    expect(eoq).toBeGreaterThan(0)
  })
  
  it('should analyze stock levels', () => {
    const analysis = StockCalculationService.analyzeStockLevels(
      mockIngredients,
      mockTransactions
    )
    
    expect(analysis).toHaveLength(mockIngredients.length)
    expect(analysis[0]).toHaveProperty('usageRate')
    expect(analysis[0]).toHaveProperty('alertLevel')
  })
})
```

#### Component Test dengan Mocked Services:
```typescript
// src/modules/inventory/components/__tests__/InventoryPage.test.tsx
import { render, screen } from '@testing-library/react'
import { InventoryPage } from '../InventoryPage'

// Mock domain hooks
jest.mock('@/inventory/hooks/useInventoryData', () => ({
  useInventoryData: () => ({
    ingredients: mockIngredients,
    loading: false,
    error: null
  })
}))

test('renders inventory page with ingredients', () => {
  render(<InventoryPage />)
  
  expect(screen.getByText('Total Ingredients')).toBeInTheDocument()
  expect(screen.getByText('Tepung Terigu')).toBeInTheDocument()
})
```

## Best Practices Summary

1. **Separation of Concerns**: UI logic terpisah dari business logic
2. **Single Responsibility**: Setiap service/hook punya tanggung jawab yang jelas
3. **Type Safety**: Gunakan TypeScript types yang kuat
4. **Reusability**: Maksimalkan penggunaan shared components
5. **Performance**: Lazy load heavy components dan modules
6. **Testing**: Test services dan components secara terpisah
7. **Documentation**: Document API dan usage patterns
8. **Consistency**: Gunakan naming convention dan structure yang konsisten
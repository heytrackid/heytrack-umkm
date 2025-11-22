# Fitur HPP (Harga Pokok Produksi) - Dokumentasi Teknis

## 📋 Overview

Fitur HPP adalah sistem kalkulasi biaya produksi yang komprehensif untuk bisnis kuliner yang dikembangkan dengan arsitektur modern dan performa tinggi. Sistem ini mengintegrasikan AI-powered insights, real-time calculations, dan advanced analytics untuk membantu pengusaha kuliner mengoptimalkan profitabilitas.

## 🎯 Arsitektur Sistem

### Frontend Architecture
```
UnifiedHppPage (Main Container)
├── HppOverviewCard (Dashboard & Metrics)
├── RecipeSelector (Recipe Management)
├── CostCalculationCard (HPP Calculator)
├── PricingCalculatorCard (Price Optimizer)
├── Tabs System:
│   ├── HppBreakdownVisual (Cost Analysis)
│   ├── ProductComparisonCard (Recipe Comparison)
│   ├── HppScenarioPlanner (What-if Analysis)
│   ├── HppAlertsTab (Alert Management)
│   └── HppTrendVisualization (Trend Analytics)
```

### Backend Architecture
```
API Routes (/api/hpp)
├── GET /api/hpp - System overview & alerts
├── GET /api/hpp/comparison - Recipe comparison data
├── GET /api/hpp/recipe/[id] - Detailed recipe analysis
├── POST /api/hpp/calculate - Single recipe calculation
├── PUT /api/hpp/calculate - Batch calculation
├── POST /api/hpp/pricing - AI pricing recommendations
└── GET /api/hpp/calculations - Historical calculations
```

### Service Layer
```
HppService (Business Logic)
├── HppCalculatorService (Core Calculations)
├── AIService (AI Integration)
└── HPP_CONFIG (Business Rules)
```

### Worker Layer
```
hpp-calculator.worker.ts
├── High-performance calculations
├── Non-blocking UI operations
├── Complex mathematical operations
└── Background processing
```

## 📊 Algoritma Kalkulasi

### 1. Material Cost Calculation
```typescript
// Per batch material cost with WAC adjustment
totalMaterialCost = Σ(ingredient.quantity × ingredient.effective_price)

// Where effective_price = WAC if available, otherwise current_price
effective_price = ingredient.weighted_average_cost ?? ingredient.price_per_unit

// Per unit material cost
materialCostPerUnit = totalMaterialCost / recipe.servings
```

### 2. Labor Cost Calculation
```typescript
// From recent production batches (last 100 completed)
totalLaborCost = Σ(production.labor_cost)
totalQuantity = Σ(production.actual_quantity)
laborCostPerUnit = totalLaborCost / totalQuantity

// Fallback if no production data
laborCostPerUnit = HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
```

### 3. Overhead Cost Allocation
```typescript
// Production volume-based allocation
totalOverhead = Σ(operational_costs.amount)
recipeVolume = Σ(recipe_productions.actual_quantity)
totalVolume = Σ(all_productions.actual_quantity)

if (totalVolume > 0 && recipeVolume > 0) {
  allocationRatio = recipeVolume / totalVolume
  overheadPerUnit = (totalOverhead × allocationRatio) / recipeVolume
} else {
  // Fallback: equal allocation
  overheadPerUnit = totalOverhead / activeRecipeCount
}
```

### 4. WAC (Weighted Average Cost) Adjustment
```typescript
// From recent transactions (last 30 days, max 50 transactions)
recentTransactions = filter(transactions, date >= cutoffDate)

for each ingredient:
  ingredientTransactions = filter(recentTransactions, ingredient_id)
  if (ingredientTransactions.length > 0):
    totalQuantity = Σ(transaction.quantity)
    totalValue = Σ(transaction.total_price)
    wac = totalValue / totalQuantity

    // Only adjust if not already using WAC
    if (ingredient.price_per_unit !== wac):
      adjustment = (wac - ingredient.price_per_unit) × quantity_per_unit
      totalWacAdjustment += adjustment
```

### 5. Final HPP Calculation
```typescript
costPerUnit = materialCostPerUnit + laborCostPerUnit + overheadCostPerUnit + wacAdjustment
totalHpp = costPerUnit × recipe.servings
marginPercentage = ((sellingPrice - costPerUnit) / sellingPrice) × 100
```

## 🎨 User Interface Components

### UnifiedHppPage
**Main container dengan progressive disclosure pattern**
- **State Management**: useUnifiedHpp hook untuk data fetching & caching
- **Layout**: Responsive grid dengan mobile-first design
- **Navigation**: Swipeable tabs untuk advanced features

### HppOverviewCard
**Dashboard dengan real-time metrics**
- **Metrics Display**: Total recipes, calculated recipes, average HPP, alerts
- **Progress Indicators**: Completion percentage dengan color coding
- **Quick Actions**: Batch calculation triggers
- **Alert System**: Priority-based notifications

### CostCalculationCard
**Real-time HPP calculator**
- **Input Validation**: Zod schemas untuk type safety
- **Real-time Updates**: Debounced calculations
- **Error Handling**: Graceful degradation dengan fallbacks
- **Worker Integration**: Background processing untuk complex calculations

### HppScenarioPlanner
**Advanced what-if analysis**
- **Quick Scenarios**: Predefined inflation & efficiency scenarios
- **Custom Builder**: Per-ingredient parameter adjustments
- **Impact Visualization**: Real-time cost & margin calculations
- **Smart Warnings**: Margin threshold alerts

### HppTrendVisualization
**Historical trend analysis**
- **Data Aggregation**: Monthly/quarterly trend calculations
- **Volatility Analysis**: Standard deviation calculations
- **Best/Worst Period Detection**: Automated insights
- **Interactive Charts**: Visual trend representation

## 🔧 Technical Implementation

### Type Definitions
```typescript
interface HppCalculationResult {
  recipe_id: string
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_hpp: number
  cost_per_unit: number
  wac_adjustment: number
  production_quantity: number
  material_breakdown: MaterialBreakdown[]
}

interface HppOverview {
  totalRecipes: number
  calculatedRecipes: number
  totalHppValue: number
  averageMargin: number
  alerts: HppAlert[]
}

interface HppComparison extends Array<{
  id: string
  name: string
  cost_per_unit: number
  selling_price: number
  margin_percentage: number
  last_calculated: string | null
}>
```

### Configuration Constants
```typescript
export const HPP_CONFIG = {
  // Labor costs
  DEFAULT_LABOR_COST_PER_SERVING: 5000,

  // Overhead costs
  DEFAULT_OVERHEAD_PER_SERVING: 2500,
  MIN_OPERATIONAL_COST_PERCENTAGE: 0.15,

  // WAC settings
  WAC_LOOKBACK_TRANSACTIONS: 50,
  WAC_MAX_AGE_DAYS: 30,

  // Alert thresholds
  PRICE_INCREASE_THRESHOLD: 0.10,
  MARGIN_LOW_THRESHOLD: 0.20,
  RECOMMENDED_MIN_MARGIN: 0.30,
  RECOMMENDED_TARGET_MARGIN: 0.40
}
```

### Web Worker Implementation
```typescript
// Input interface
interface HppCalculationInput {
  ingredients: Array<{
    quantity: number
    price_per_unit: number
  }>
  operationalCost: number
  batchSize: number
}

// Output interface
interface HppCalculationResult {
  material_cost: number
  operational_cost_per_unit: number
  total_cost: number
  cost_per_unit: number
  breakdown: {
    materials: number
    operational: number
  }
}
```

## 🚀 Performance Optimizations

### React Query Caching
```typescript
// Stale-while-revalidate pattern
const { data: recipeData } = useQuery({
  queryKey: ['recipe-detail', selectedRecipeId],
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false
})
```

### Web Worker Offloading
```typescript
// Heavy calculations moved to background
const worker = new Worker('/workers/hpp-calculator.worker.js')
worker.postMessage(calculationInput)
worker.onmessage = (e) => handleResult(e.data)
```

### Database Optimization
```typescript
// Indexed queries for performance
const { data } = await supabase
  .from('hpp_calculations')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50)
```

### Memory Management
```typescript
// Cleanup unused resources
useEffect(() => {
  return () => {
    workerRef.current?.terminate()
  }
}, [])
```

## 🔒 Security & Validation

### Input Sanitization
```typescript
// AI prompt sanitization
const safePrompt = AISecurity.sanitizeInput(userPrompt)
const validatedInput = AISecurity.validateInput(safePrompt)
```

### Row Level Security
```typescript
// Supabase RLS policies
ALTER TABLE hpp_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own calculations"
ON hpp_calculations FOR ALL USING (auth.uid() = user_id);
```

### API Route Protection
```typescript
// Middleware authentication
const { user } = await authenticateRequest(request)
if (!user) return unauthorizedResponse()
```

## 🤖 AI Integration

### Pricing Recommendations
```typescript
const aiRecommendation = await AIService.generatePricingRecommendation({
  recipeName,
  currentHpp,
  currentPrice,
  currentMargin,
  category,
  ingredients,
  marketData: {
    competitorPrices,
    marketDemand,
    seasonality
  }
})
```

### Fallback Strategy
```typescript
// Graceful degradation
try {
  const aiResult = await AIService.callAI(prompt, systemPrompt)
  return JSON.parse(aiResult)
} catch (error) {
  // Fallback to rule-based calculation
  return calculateFallbackPricing(data)
}
```

## 📈 Business Logic

### Pricing Strategy Matrix
| Margin Range | Strategy | Action |
|-------------|----------|--------|
| < 20% | Critical | Immediate price increase required |
| 20-30% | Warning | Monitor and optimize costs |
| 30-40% | Optimal | Maintain current pricing |
| > 40% | Premium | Consider value-based pricing |

### Cost Control Triggers
- **Price Increase Alert**: > 10% month-over-month
- **Margin Drop Alert**: < 20% for 2+ consecutive periods
- **Volatility Alert**: Standard deviation > 15% of average

### Scenario Planning Logic
```typescript
const scenarios = {
  inflation_5: { type: 'price', change: 5 },
  inflation_10: { type: 'price', change: 10 },
  efficiency_improvement: { type: 'quantity', change: -10 }
}
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('HPP Calculations', () => {
  test('calculates material cost correctly', () => {
    const result = calculateMaterialCost(ingredients, servings)
    expect(result).toBe(expectedCost)
  })

  test('handles WAC adjustment', () => {
    const result = calculateWacAdjustment(breakdown, transactions)
    expect(result).toBeGreaterThan(0)
  })
})
```

### Integration Tests
```typescript
describe('API Integration', () => {
  test('calculates HPP for recipe', async () => {
    const response = await api.post('/api/hpp/calculate', { recipeId })
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('cost_per_unit')
  })
})
```

### E2E Tests
```typescript
describe('User Workflow', () => {
  test('complete HPP calculation flow', async () => {
    // Navigate to HPP page
    // Select recipe
    // Calculate HPP
    // Verify results
    // Apply pricing recommendation
  })
})
```

## 📚 API Reference

### GET /api/hpp
```typescript
Response: HppOverview
Status: 200 OK
```

### GET /api/hpp/comparison
```typescript
Response: HppComparison
Status: 200 OK
```

### GET /api/hpp/recipe/[id]
```typescript
Response: {
  recipe: Recipe
  ingredients: RecipeIngredientWithPrice[]
  operational_costs: number
  labor_costs: number
  overhead_costs: number
  total_cost: number
}
Status: 200 OK
```

### POST /api/hpp/calculate
```typescript
Body: { recipeId: string }
Response: HppCalculationResult
Status: 200 OK | 400 Bad Request | 500 Internal Server Error
```

### POST /api/hpp/pricing
```typescript
Body: { recipeId: string }
Response: {
  current_price: number
  recommended_price: number
  hpp_cost: number
  suggested_margin: number
  reasoning: string[]
  ai_insights?: {
    confidence: number
    alternatives: PricingAlternative[]
  }
}
Status: 200 OK
```

## 🔄 Deployment & Maintenance

### Environment Variables
```bash
# AI Service Configuration
OPENROUTER_API_KEY=your_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Application Settings
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

### Database Migrations
```sql
-- HPP Calculations Table
CREATE TABLE hpp_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  calculation_date DATE NOT NULL,
  material_cost DECIMAL(10,2) NOT NULL,
  labor_cost DECIMAL(10,2) NOT NULL,
  overhead_cost DECIMAL(10,2) NOT NULL,
  total_hpp DECIMAL(10,2) NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  wac_adjustment DECIMAL(10,2) DEFAULT 0,
  production_quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_hpp_calculations_recipe_user ON hpp_calculations(recipe_id, user_id);
CREATE INDEX idx_hpp_calculations_date ON hpp_calculations(calculation_date);
```

### Monitoring & Alerts
```typescript
// Performance monitoring
const calculationTime = performance.now() - startTime
if (calculationTime > 5000) {
  logger.warn({ calculationTime, recipeId }, 'Slow HPP calculation detected')
}

// Error tracking
if (error) {
  logger.error({ error, userId, recipeId }, 'HPP calculation failed')
  // Send to error monitoring service
}
```

## 🎯 Future Roadmap

### Phase 2 Enhancements
- **Multi-currency support** for international expansion
- **Advanced forecasting** with machine learning models
- **Integration APIs** for POS and inventory systems
- **Mobile optimization** for field operations

### Technical Improvements
- **GraphQL migration** for flexible data fetching
- **Real-time subscriptions** for live updates
- **Advanced caching** with Redis clusters
- **Microservices architecture** for scalability

### AI Enhancements
- **Predictive analytics** for demand forecasting
- **Automated optimization** for recipe costing
- **Market intelligence** integration
- **Competitor analysis** automation

---

## 📞 Support & Troubleshooting

### Common Issues

**Slow Calculations**
- Check Web Worker support in browser
- Verify large dataset handling
- Monitor database query performance

**AI Recommendation Errors**
- Verify OpenRouter API connectivity
- Check API key validity
- Review fallback mechanisms

**Data Inconsistency**
- Validate recipe ingredient data
- Check calculation timestamps
- Verify WAC calculation logic

### Debug Tools
```typescript
// Enable debug logging
localStorage.setItem('debug', 'hpp:*')

// Manual calculation verification
const manualResult = calculateHppManually(recipeData)
const apiResult = await api.calculateHpp(recipeId)
assert.deepEqual(manualResult, apiResult)
```

### Performance Benchmarks
- **Single Recipe Calculation**: < 500ms
- **Batch Calculation (50 recipes)**: < 3000ms
- **AI Recommendation**: < 2000ms
- **Trend Analysis**: < 1000ms

---

*Dokumentasi teknis lengkap untuk Fitur HPP v1.0 - HeyTrack Culinary Business Management System*</content>
<parameter name="filePath">docs/HPP_TECHNICAL_DOCUMENTATION.md
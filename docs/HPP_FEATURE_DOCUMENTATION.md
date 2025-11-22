# Fitur HPP (Harga Pokok Produksi) - Dokumentasi Lengkap

## 📋 Overview

Fitur HPP adalah sistem kalkulasi biaya produksi yang komprehensif untuk bisnis kuliner. Sistem ini membantu pengusaha kuliner menghitung, memantau, dan mengoptimalkan biaya produksi untuk memaksimalkan profitabilitas.

## 🎯 Fitur Utama

### 1. Analisis Biaya Resep (Recipe Cost Analysis)
- **Breakdown detail biaya bahan baku** dengan WAC (Weighted Average Cost)
- **Kalkulasi biaya tenaga kerja** berdasarkan data produksi historis
- **Alokasi biaya overhead** berbasis volume produksi
- **Adjustment WAC** untuk akurasi biaya bahan baku

### 2. Perencanaan Skenario (Scenario Planning)
- **What-if analysis** untuk antisipasi perubahan biaya
- **Quick scenarios**: Inflasi 5/10/15%, efisiensi -10%
- **Custom scenario builder** per bahan baku
- **Impact calculation** real-time dengan visual feedback

### 3. Pemantauan Tren Biaya (Cost Trend Monitoring)
- **Visualisasi tren historis** HPP dan margin
- **Analisis volatilitas** biaya
- **Identifikasi periode terbaik/terburuk**
- **Alerts otomatis** untuk anomali biaya

### 4. Rekomendasi Harga (AI-Powered Pricing)
- **AI analysis** menggunakan OpenRouter API
- **Market intelligence** dengan competitor pricing
- **Seasonal considerations** dan demand analysis
- **Multiple pricing alternatives** dengan confidence levels

### 5. Kalkulasi High-Performance (Worker-based Processing)
- **Web Worker offloading** untuk kalkulasi berat
- **Background processing** tanpa blocking UI
- **Complex calculations** dengan WAC dan overhead allocation

## 🏗️ Arsitektur Sistem

### Frontend Architecture
```
UnifiedHppPage (Main UI)
├── HppOverviewCard (Dashboard summary)
├── RecipeSelector (Recipe picker)
├── CostCalculationCard (HPP calculation)
├── PricingCalculatorCard (Price setting)
├── Tabs System:
│   ├── HppBreakdownVisual (Cost breakdown)
│   ├── ProductComparisonCard (Recipe comparison)
│   ├── HppScenarioPlanner (What-if analysis)
│   ├── HppAlertsTab (Alerts & notifications)
│   └── HppTrendVisualization (Trend charts)
```

### Backend Architecture
```
API Routes (/api/hpp)
├── GET /api/hpp - Overview data
├── GET /api/hpp/comparison - Recipe comparison
├── GET /api/hpp/recipe/[id] - Recipe with HPP data
├── POST /api/hpp/calculate - Calculate single recipe
├── PUT /api/hpp/calculate - Batch calculate all
├── POST /api/hpp/pricing - AI pricing recommendations
└── GET /api/hpp/calculations - Historical calculations
```

### Service Layer
```
HppService (Main service)
├── HppCalculatorService (Core calculations)
├── AIService (AI recommendations)
└── HPP_CONFIG (Configuration constants)
```

### Worker Layer
```
hpp-calculator.worker.ts
├── Complex HPP calculations
├── WAC adjustment algorithms
├── Labor cost from production data
└── Overhead allocation logic
```

## 📊 Algoritma Kalkulasi

### 1. Material Cost Calculation
```typescript
// Per batch material cost
totalMaterialCost = Σ(ingredient.quantity × ingredient.unit_price)

// Per unit material cost
materialCostPerUnit = totalMaterialCost / servings

// With WAC adjustment
wacAdjustment = Σ(ingredient_wac - current_price) × quantity_per_unit
```

### 2. Labor Cost Calculation
```typescript
// From recent productions (last 100 completed batches)
totalLaborCost = Σ(production.labor_cost)
totalQuantity = Σ(production.actual_quantity)
laborCostPerUnit = totalLaborCost / totalQuantity
```

### 3. Overhead Cost Allocation
```typescript
// Production volume-based allocation
totalOverhead = Σ(operational_costs.amount)
recipeVolume = Σ(recipe_productions.actual_quantity)
totalVolume = Σ(all_productions.actual_quantity)

if (totalVolume > 0) {
  allocationRatio = recipeVolume / totalVolume
  overheadPerUnit = (totalOverhead × allocationRatio) / recipeVolume
}
```

### 4. WAC (Weighted Average Cost) Adjustment
```typescript
// From recent transactions (last 30 days, max 50 transactions)
wac = total_purchase_value / total_quantity_purchased
currentPrice = ingredient.price_per_unit
adjustment = (wac - currentPrice) × quantity_per_unit
```

### 5. Final HPP Calculation
```typescript
costPerUnit = materialCostPerUnit + laborCostPerUnit + overheadCostPerUnit + wacAdjustment
totalHpp = costPerUnit × servings
```

## 🎨 User Interface

### Main Dashboard
- **Real-time overview** dengan metrics utama
- **Progress indicators** untuk completion status
- **Quick actions** untuk kalkulasi batch
- **Alert notifications** untuk issues

### Recipe Management
- **Recipe selector** dengan search dan filter
- **Cost calculation** dengan real-time feedback
- **Price setting** dengan margin calculator
- **Visual breakdown** bahan baku dan biaya

### Advanced Tools
- **Scenario planner** dengan drag-drop interface
- **Trend visualization** dengan interactive charts
- **Comparison tools** untuk multiple recipes
- **AI recommendations** dengan confidence indicators

## 🔧 Technical Implementation

### Type Definitions
```typescript
interface HppCalculationResult {
  recipeId: string
  materialCost: number
  laborCost: number
  overheadCost: number
  totalHpp: number
  costPerUnit: number
  wacAdjustment: number
  productionQuantity: number
  materialBreakdown: MaterialBreakdown[]
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
  DEFAULT_LABOR_COST_PER_SERVING: 5000,
  DEFAULT_OVERHEAD_PER_SERVING: 2500,
  MIN_OPERATIONAL_COST_PERCENTAGE: 0.15,
  WAC_LOOKBACK_TRANSACTIONS: 50,
  WAC_MAX_AGE_DAYS: 30,
  PRICE_INCREASE_THRESHOLD: 0.10,
  MARGIN_LOW_THRESHOLD: 0.20,
  RECOMMENDED_MIN_MARGIN: 0.30,
  RECOMMENDED_TARGET_MARGIN: 0.40
}
```

### Error Handling
- **Graceful degradation** dengan fallback calculations
- **Comprehensive logging** untuk debugging
- **User-friendly error messages** dengan actionable guidance
- **Retry mechanisms** untuk failed operations

## 🚀 Performance Optimizations

### Web Worker Implementation
- **Heavy calculations offloaded** to background threads
- **Non-blocking UI** selama kalkulasi kompleks
- **Timeout handling** (30 detik max per calculation)
- **Fallback to synchronous** jika Web Workers tidak supported

### Caching Strategy
- **React Query caching** untuk data API
- **Stale-while-revalidate** untuk real-time updates
- **Granular invalidation** per recipe changes
- **Background refetching** untuk data updates

### Database Optimization
- **Indexed queries** untuk performance
- **Batch operations** untuk multiple calculations
- **Connection pooling** untuk concurrent requests
- **Query result caching** untuk repeated data

## 🔒 Security & Validation

### Input Validation
- **Zod schemas** untuk API input validation
- **Type guards** untuk runtime type checking
- **Sanitization** untuk AI prompts
- **SQL injection prevention** dengan parameterized queries

### Authentication & Authorization
- **Row Level Security (RLS)** di Supabase
- **User-scoped data** access
- **API route protection** dengan middleware
- **Audit logging** untuk sensitive operations

## 📈 Business Logic

### Pricing Strategy
- **Cost-plus pricing** sebagai baseline
- **Value-based pricing** dengan market analysis
- **Competitive positioning** berdasarkan market data
- **Psychological pricing** dengan AI recommendations

### Cost Management
- **WAC for accuracy** dalam inventory valuation
- **Production-based allocation** untuk fair overhead distribution
- **Trend monitoring** untuk early warning systems
- **Scenario planning** untuk risk management

### Profit Optimization
- **Margin analysis** dengan industry benchmarks
- **Break-even calculations** untuk pricing decisions
- **Sensitivity analysis** untuk cost changes
- **Recommendation engine** untuk optimal pricing

## 🧪 Testing Strategy

### Unit Tests
- **Calculation algorithms** dengan mock data
- **API endpoints** dengan various scenarios
- **Component rendering** dengan different props
- **Error handling** edge cases

### Integration Tests
- **Full calculation flow** dari UI ke database
- **Worker communication** dengan main thread
- **API integration** dengan external services
- **Database operations** dengan real data

### E2E Tests
- **User workflows** untuk complete features
- **Performance testing** untuk large datasets
- **Cross-browser compatibility** untuk Web Workers
- **Mobile responsiveness** untuk all components

## 📚 API Reference

### GET /api/hpp
**Overview data untuk dashboard**
```typescript
Response: HppOverview
```

### GET /api/hpp/comparison
**Perbandingan semua resep**
```typescript
Response: HppComparison
```

### GET /api/hpp/recipe/[id]
**Data resep lengkap dengan kalkulasi HPP**
```typescript
Response: {
  recipe: Recipe
  ingredients: RecipeIngredientWithPrice[]
  operational_costs: number
  labor_costs: number
  overhead_costs: number
  total_cost: number
}
```

### POST /api/hpp/calculate
**Kalkulasi HPP untuk satu resep**
```typescript
Body: { recipeId: string }
Response: HppCalculationResult
```

### PUT /api/hpp/calculate
**Batch kalkulasi untuk semua resep**
```typescript
Response: {
  results: HppCalculationResult[]
  summary: { total: number }
}
```

### POST /api/hpp/pricing
**Rekomendasi harga dengan AI**
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
```

## 🔄 Migration & Deployment

### Database Migrations
- **HPP calculations table** untuk menyimpan hasil kalkulasi
- **Indexes** untuk query performance
- **RLS policies** untuk data security
- **Triggers** untuk automatic calculations

### Feature Rollout
- **Progressive deployment** dengan feature flags
- **A/B testing** untuk AI recommendations
- **Performance monitoring** untuk worker usage
- **User feedback collection** untuk improvements

### Monitoring & Analytics
- **Calculation performance** metrics
- **User adoption** tracking
- **Error rates** dan failure analysis
- **Business impact** measurement

## 🎯 Future Enhancements

### Planned Features
- **Multi-currency support** untuk international businesses
- **Advanced forecasting** dengan machine learning
- **Integration dengan POS systems** untuk real-time data
- **Mobile app** untuk on-the-go management

### Technical Improvements
- **GraphQL API** untuk flexible queries
- **Real-time updates** dengan WebSockets
- **Advanced caching** dengan Redis
- **Microservices architecture** untuk scalability

---

## 📞 Support & Maintenance

### Troubleshooting
- **Common issues** dan solutions
- **Performance tuning** guidelines
- **Debugging tools** untuk development
- **Monitoring dashboards** untuk production

### Maintenance Tasks
- **Regular data cleanup** untuk historical calculations
- **Performance optimization** berdasarkan usage patterns
- **Security updates** untuk dependencies
- **Feature enhancements** berdasarkan user feedback

---

*Dokumentasi ini dibuat untuk HeyTrack v1.0 - Fitur HPP lengkap dengan AI-powered insights dan high-performance calculations.*</content>
<parameter name="filePath">docs/HPP_FEATURE_DOCUMENTATION.md
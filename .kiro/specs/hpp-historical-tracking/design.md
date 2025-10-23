# Design Document: Historical HPP Tracking & Trends

## Overview

Fitur Historical HPP Tracking & Trends menambahkan kemampuan analisis temporal pada sistem HPP yang sudah ada. Fitur ini akan terintegrasi dengan halaman HPP existing sebagai tab baru "HPP Lanjutan" dan menyediakan visualisasi tren, alert system, dan rekomendasi optimasi biaya berdasarkan data historical.

### Key Features
- Grafik tren HPP dengan multiple time periods
- Perbandingan periode dan change indicators
- Alert system untuk perubahan signifikan
- Cost breakdown visualization
- Excel export functionality
- Multi-product comparison
- Automated daily snapshots via cron job
- Cost optimization recommendations

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  HPP Page (existing)                                         │
│  └── New Tab: "HPP Lanjutan"                                │
│      ├── HPPHistoricalChart Component                       │
│      ├── HPPComparisonCard Component                        │
│      ├── HPPAlertsList Component                            │
│      ├── CostBreakdownChart Component                       │
│      └── HPPExportButton Component                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  /api/hpp/snapshots                                         │
│  /api/hpp/trends                                            │
│  /api/hpp/alerts                                            │
│  /api/hpp/breakdown                                         │
│  /api/hpp/export                                            │
│  /api/hpp/recommendations                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Background Jobs                             │
├─────────────────────────────────────────────────────────────┤
│  Cron Job: Daily HPP Snapshot (00:00)                       │
│  Cron Job: Alert Detection (every 6 hours)                  │
│  Cron Job: Data Archival (monthly)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  - hpp_snapshots (new)                                      │
│  - hpp_alerts (new)                                         │
│  - recipes (existing)                                       │
│  - ingredients (existing)                                   │
│  - operational_costs (existing)                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React, Next.js 14, TypeScript
- **Charts**: Recharts (already used in mobile-charts.tsx)
- **State Management**: React hooks, TanStack Query
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Cron Jobs**: Vercel Cron or existing cron-jobs.ts
- **Export**: ExcelJS (already used in excel-export-lazy.service.ts)

## Components and Interfaces

### 1. Database Schema

#### New Table: `hpp_snapshots`
```sql
CREATE TABLE hpp_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  hpp_value DECIMAL(12, 2) NOT NULL,
  
  -- Cost breakdown
  material_cost DECIMAL(12, 2) NOT NULL,
  operational_cost DECIMAL(12, 2) NOT NULL,
  
  -- Detailed breakdown (JSONB for flexibility)
  cost_breakdown JSONB NOT NULL,
  -- Example: {
  --   "ingredients": [
  --     {"id": "uuid", "name": "Tepung", "cost": 5000, "percentage": 25},
  --     {"id": "uuid", "name": "Gula", "cost": 3000, "percentage": 15}
  --   ],
  --   "operational": [
  --     {"category": "utilities", "cost": 2000, "percentage": 10}
  --   ]
  -- }
  
  -- Metadata
  selling_price DECIMAL(12, 2),
  margin_percentage DECIMAL(5, 2),
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_hpp_snapshots_recipe_date ON hpp_snapshots(recipe_id, snapshot_date DESC);
CREATE INDEX idx_hpp_snapshots_date ON hpp_snapshots(snapshot_date DESC);
CREATE INDEX idx_hpp_snapshots_user ON hpp_snapshots(user_id);
```

#### New Table: `hpp_alerts`
```sql
CREATE TABLE hpp_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'hpp_increase', 'hpp_decrease', 'margin_low', 'cost_spike'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Alert details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Change metrics
  old_value DECIMAL(12, 2) NOT NULL,
  new_value DECIMAL(12, 2) NOT NULL,
  change_percentage DECIMAL(5, 2) NOT NULL,
  
  -- Affected components (JSONB)
  affected_components JSONB,
  -- Example: {
  --   "ingredients": [{"name": "Tepung", "old": 5000, "new": 6000, "change": 20}],
  --   "operational": [{"category": "utilities", "old": 2000, "new": 2500, "change": 25}]
  -- }
  
  -- Status tracking
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_hpp_alerts_recipe ON hpp_alerts(recipe_id);
CREATE INDEX idx_hpp_alerts_user_unread ON hpp_alerts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_hpp_alerts_created ON hpp_alerts(created_at DESC);
```

#### New Table: `hpp_snapshots_archive` (for data older than 1 year)
```sql
CREATE TABLE hpp_snapshots_archive (
  LIKE hpp_snapshots INCLUDING ALL
);

-- Partition by year for better performance
CREATE INDEX idx_hpp_archive_recipe_date ON hpp_snapshots_archive(recipe_id, snapshot_date DESC);
```

### 2. TypeScript Interfaces

```typescript
// types/hpp-tracking.ts

export interface HPPSnapshot {
  id: string
  recipe_id: string
  snapshot_date: string
  hpp_value: number
  material_cost: number
  operational_cost: number
  cost_breakdown: CostBreakdown
  selling_price?: number
  margin_percentage?: number
  created_at: string
  user_id: string
}

export interface CostBreakdown {
  ingredients: IngredientCost[]
  operational: OperationalCost[]
}

export interface IngredientCost {
  id: string
  name: string
  cost: number
  percentage: number
}

export interface OperationalCost {
  category: string
  cost: number
  percentage: number
}

export interface HPPAlert {
  id: string
  recipe_id: string
  alert_type: 'hpp_increase' | 'hpp_decrease' | 'margin_low' | 'cost_spike'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  old_value: number
  new_value: number
  change_percentage: number
  affected_components?: AffectedComponents
  is_read: boolean
  is_dismissed: boolean
  read_at?: string
  dismissed_at?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface AffectedComponents {
  ingredients?: ComponentChange[]
  operational?: ComponentChange[]
}

export interface ComponentChange {
  name: string
  old: number
  new: number
  change: number
}

export interface HPPTrendData {
  date: string
  hpp: number
  material_cost: number
  operational_cost: number
}

export interface HPPComparison {
  current_period: {
    avg_hpp: number
    min_hpp: number
    max_hpp: number
    start_date: string
    end_date: string
  }
  previous_period: {
    avg_hpp: number
    min_hpp: number
    max_hpp: number
    start_date: string
    end_date: string
  }
  change: {
    absolute: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
}

export interface HPPRecommendation {
  type: 'supplier_review' | 'ingredient_alternative' | 'operational_efficiency' | 'price_adjustment'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  potential_savings?: number
  action_items: string[]
}

export type TimePeriod = '7d' | '30d' | '90d' | '1y'

export interface HPPExportData {
  recipe_name: string
  period: TimePeriod
  snapshots: HPPSnapshot[]
  summary: {
    min: number
    max: number
    avg: number
    trend: 'up' | 'down' | 'stable'
    total_change: number
  }
}
```

### 3. API Endpoints

#### GET `/api/hpp/snapshots`
**Query Parameters:**
- `recipe_id`: string (required)
- `period`: '7d' | '30d' | '90d' | '1y' (default: '30d')
- `start_date`: ISO date string (optional)
- `end_date`: ISO date string (optional)

**Response:**
```typescript
{
  success: boolean
  data: HPPSnapshot[]
  meta: {
    count: number
    period: string
    recipe_name: string
  }
}
```

#### GET `/api/hpp/trends`
**Query Parameters:**
- `recipe_ids`: string[] (comma-separated, max 5)
- `period`: TimePeriod

**Response:**
```typescript
{
  success: boolean
  data: {
    [recipe_id: string]: HPPTrendData[]
  }
  meta: {
    recipes: Array<{ id: string, name: string }>
  }
}
```

#### GET `/api/hpp/comparison`
**Query Parameters:**
- `recipe_id`: string
- `period`: TimePeriod

**Response:**
```typescript
{
  success: boolean
  data: HPPComparison
}
```

#### GET `/api/hpp/alerts`
**Query Parameters:**
- `unread_only`: boolean (default: false)
- `limit`: number (default: 20)

**Response:**
```typescript
{
  success: boolean
  data: HPPAlert[]
  meta: {
    total: number
    unread_count: number
  }
}
```

#### POST `/api/hpp/alerts/:id/read`
**Body:** None

**Response:**
```typescript
{
  success: boolean
  data: HPPAlert
}
```

#### GET `/api/hpp/breakdown`
**Query Parameters:**
- `recipe_id`: string
- `date`: ISO date string (optional, defaults to latest)

**Response:**
```typescript
{
  success: boolean
  data: {
    total_hpp: number
    material_cost: number
    operational_cost: number
    breakdown: CostBreakdown
  }
}
```

#### GET `/api/hpp/export`
**Query Parameters:**
- `recipe_id`: string
- `period`: TimePeriod

**Response:** Excel file download

#### GET `/api/hpp/recommendations`
**Query Parameters:**
- `recipe_id`: string (optional, if not provided returns all)

**Response:**
```typescript
{
  success: boolean
  data: HPPRecommendation[]
}
```

#### POST `/api/hpp/snapshot` (Internal - called by cron)
**Body:**
```typescript
{
  recipe_id?: string // If not provided, snapshot all recipes
}
```

**Response:**
```typescript
{
  success: boolean
  data: {
    snapshots_created: number
    alerts_generated: number
  }
}
```

## Data Models

### HPP Calculation Logic

```typescript
// lib/hpp-calculator.ts

export interface HPPCalculationResult {
  total_hpp: number
  material_cost: number
  operational_cost: number
  breakdown: CostBreakdown
}

export async function calculateHPP(recipeId: string): Promise<HPPCalculationResult> {
  // 1. Get recipe with ingredients
  const recipe = await getRecipeWithIngredients(recipeId)
  
  // 2. Calculate material cost
  const materialCost = recipe.recipe_ingredients.reduce((total, ri) => {
    return total + (ri.ingredient.price_per_unit * ri.quantity)
  }, 0)
  
  // 3. Get operational costs (monthly, converted to per-unit)
  const operationalCosts = await getOperationalCosts()
  const monthlyOpCost = operationalCosts.reduce((total, cost) => {
    return total + calculateMonthlyCost(cost)
  }, 0)
  
  // 4. Estimate production volume per month
  const estimatedMonthlyProduction = await getEstimatedMonthlyProduction(recipeId)
  const operationalCostPerUnit = monthlyOpCost / estimatedMonthlyProduction
  
  // 5. Calculate breakdown
  const ingredientBreakdown = recipe.recipe_ingredients.map(ri => ({
    id: ri.ingredient.id,
    name: ri.ingredient.name,
    cost: ri.ingredient.price_per_unit * ri.quantity,
    percentage: 0 // Will calculate after total
  }))
  
  const operationalBreakdown = operationalCosts.map(cost => ({
    category: cost.category,
    cost: calculateMonthlyCost(cost) / estimatedMonthlyProduction,
    percentage: 0 // Will calculate after total
  }))
  
  const totalHPP = materialCost + operationalCostPerUnit
  
  // Calculate percentages
  ingredientBreakdown.forEach(item => {
    item.percentage = (item.cost / totalHPP) * 100
  })
  
  operationalBreakdown.forEach(item => {
    item.percentage = (item.cost / totalHPP) * 100
  })
  
  return {
    total_hpp: totalHPP,
    material_cost: materialCost,
    operational_cost: operationalCostPerUnit,
    breakdown: {
      ingredients: ingredientBreakdown,
      operational: operationalBreakdown
    }
  }
}
```

### Alert Detection Logic

```typescript
// lib/hpp-alert-detector.ts

export interface AlertDetectionResult {
  alerts: HPPAlert[]
  snapshots_analyzed: number
}

export async function detectHPPAlerts(recipeId?: string): Promise<AlertDetectionResult> {
  const recipes = recipeId ? [await getRecipe(recipeId)] : await getAllRecipes()
  const alerts: HPPAlert[] = []
  
  for (const recipe of recipes) {
    // Get last 2 snapshots (current and previous)
    const snapshots = await getRecentSnapshots(recipe.id, 2)
    
    if (snapshots.length < 2) continue
    
    const [current, previous] = snapshots
    const changePercentage = ((current.hpp_value - previous.hpp_value) / previous.hpp_value) * 100
    
    // Alert Rule 1: HPP increase > 10%
    if (changePercentage > 10) {
      alerts.push(createAlert({
        recipe_id: recipe.id,
        alert_type: 'hpp_increase',
        severity: changePercentage > 20 ? 'high' : 'medium',
        title: `HPP ${recipe.name} naik ${changePercentage.toFixed(1)}%`,
        message: `HPP meningkat dari ${formatCurrency(previous.hpp_value)} menjadi ${formatCurrency(current.hpp_value)}`,
        old_value: previous.hpp_value,
        new_value: current.hpp_value,
        change_percentage: changePercentage,
        affected_components: analyzeAffectedComponents(current, previous)
      }))
    }
    
    // Alert Rule 2: Margin below 15%
    if (current.margin_percentage && current.margin_percentage < 15) {
      alerts.push(createAlert({
        recipe_id: recipe.id,
        alert_type: 'margin_low',
        severity: current.margin_percentage < 10 ? 'critical' : 'high',
        title: `Margin ${recipe.name} rendah (${current.margin_percentage.toFixed(1)}%)`,
        message: `Margin profit di bawah target minimum 15%`,
        old_value: previous.margin_percentage || 0,
        new_value: current.margin_percentage,
        change_percentage: 0
      }))
    }
    
    // Alert Rule 3: Specific ingredient cost spike > 15%
    const ingredientSpikes = detectIngredientSpikes(current, previous)
    if (ingredientSpikes.length > 0) {
      alerts.push(createAlert({
        recipe_id: recipe.id,
        alert_type: 'cost_spike',
        severity: 'medium',
        title: `Lonjakan biaya bahan ${recipe.name}`,
        message: `${ingredientSpikes.length} bahan mengalami kenaikan harga signifikan`,
        old_value: previous.material_cost,
        new_value: current.material_cost,
        change_percentage: ((current.material_cost - previous.material_cost) / previous.material_cost) * 100,
        affected_components: { ingredients: ingredientSpikes }
      }))
    }
  }
  
  // Save alerts to database
  if (alerts.length > 0) {
    await saveAlerts(alerts)
  }
  
  return {
    alerts,
    snapshots_analyzed: recipes.length
  }
}
```

## Error Handling

### Error Types
```typescript
export class HPPTrackingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'HPPTrackingError'
  }
}

export const HPPErrorCodes = {
  SNAPSHOT_NOT_FOUND: 'SNAPSHOT_NOT_FOUND',
  INVALID_PERIOD: 'INVALID_PERIOD',
  RECIPE_NOT_FOUND: 'RECIPE_NOT_FOUND',
  CALCULATION_FAILED: 'CALCULATION_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
} as const
```

### Error Handling Strategy
1. **API Level**: Return structured error responses with appropriate HTTP status codes
2. **Frontend Level**: Display user-friendly error messages with toast notifications
3. **Logging**: Log all errors to console (development) and error tracking service (production)
4. **Fallback**: Show skeleton loaders or empty states when data is unavailable

## Testing Strategy

### Unit Tests
- HPP calculation logic
- Alert detection algorithms
- Date range calculations
- Cost breakdown calculations
- Export data formatting

### Integration Tests
- API endpoints with database
- Cron job execution
- Real-time data updates
- Multi-user scenarios

### E2E Tests (Optional)
- Complete user flow: view trends → export data
- Alert notification flow
- Multi-product comparison

### Test Data
- Create seed data with various HPP scenarios
- Test edge cases: no data, single data point, extreme values
- Test different time periods and date ranges

## Performance Considerations

### Database Optimization
1. **Indexes**: Create indexes on frequently queried columns (recipe_id, snapshot_date, user_id)
2. **Partitioning**: Partition hpp_snapshots by month for better query performance
3. **Archival**: Move data older than 1 year to archive table
4. **Query Optimization**: Use EXPLAIN ANALYZE to optimize slow queries

### Frontend Optimization
1. **Lazy Loading**: Use dynamic imports for chart components
2. **Data Pagination**: Limit initial data load, load more on demand
3. **Caching**: Use TanStack Query for client-side caching
4. **Debouncing**: Debounce filter changes to reduce API calls
5. **Memoization**: Memoize expensive calculations with useMemo

### API Optimization
1. **Response Compression**: Enable gzip compression
2. **Batch Requests**: Allow fetching multiple recipes in single request
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **CDN Caching**: Cache static export files

### Cron Job Optimization
1. **Batch Processing**: Process snapshots in batches of 50
2. **Error Recovery**: Implement retry logic for failed snapshots
3. **Monitoring**: Log execution time and success rate
4. **Off-Peak Execution**: Run at 00:00 when traffic is low

## Security Considerations

### Authentication & Authorization
- All API endpoints require authentication
- Users can only access their own HPP data
- Implement Row Level Security (RLS) in Supabase

### Data Privacy
- No sensitive data in logs
- Encrypt exported Excel files (optional)
- Implement data retention policy

### Input Validation
- Validate all query parameters
- Sanitize user inputs
- Prevent SQL injection with parameterized queries

## Deployment Strategy

### Phase 1: Database Migration
1. Create new tables (hpp_snapshots, hpp_alerts)
2. Add indexes
3. Set up RLS policies

### Phase 2: Backend Implementation
1. Implement API endpoints
2. Set up cron jobs
3. Test with sample data

### Phase 3: Frontend Implementation
1. Create new components
2. Integrate with existing HPP page
3. Add mobile responsiveness

### Phase 4: Testing & QA
1. Run all tests
2. Performance testing
3. User acceptance testing

### Phase 5: Production Deployment
1. Deploy database changes
2. Deploy backend code
3. Deploy frontend code
4. Monitor for errors

### Phase 6: Data Backfill (Optional)
1. Generate historical snapshots from existing data
2. Run alert detection on historical data

## Monitoring & Maintenance

### Metrics to Track
- Snapshot creation success rate
- Alert generation rate
- API response times
- Export success rate
- Database query performance

### Alerts & Notifications
- Failed cron job executions
- Database connection errors
- High API error rates
- Slow query performance

### Regular Maintenance
- Monthly data archival
- Quarterly performance review
- Annual data cleanup

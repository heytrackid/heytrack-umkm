# HPPRecommendationsPanel Component

## Overview

The `HPPRecommendationsPanel` component displays AI-powered recommendations for optimizing HPP (Harga Pokok Produksi) and improving profitability. It analyzes historical HPP data and provides actionable suggestions based on detected patterns and inefficiencies.

## Features

- **Priority-based Recommendations**: Displays recommendations sorted by priority (High, Medium, Low)
- **Multiple Recommendation Types**:
  - Supplier Review: Suggests reviewing suppliers or finding alternatives
  - Ingredient Alternative: Recommends evaluating expensive ingredients
  - Operational Efficiency: Identifies opportunities to reduce operational costs
  - Price Adjustment: Suggests margin improvement through pricing
- **Potential Savings Calculation**: Shows estimated savings for each recommendation
- **Expandable Details**: Click to expand and view detailed action items
- **Total Savings Summary**: Displays total potential savings across all recommendations
- **Real-time Updates**: Automatically refetches data every 5 minutes

## Usage

### Basic Usage

```tsx
import { HPPRecommendationsPanel } from '@/app/hpp/components/HPPRecommendationsPanel'

export default function HPPPage() {
  return (
    <div>
      <HPPRecommendationsPanel />
    </div>
  )
}
```

### Filter by Recipe

```tsx
import { HPPRecommendationsPanel } from '@/app/hpp/components/HPPRecommendationsPanel'

export default function RecipeDetailPage({ recipeId }: { recipeId: string }) {
  return (
    <div>
      <HPPRecommendationsPanel recipeId={recipeId} />
    </div>
  )
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `recipeId` | `string` | No | `undefined` | Filter recommendations for a specific recipe. If not provided, shows recommendations for all recipes. |

## Recommendation Logic

The component fetches recommendations from `/api/hpp/recommendations` which implements the following detection rules:

### Rule 1: Consistent HPP Increase (Requirement 8.1)
- **Trigger**: HPP increases consistently over 30 days (>10% total increase, 60% of snapshots show increase)
- **Type**: `supplier_review`
- **Priority**: High (if >20% increase), Medium (if 10-20% increase)
- **Action Items**:
  - Compare prices from at least 3 different suppliers
  - Evaluate quality of alternative ingredients with lower prices
  - Negotiate bulk purchase prices with current supplier
  - Consider long-term contracts for stable pricing

### Rule 2: High Operational Cost (Requirement 8.2)
- **Trigger**: Operational cost >20% of HPP OR operational cost increased >20% in 30 days
- **Type**: `operational_efficiency`
- **Priority**: High (if increased >20%), Medium (if just high percentage)
- **Action Items**:
  - Audit utility usage (electricity, water, gas)
  - Evaluate production process efficiency
  - Consider investing in energy-efficient equipment
  - Optimize production schedule to reduce idle time
  - Review vendor contracts for operational costs

### Rule 3: Low Margin (Requirement 8.5)
- **Trigger**: Profit margin <15%
- **Type**: `price_adjustment`
- **Priority**: High (if <10%), Medium (if 10-15%)
- **Action Items**:
  - Option 1: Increase selling price to achieve 25% margin
  - Option 2: Reduce HPP through material and operational efficiency
  - Communicate value proposition to customers for price justification
  - Monitor competitors to ensure competitive pricing
  - Consider bundling or upselling strategies

### Rule 4: Expensive Ingredients (Requirement 8.4)
- **Trigger**: Top ingredient contributes >30% of material cost
- **Type**: `ingredient_alternative`
- **Priority**: Medium (if >40%), Low (if 30-40%)
- **Action Items**:
  - Find alternatives with 20% lower cost
  - Evaluate if quantity can be reduced without affecting quality
  - Consider bulk purchase for volume discounts
  - Test recipe with optimized ingredient proportions
  - Negotiate prices with supplier for large quantity purchases

## Potential Savings Calculation

Each recommendation includes an estimated potential savings:

- **Supplier Review**: (Last HPP - First HPP) × 10 units
- **Operational Efficiency**: (Current Op Cost - Target Op Cost) × 10 units
- **Price Adjustment**: (Suggested Price - Current Price) × 10 units
- **Ingredient Alternative**: Top Ingredient Cost × 0.2 × 10 units

The total potential savings is displayed at the top of the panel when recommendations are available.

## UI Components

### Priority Badges
- **High Priority**: Red badge with "Prioritas Tinggi"
- **Medium Priority**: Yellow badge with "Prioritas Sedang"
- **Low Priority**: Blue badge with "Prioritas Rendah"

### Recommendation Type Icons
- **Supplier Review**: Users icon (purple)
- **Ingredient Alternative**: Package icon (blue)
- **Operational Efficiency**: TrendingUp icon (green)
- **Price Adjustment**: DollarSign icon (orange)

### States

#### Loading State
Shows skeleton loaders for 3 recommendation cards while fetching data.

#### Error State
Displays an error message with AlertCircle icon if data fetch fails.

#### Empty State
Shows a success message with CheckCircle2 icon when no recommendations are needed (all HPP values are optimal).

#### Loaded State
Displays recommendations in collapsible cards with:
- Recommendation title and description
- Priority badge
- Recipe name (if applicable)
- Potential savings amount
- Expandable action items list

## Example Integration

```tsx
'use client'

import { HPPHistoricalChart } from './HPPHistoricalChart'
import { HPPComparisonCard } from './HPPComparisonCard'
import { HPPAlertsList } from './HPPAlertsList'
import { HPPRecommendationsPanel } from './HPPRecommendationsPanel'

export default function HPPHistoricalTab({ recipeId }: { recipeId: string }) {
  return (
    <div className="space-y-6">
      {/* Chart and Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HPPHistoricalChart recipeId={recipeId} />
        <HPPComparisonCard recipeId={recipeId} />
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HPPAlertsList recipeId={recipeId} />
        <HPPRecommendationsPanel recipeId={recipeId} />
      </div>
    </div>
  )
}
```

## API Endpoint

The component fetches data from:

```
GET /api/hpp/recommendations?recipe_id={recipeId}
```

**Response Format:**
```typescript
{
  success: boolean
  data: Array<HPPRecommendation & { recipe_id: string; recipe_name: string }>
  meta: {
    total_recommendations: number
    recipes_analyzed: number
  }
}
```

## Dependencies

- `@tanstack/react-query`: For data fetching and caching
- `lucide-react`: For icons
- `@/components/ui/*`: Shadcn UI components
- `@/hooks/useCurrency`: For currency formatting

## Styling

The component uses Tailwind CSS classes and follows the application's design system:
- Card-based layout with proper spacing
- Responsive design (mobile-friendly)
- Dark mode support
- Smooth animations for expand/collapse
- Color-coded priority and type indicators

## Performance

- **Caching**: Uses TanStack Query for automatic caching
- **Refetch Interval**: 5 minutes (300000ms)
- **Optimized Rendering**: Only re-renders when data changes
- **Lazy Loading**: Collapsible content is rendered but hidden until expanded

## Accessibility

- Semantic HTML structure
- Keyboard navigation support (collapsible triggers)
- ARIA labels for icons
- Color contrast meets WCAG standards
- Screen reader friendly

## Testing

To test the component:

1. Ensure you have HPP snapshots data in the database
2. Navigate to the HPP page
3. Select a recipe with historical data
4. Verify recommendations appear based on the detection rules
5. Click to expand and view action items
6. Check that potential savings are calculated correctly

## Troubleshooting

### No Recommendations Showing
- Verify that HPP snapshots exist for the recipe (at least 5 snapshots for 30-day analysis)
- Check that the API endpoint is accessible
- Ensure the recipe has cost breakdown data

### Incorrect Savings Calculation
- Verify that snapshot data includes accurate cost_breakdown
- Check that selling_price is set for the recipe
- Review the calculation logic in `/api/hpp/recommendations/route.ts`

### Performance Issues
- Limit the number of recipes analyzed (default: 20)
- Increase refetch interval if needed
- Consider implementing pagination for large datasets

## Related Components

- `HPPHistoricalChart`: Displays HPP trend over time
- `HPPComparisonCard`: Shows period-over-period comparison
- `HPPAlertsList`: Displays HPP alerts and notifications
- `CostBreakdownChart`: Shows cost component breakdown

## Requirements Mapping

This component fulfills the following requirements:

- **Requirement 8.1**: Detect consistent HPP increases (30 days)
- **Requirement 8.2**: Identify operational cost increases > 20%
- **Requirement 8.3**: Display recommendations with priority badges
- **Requirement 8.4**: Calculate potential savings from alternatives
- **Requirement 8.5**: Generate margin improvement suggestions

# HPPComparisonCard Component

## Overview

The `HPPComparisonCard` component displays a comparison between the current and previous period's HPP (Harga Pokok Produksi) values. It provides visual indicators for trends and detailed statistics.

## Features

- **Period Comparison**: Shows current vs previous period average HPP
- **Trend Indicators**: Visual indicators with color coding:
  - 🔴 Red for increases > 5%
  - 🟢 Green for decreases > 5%
  - ⚪ Gray for stable changes (< 5%)
- **Percentage & Absolute Change**: Displays both percentage and currency value changes
- **Min/Max Statistics**: Shows minimum and maximum HPP values for both periods
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Graceful handling when data is unavailable
- **Animated Transitions**: Smooth transitions for value changes
- **Dark Mode Support**: Full support for light and dark themes

## Props

```typescript
interface HPPComparisonCardProps {
  comparison: HPPComparison | null  // Comparison data from API
  loading?: boolean                  // Loading state
  recipeName?: string                // Optional recipe name for display
  period?: string                    // Period label (e.g., '30d')
}
```

## Data Structure

The component expects data in the following format:

```typescript
interface HPPComparison {
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
```

## Usage

### Basic Usage

```tsx
import HPPComparisonCard from '@/app/hpp/components/HPPComparisonCard'

function MyComponent() {
  const [comparison, setComparison] = useState<HPPComparison | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch comparison data...

  return (
    <HPPComparisonCard
      comparison={comparison}
      loading={loading}
      recipeName="Kue Brownies"
      period="30d"
    />
  )
}
```

### With TanStack Query (Recommended)

```tsx
import { useQuery } from '@tanstack/react-query'
import HPPComparisonCard from '@/app/hpp/components/HPPComparisonCard'

function useHPPComparison(recipeId: string, period: TimePeriod) {
  return useQuery({
    queryKey: ['hpp-comparison', recipeId, period],
    queryFn: async () => {
      const response = await fetch(
        `/api/hpp/comparison?recipe_id=${recipeId}&period=${period}`
      )
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data as HPPComparison
    },
    enabled: !!recipeId,
    staleTime: 5 * 60 * 1000,
  })
}

function MyComponent({ recipeId }: { recipeId: string }) {
  const { data, isLoading } = useHPPComparison(recipeId, '30d')

  return (
    <HPPComparisonCard
      comparison={data || null}
      loading={isLoading}
      recipeName="Kue Brownies"
      period="30d"
    />
  )
}
```

## API Endpoint

The component works with the `/api/hpp/comparison` endpoint:

**Request:**
```
GET /api/hpp/comparison?recipe_id={id}&period={period}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_period": {
      "avg_hpp": 15000,
      "min_hpp": 14500,
      "max_hpp": 15500,
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-01-31T00:00:00Z"
    },
    "previous_period": {
      "avg_hpp": 14000,
      "min_hpp": 13500,
      "max_hpp": 14500,
      "start_date": "2024-12-01T00:00:00Z",
      "end_date": "2024-12-31T00:00:00Z"
    },
    "change": {
      "absolute": 1000,
      "percentage": 7.14,
      "trend": "up"
    }
  },
  "meta": {
    "recipe_name": "Kue Brownies",
    "period": "30d",
    "has_previous_data": true
  }
}
```

## Styling

The component uses Tailwind CSS and shadcn/ui components. It automatically adapts to:
- Light and dark themes
- Different screen sizes (responsive)
- Color schemes based on trend direction

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **Requirement 2.1**: Display percentage change compared to previous period ✅
- **Requirement 2.2**: Red indicator for increase > 5% with up arrow ✅
- **Requirement 2.3**: Green indicator for decrease > 5% with down arrow ✅
- **Requirement 2.4**: Gray indicator for stable change (< 5%) ✅
- **Requirement 2.5**: Display absolute value change in currency format ✅

## Dependencies

- `@/components/ui/card` - Card components
- `@/components/ui/skeleton` - Loading skeletons
- `@/hooks/useCurrency` - Currency formatting
- `@/types/hpp-tracking` - TypeScript types
- `lucide-react` - Icons (ArrowUp, ArrowDown, Minus)
- `@/lib/utils` - Utility functions (cn)

## Future Enhancements

Potential improvements for future iterations:

1. Add click-to-expand for detailed breakdown
2. Add export functionality for comparison data
3. Add historical comparison (compare multiple periods)
4. Add customizable thresholds for trend indicators
5. Add tooltips with more detailed information
6. Add animation for value changes (number counting)

## Testing

To test the component:

1. **With Data**: Provide valid comparison data and verify all values display correctly
2. **Loading State**: Set `loading={true}` and verify skeleton loaders appear
3. **Empty State**: Set `comparison={null}` and verify empty state message
4. **Trend Indicators**: Test with different trend values (up/down/stable)
5. **Responsive**: Test on different screen sizes
6. **Dark Mode**: Toggle theme and verify colors adapt correctly

## Related Components

- `HPPHistoricalChart` - Displays HPP trends over time
- `HPPAlertsList` - Shows HPP alerts
- `CostBreakdownChart` - Shows cost breakdown visualization

## Support

For issues or questions, refer to:
- Design document: `.kiro/specs/hpp-historical-tracking/design.md`
- Requirements: `.kiro/specs/hpp-historical-tracking/requirements.md`
- Tasks: `.kiro/specs/hpp-historical-tracking/tasks.md`

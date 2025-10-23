# CostBreakdownChart Component

## Overview

The `CostBreakdownChart` component provides a comprehensive visualization of HPP (Harga Pokok Produksi / Cost of Goods Sold) breakdown for recipes. It displays the cost composition using an interactive pie chart and detailed ingredient listings.

## Features

### ✅ Task 9.1: Core Pie Chart
- **Interactive Pie Chart**: Built with Recharts library
- **Material vs Operational Split**: Clear visualization of cost categories
- **Percentage Display**: Shows percentages directly on chart segments
- **Legend**: Displays cost values with color coding
- **Hover Effects**: Active shape animation on hover
- **Click Interaction**: Click segments to drill down into details

### ✅ Task 9.2: Detailed Breakdown View
- **Top 5 Ingredients**: Shows the most expensive ingredients
- **Cost & Percentage**: Displays both absolute cost and percentage contribution
- **Price Change Alerts**: Highlights ingredients with >15% price increases
- **Expandable List**: Collapsible section to view all ingredients
- **Previous Cost Comparison**: Shows strikethrough previous costs when changed

### ✅ Task 9.3: Interactive Features
- **Segment Click**: Click pie segments to show detailed breakdowns
- **Hover Tooltips**: Rich tooltips with formatted currency values
- **Drill-down**: View operational cost details when clicking operational segment
- **Visual Feedback**: Color-coded alerts for significant changes
- **Mobile Responsive**: Optimized for touch devices

## Usage

### Basic Usage

```tsx
import CostBreakdownChart from '@/app/hpp/components/CostBreakdownChart'

function MyComponent() {
  return (
    <CostBreakdownChart
      recipeId="recipe-uuid-here"
      recipeName="Nasi Goreng Spesial"
    />
  )
}
```

### With Specific Date

```tsx
<CostBreakdownChart
  recipeId="recipe-uuid-here"
  recipeName="Nasi Goreng Spesial"
  date="2025-01-22"
/>
```

### With Custom Styling

```tsx
<CostBreakdownChart
  recipeId="recipe-uuid-here"
  recipeName="Nasi Goreng Spesial"
  className="shadow-lg border-2"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `recipeId` | `string` | Yes | The UUID of the recipe to fetch breakdown for |
| `recipeName` | `string` | No | Display name for the recipe (shown in header) |
| `date` | `string` | No | Specific date for snapshot (ISO format: YYYY-MM-DD) |
| `className` | `string` | No | Additional CSS classes for the card container |

## Data Structure

The component fetches data from `/api/hpp/breakdown` endpoint:

```typescript
interface BreakdownData {
  total_hpp: number
  material_cost: number
  operational_cost: number
  breakdown: {
    ingredients: Array<{
      id: string
      name: string
      cost: number
      percentage: number
      previous_cost?: number
      change_percentage?: number
      has_significant_change?: boolean
    }>
    operational: Array<{
      category: string
      cost: number
      percentage: number
    }>
    all_ingredients: IngredientCost[]
  }
  snapshot_date: string
}
```

## Visual Indicators

### Color Coding

- **Material Costs**: Green (`#10b981`)
- **Operational Costs**: Orange (`#f59e0b`)
- **Ingredients**: Rainbow palette (8 colors)

### Alert Badges

- **Red Badge with TrendingUp Icon**: Ingredient with >15% price increase
- **Red Background**: Ingredient card with significant change
- **Strikethrough Price**: Previous cost when changed

## States

### Loading State
- Displays skeleton loaders for all sections
- Maintains layout structure during load

### Error State
- Shows error alert with message
- Provides "Try Again" button to retry

### Empty State
- Displays pie chart icon
- Shows helpful message about data availability

## Interactive Behaviors

### Pie Chart Interactions

1. **Hover**: Segment expands and shows active shape with details
2. **Click**: Sets selected segment and shows detailed breakdown below
3. **Mouse Leave**: Returns to default state

### Ingredient List

1. **Top 5 Display**: Always visible with color indicators
2. **Expand Button**: Shows when more than 5 ingredients exist
3. **Collapsible Content**: Smooth animation for expand/collapse

### Segment Details

- **Material Segment**: Shows top 5 ingredients (always visible)
- **Operational Segment**: Shows operational cost breakdown when clicked

## Mobile Optimization

- **Responsive Chart Size**: 280px on mobile, 320px on desktop
- **Touch-Friendly**: Larger touch targets for mobile
- **Optimized Layout**: Stacks elements vertically on small screens
- **Readable Text**: Adjusted font sizes for mobile readability

## Requirements Mapping

### Requirement 4.1 ✅
> THE HPP System SHALL menampilkan pie chart yang menunjukkan proporsi biaya bahan baku dan biaya operasional

**Implementation**: Pie chart with material and operational cost segments

### Requirement 4.2 ✅
> WHEN User mengklik segmen pie chart, THE HPP System SHALL menampilkan detail breakdown komponen biaya tersebut

**Implementation**: Click handler with segment selection and detail display

### Requirement 4.3 ✅
> THE HPP System SHALL menampilkan daftar 5 bahan baku dengan kontribusi biaya tertinggi

**Implementation**: Top 5 ingredients sorted by cost

### Requirement 4.4 ✅
> THE HPP System SHALL menghitung dan menampilkan persentase kontribusi setiap komponen terhadap total HPP

**Implementation**: Percentage calculation and display for all components

### Requirement 4.5 ✅
> WHEN biaya bahan baku tertentu naik lebih dari 15%, THE HPP System SHALL menandai bahan tersebut dengan highlight warna merah

**Implementation**: Red background and badge for ingredients with >15% increase

## Dependencies

- `recharts`: Chart library
- `@/components/ui/*`: UI components (Card, Badge, Button, etc.)
- `@/hooks/use-mobile`: Responsive design hook
- `@/hooks/useCurrency`: Currency formatting hook
- `lucide-react`: Icon library

## Performance Considerations

- **Memoization**: Uses `useMemo` for expensive calculations
- **Lazy Loading**: Can be dynamically imported
- **Optimized Re-renders**: Only updates when data changes
- **Efficient API Calls**: Single endpoint for all data

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **Color Contrast**: WCAG AA compliant colors
- **Keyboard Navigation**: Collapsible sections are keyboard accessible
- **Screen Reader Support**: Meaningful labels and descriptions

## Future Enhancements

- [ ] Export breakdown as PDF/Excel
- [ ] Compare multiple time periods
- [ ] Animated transitions for data changes
- [ ] Custom color themes
- [ ] Print-friendly view

## Related Components

- `HPPHistoricalChart`: Shows HPP trends over time
- `HPPComparisonCard`: Compares periods
- `HPPAlertsList`: Shows HPP alerts

## Testing

To test the component:

1. Ensure you have HPP snapshots in the database
2. Use a valid recipe ID
3. Check different states (loading, error, empty, success)
4. Test interactions (hover, click, expand)
5. Verify mobile responsiveness

## Troubleshooting

### No Data Displayed
- Verify recipe ID is correct
- Check if HPP snapshots exist for the recipe
- Ensure API endpoint is accessible

### Chart Not Rendering
- Check browser console for errors
- Verify Recharts is installed
- Ensure data structure matches expected format

### Percentages Don't Add Up to 100%
- This is expected due to rounding
- Backend calculates exact percentages
- Display rounds to 1 decimal place

## Support

For issues or questions, refer to:
- Design document: `.kiro/specs/hpp-historical-tracking/design.md`
- Requirements: `.kiro/specs/hpp-historical-tracking/requirements.md`
- API documentation: `src/app/api/hpp/breakdown/route.ts`

# HPP Utilities Documentation

This directory contains utility functions for the HPP Historical Tracking feature.

## Files Overview

### 1. `hpp-date-utils.ts`
Date range calculations and formatting utilities.

**Key Functions:**
- `getPeriodDateRange(period, endDate?)` - Get start/end dates for a time period
- `formatDate(date, format)` - Format dates for display ('short', 'medium', 'long')
- `formatDateForAPI(date)` - Format dates for API requests (ISO)
- `getPeriodLabel(period)` - Get human-readable period labels
- `getShortPeriodLabel(period)` - Get short labels for buttons
- `formatDateRange(start, end)` - Format date ranges
- `getRelativeDateLabel(date)` - Get relative labels (Today, Yesterday, etc.)
- `formatChartDate(date, period)` - Format dates for chart axes

**Usage Example:**
```typescript
import { getPeriodDateRange, formatDate, getPeriodLabel } from '@/utils/hpp-utils'

// Get date range for last 30 days
const { start, end } = getPeriodDateRange('30d')

// Format date for display
const displayDate = formatDate(new Date(), 'medium') // "25 Des"

// Get period label
const label = getPeriodLabel('30d') // "30 Hari Terakhir"
```

### 2. `hpp-chart-formatters.ts`
Data formatting utilities for Recharts visualization.

**Key Functions:**
- `formatSnapshotsForChart(snapshots, period)` - Format snapshots for single product chart
- `formatTrendDataForChart(trendData, period)` - Format trend data for charts
- `formatMultiProductData(productsData, recipeNames, period)` - Format multi-product comparison data
- `aggregateSnapshotsByDate(snapshots, aggregation)` - Aggregate multiple snapshots per day
- `fillMissingDataPoints(data, fillMethod)` - Fill gaps in data
- `calculateMovingAverage(data, windowSize)` - Calculate moving average for smoothing
- `getChartDomain(data, field, padding)` - Calculate chart Y-axis domain
- `formatTooltipValue(value, type)` - Format values for chart tooltips

**Usage Example:**
```typescript
import { formatSnapshotsForChart, formatTooltipValue } from '@/utils/hpp-utils'

// Format snapshots for chart
const chartData = formatSnapshotsForChart(snapshots, '30d')

// Format tooltip value
const formattedValue = formatTooltipValue(50000, 'currency') // "Rp 50.000"
```

### 3. `hpp-alert-helpers.ts`
Alert formatting and severity mapping utilities.

**Key Functions:**
- `getSeverityColors(severity)` - Get color scheme for severity level
- `getAlertTypeIcon(alertType)` - Get icon for alert type
- `getSeverityLabel(severity)` - Get localized severity label
- `getAlertTypeLabel(alertType)` - Get localized alert type label
- `formatChangePercentage(changePercentage, includeSign?)` - Format percentage with sign
- `getChangeIndicator(changePercentage)` - Get arrow indicator (↑↓→)
- `getChangeColorClass(changePercentage, isPositiveGood?)` - Get Tailwind color class
- `generateAlertMessage(alert)` - Generate formatted alert message
- `generateAlertTitle(alertType, severity, recipeName)` - Generate alert title
- `formatCurrency(value)` - Format currency values
- `formatAbsoluteChange(oldValue, newValue)` - Format absolute change with sign
- `getAlertPriority(alert)` - Calculate priority score for sorting
- `sortAlertsByPriority(alerts)` - Sort alerts by priority
- `groupAlertsByDate(alerts)` - Group alerts by date categories
- `getAlertsSummary(alerts)` - Get summary statistics
- `formatTimeAgo(date)` - Format relative time

**Usage Example:**
```typescript
import { 
  getSeverityColors, 
  formatChangePercentage, 
  sortAlertsByPriority 
} from '@/utils/hpp-utils'

// Get severity colors
const colors = getSeverityColors('high')
// { color: 'text-orange-700', bgColor: 'bg-orange-50', ... }

// Format change percentage
const change = formatChangePercentage(15.5) // "+15.5%"

// Sort alerts
const sortedAlerts = sortAlertsByPriority(alerts)
```

### 4. `hpp-utils.ts`
Central export point for all HPP utilities.

**Usage:**
```typescript
// Import all utilities from one place
import {
  getPeriodDateRange,
  formatSnapshotsForChart,
  getSeverityColors,
  formatChangePercentage
} from '@/utils/hpp-utils'
```

## Integration with Components

These utilities are designed to work with:
- `HPPHistoricalChart` - Uses date and chart formatters
- `HPPComparisonCard` - Uses date and change formatters
- `HPPAlertsList` - Uses alert helpers
- `CostBreakdownChart` - Uses chart formatters
- API endpoints - Uses date formatters for queries

## Type Safety

All utilities are fully typed with TypeScript and use types from:
- `@/types/hpp-tracking` - HPP-specific types
- Standard TypeScript Date types

## Localization

All user-facing strings are in Indonesian (Bahasa Indonesia) to match the application's target audience.

## Performance Considerations

- Date calculations are optimized for common use cases
- Chart formatters handle large datasets efficiently
- Alert helpers include memoization-friendly pure functions
- All functions are side-effect free for easy testing

## Testing

These utilities are pure functions that can be easily unit tested:

```typescript
import { getPeriodDateRange } from '@/utils/hpp-utils'

describe('getPeriodDateRange', () => {
  it('should return correct date range for 7 days', () => {
    const { start, end } = getPeriodDateRange('7d')
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(7)
  })
})
```

## Requirements Coverage

These utilities fulfill the following requirements:
- **1.3, 1.4**: Date range utilities for period filtering
- **1.1, 6.1, 6.2**: Chart data formatters for visualization
- **3.1, 3.2, 3.4**: Alert severity helpers for notifications

## Future Enhancements

Potential improvements:
- Add more date locales support
- Add chart theme customization
- Add alert notification sound/vibration helpers
- Add export formatters for different file types

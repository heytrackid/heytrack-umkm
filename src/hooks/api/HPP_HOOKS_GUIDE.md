# HPP Custom Hooks Guide

This guide explains how to use the custom hooks for HPP (Harga Pokok Produksi) historical tracking features.

## Overview

The HPP hooks provide a clean, type-safe interface for fetching and managing HPP data using TanStack Query. All hooks include automatic caching, error handling, and optimistic updates where applicable.

## Available Hooks

### 1. useHPPSnapshots

Fetch HPP snapshots for a specific recipe with period filtering.

**Features:**
- Automatic caching (5-minute stale time)
- Refetch on window focus
- Period filtering (7d, 30d, 90d, 1y)
- Custom date range support

**Usage:**
```tsx
import { useHPPSnapshots } from '@/hooks/api/useHPP'

function HPPChart({ recipeId }: { recipeId: string }) {
  const { data, isLoading, error } = useHPPSnapshots({
    recipeId,
    period: '30d'
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h3>{data?.meta.recipe_name}</h3>
      <p>Total snapshots: {data?.meta.count}</p>
      {/* Render chart with data.data */}
    </div>
  )
}
```

**Parameters:**
- `recipeId` (required): Recipe UUID
- `period` (optional): '7d' | '30d' | '90d' | '1y' (default: '30d')
- `startDate` (optional): ISO date string for custom range
- `endDate` (optional): ISO date string for custom range
- `enabled` (optional): Enable/disable query (default: true)

---

### 2. useHPPAlerts

Fetch HPP alerts with real-time updates and unread count tracking.

**Features:**
- Automatic polling every 5 minutes
- Unread count tracking
- Filter by unread status
- Refetch on window focus

**Usage:**
```tsx
import { useHPPAlerts } from '@/hooks/api/useHPP'

function AlertsList() {
  const { alerts, unreadCount, isLoading } = useHPPAlerts({
    unreadOnly: false,
    limit: 20
  })

  return (
    <div>
      <h3>Alerts ({unreadCount} unread)</h3>
      {alerts.map(alert => (
        <div key={alert.id}>
          {alert.title}
        </div>
      ))}
    </div>
  )
}
```

**Parameters:**
- `unreadOnly` (optional): Show only unread alerts (default: false)
- `limit` (optional): Number of alerts to fetch (default: 20)
- `enabled` (optional): Enable/disable query (default: true)

**Returns:**
- `alerts`: Array of HPPAlert objects
- `unreadCount`: Number of unread alerts
- `total`: Total number of alerts
- Plus all standard TanStack Query properties

---

### 3. useMarkAlertAsRead

Mark an alert as read with optimistic updates.

**Features:**
- Optimistic UI updates
- Automatic cache invalidation
- Error handling with rollback
- Success/error notifications

**Usage:**
```tsx
import { useMarkAlertAsRead } from '@/hooks/api/useHPP'

function AlertItem({ alert }: { alert: HPPAlert }) {
  const { mutate: markAsRead, isPending } = useMarkAlertAsRead()

  return (
    <div>
      <p>{alert.title}</p>
      <button 
        onClick={() => markAsRead(alert.id)}
        disabled={isPending || alert.is_read}
      >
        {alert.is_read ? 'Read' : 'Mark as Read'}
      </button>
    </div>
  )
}
```

---

### 4. useHPPAlertsUnreadCount

Get only the unread count without fetching full alert data. Useful for badge displays.

**Usage:**
```tsx
import { useHPPAlertsUnreadCount } from '@/hooks/api/useHPP'

function NavBadge() {
  const { unreadCount } = useHPPAlertsUnreadCount()

  return unreadCount > 0 ? (
    <span className="badge">{unreadCount}</span>
  ) : null
}
```

---

### 5. useHPPComparison

Fetch HPP comparison data with automatic trend indicator calculations.

**Features:**
- Automatic caching (5-minute stale time)
- Memoized trend calculations
- Period comparison support
- Refetch on window focus

**Usage:**
```tsx
import { useHPPComparison } from '@/hooks/api/useHPP'

function ComparisonCard({ recipeId }: { recipeId: string }) {
  const { 
    comparison,
    trendIndicator,
    changePercentage,
    changeAbsolute,
    isLoading 
  } = useHPPComparison({
    recipeId,
    period: '30d'
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h3>HPP Comparison</h3>
      <p>Current: {comparison?.current_period.avg_hpp}</p>
      <p>Previous: {comparison?.previous_period.avg_hpp}</p>
      <p className={`text-${trendIndicator?.color}`}>
        {trendIndicator?.icon} {changePercentage.toFixed(1)}%
      </p>
    </div>
  )
}
```

**Parameters:**
- `recipeId` (required): Recipe UUID
- `period` (optional): '7d' | '30d' | '90d' | '1y' (default: '30d')
- `enabled` (optional): Enable/disable query (default: true)

**Returns:**
- `comparison`: HPPComparison object
- `trendIndicator`: { color, icon, label }
- `changePercentage`: Percentage change
- `changeAbsolute`: Absolute change value
- `currentAvg`: Current period average
- `previousAvg`: Previous period average
- Plus all standard TanStack Query properties

---

### 6. useTrendIndicator

Calculate trend indicator for a specific change percentage without fetching data.

**Usage:**
```tsx
import { useTrendIndicator } from '@/hooks/api/useHPP'

function TrendBadge({ changePercentage }: { changePercentage: number }) {
  const indicator = useTrendIndicator(changePercentage)

  return (
    <span className={`badge-${indicator.color}`}>
      {indicator.icon} {indicator.label}
    </span>
  )
}
```

---

### 7. useHPPExport

Export HPP data to Excel with automatic file download.

**Features:**
- Automatic file download on success
- Loading state management
- Error handling with notifications
- Success notifications

**Usage:**
```tsx
import { useHPPExport } from '@/hooks/api/useHPP'

function ExportButton({ recipeId, recipeName }: Props) {
  const { mutate: exportToExcel, isPending } = useHPPExport()

  const handleExport = () => {
    exportToExcel({
      recipeId,
      period: '30d',
      recipeName
    })
  }

  return (
    <button onClick={handleExport} disabled={isPending}>
      {isPending ? 'Exporting...' : 'Export to Excel'}
    </button>
  )
}
```

**Parameters:**
- `recipeId` (required): Recipe UUID
- `period` (optional): '7d' | '30d' | '90d' | '1y' (default: '30d')
- `recipeName` (optional): Recipe name for filename (default: 'Product')

---

### 8. useHPPBatchExport

Export multiple recipes to Excel in batch.

**Usage:**
```tsx
import { useHPPBatchExport } from '@/hooks/api/useHPP'

function BatchExportButton({ recipes }: Props) {
  const { mutate: exportMultiple, isPending } = useHPPBatchExport()

  const handleBatchExport = () => {
    exportMultiple({
      recipes: [
        { recipeId: 'uuid-1', recipeName: 'Product 1' },
        { recipeId: 'uuid-2', recipeName: 'Product 2' }
      ],
      period: '30d'
    })
  }

  return (
    <button onClick={handleBatchExport} disabled={isPending}>
      {isPending ? 'Exporting...' : 'Export All'}
    </button>
  )
}
```

---

## Best Practices

### 1. Enable/Disable Queries Conditionally

```tsx
const { data } = useHPPSnapshots({
  recipeId,
  period,
  enabled: !!recipeId // Only fetch when recipeId is available
})
```

### 2. Handle Loading and Error States

```tsx
const { data, isLoading, error } = useHPPSnapshots({ recipeId, period })

if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />

return <Chart data={data.data} />
```

### 3. Use Optimistic Updates for Better UX

The `useMarkAlertAsRead` hook already implements optimistic updates. The UI updates immediately before the server responds.

### 4. Leverage Memoization

The `useHPPComparison` hook automatically memoizes expensive calculations. Use the provided computed values instead of recalculating:

```tsx
// ✅ Good - uses memoized value
const { changePercentage } = useHPPComparison({ recipeId, period })

// ❌ Bad - recalculates on every render
const changePercentage = (current - previous) / previous * 100
```

### 5. Combine Multiple Hooks

```tsx
function HPPDashboard({ recipeId }: Props) {
  const { data: snapshots } = useHPPSnapshots({ recipeId, period: '30d' })
  const { comparison, trendIndicator } = useHPPComparison({ recipeId, period: '30d' })
  const { alerts, unreadCount } = useHPPAlerts({ limit: 5 })
  const { mutate: exportToExcel } = useHPPExport()

  return (
    <div>
      <ComparisonCard comparison={comparison} indicator={trendIndicator} />
      <AlertsBadge count={unreadCount} />
      <Chart data={snapshots?.data} />
      <ExportButton onClick={() => exportToExcel({ recipeId })} />
    </div>
  )
}
```

---

## Type Safety

All hooks are fully typed with TypeScript. Import types from the hooks or from `@/types/hpp-tracking`:

```tsx
import type { 
  HPPSnapshot, 
  HPPAlert, 
  HPPComparison,
  TimePeriod 
} from '@/types/hpp-tracking'

import type {
  UseHPPSnapshotsParams,
  UseHPPAlertsParams,
  UseHPPComparisonParams,
  ExportHPPParams
} from '@/hooks/api/useHPP'
```

---

## Error Handling

All hooks use TanStack Query's built-in error handling. Errors are automatically retried (up to 2 times) with exponential backoff.

```tsx
const { error, isError } = useHPPSnapshots({ recipeId, period })

if (isError) {
  console.error('Failed to fetch snapshots:', error)
  // Show error UI
}
```

---

## Caching Strategy

- **Snapshots & Comparison**: 5-minute stale time, 15-minute garbage collection
- **Alerts**: 2-minute stale time, 10-minute garbage collection, auto-refetch every 5 minutes
- **All queries**: Refetch on window focus, retry on failure

To manually refetch:

```tsx
const { refetch } = useHPPSnapshots({ recipeId, period })

// Later...
refetch()
```

To invalidate cache:

```tsx
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Invalidate all HPP queries
queryClient.invalidateQueries({ queryKey: ['hpp'] })

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['hpp', 'snapshots', recipeId] })
```

---

## Testing

Example test using these hooks:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useHPPSnapshots } from '@/hooks/api/useHPP'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('fetches HPP snapshots', async () => {
  const { result } = renderHook(
    () => useHPPSnapshots({ recipeId: 'test-id', period: '30d' }),
    { wrapper: createWrapper() }
  )

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toBeDefined()
})
```

---

## Related Documentation

- [HPP Historical Tracking Requirements](/.kiro/specs/hpp-historical-tracking/requirements.md)
- [HPP Historical Tracking Design](/.kiro/specs/hpp-historical-tracking/design.md)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

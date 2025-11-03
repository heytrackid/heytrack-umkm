# Performance Monitoring System

## Overview
Comprehensive performance monitoring system with real-time Web Vitals tracking and detailed metrics.

## Components

### 1. Performance Monitor Hook
**File**: `src/hooks/usePerformanceMonitoring.ts`

Features:
- Core Web Vitals tracking (LCP, FID, CLS)
- Navigation timing metrics
- Resource loading performance
- Memory usage monitoring (Chrome)
- Performance scoring algorithm
- Automated metrics export

### 2. Web Vitals Integration
**File**: `src/lib/performance/web-vitals.tsx`

Features:
- Uses official `web-vitals` library
- Tracks CLS, FCP, INP, LCP, TTFB
- Sends metrics to analytics endpoint
- Long task detection (>50ms)
- Resource timing analysis
- Performance logging

### 3. Performance Monitor Component
**File**: `src/components/admin/PerformanceMonitor.tsx`

Features:
- Real-time visual dashboard
- Color-coded metrics
- Performance score (0-100)
- Rating system (Excellent/Good/Needs Improvement/Poor)
- Memory usage display
- Export functionality

## Usage

### Development Mode
Performance monitor automatically appears in development:
```tsx
// Visible by default in dev mode
npm run dev
```

### Production Mode
Add `?perf=true` to URL to enable monitoring:
```
https://yourapp.com/dashboard?perf=true
```

### Programmatic Usage
```tsx
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

function MyComponent() {
  const { metrics, performanceScore, performanceRating } = usePerformanceMonitoring()
  
  return (
    <div>
      Score: {performanceScore}/100
      Rating: {performanceRating}
    </div>
  )
}
```

### Web Vitals Tracking
```tsx
import { useWebVitals } from '@/lib/performance/web-vitals'

function App() {
  useWebVitals((metric) => {
    // Send to your analytics service
    analytics.track('web_vitals', metric)
  })
}
```

## Metrics Tracked

### Core Web Vitals
1. **LCP (Largest Contentful Paint)**: < 2.5s (Good), < 4s (Needs Improvement)
2. **FID (First Input Delay)**: < 100ms (Good), < 300ms (Needs Improvement)
3. **CLS (Cumulative Layout Shift)**: < 0.1 (Good), < 0.25 (Needs Improvement)

### Additional Metrics
- **FCP (First Contentful Paint)**: Time to first visible content
- **TTFB (Time to First Byte)**: Server response time
- **DOM Content Loaded**: Time to parse HTML
- **Load Complete**: Total page load time
- **Memory Usage**: JS heap size (Chrome only)

### Performance Scoring
```
Score = 100 points
- LCP > 4s: -30 points (Poor), > 2.5s: -15 points
- FID > 300ms: -30 points (Poor), > 100ms: -15 points
- CLS > 0.25: -30 points (Poor), > 0.1: -15 points

Ratings:
- 90-100: Excellent ✅
- 70-89: Good 👍
- 50-69: Needs Improvement ⚠️
- 0-49: Poor ❌
```

## API Endpoints

### POST /api/analytics/web-vitals
Receives Web Vitals metrics from clients
```json
{
  "name": "LCP",
  "value": 1234,
  "rating": "good",
  "delta": 100,
  "id": "v1-1234567890",
  "navigationType": "navigate"
}
```

### POST /api/analytics/long-tasks
Receives long task performance data
```json
{
  "duration": 150,
  "startTime": 1000,
  "name": "long-task"
}
```

## Performance Optimization Tips

### Based on Monitoring Data

1. **High LCP (>4s)**
   - Optimize images (use Next.js Image)
   - Lazy load below-fold content
   - Reduce server response time
   - Use CDN for static assets

2. **High FID (>300ms)**
   - Reduce JavaScript execution time
   - Code split large bundles
   - Defer non-critical JavaScript
   - Use Web Workers for heavy computations

3. **High CLS (>0.25)**
   - Set explicit dimensions for images/videos
   - Avoid inserting content above existing content
   - Use CSS transform instead of layout-changing properties
   - Preload fonts

4. **Long Tasks (>50ms)**
   - Break up long-running JavaScript
   - Use `requestIdleCallback` for non-urgent work
   - Implement progressive rendering
   - Optimize React components (useMemo, useCallback)

5. **High Memory Usage**
   - Fix memory leaks
   - Clean up event listeners
   - Dispose of unused objects
   - Limit cache sizes

## Integration with Analytics

### Google Analytics 4
```tsx
useWebVitals((metric) => {
  window.gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  })
})
```

### Custom Analytics
```tsx
useWebVitals((metric) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      metric: metric.name,
      value: metric.value,
      page: window.location.pathname,
      timestamp: Date.now()
    })
  })
})
```

## Monitoring Dashboard

Access the admin performance dashboard:
```
/admin (with admin privileges)
```

Features:
- Real-time metrics visualization
- Historical data trends
- Performance logs
- Error tracking
- Resource timing analysis

## Browser Support

### Full Support
- Chrome 90+
- Edge 90+
- Safari 14+
- Firefox 89+

### Partial Support
- Memory monitoring: Chrome only
- Some metrics may not be available in older browsers

## Environment Variables

```env
# Enable performance monitoring in production
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# Analytics endpoint
NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics/web-vitals
```

## Best Practices

1. **Always Monitor in Production**: Real user data is most valuable
2. **Set Performance Budgets**: Define acceptable thresholds
3. **Regular Reviews**: Check metrics weekly
4. **A/B Testing**: Compare performance of changes
5. **User-Centric**: Focus on metrics that affect user experience
6. **Automated Alerts**: Set up alerts for performance regressions

## Troubleshooting

### Metrics Not Appearing
- Check browser console for errors
- Verify PerformanceObserver support
- Ensure hooks are called in client components

### Inaccurate Metrics
- Wait for page to fully load
- Check for ad blockers
- Verify correct implementation of observers

### High Memory Usage
- Check for memory leaks in components
- Verify cleanup in useEffect
- Monitor component re-renders

## Future Enhancements

1. Server-side performance tracking
2. Performance regression detection
3. Automated performance reports
4. Integration with CI/CD pipeline
5. Performance comparison across deployments
6. Custom metric definitions
7. Performance heatmaps
8. User session replay with performance data

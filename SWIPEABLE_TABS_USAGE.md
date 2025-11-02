# Swipeable Tabs Usage Guide

## ✅ Fixed: Touch Swipe Gestures

Tabs sekarang support **swipe kiri-kanan** untuk navigasi! 🎉

## 🎯 Features

- ✅ Swipe **kanan**: Previous tab
- ✅ Swipe **kiri**: Next tab
- ✅ Edge resistance di tab pertama/terakhir (seperti iOS)
- ✅ Smooth animation (200ms)
- ✅ Works on mobile (touch) & desktop (mouse drag)
- ✅ Automatic snap to tab
- ✅ Configurable threshold & resistance

## 📖 Usage

### Basic Usage (With Swipe Support)

```tsx
'use client'

import { useState } from 'react'
import {
  SwipeableTabs,
  SwipeableTabsList,
  SwipeableTabsTrigger,
  SwipeableTabsContent,
  SwipeableTabsContentContainer
} from '@/components/ui'

export function MyTabs() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabValues = ['overview', 'details', 'settings']
  
  return (
    <SwipeableTabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      enableTouchSwipe={true} // Enable touch swipe
    >
      {/* Tab Headers */}
      <SwipeableTabsList>
        <SwipeableTabsTrigger value="overview">
          Overview
        </SwipeableTabsTrigger>
        <SwipeableTabsTrigger value="details">
          Details
        </SwipeableTabsTrigger>
        <SwipeableTabsTrigger value="settings">
          Settings
        </SwipeableTabsTrigger>
      </SwipeableTabsList>

      {/* Tab Content with Swipe */}
      <SwipeableTabsContentContainer
        tabValues={tabValues}
        currentValue={activeTab}
        onValueChange={setActiveTab}
        enableSwipe={true}
      >
        <SwipeableTabsContent value="overview">
          <div className="p-4">Overview content</div>
        </SwipeableTabsContent>
        
        <SwipeableTabsContent value="details">
          <div className="p-4">Details content</div>
        </SwipeableTabsContent>
        
        <SwipeableTabsContent value="settings">
          <div className="p-4">Settings content</div>
        </SwipeableTabsContent>
      </SwipeableTabsContentContainer>
    </SwipeableTabs>
  )
}
```

### Without Swipe Support (Legacy)

```tsx
// Jika tidak ingin swipe gesture
<SwipeableTabs 
  value={activeTab} 
  onValueChange={setActiveTab}
  enableTouchSwipe={false}
>
  <SwipeableTabsList>
    {/* tabs */}
  </SwipeableTabsList>
  
  {/* Regular content tanpa SwipeableTabsContentContainer */}
  <SwipeableTabsContent value="tab1">...</SwipeableTabsContent>
  <SwipeableTabsContent value="tab2">...</SwipeableTabsContent>
</SwipeableTabs>
```

## ⚙️ Configuration

### Custom Swipe Settings

```tsx
import { useSwipeableTabs } from '@/hooks/useSwipeableTabs'

// Di dalam component
const { containerRef, translateX, isDragging } = useSwipeableTabs(
  currentIndex,
  totalTabs,
  onIndexChange,
  {
    threshold: 80,           // Min px untuk trigger tab change (default: 50)
    resistance: 0.5,         // Edge resistance multiplier (default: 0.3)
    animationDuration: 300,  // Animation ms (default: 200)
    enabled: true,           // Enable/disable swipe (default: true)
    
    // Optional callbacks
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right')
  }
)
```

## 🎨 Styling

### Custom Cursor During Swipe

```tsx
<SwipeableTabsContentContainer
  className="min-h-[400px]"
  // Cursor automatically changes:
  // - cursor-grab (idle)
  // - cursor-grabbing (dragging)
>
  {/* content */}
</SwipeableTabsContentContainer>
```

### Disable User Select During Swipe

CSS automatically applied:
- `touch-pan-y`: Allows vertical scroll while swiping horizontally
- `overflow-hidden`: Prevents content overflow during animation

## 📱 Mobile Optimization

### Prevent Page Scroll on Horizontal Swipe

The hook automatically prevents page scroll when horizontal swipe is detected (|deltaX| > 10px).

### Touch Zones

- **Swipe threshold**: 50px minimum
- **Edge resistance**: 30% at first/last tab
- **Snap behavior**: Auto-snap to nearest tab

## 🧪 Testing

### Test on Different Devices

1. **iOS Safari**:
   - Edge resistance should feel native
   - No bounce on edges
   - Smooth 60fps animation

2. **Android Chrome**:
   - Fast swipe response
   - Proper touch event handling
   - No lag on low-end devices

3. **Desktop (for testing)**:
   - Mouse drag should work
   - Click-and-drag to swipe
   - Release to snap

### Debug Mode

```tsx
const { translateX, isDragging, swipeState } = useSwipeableTabs(...)

console.log({
  translateX,    // Current drag distance
  isDragging,    // Is user swiping?
  swipeState     // Full state object
})
```

## 🐛 Troubleshooting

### Swipe not working?

1. **Check enableSwipe prop**:
   ```tsx
   <SwipeableTabsContentContainer enableSwipe={true}>
   ```

2. **Verify tabValues array**:
   ```tsx
   // Must match tab trigger values exactly
   const tabValues = ['tab1', 'tab2', 'tab3']
   ```

3. **Check currentValue**:
   ```tsx
   // Must be one of tabValues
   currentValue="tab1" // ✅
   currentValue="invalid" // ❌
   ```

### Swipe too sensitive/not sensitive?

Adjust threshold:
```tsx
threshold: 100  // Require 100px swipe (less sensitive)
threshold: 30   // Require 30px swipe (more sensitive)
```

### Edge resistance too strong?

Adjust resistance:
```tsx
resistance: 0.1  // Very little resistance
resistance: 0.5  // More resistance
```

## 📊 Performance

- **Bundle size**: +2KB (gzipped)
- **Runtime overhead**: Minimal (only active during swipe)
- **Memory**: Event listeners cleaned up on unmount
- **Animation**: CSS transform (GPU accelerated)

## 🔄 Migration Guide

### From Old SwipeableTabs

**Before**:
```tsx
<SwipeableTabs value={tab} onValueChange={setTab}>
  <SwipeableTabsList>...</SwipeableTabsList>
  <SwipeableTabsContent value="tab1">...</SwipeableTabsContent>
</SwipeableTabs>
```

**After** (with swipe):
```tsx
<SwipeableTabs value={tab} onValueChange={setTab}>
  <SwipeableTabsList>...</SwipeableTabsList>
  
  {/* ADD THIS WRAPPER */}
  <SwipeableTabsContentContainer
    tabValues={['tab1', 'tab2']}
    currentValue={tab}
    onValueChange={setTab}
  >
    <SwipeableTabsContent value="tab1">...</SwipeableTabsContent>
    <SwipeableTabsContent value="tab2">...</SwipeableTabsContent>
  </SwipeableTabsContentContainer>
</SwipeableTabs>
```

## 🎯 Examples

### Settings Page with Swipe

```tsx
const tabs = ['general', 'security', 'notifications', 'advanced']

<SwipeableTabsContentContainer
  tabValues={tabs}
  currentValue={activeTab}
  onValueChange={setActiveTab}
>
  {tabs.map(tab => (
    <SwipeableTabsContent key={tab} value={tab}>
      <SettingsPanel type={tab} />
    </SwipeableTabsContent>
  ))}
</SwipeableTabsContentContainer>
```

### Reports with Dynamic Tabs

```tsx
const reports = ['daily', 'weekly', 'monthly', 'yearly']

<SwipeableTabsContentContainer
  tabValues={reports}
  currentValue={period}
  onValueChange={setPeriod}
  className="min-h-[600px]"
>
  {reports.map(report => (
    <SwipeableTabsContent key={report} value={report}>
      <ReportChart period={report} />
    </SwipeableTabsContent>
  ))}
</SwipeableTabsContentContainer>
```

## 💡 Tips

1. **Keep tabValues array stable**: Use `useMemo` or define outside component
2. **Add loading states**: Show skeleton while tab content loads
3. **Preload adjacent tabs**: Use React Suspense or lazy loading
4. **Add haptic feedback**: Use Vibration API on mobile
5. **Test on real devices**: Emulators might not capture touch accurately

## 🚀 Next Steps

- [ ] Add vertical swipe for nested tabs
- [ ] Add keyboard navigation
- [ ] Add screen reader support
- [ ] Add analytics tracking for swipe events

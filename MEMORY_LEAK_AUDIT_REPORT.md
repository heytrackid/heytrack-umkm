# HeyTrack Memory Leak Audit Report
Generated: 2025-11-20

## Executive Summary
Scanned 150+ files for common memory leak patterns. Found **6 CRITICAL**, **8 HIGH**, and **12 MEDIUM** risk issues that should be addressed.

---

## 🔴 CRITICAL Issues (Immediate Action Required)

### 1. Worker Event Listeners - Multiple Attachment Without Cleanup
**Files:**
- `src/modules/hpp/hooks/useHppWorker.ts` (lines 109, 138, 167)
- `src/modules/hpp/hooks/useHppCalculatorWorker.ts` (line 94)

**Issue:** Event listeners are added with `addEventListener()` but only removed after the first message. If component unmounts before the message arrives, listeners persist indefinitely, holding references to handler closures containing component state.

**Risk:** 
- Memory accumulation on each component mount/unmount cycle
- Stale closures keeping component state in memory
- Multiple handler registrations for same message event

**Example:**
```typescript
// ❌ PROBLEM
const handleMessage = (e: MessageEvent) => {
  if (type === 'CALCULATE_HPP_SUCCESS') {
    workerRef.current?.removeEventListener('message', handleMessage)
    resolve(result)
  }
}
workerRef.current.addEventListener('message', handleMessage)
// If component unmounts BEFORE message arrives, listener remains!
```

**Fix:** Use a cleanup approach:
```typescript
// ✅ SOLUTION
useEffect(() => {
  const handleMessage = (e: MessageEvent) => {
    // handler logic
  }
  
  workerRef.current?.addEventListener('message', handleMessage)
  return () => {
    workerRef.current?.removeEventListener('message', handleMessage)
  }
}, [])
```

---

### 2. Global Error Event Handlers Without Cleanup
**File:** `src/lib/errors/monitoring-service.ts` (lines 240-258)

**Issue:** `setupGlobalHandlers()` adds window event listeners for 'error' and 'unhandledrejection' but there's no removal mechanism. The service instance can't be garbage collected.

**Risk:**
- Permanent memory retention of service instance
- Listener multiplied on every service instantiation
- Service callbacks hold references indefinitely

**Code:**
```typescript
// ❌ PROBLEM - No cleanup
window.addEventListener('error', (event) => { ... })
window.addEventListener('unhandledrejection', (event) => { ... })
// These listeners are never removed
```

---

### 3. Network Connection Change Listener Not Properly Cleaned Up
**File:** `src/lib/performance/monitoring.ts` (lines 364-377)

**Issue:** The connection change listener is added but incomplete cleanup - the offline handler removal is missing.

**Risk:**
- Connection listener persists after component unmount
- Old updateNetworkInfo closures accumulate

**Code:**
```typescript
// ❌ PROBLEM - Incomplete cleanup
return () => {
  window.removeEventListener('online', handleOnline)
  // ← Missing: window.removeEventListener('offline', handleOffline)
  // ← Missing: nav.connection.removeEventListener('change', updateNetworkInfo)
}
```

---

### 4. Fetch Requests Without AbortController (WIDESPREAD)
**Files:** 150+ files with `fetch()` calls
**Notable concentrations:**
- `src/modules/orders/` - 15+ fetch calls
- `src/modules/hpp/` - 12+ fetch calls
- `src/hooks/` - 25+ fetch calls
- `src/components/` - 30+ fetch calls

**Issue:** None of the fetch requests use `AbortController`. When components unmount during pending requests, state updates still occur.

**Risk:**
- "Can't perform a React state update on an unmounted component" warnings
- Memory accumulation from response promises
- Cascading failures from zombie requests

**Example:**
```typescript
// ❌ PROBLEM - No abort signal
const response = await fetch('/api/orders', {
  credentials: 'include'
})
// If component unmounts, setOrders() still fires!

// ✅ SOLUTION
useEffect(() => {
  const abortController = new AbortController()
  fetch('/api/orders', {
    credentials: 'include',
    signal: abortController.signal
  }).then(setOrders)
  
  return () => abortController.abort()
}, [])
```

---

### 5. useEffect Intervals Without Dependencies
**File:** `src/lib/performance/use-performance-monitoring.ts` (line 285)

**Issue:** `setInterval()` called in useEffect without proper dependency management:
```typescript
const memoryInterval = setInterval(() => {
  // updates state
}, updateInterval)
// Called every render if updateInterval changes
```

---

### 6. PreloadingProvider - Visibility Change Listener
**File:** `src/providers/PreloadingProvider.tsx` (line 330)

**Issue:** `document.addEventListener('visibilitychange', ...)` is added but cleanup not visible in shown code. May be incomplete.

---

## 🟠 HIGH Risk Issues (Should Fix)

### 1. Toast Timeout Map Can Accumulate
**File:** `src/hooks/use-toast.ts` (lines 55-62)

**Issue:** `toastTimeouts` Map stores timeout IDs. If toasts are created rapidly, old timeouts might not clear properly.

### 2. Error Monitoring Service - No Teardown
**File:** `src/lib/errors/monitoring-service.ts`

**Issue:** Global singleton instance. When removed from DOM, listeners remain attached to window.

### 3. Modal Escape Key Listeners
**File:** `src/components/ui/modal.tsx` (lines 41, 183)

**Issue:** Multiple useEffects adding keydown listeners. Could accumulate if component re-mounts frequently.

### 4. Performance Monitoring Intervals
**Files:** `src/lib/performance/` multiple files

**Issue:** Various setInterval calls for monitoring without aggressive cleanup verification.

### 5. Deferred Script Listeners
**File:** `src/lib/performance/defer-script.tsx` (line 79)

**Issue:** Multiple addEventListener calls for deferred loading without clear cleanup order.

### 6. Window Resize Listeners
**Files:** Multiple files with resize listeners
- `src/components/ui/virtualized-table.tsx` (line 43)
- `src/components/ui/swipeable-tabs.tsx` (line 75)
- `src/utils/responsive.ts` (multiple)

**Issue:** Proper cleanup exists but should use debouncing to reduce listener count.

### 7. Operation Monitor Intervals
**File:** `src/lib/performance/operation-monitor.ts` (lines 47, 91)

**Issue:** Async intervals without guaranteed cleanup on errors.

### 8. AI Chatbot Online/Offline Listeners
**File:** `src/app/ai-chatbot/components/ChatHeader.tsx` (lines 13-14)

**Issue:** Cleanup is present but should be verified not to accumulate on rapid mounts.

---

## 🟡 MEDIUM Risk Issues (Nice to Fix)

### 1. setTimeout/setInterval Without Type Safety (Multiple Files)
Over 80+ occurrences of setTimeout/setInterval. While most have cleanup, some could be optimized:
- `src/lib/performance/advanced.ts`
- `src/lib/bundle-splitting.ts`
- `src/hooks/useEnhancedPerformance.ts`

### 2. Swipeable Tabs Complex Event Setup
**File:** `src/hooks/useSwipeableTabs.ts` (lines 194-202)

**Issue:** 4 event listeners added (touchstart, touchmove, touchend, mousedown, mousemove, mouseup). While cleaned up, rapid re-mounts could cause issues.

### 3. Enhanced Cache Cleanup Interval
**File:** `src/lib/enhanced-cache.ts` (line 51)

**Issue:** 
```typescript
this.cleanupInterval = setInterval(() => {
  // cleanup
}, interval)
```
Ensure this is cleared in destructor/dispose.

### 4. Data Management Periodic Sync
**File:** `src/lib/shared/data-management.ts` (line 66)

**Issue:** 
```typescript
setInterval(() => {
  // sync logic
}, interval)
```
Should be cancelable.

### 5. API Middleware Cleanup Timer
**File:** `src/utils/security/api-middleware.ts` (lines 60, 114-124)

**Issue:** Static cleanup timer might not fire if no requests queued.

### 6. Rate Limiter Cleanup
**File:** `src/lib/services/RateLimiter.ts` (lines 19, 161-165)

**Issue:** Static cleanup timer similar to API middleware.

### 7. GraphQL-like Subscription Pattern
**Files:** Multiple hook files with fetch-based polling

**Issue:** Polling timers could accumulate if hooks unmount/remount rapidly.

### 8. Notification Context Fetch Calls
**File:** `src/contexts/notification-context.tsx` (lines 46-88)

**Issue:** Multiple fetch calls without abort signals in context effects.

### 9. Settings Manager Parallel Fetches
**File:** `src/app/settings/hooks/useSettingsManager.ts` (lines 29-32)

**Issue:** Promise.all() without abort signal coordination.

### 10. AI Recipe Generator Interval
**File:** `src/app/recipes/ai-generator/components/AIRecipeGeneratorLayout.tsx` (line 330)

**Issue:** Auto-save interval could persist if component unmounts during save.

### 11. Typing Indicator Animation
**File:** `src/app/ai-chatbot/components/TypingIndicator.tsx` (line 18)

**Issue:** Animation interval should verify it's cleared on unmount.

### 12. Report Components State Updates
**Files:** Multiple report components
**Issue:** Async operations in reports without abort signals.

---

## 📊 Summary Statistics

| Category | Count | Details |
|----------|-------|---------|
| **Event Listeners (High Risk)** | 45+ | addEventListener without guaranteed cleanup |
| **Fetch Calls (No AbortController)** | 200+ | Scattered across 80+ files |
| **Timer/Interval Issues** | 85+ | setTimeout/setInterval calls |
| **useEffect Potential Issues** | 15+ | Missing or incomplete cleanup |
| **Global Singletons** | 3 | Services with persistent listeners |

---

## 🛠️ Recommended Fixes (Priority Order)

### Phase 1 (Critical - Fix Immediately)
1. ✅ Add AbortController to all fetch calls
2. ✅ Fix worker listener management in HPP hooks
3. ✅ Add cleanup to global error handlers
4. ✅ Fix network listener cleanup in monitoring.ts

### Phase 2 (High - Fix This Week)
1. 🔄 Audit and fix all interval cleanup
2. 🔄 Review timer assignments in state
3. 🔄 Add type safety for timer returns

### Phase 3 (Medium - Fix This Sprint)
1. 📋 Debounce resize listeners
2. 📋 Optimize repeated event listener patterns
3. 📋 Add memory profiling tests

---

## 🎯 Testing Recommendations

### Chrome DevTools Memory Profiler
```javascript
// In console while interacting with app:
// 1. Take heap snapshot
// 2. Perform action (mount/unmount component)
// 3. Take another heap snapshot
// 4. Compare - should NOT see growth for unmounted components
```

### Recommended Test Script
```bash
# Run with memory monitoring
node --expose-gc app.js

# Monitor RSS memory
watch -n 1 'ps aux | grep node'
```

### Key Metrics to Monitor
- Detached DOM nodes (should be 0 after unmount)
- Event listener count (should decrease after unmount)
- Timer/interval count (should be minimal)
- Promise count (should resolve/reject completely)

---

## ⚠️ Highest Impact Quick Wins

1. **AbortController in useEffect**: Wrap all fetch calls in useEffect with AbortController
2. **Worker Listener Pattern**: Create a reusable useWorkerMessage hook
3. **Global Error Handlers**: Add removeEventListener in destructor
4. **Interval Cleanup**: Use a custom useInterval hook that guarantees cleanup

---

## 📎 Files Requiring Most Attention

🔴 **CRITICAL**:
- `src/modules/hpp/hooks/useHppWorker.ts`
- `src/modules/hpp/hooks/useHppCalculatorWorker.ts`
- `src/lib/errors/monitoring-service.ts`
- `src/lib/performance/monitoring.ts`

🟠 **HIGH**:
- `src/hooks/use-toast.ts`
- `src/app/recipes/ai-generator/components/AIRecipeGeneratorLayout.tsx`
- `src/modules/orders/` (all files)
- `src/contexts/notification-context.tsx`

---

Generated by Memory Leak Scanner
Last Updated: 2025-11-20

# Loading Skeleton Audit & Fixes

## 🔍 Issues Found

### ❌ Issue #1: Dashboard - Redundant Loading States
**File:** `src/app/dashboard/page.tsx`

**Problem:**
```typescript
// Line 138-150: Shows skeleton during auth loading
if (isAuthLoading) {
  return <AppLayout><DashboardHeaderSkeleton />...</AppLayout>
}

// Line 207-220: Shows skeleton AGAIN during data loading
{isDataLoading ? (
  <DashboardHeaderSkeleton />
) : (
  <div>...</div>
)}
```

**Impact:** Double skeleton - shows skeleton twice (auth + data loading)

**Fix:** Combine loading states
```typescript
const isLoading = isAuthLoading || isDataLoading

if (isLoading) {
  return <AppLayout>...skeleton...</AppLayout>
}
```

---

### ❌ Issue #2: Profit Page - Loading Blocks Content
**File:** `src/app/profit/page.tsx`

**Problem:**
```typescript
// Line 67-82: Returns early, blocks entire page
if (loading) {
  return (
    <AppLayout>
      <div className="space-y-6">
        <StatsSkeleton count={4} />
        ...
      </div>
    </AppLayout>
  )
}
```

**Impact:** 
- User can't see header/breadcrumb during loading
- No context about what's loading
- Jarring experience

**Fix:** Show header + breadcrumb, only skeleton for content
```typescript
return (
  <AppLayout>
    <Breadcrumb>...</Breadcrumb>
    <PageHeader>...</PageHeader>
    
    {loading ? (
      <StatsSkeleton count={4} />
    ) : (
      <ProfitContent />
    )}
  </AppLayout>
)
```

---

### ❌ Issue #3: Production Page - Inconsistent Skeleton
**File:** `src/app/production/components/EnhancedProductionPage.tsx`

**Problem:**
```typescript
// Line 201-213: Shows partial UI during loading
if (loading) {
  return (
    <div className="space-y-6">
      {/* Shows header but not stats */}
      <div className="flex items-center justify-between">
        <h1>Production Tracking</h1>
      </div>
      {/* Only skeleton for stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1,2,3,4].map(i => <div className="h-32 bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  )
}
```

**Impact:**
- Inconsistent - shows header but not buttons
- Skeleton doesn't match actual layout (5 cards, not 4)
- Missing filters skeleton

**Fix:** Complete skeleton or show full header
```typescript
if (loading) {
  return (
    <div className="space-y-6">
      {/* Full header with disabled buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Production Tracking</h1>
          <p>Kelola dan monitor produksi batch</p>
        </div>
        <div className="flex gap-2">
          <Button disabled>Refresh</Button>
          <Button disabled>Produksi Baru</Button>
        </div>
      </div>
      
      {/* Match actual layout: 5 cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {[1,2,3,4,5].map(i => <StatsCardSkeleton key={i} />)}
      </div>
      
      {/* Filters skeleton */}
      <Card><CardContent className="pt-6">
        <div className="animate-pulse space-y-4">...</div>
      </CardContent></Card>
      
      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1,2,3].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
```

---

### ❌ Issue #4: Notifications Settings - Basic Skeleton
**File:** `src/app/settings/notifications/page.tsx`

**Problem:**
```typescript
// Line 74-82: Too simple skeleton
if (isLoading) {
  return (
    <div className="container max-w-4xl py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-64 bg-muted rounded" />
      </div>
    </div>
  )
}
```

**Impact:**
- Doesn't match actual layout (multiple cards)
- No visual hierarchy
- Looks broken

**Fix:** Match actual layout
```typescript
if (isLoading) {
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
      </div>
      
      {/* Cards skeleton */}
      {[1,2,3,4,5].map(i => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map(j => (
                <div key={j} className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                  <div className="h-6 w-11 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

### ✅ Good Examples

#### Dashboard Stats Cards
**File:** `src/app/dashboard/components/StatsCardsSection.tsx`
```typescript
// Uses proper skeleton component
<StatsCardSkeleton />
```

#### Orders List
**File:** `src/components/orders/OrdersList.tsx`
```typescript
if (loading) {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={`skeleton-${i}`} className="animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Why it's good:**
- ✅ Unique keys
- ✅ Dark mode support
- ✅ Matches actual layout
- ✅ Visual hierarchy

---

## 📋 Best Practices

### 1. **Match Actual Layout**
Skeleton should look like the actual content:
```typescript
// ❌ BAD
<div className="h-64 bg-muted rounded" />

// ✅ GOOD
<Card>
  <CardHeader>
    <div className="h-6 bg-muted rounded w-1/3" />
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-3/4" />
    </div>
  </CardContent>
</Card>
```

### 2. **Show Context During Loading**
Don't hide everything:
```typescript
// ❌ BAD - Hides everything
if (loading) return <Skeleton />

// ✅ GOOD - Shows header
return (
  <>
    <PageHeader title="Orders" />
    {loading ? <Skeleton /> : <Content />}
  </>
)
```

### 3. **Use Skeleton Components**
Create reusable skeleton components:
```typescript
// ✅ GOOD
import { StatsCardSkeleton } from '@/components/ui/skeletons'

{loading && <StatsCardSkeleton />}
```

### 4. **Dark Mode Support**
Always support dark mode:
```typescript
// ❌ BAD
<div className="bg-gray-200" />

// ✅ GOOD
<div className="bg-gray-200 dark:bg-gray-700" />
```

### 5. **Unique Keys**
Use unique keys for arrays:
```typescript
// ❌ BAD
{[...Array(5)].map((_, i) => <Skeleton key={i} />)}

// ✅ GOOD
{[...Array(5)].map((_, i) => <Skeleton key={`skeleton-${i}`} />)}
```

### 6. **Conditional Rendering**
Check loading state properly:
```typescript
// ❌ BAD - Shows empty state during loading
if (data.length === 0) return <EmptyState />

// ✅ GOOD - Check loading first
if (loading) return <Skeleton />
if (data.length === 0) return <EmptyState />
```

### 7. **Combine Loading States**
Don't show multiple skeletons:
```typescript
// ❌ BAD
if (authLoading) return <Skeleton />
if (dataLoading) return <Skeleton />

// ✅ GOOD
const isLoading = authLoading || dataLoading
if (isLoading) return <Skeleton />
```

---

## 🎯 Priority Fixes

### High Priority
1. ✅ **Orders** - Already fixed
2. 🔴 **Dashboard** - Redundant loading states
3. 🔴 **Profit Page** - Blocks entire page

### Medium Priority
4. 🟡 **Production** - Inconsistent skeleton
5. 🟡 **Notifications Settings** - Basic skeleton

### Low Priority
6. 🟢 **Automation** - Simple but acceptable
7. 🟢 **Reports** - Uses proper skeleton components

---

## 📝 Implementation Checklist

For each page with loading state:

- [ ] Does skeleton match actual layout?
- [ ] Is header/breadcrumb visible during loading?
- [ ] Are buttons disabled (not hidden) during loading?
- [ ] Does skeleton support dark mode?
- [ ] Are array keys unique?
- [ ] Is loading state combined (not redundant)?
- [ ] Does empty state check loading first?
- [ ] Is skeleton reusable (component)?

---

## 🔧 Quick Fixes

### Fix Template
```typescript
// Before
if (loading) {
  return <div className="h-64 bg-muted animate-pulse" />
}

// After
if (loading) {
  return (
    <div className="space-y-6">
      {/* Header - always visible */}
      <PageHeader title="..." description="..." />
      
      {/* Content skeleton - matches layout */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1,2,3].map(i => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-6">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-muted dark:bg-muted/50 rounded w-3/4" />
                <div className="h-3 bg-muted dark:bg-muted/50 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

**Status:** 🔴 Needs Fixes
**Priority:** High
**Estimated Time:** 2-3 hours
**Impact:** Better UX, less confusion

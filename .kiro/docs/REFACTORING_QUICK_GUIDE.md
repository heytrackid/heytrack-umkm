# ⚡ Refactoring Quick Guide

## 🎯 When to Refactor

Refactor a file when:
- ✅ File > 600 lines
- ✅ Multiple responsibilities
- ✅ Hard to test
- ✅ Slow to load
- ✅ Difficult to maintain

---

## 📋 Refactoring Checklist

### Before Starting
- [ ] Identify file size: `wc -l filename.tsx`
- [ ] List all responsibilities
- [ ] Check dependencies
- [ ] Plan module structure
- [ ] Backup current code

### During Refactoring
- [ ] Create module folder
- [ ] Split into logical sections
- [ ] Add TypeScript types
- [ ] Implement code splitting
- [ ] Update imports
- [ ] Test each module

### After Refactoring
- [ ] Run diagnostics: `getDiagnostics()`
- [ ] Test functionality
- [ ] Check bundle size
- [ ] Update documentation
- [ ] Remove old file

---

## 🔧 Quick Commands

### Find Large Files
```bash
# Files > 600 lines
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```

### Check File Size
```bash
wc -l src/path/to/file.tsx
```

### Test Diagnostics
```typescript
getDiagnostics(['src/path/to/file.tsx'])
```

### Analyze Bundle
```bash
pnpm build:analyze
```

---

## 📦 Module Template

### Folder Structure
```
ComponentName/
├── index.tsx           # Main component + code splitting
├── Section1.tsx        # Logical section 1
├── Section2.tsx        # Logical section 2
├── Section3.tsx        # Logical section 3
└── types.ts            # Shared types (optional)
```

### index.tsx Template
```typescript
'use client'

import dynamic from 'next/dynamic'

// Code splitting
const Section1 = dynamic(() => import('./Section1'), {
  loading: () => <Skeleton />,
  ssr: false
})

const Section2 = dynamic(() => import('./Section2'), {
  loading: () => <Skeleton />,
  ssr: false
})

export function ComponentName() {
  return (
    <div>
      <Section1 />
      <Section2 />
    </div>
  )
}
```

### Section Template
```typescript
'use client'

interface Section1Props {
  data: SomeType
  onAction: () => void
}

export function Section1({ data, onAction }: Section1Props) {
  return (
    <div>
      {/* Section content */}
    </div>
  )
}
```

---

## 🚀 Code Splitting Patterns

### Pattern 1: Heavy Component
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100" />,
  ssr: false
})
```

### Pattern 2: Conditional Load
```typescript
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <Skeleton />,
  ssr: false
})

{isAdmin && <AdminPanel />}
```

### Pattern 3: Tab Content
```typescript
const Tab1Content = dynamic(() => import('./Tab1Content'))
const Tab2Content = dynamic(() => import('./Tab2Content'))

<Tabs>
  <TabsContent value="tab1">
    <Tab1Content />
  </TabsContent>
  <TabsContent value="tab2">
    <Tab2Content />
  </TabsContent>
</Tabs>
```

---

## 🎨 Component Patterns

### Pattern 1: Stats Cards
```typescript
interface StatsCardsProps {
  stats: {
    total: number
    revenue: number
    average: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </CardContent>
      </Card>
      {/* More cards */}
    </div>
  )
}
```

### Pattern 2: List with Empty State
```typescript
interface ListProps {
  items: Item[]
  onItemClick: (item: Item) => void
}

export function List({ items, onItemClick }: ListProps) {
  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} onClick={onItemClick} />
      ))}
    </div>
  )
}
```

### Pattern 3: Filters
```typescript
interface FiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearFilters: () => void
}

export function Filters({ filters, onFilterChange, onClearFilters }: FiltersProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex gap-4">
          <Input
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.status}
            onValueChange={(status) => onFilterChange({ ...filters, status })}
          >
            {/* Options */}
          </Select>
          <Button onClick={onClearFilters}>Clear</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🧪 Testing Patterns

### Unit Test
```typescript
import { render, screen } from '@testing-library/react'
import { StatsCards } from './StatsCards'

describe('StatsCards', () => {
  it('should display stats', () => {
    const stats = { total: 100, revenue: 5000, average: 50 }
    render(<StatsCards stats={stats} />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
```

### Integration Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Filters } from './Filters'

describe('Filters', () => {
  it('should call onFilterChange when input changes', () => {
    const onFilterChange = jest.fn()
    render(<Filters filters={{}} onFilterChange={onFilterChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(onFilterChange).toHaveBeenCalled()
  })
})
```

---

## 📊 Performance Checklist

### Before Refactoring
- [ ] Measure current bundle size
- [ ] Record Time to Interactive (TTI)
- [ ] Note First Contentful Paint (FCP)
- [ ] Check Lighthouse score

### After Refactoring
- [ ] Compare bundle size (should be smaller)
- [ ] Verify TTI improved
- [ ] Check FCP improved
- [ ] Run Lighthouse again

### Target Metrics
- Bundle size: < 200KB (initial)
- TTI: < 3s
- FCP: < 1.5s
- LCP: < 2.5s
- Lighthouse: > 90

---

## 🔍 Common Issues

### Issue 1: Import Errors
```typescript
// ❌ Wrong
import { Component } from './Component'

// ✅ Correct
import { Component } from './Component/index'
// or
import { Component } from './Component'  // if index.tsx exports it
```

### Issue 2: Circular Dependencies
```typescript
// ❌ Wrong
// A.tsx imports B.tsx
// B.tsx imports A.tsx

// ✅ Correct
// Extract shared code to separate file
// shared.ts
// A.tsx imports shared.ts
// B.tsx imports shared.ts
```

### Issue 3: Props Drilling
```typescript
// ❌ Wrong
<Parent>
  <Child1 prop={data}>
    <Child2 prop={data}>
      <Child3 prop={data} />
    </Child2>
  </Child1>
</Parent>

// ✅ Correct - Use Context
const DataContext = createContext()

<DataContext.Provider value={data}>
  <Parent>
    <Child1>
      <Child2>
        <Child3 />
      </Child2>
    </Child1>
  </Parent>
</DataContext.Provider>
```

---

## 💡 Pro Tips

1. **Start Small:** Refactor one section at a time
2. **Test Often:** Run diagnostics after each change
3. **Keep Backups:** Git commit before major changes
4. **Document Changes:** Update comments and docs
5. **Measure Impact:** Compare before/after metrics
6. **Get Feedback:** Code review with team
7. **Iterate:** Refactoring is continuous improvement

---

## 📚 Quick Links

- [Modular Architecture Guide](.kiro/docs/MODULAR_ARCHITECTURE.md)
- [Refactoring Summary](REFACTORING_SUMMARY.md)
- [Code Quality Standards](.kiro/steering/code-quality.md)
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)

---

**Remember:** Good code is code that's easy to change!

---

**Last Updated:** October 30, 2025

# 🏗️ Modular Architecture Guide

## Overview

HeyTrack menggunakan **modular architecture** untuk meningkatkan maintainability, testability, dan performance.

---

## 🎯 Design Principles

### 1. Single Responsibility Principle
Setiap modul/komponen hanya bertanggung jawab untuk satu hal.

### 2. Code Splitting
Komponen berat di-lazy load untuk performa optimal.

### 3. Reusability
Komponen dapat digunakan kembali di berbagai tempat.

### 4. Testability
Setiap modul dapat di-test secara independen.

---

## 📦 Module Structure

### AI Module (`src/lib/ai/`)

```
ai/
├── index.ts              # Main export & convenience functions
├── client.ts             # API calls (OpenRouter, OpenAI)
├── security.ts           # Input sanitization & rate limiting
├── prompt-builder.ts     # Secure prompt construction
├── service.ts            # Core AI service
├── nlp-processor.ts      # Natural language processing
└── business.ts           # Business intelligence
```

**Usage:**
```typescript
// Import specific module
import { AIClient } from '@/lib/ai/client'
import { NLPProcessor } from '@/lib/ai/nlp-processor'

// Or use convenience exports
import { processChatbotQuery, generateAIInsights } from '@/lib/ai'
```

---

### OrderForm Module (`src/modules/orders/components/OrderForm/`)

```
OrderForm/
├── index.tsx             # Main orchestration + code splitting
├── CustomerSection.tsx   # Customer selection & input
├── ItemsSection.tsx      # Order items management
├── DeliverySection.tsx   # Delivery information
└── PaymentSection.tsx    # Payment & summary
```

**Code Splitting:**
```typescript
// Lazy load sections
const CustomerSection = dynamic(() => import('./CustomerSection'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

**Usage:**
```typescript
import { OrderForm } from '@/modules/orders/components/OrderForm'

<OrderForm
  order={order}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

---

### OrdersPage Module (`src/modules/orders/components/OrdersPage/`)

```
OrdersPage/
├── index.tsx             # Main page + code splitting
├── StatsCards.tsx        # Statistics overview
├── StatusSummary.tsx     # Status distribution
├── OrderFilters.tsx      # Search & filters
├── OrderCard.tsx         # Single order card
├── DashboardView.tsx     # Dashboard with charts
└── OrdersList.tsx        # List view
```

**Code Splitting:**
```typescript
// Lazy load heavy components
const OrderForm = dynamic(() => import('../OrderForm'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

**Usage:**
```typescript
import OrdersPage from '@/modules/orders/components/OrdersPage'

<OrdersPage />
```

---

## 🚀 Performance Optimization

### Code Splitting Strategy

**When to use:**
- Heavy components (forms, charts, tables)
- Components not needed on initial load
- Third-party libraries

**How to implement:**
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false // Disable SSR if not needed
})
```

**Benefits:**
- ⬇️ Reduced initial bundle size
- ⚡ Faster Time to Interactive (TTI)
- 📱 Better mobile performance
- 🎯 Load only what's needed

---

## 🧪 Testing Strategy

### Unit Tests

**Test individual modules:**
```typescript
// ai/client.test.ts
import { AIClient } from '@/lib/ai/client'

describe('AIClient', () => {
  it('should call OpenRouter API', async () => {
    const result = await AIClient.callOpenRouter('test', 'system')
    expect(result).toBeDefined()
  })
})
```

### Integration Tests

**Test component interactions:**
```typescript
// OrderForm.test.tsx
import { render, screen } from '@testing-library/react'
import { OrderForm } from '@/modules/orders/components/OrderForm'

describe('OrderForm', () => {
  it('should render all sections', () => {
    render(<OrderForm onSubmit={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText('Pelanggan')).toBeInTheDocument()
    expect(screen.getByText('Item')).toBeInTheDocument()
  })
})
```

---

## 📝 Best Practices

### 1. Component Size
- Keep components under 300 lines
- Split into smaller components if needed
- Use composition over inheritance

### 2. Props Interface
```typescript
// ✅ GOOD - Clear, typed props
interface StatsCardsProps {
  stats: OrderStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  // ...
}
```

### 3. Code Splitting
```typescript
// ✅ GOOD - Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
})

// ❌ BAD - Import everything upfront
import { HeavyChart } from './HeavyChart'
```

### 4. Exports
```typescript
// ✅ GOOD - Named exports for better tree-shaking
export function CustomerSection() { }
export function ItemsSection() { }

// ❌ BAD - Default export makes tree-shaking harder
export default { CustomerSection, ItemsSection }
```

---

## 🔄 Migration Workflow

### Step 1: Identify Large Files
```bash
# Find files > 600 lines
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec wc -l {} + | sort -rn | head -20
```

### Step 2: Analyze Responsibilities
- What does this file do?
- Can it be split into logical sections?
- Which parts are independent?

### Step 3: Create Modules
```
Before:
  LargeComponent.tsx (800 lines)

After:
  LargeComponent/
    ├── index.tsx (200 lines)
    ├── Section1.tsx (150 lines)
    ├── Section2.tsx (150 lines)
    ├── Section3.tsx (150 lines)
    └── Section4.tsx (150 lines)
```

### Step 4: Add Code Splitting
```typescript
// index.tsx
const Section1 = dynamic(() => import('./Section1'))
const Section2 = dynamic(() => import('./Section2'))
```

### Step 5: Test & Verify
- Run TypeScript diagnostics
- Test all functionality
- Check bundle size
- Measure performance

---

## 📊 Monitoring

### Bundle Analysis
```bash
# Analyze bundle size
pnpm build:analyze
```

### Performance Metrics
- **Time to Interactive (TTI):** < 3s
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Bundle Size:** < 200KB (initial)

---

## 🎯 Future Improvements

### Short Term
1. Add unit tests for all modules
2. Implement error boundaries
3. Add loading states
4. Optimize re-renders with React.memo

### Medium Term
1. Refactor remaining large files (600+ lines)
2. Add Storybook for component documentation
3. Implement E2E tests with Playwright
4. Add performance monitoring

### Long Term
1. Micro-frontends architecture
2. Server Components optimization
3. Edge runtime for API routes
4. Advanced caching strategies

---

## 📚 Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Bundle Analysis](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Performance Best Practices](https://web.dev/performance/)

---

**Last Updated:** October 30, 2025  
**Maintained By:** Development Team

# Frontend Standards & Consistency Guidelines - HeyTrack

## Overview

This document outlines the standardized patterns, conventions, and best practices for frontend development in the HeyTrack application. These guidelines ensure consistency, maintainability, and performance across the codebase.

## Table of Contents

1. [Architecture & Structure](#architecture--structure)
2. [React Components](#react-components)
3. [TypeScript Standards](#typescript-standards)
4. [Hooks & State Management](#hooks--state-management)
5. [Styling & UI](#styling--ui)
6. [Error Handling](#error-handling)
7. [Performance Optimization](#performance-optimization)
8. [Code Quality & Reviews](#code-quality--reviews)
9. [Migration Guide](#migration-guide)

## Architecture & Structure

### Folder Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── ui/                # Shadcn/ui components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── ...
├── modules/               # Feature modules
│   ├── hpp/
│   ├── orders/
│   ├── recipes/
│   └── ...
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── lib/                   # Utilities & shared logic
├── types/                 # TypeScript definitions
└── providers/             # Context providers
```

### Path Mapping

- `@/` → `src/`
- `@/modules/*` → `src/modules/*`
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/lib/*` → `src/lib/*`

## React Components

### Component Declaration

**✅ Correct Patterns:**

```tsx
'use client'

import { memo, useCallback, useState } from 'react'
import type { ComponentNameProps } from './types'

interface ComponentNameProps {
  propName: string
  onAction?: (value: string) => void
}

export const ComponentName = memo<ComponentNameProps>(({
  propName,
  onAction
}) => {
  // Component logic
  return <div>{/* JSX */}</div>
})

ComponentName.displayName = 'ComponentName'
```

**❌ Incorrect Patterns:**

```tsx
// Wrong: 'use client' not at line 1
import { useState } from 'react'
'use client'

// Wrong: No memo for components with props
export function ComponentName({ prop }: Props) {
  // ...
}

// Wrong: Inconsistent interface naming
interface Props {
  // ...
}
```

### Component Rules

1. **Always use `'use client'` directive at line 1** for client components
2. **Use `memo()`** for all components that receive props
3. **Destructure props** in function parameters
4. **Use PascalCase** for component names
5. **Set `displayName`** for memoized components
6. **Use arrow functions** for component declarations

### Props Interface Naming

```tsx
// ✅ Correct
interface ComponentNameProps {
  // ...
}

// ❌ Incorrect
interface Props {
  // ...
}
interface ComponentProps {
  // ...
}
```

## TypeScript Standards

### Configuration

- **Strict mode**: All strict options enabled
- **No `any` types**: Use `unknown` or proper types
- **Explicit return types**: All functions must have explicit returns
- **Interface vs Type**: Use `interface` for objects, `type` for unions

### Import Patterns

```tsx
// ✅ Correct: Type imports separated
import type { ComponentProps, ReactNode } from 'react'
import { useState, useEffect } from 'react'
import type { CustomType } from '@/types/common'

// ❌ Incorrect: Mixed imports
import { useState, type ComponentProps } from 'react'
```

### Generic Types

```tsx
// ✅ Correct
interface DataTableProps<TData, TValue = unknown> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

// ✅ Correct usage
function DataTable<TData, TValue = unknown>({
  data,
  columns
}: DataTableProps<TData, TValue>) {
  // ...
}
```

## Hooks & State Management

### Custom Hook Patterns

```tsx
// ✅ Correct
export function useCustomHook(param: string) {
  const [state, setState] = useState(initialValue)

  const action = useCallback(() => {
    // logic
  }, [dependencies])

  return {
    state,
    action
  }
}

// ❌ Incorrect: No 'use' prefix
export function customHook() {
  // ...
}
```

### React Query Usage

```tsx
// ✅ Correct
export function useData() {
  return useQuery({
    queryKey: ['data'],
    queryFn: () => fetchApi('/api/data'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ✅ Correct: Mutations
export function useCreateData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Data) => fetchApi('/api/data', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] })
    }
  })
}
```

### Context Usage

```tsx
// ✅ Correct
interface ContextType {
  value: string
  setValue: (value: string) => void
}

const Context = createContext<ContextType | null>(null)

export function Provider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('')

  return (
    <Context.Provider value={{ value, setValue }}>
      {children}
    </Context.Provider>
  )
}

export function useContext() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useContext must be used within Provider')
  }
  return context
}
```

## Styling & UI

### Tailwind CSS + Shadcn/ui

```tsx
// ✅ Correct
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function Component() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h3 className="text-lg font-semibold">Title</h3>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="sm">
          Action
        </Button>
      </CardContent>
    </Card>
  )
}
```

### CSS Variables & Theming

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Responsive Design

```tsx
// ✅ Correct: Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// ✅ Correct: Custom breakpoints
<div className="hidden sm:block md:hidden">
  {/* Tablet only */}
</div>
```

## Error Handling

### Error Boundaries

```tsx
// ✅ Correct
'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Loading States

```tsx
// ✅ Correct: Skeleton loading
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  )
}

// ✅ Correct: Progressive loading
import { Suspense } from 'react'

export function Component() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LazyComponent />
    </Suspense>
  )
}
```

## Performance Optimization

### Memoization

```tsx
// ✅ Correct: Component memoization
export const ExpensiveComponent = memo<ExpensiveComponentProps>(({
  data,
  onAction
}) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data)
  }, [data])

  const handleAction = useCallback(() => {
    onAction(processedData)
  }, [onAction, processedData])

  return <div onClick={handleAction}>{processedData}</div>
})

// ✅ Correct: Custom memoization hooks
import { memoShallow, memoDeep } from '@/lib/performance/memoization'

export const Component = memoShallow(({ prop }) => {
  // For shallow comparison
})

export const DeepComponent = memoDeep(({ prop }) => {
  // For deep comparison
})
```

### Lazy Loading

```tsx
// ✅ Correct: Component lazy loading
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./LazyComponent'))

export function ParentComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}

// ✅ Correct: Route-based code splitting
// In app/layout.tsx or page.tsx
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./DynamicComponent'), {
  loading: () => <div>Loading...</div>
})
```

### Image Optimization

```tsx
// ✅ Correct: Optimized images
import { OptimizedImage } from '@/components/ui/optimized-image'

export function Component() {
  return (
    <OptimizedImage
      src="/image.jpg"
      alt="Description"
      width={400}
      height={300}
      priority={false}
      lazy={true}
    />
  )
}
```

## Code Quality & Reviews

### ESLint Configuration

```json
{
  "extends": ["next/core-web-vitals", "@heytrack/eslint-config"],
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }]
  }
}
```

### Pre-commit Hooks

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm run lint
pnpm run type-check
```

### Code Review Checklist

- [ ] Component uses `'use client'` directive correctly
- [ ] Props interface follows naming convention
- [ ] Component is memoized if it receives props
- [ ] All imports are properly sorted and typed
- [ ] Error boundaries are implemented where needed
- [ ] Loading states are handled appropriately
- [ ] Performance optimizations are applied
- [ ] TypeScript types are explicit and correct
- [ ] Tests are written for new functionality

## Migration Guide

### Phase 1: Setup Standards

1. Update ESLint configuration with new rules
2. Add Prettier configuration for import sorting
3. Create custom ESLint rules for HeyTrack patterns

### Phase 2: Component Migration

1. Run automated script to add `'use client'` directives
2. Add `memo()` to all components with props
3. Rename props interfaces to follow convention
4. Sort and optimize imports

### Phase 3: Performance Optimization

1. Audit components for memoization opportunities
2. Implement lazy loading for heavy components
3. Add error boundaries to major components
4. Optimize images and assets

### Phase 4: Documentation & Training

1. Update this document with any new patterns
2. Train team on new standards
3. Add automated checks to CI/CD pipeline

### Automated Migration Scripts

```bash
# Add 'use client' directive
find src -name "*.tsx" -exec sed -i '1i\'use client\' $1 \;

# Add memo to components
# (Requires custom script for intelligent memo addition)
```

## Tools & Resources

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript**: Type checking
- **React Query**: Data fetching
- **Tailwind CSS**: Styling
- **Shadcn/ui**: Component library

## Contributing

When adding new patterns or updating standards:

1. Update this document first
2. Update ESLint rules if applicable
3. Notify the team of changes
4. Provide migration guide for breaking changes

---

*Last updated: November 2025*
*Maintained by: HeyTrack Frontend Team*
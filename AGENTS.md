# HeyTrack Agent Guidelines

## Commands
- **Development**: `pnpm run dev` (with Turbo), `pnpm run dev:clean` (clear cache), `pnpm run dev:verbose` (with tracing)
- **Build**: `pnpm run build`, `pnpm run build:fast`, `pnpm run build:validate`, `pnpm run build:analyze` (bundle analysis)
- **Type Checking**: `pnpm run type-check` (current), `pnpm run type-check:all` (full project)
- **Linting**: `pnpm run lint` (current), `pnpm run lint:all` (full), `pnpm run lint:fix` (auto-fix)
- **Validation**: `pnpm run validate` (type + lint), `pnpm run validate:all` (full project), `pnpm run validate:quick` (quick check)
- **Testing**: `npx vitest` (all), `npx vitest path/to/test.test.ts` (single), `npx vitest --watch` (watch mode), `npx vitest --coverage` (with coverage)
- **Database**: `pnpm run supabase:types` (generate types), `pnpm run supabase:types:remote` (from remote)
- **Maintenance**: `pnpm run clean` (cache), `pnpm run clean:all` (full reset)

## Code Style & Conventions

### TypeScript Configuration
- **Strict Mode**: All strict options enabled (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, etc.)
- **Path Mapping**: `@/` for `src/`, `@/modules/*` for modules, `@/shared/*` for shared code
- **Import Types**: Use `import type { Type }` for type-only imports
- **Explicit Returns**: All functions must have explicit return types
- **No Any**: Never use `any` type, use `unknown` or proper types
- **Interface vs Type**: Use `interface` for object types, `type` for unions/aliases

### React Patterns
- **Components**: Functional components only, arrow functions, TypeScript interfaces for props
- **Hooks**: Custom hooks prefixed with `use`, follow Rules of Hooks
- **Server Components**: Default for pages/layouts, mark client components with `'use client'`
- **Props**: Destructure props, use `...props` for rest props, no prop-types package
- **Event Handlers**: Prefix with `handle` or `on`, use proper typing

### Naming Conventions
- **Functions/Variables**: camelCase (`getUserData`, `isValidEmail`)
- **Components/Types**: PascalCase (`UserProfile`, `ApiResponse`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_TIMEOUT`)
- **Files**: kebab-case for components (`user-profile.tsx`), camelCase for utilities (`dateUtils.ts`)
- **Hooks**: `use` prefix (`useAuth`, `useDebounce`)
- **Services**: PascalCase with `Service` suffix (`UserService`, `EmailService`)

### Import Organization
```ts
// External dependencies (React, libraries)
import React from 'react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

// Internal modules (@/ paths)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/services/UserService'

// Type imports (at bottom)
import type { User } from '@/types/user'
import type { ApiResponse } from '@/types/api'
```

### Formatting Rules (Prettier)
- **Quotes**: Single quotes only (`'string'`)
- **Semicolons**: None (ASI - Automatic Semicolon Insertion)
- **Line Length**: 100 characters max
- **Indentation**: 2 spaces
- **Trailing Commas**: ES5 style (always for multiline)
- **Line Endings**: LF (Unix style)
- **Arrow Parens**: Avoid when possible (`x => x`)

### Error Handling Patterns
```ts
// API Routes
export const runtime = 'nodejs'
async function GET(req: NextRequest) {
  try {
    const data = await someOperation()
    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error)
  }
}
export const GET = withSecurity(GET, SecurityPresets.apiRead)

// Client Components
import { createClientLogger } from '@/lib/logger'

function MyComponent() {
  const handleError = (error: unknown) => {
    const logger = createClientLogger('MyComponent')
    logger.error('Operation failed', { error })
    // Show user-friendly message
  }
}
```

### Security Patterns
```ts
// Input Sanitization
import { InputSanitizer } from '@/utils/security/InputSanitizer'

const sanitizedInput = InputSanitizer.sanitize(userInput)

// Zod Validation
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50)
})

// API Security Middleware
export const GET = withSecurity(GET, SecurityPresets.apiRead)
export const POST = withSecurity(POST, SecurityPresets.apiWrite)
```

## Component Patterns

### Basic Component
```tsx
'use client'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Custom Hook
```ts
import { useState, useEffect } from 'react'
import type { User } from '@/types/user'

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch user')
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { user, loading, error }
}
```

## API Route Patterns

### CRUD Operations
```ts
// GET /api/users/[id]/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createServerLogger } from '@/lib/logger'
import { handleAPIError } from '@/lib/errors'

async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const logger = createServerLogger('GET /api/users/[id]')
    const { id } = params

    // Business logic here
    const user = await getUserById(id)

    logger.info('User retrieved', { userId: id })
    return NextResponse.json({ user })
  } catch (error) {
    return handleAPIError(error)
  }
}

export const GET = withSecurity(GET, SecurityPresets.apiRead)
```

### POST with Validation
```ts
// POST /api/users/route.ts
async function POST(req: NextRequest) {
  try {
    const logger = createServerLogger('POST /api/users')
    const body = await req.json()

    // Validate input
    const validatedData = userCreateSchema.parse(body)

    // Business logic
    const newUser = await createUser(validatedData)

    logger.info('User created', { userId: newUser.id })
    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    return handleAPIError(error)
  }
}

export const POST = withSecurity(POST, SecurityPresets.apiWrite)
```

## Database Patterns

### Supabase Queries
```ts
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

// Type-safe queries
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Insert with type safety
export async function createUser(userData: Database['public']['Tables']['profiles']['Insert']) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(userData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Complex queries with joins
export async function getOrdersWithItems(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        recipes (
          name,
          price
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}
```

## Service Layer Patterns

### Business Service
```ts
import type { Database } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { createServerLogger } from '@/lib/logger'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']

export class OrderService {
  private logger = createServerLogger('OrderService')

  async createOrder(orderData: OrderInsert): Promise<Order> {
    this.logger.info('Creating order', { customerId: orderData.customer_id })

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) throw error

    this.logger.info('Order created', { orderId: data.id })
    return data
  }

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }
}
```

## Testing Patterns

### Component Test
```ts
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

### API Route Test
```ts
import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'
import { createMockRequest } from '@/lib/test-utils'

describe('GET /api/users/[id]', () => {
  it('returns user data for valid id', async () => {
    const mockReq = createMockRequest()
    const mockParams = { id: '123' }

    const response = await GET(mockReq, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.id).toBe('123')
  })

  it('returns 404 for non-existent user', async () => {
    const mockReq = createMockRequest()
    const mockParams = { id: 'non-existent' }

    const response = await GET(mockReq, { params: mockParams })

    expect(response.status).toBe(404)
  })
})
```

## Performance Guidelines

### Complexity Limits
- **Cyclomatic Complexity**: ≤14 (ESLint rule)
- **Max Depth**: 4 levels (ESLint rule)
- **Max Lines per Function**: 250 (ESLint rule)
- **Max Parameters**: 5 (ESLint rule)
- **Max Statements**: 40 (ESLint rule)

### Optimization Patterns
```ts
// Memoization for expensive calculations
import { useMemo } from 'react'

function ExpensiveComponent({ data, filter }) {
  const filteredData = useMemo(() => {
    return data.filter(item => item.status === filter)
  }, [data, filter])

  return <div>{/* render filteredData */}</div>
}

// Lazy loading for routes
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>
})

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window'

function VirtualizedList({ items }) {
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </List>
  )
}
```

## Critical Rules & Best Practices

### ✅ REQUIRED
- **Input Validation**: Always validate and sanitize user inputs with Zod schemas
- **TypeScript Strict**: Never use `any`, always provide explicit types
- **Security Middleware**: Use `withSecurity()` wrapper on all API routes
- **Proper Logging**: Use `createClientLogger()`/`createServerLogger()` instead of `console`
- **Absolute Imports**: Never use relative imports (`../`), always use `@/` aliases
- **Error Boundaries**: Wrap components that might throw errors
- **Accessibility**: Follow JSX A11y rules for screen readers
- **Performance**: Keep bundle size optimized, use lazy loading for heavy components

### ❌ FORBIDDEN
- **Console Usage**: No `console.log`, `console.error`, etc. (use proper logging)
- **Any Type**: Never use `any` or `unknown` without proper type guards
- **Relative Imports**: No `../../../components/Button` (use `@/components/Button`)
- **Secret Exposure**: Never log or expose API keys, passwords, or sensitive data
- **Dangerous HTML**: No `dangerouslySetInnerHTML` without sanitization
- **Enums**: Use const objects or union types instead of TypeScript enums
- **Default Exports**: Use named exports only
- **PropTypes**: Use TypeScript interfaces instead of prop-types package
- **Semicolons**: Never use semicolons (breaks Prettier formatting)
- **Double Quotes**: Always use single quotes
- **Var Declarations**: Use `const`/`let`, never `var`

### Module-Specific Rules
- **API Routes**: Must have `runtime = 'nodejs'`, use `handleAPIError()`, wrap with `withSecurity()`
- **Components**: Client components need `'use client'`, use proper TypeScript interfaces
- **Services**: Class-based with proper error handling and logging
- **Hooks**: Follow Rules of Hooks, proper dependency arrays
- **Types**: Keep in separate files, use consistent naming patterns
- **Utils**: Pure functions, comprehensive error handling
- **Tests**: Use Vitest with jsdom environment, follow testing-library patterns</content>
<parameter name="filePath">AGENTS.md



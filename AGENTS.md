# HeyTrack Agent Guidelines

## Build & Development Commands
- **Development**: `npm run dev` (Next.js with hot reload)
- **Build**: `npm run build` (production build)
- **Type Check**: `npm run type-check` (TypeScript strict checking)
- **Lint**: `npm run lint` (ESLint with strict rules, max 0 warnings)
- **Lint Fix**: `npm run lint:fix` (auto-fix ESLint issues)
- **Validate**: `npm run validate` (type-check + lint)
- **Clean**: `npm run clean` (remove build artifacts)

## Testing Commands
- **Run all tests**: `npx vitest` or `npx vitest run`
- **Run single test**: `npx vitest path/to/test.file.test.ts`
- **Watch mode**: `npx vitest --watch`
- **UI mode**: `npx vitest --ui`
- **Coverage**: `npx vitest --coverage`

## Security & Safety Guidelines

### Input Validation & Sanitization
- **ALWAYS sanitize user inputs** using `@/utils/security/InputSanitizer`
- **Validate all API inputs** with Zod schemas from `@/lib/validations`
- **Use rate limiting** with `@/utils/security/RateLimiter` for API endpoints
- **Sanitize HTML content** to prevent XSS attacks
- **Validate file uploads** and prevent directory traversal
- **Use parameterized queries** for database operations

### Authentication & Authorization
- **Validate user sessions** on all protected routes
- **Use Supabase auth** for user management
- **Implement proper role-based access control**
- **Never expose sensitive data** in client-side code
- **Use secure headers** from `@/utils/security/SecurityHeaders`

### Error Handling & Logging
- **Use `useErrorHandler` hook** for component error management
- **Log errors properly** with `@/lib/logger` (never use console)
- **Handle API errors** with `handleAPIError` from `@/lib/errors/api-error-handler`
- **Provide user-friendly error messages** without exposing sensitive information
- **Implement proper error boundaries** for React components

### Database & API Safety
- **Use typed database queries** with generated Supabase types
- **Validate all database inputs** before insertion/update
- **Implement proper transaction handling** for complex operations
- **Use database constraints** and validation at the schema level
- **Sanitize all user-generated content** before storage

## Code Style Guidelines

### TypeScript
- **Strict mode enabled**: All strict TypeScript checks active
- **No `any` types**: Use proper types, avoid `unknown` when possible
- **Type imports**: Separate type imports with `import type`
- **Interface over type**: Prefer `interface` for object types
- **Array types**: Use `Type[]` syntax, not `Array<Type>`
- **Generic constraints**: Use proper generic constraints
- **Union types**: Prefer union types over enums
- **Type guards**: Implement proper type guards for runtime type checking

### Imports & Modules
- **Absolute imports**: Use `@/` alias instead of relative imports
- **No relative imports**: `../../../` patterns are forbidden
- **Import organization**: Group by external, internal, types
- **No default exports**: Use named exports only
- **Barrel exports**: Use index.ts files for clean imports
- **Tree shaking**: Ensure imports are tree-shakeable

### React & Components
- **Functional components**: Arrow functions preferred
- **Hooks**: Follow rules-of-hooks, exhaustive-deps enabled
- **Props**: TypeScript interfaces, no prop-types
- **JSX**: Self-closing tags, no useless fragments
- **Keys**: Avoid array index keys (warn level)
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Error boundaries**: Implement error boundaries for error isolation

### Naming Conventions
- **Files**: kebab-case for components, camelCase for utilities
- **Components**: PascalCase, descriptive names
- **Hooks**: camelCase starting with `use`
- **Types**: PascalCase, suffix with `Type`, `Props`, etc.
- **Constants**: SCREAMING_SNAKE_CASE
- **Functions**: camelCase, descriptive names
- **Variables**: camelCase, descriptive names

### Error Handling
- **Try-catch**: Use consistent error handling patterns
- **No console**: Use proper logging instead of console methods
- **Async/await**: Required, no floating promises
- **Error types**: Custom error classes when appropriate
- **Graceful degradation**: Handle errors gracefully without breaking UX
- **User feedback**: Provide clear error messages to users

### Code Quality
- **No semicolons**: Prettier removes them
- **Single quotes**: For strings
- **Trailing commas**: ES5 style
- **Print width**: 100 characters
- **No enums**: Use const objects or union types
- **Destructuring**: Preferred for objects
- **Arrow functions**: Preferred over function declarations
- **Pure functions**: Prefer pure functions when possible
- **Immutability**: Maintain immutability for state management

### Database & Supabase
- **Typed queries**: Use generated Supabase types
- **Query optimization**: Use select() to limit returned fields
- **Real-time subscriptions**: Handle subscription cleanup properly
- **Connection pooling**: Let Supabase handle connection management
- **Migration safety**: Test migrations thoroughly before deployment

### API Routes
- **Runtime specification**: Use `export const runtime = 'nodejs'` for server operations
- **Security middleware**: Apply `withSecurity()` to all routes
- **Input validation**: Validate all inputs with Zod schemas
- **Error responses**: Use consistent error response format
- **Rate limiting**: Implement rate limiting for public endpoints
- **CORS handling**: Configure CORS properly for cross-origin requests

### Testing
- **Framework**: Vitest with jsdom environment
- **Structure**: describe/it/expect pattern
- **File location**: `__tests__/` directories or `.test.ts` files
- **Mocking**: Use Vitest's built-in mocking
- **Coverage**: V8 provider with HTML/text reports
- **Integration tests**: Test API routes and database operations
- **Component tests**: Test React components with user interactions

### Performance
- **Bundle analysis**: `npm run build:analyze`
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Images**: Optimize with Next.js Image component
- **Code splitting**: Automatic with Next.js pages
- **Lazy loading**: Use dynamic imports for heavy components
- **Virtual scrolling**: Use for large lists
- **Bundle optimization**: Minimize bundle size with tree shaking

## Common Patterns & Best Practices

### Component Structure
```tsx
'use client'

import type { ComponentProps } from './types'

interface MyComponentProps extends ComponentProps {
  onAction: (data: string) => void
}

export function MyComponent({ onAction, ...props }: MyComponentProps) {
  // Component logic here
  return <div {...props}>Content</div>
}
```

### API Route Structure
```ts
import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/utils/security'
import { handleAPIError } from '@/lib/errors/api-error-handler'

export const runtime = 'nodejs'

async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data: result })
  } catch (error) {
    return handleAPIError(error)
  }
}

export const GET = withSecurity(GET, SecurityPresets.apiRead)
```

### Error Handling in Components
```tsx
import { useErrorHandler } from '@/hooks/error-handler'

export function MyComponent() {
  const { error, isError, message, handleError, resetError } = useErrorHandler()

  const handleAction = async () => {
    try {
      await someAsyncOperation()
    } catch (err) {
      handleError(err, 'MyComponent.handleAction')
    }
  }

  if (isError) {
    return <ErrorDisplay message={message} onRetry={resetError} />
  }

  return <div>Content</div>
}
```

### Database Queries
```ts
import { createClient } from '@/utils/supabase'
import type { Database } from '@/types/database'

export async function getUserData(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
```

## Critical Safety Rules

### NEVER DO:
- ❌ Use `console.log` in production code
- ❌ Expose sensitive environment variables to client
- ❌ Store passwords or API keys in plain text
- ❌ Use `any` type for new code
- ❌ Make direct DOM manipulations
- ❌ Use relative imports (`../../../`)
- ❌ Commit secrets or credentials
- ❌ Use `eval()` or `new Function()`
- ❌ Disable TypeScript strict checks
- ❌ Use `dangerouslySetInnerHTML` without sanitization

### ALWAYS DO:
- ✅ Validate and sanitize all user inputs
- ✅ Use proper error handling and logging
- ✅ Implement authentication checks
- ✅ Write tests for critical functionality
- ✅ Use TypeScript strict mode
- ✅ Follow security best practices
- ✅ Keep dependencies updated
- ✅ Review code for security vulnerabilities</content>
<parameter name="filePath">AGENTS.md
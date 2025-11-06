# HeyTrack Agent Guidelines

## Commands
- **Dev**: `npm run dev` | **Build**: `npm run build` | **Type-check**: `npm run type-check`
- **Lint**: `npm run lint` | **Lint fix**: `npm run lint:fix` | **Validate**: `npm run validate`
- **Test all**: `npx vitest` | **Single test**: `npx vitest path/to/test.test.ts` | **Watch**: `npx vitest --watch`

## Code Style
- **TypeScript**: Strict mode, no `any`, absolute imports `@/`, `import type` for types
- **React**: Functional components, arrow functions, hooks `useXxx`, TypeScript interfaces for props
- **Naming**: camelCase functions/vars, PascalCase components/types, SCREAMING_SNAKE_CASE constants
- **Imports**: Absolute only, group external→internal→types, named exports only, no defaults
- **Formatting**: No semicolons, single quotes, 100 chars, trailing commas, no enums
- **Error Handling**: `createClientLogger()`, no `console`, async/await, graceful degradation
- **Security**: Sanitize with `@/utils/security/InputSanitizer`, validate with Zod, `withSecurity()` middleware

## API Routes
```ts
export const runtime = 'nodejs'
async function GET(req: NextRequest) {
  try { /* impl */ } catch (e) { return handleAPIError(e) }
}
export const GET = withSecurity(GET, SecurityPresets.apiRead)
```

## Components
```tsx
'use client'
interface Props { onAction: (data: string) => void }
export function Component({ onAction, ...props }: Props) {
  return <div {...props}>Content</div>
}
```

## Database
```ts
const { data, error } = await supabase.from('table').select('fields').eq('id', id).single()
if (error) throw error
```

## Critical Rules
- ✅ Validate/sanitize inputs | ✅ TypeScript strict | ✅ Security middleware | ✅ Proper logging
- ❌ No `console.log` | ❌ No `any` | ❌ Relative imports | ❌ Expose secrets | ❌ `dangerouslySetInnerHTML`</content>
<parameter name="filePath">AGENTS.md



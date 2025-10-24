# Console-to-Logger Migration Quick Reference

## Quick Conversion Guide

### Basic Replacements

```typescript
// console.log → logger.info or logger.debug
console.log('User logged in')
logger.info('User logged in')

// console.error → logger.error
console.error('Failed to fetch')
logger.error('Failed to fetch')

// console.warn → logger.warn
console.warn('Cache miss')
logger.warn('Cache miss')

// console.info → logger.info
console.info('Server started')
logger.info('Server started')

// console.debug → logger.debug
console.debug('Debug info')
logger.debug('Debug info')
```

### Error Object Handling

```typescript
// Pattern 1: Error with message
console.error('Failed to fetch:', error)
logger.error({ err: error }, 'Failed to fetch')

// Pattern 2: Error only
console.error(error)
logger.error({ err: error }, error.message || 'Error occurred')

// Pattern 3: Error with context
console.error('API error:', error, { endpoint: '/api/users' })
logger.error({ err: error, endpoint: '/api/users' }, 'API error')
```

### Adding Context Data

```typescript
// Before
console.log(`Processing ${count} items for user ${userId}`)

// After
logger.info({ count, userId }, 'Processing items for user')
```

## Logger Selection by File Location

| File Location | Logger to Import | Import Statement |
|--------------|------------------|------------------|
| `src/app/api/**/*` | `apiLogger` | `import { apiLogger } from '@/lib/logger'` |
| `src/lib/supabase.ts` | `dbLogger` | `import { dbLogger } from '@/lib/logger'` |
| `src/app/auth/**/*` | `authLogger` | `import { authLogger } from '@/lib/logger'` |
| `src/lib/cron-*.ts` | `cronLogger` | `import { cronLogger } from '@/lib/logger'` |
| `src/lib/automation/**/*` | `automationLogger` | `import { automationLogger } from '@/lib/logger'` |
| `src/components/**/*` | `uiLogger` | `import { uiLogger } from '@/lib/logger'` |
| Other files | `logger` | `import logger from '@/lib/logger'` |

## Common Patterns

### API Endpoint Logging
```typescript
import { apiLogger } from '@/lib/logger'

apiLogger.info({ endpoint: '/api/users', method: 'GET' }, 'API request received')
apiLogger.error({ err: error, endpoint: '/api/users' }, 'API request failed')
```

### Database Query Logging
```typescript
import { dbLogger } from '@/lib/logger'

dbLogger.info({ query: 'SELECT * FROM users', duration: 45 }, 'Query executed')
dbLogger.warn({ table: 'users' }, 'Slow query detected')
```

### Authentication Logging
```typescript
import { authLogger } from '@/lib/logger'

authLogger.info({ userId: user.id }, 'User logged in')
authLogger.error({ err: error, email }, 'Login failed')
```

### UI Component Logging
```typescript
import { uiLogger } from '@/lib/logger'

uiLogger.debug({ component: 'UserProfile' }, 'Component mounted')
uiLogger.error({ err: error, component: 'UserProfile' }, 'Component error')
```

## Migration Checklist for Each File

- [ ] Add appropriate logger import at top of file
- [ ] Replace all `console.log()` with `logger.info()` or `logger.debug()`
- [ ] Replace all `console.error()` with `logger.error({ err: error }, message)`
- [ ] Replace all `console.warn()` with `logger.warn()`
- [ ] Replace all `console.info()` with `logger.info()`
- [ ] Replace all `console.debug()` with `logger.debug()`
- [ ] Add context data where appropriate
- [ ] Remove unused imports
- [ ] Verify file compiles without errors

## Testing After Migration

1. Start dev server: `npm run dev`
2. Trigger the code path
3. Check terminal for formatted logs
4. Verify error stack traces are preserved
5. Confirm context labels appear correctly

## Example Migration

### Before
```typescript
export async function fetchUsers() {
  console.log('Fetching users...')
  try {
    const users = await db.query('SELECT * FROM users')
    console.log(`Found ${users.length} users`)
    return users
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw error
  }
}
```

### After
```typescript
import { dbLogger } from '@/lib/logger'

export async function fetchUsers() {
  dbLogger.info('Fetching users')
  try {
    const users = await db.query('SELECT * FROM users')
    dbLogger.info({ count: users.length }, 'Found users')
    return users
  } catch (error) {
    dbLogger.error({ err: error }, 'Failed to fetch users')
    throw error
  }
}
```

## Tips

1. **Use structured logging**: Add context as objects, not in strings
2. **Preserve error objects**: Always use `{ err: error }` format
3. **Choose appropriate log levels**:
   - `debug`: Detailed debugging information
   - `info`: General informational messages
   - `warn`: Warning messages that don't stop execution
   - `error`: Error messages for failures
4. **Keep messages concise**: Let context data provide details
5. **Use context-specific loggers**: Makes filtering logs easier

## Need Help?

- See `design.md` for detailed conversion patterns
- See `LOGGER_VERIFICATION.md` for logger configuration details
- See `requirements.md` for acceptance criteria

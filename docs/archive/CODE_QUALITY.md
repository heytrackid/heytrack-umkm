# Code Quality Guidelines

## Overview
This document outlines the code quality standards and tooling for the HeyTrack Bakery Management project.

## Tools

### TypeScript
- Strict type checking enabled
- Run type check: `npm run type-check`
- All code must pass TypeScript compilation without errors

### ESLint
- Configured with strict rules to prevent common errors
- Run lint: `npm run lint`
- Auto-fix on save enabled in VSCode

### Prettier
- Enforces consistent code formatting
- Configured for Tailwind CSS class sorting
- Auto-format on save enabled in VSCode

## Key Rules

### TypeScript Rules
- ✅ **Warn on `any` usage** - Explicit types preferred
- ✅ **Prevent undefined variables** - Catches typos like 'key', 'value', 'data'
- ✅ **Optional chaining** - Use `?.` for null safety
- ✅ **Nullish coalescing** - Use `??` over `||` when appropriate

### React Rules
- ✅ **JSX keys required** - All lists must have keys
- ✅ **No duplicate props** - Prevents common bugs
- ✅ **Dependencies tracking** - React hooks exhaustive deps

### Code Quality
- ✅ **Prefer const over let** - Immutability by default
- ✅ **No var** - Only use const/let
- ✅ **Async/await** - Proper promise handling
- ✅ **No console logs** - Except warn/error

## VSCode Setup

### Required Extensions
1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **TypeScript** - Built-in
4. **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`

### Settings
All settings are configured in `.vscode/settings.json`:
- Format on save enabled
- ESLint auto-fix on save
- Import organization on save
- TypeScript workspace version

## Common Error Patterns Fixed

### 1. Undefined Variables
❌ **Before:**
```typescript
const limit = parseInt(value) // 'value' is undefined
```

✅ **After:**
```typescript
const limit = parseInt(searchParams.get('limit') || '10')
```

### 2. Implicit Any Parameters
❌ **Before:**
```typescript
orders.sort((a, b) => a.date - b.date) // implicit any
```

✅ **After:**
```typescript
orders.sort((a: Order, b: Order) => a.date - b.date)
// or with any if complex:
orders.sort((a: any, b: any) => a.date - b.date)
```

### 3. Wrong Insert Data
❌ **Before:**
```typescript
await supabase.from('table').insert(data) // 'data' undefined
```

✅ **After:**
```typescript
await supabase.from('table').insert([body])
```

### 4. Null Safety
❌ **Before:**
```typescript
const name = user.profile.name // might be null
```

✅ **After:**
```typescript
const name = user?.profile?.name ?? 'Unknown'
```

## Scripts

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build (includes type check)
npm run build

# Development
npm run dev
```

## Pre-commit Checklist

Before committing code:
1. ✅ Run `npm run type-check` - Must pass
2. ✅ Run `npm run lint` - Fix all errors
3. ✅ Test locally - Ensure app runs
4. ✅ Review changes - Check for console.logs

## Error Resolution Progress

### Initial State (Dec 2024)
- **Total TypeScript Errors**: 1062

### Current State
- **Total TypeScript Errors**: 925
- **Fixed**: 137 errors (12.9% reduction)

### Categories Fixed
- ✅ All syntax errors (92 errors)
- ✅ Variable reference errors (25 errors)
- ✅ Module resolution (2 errors)
- ✅ Implicit any parameters (18 errors)

### Remaining Work
- Property missing errors (TS2339): ~260
- Function overload errors (TS2769): ~105
- Type mismatch errors (TS2322): ~75
- Null safety errors (TS18047): ~66

## Contributing

When adding new code:
1. Follow existing patterns
2. Add proper TypeScript types
3. Handle null/undefined cases
4. Avoid using `any` when possible
5. Write self-documenting code
6. Add JSDoc comments for complex functions

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

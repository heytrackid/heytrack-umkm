# Type Safety Enforcement

## Overview

This project enforces strict type safety through ESLint rules and TypeScript configuration. The goal is to eliminate all `any` types and maintain a fully type-safe codebase.

## ESLint Configuration

### No Explicit Any Rule

The `@typescript-eslint/no-explicit-any` rule is configured as an **error** (not a warning):

```javascript
"@typescript-eslint/no-explicit-any": "error"
```

This means:
- ✅ Build will fail if `any` types are introduced
- ✅ CI/CD pipeline will catch type safety violations
- ✅ Developers get immediate feedback in their IDE

### Current Status

As of the last check, there are remaining `any` types in the codebase that need to be fixed. These are tracked in the implementation plan at `.kiro/specs/fix-any-types/tasks.md`.

## How to Check for Any Types

### Run ESLint

```bash
npm run lint
```

### Check Specific Files

```bash
npx eslint src/path/to/file.ts
```

### Count Remaining Any Types

```bash
npx eslint src --ext .ts,.tsx 2>&1 | grep -c "no-explicit-any"
```

## Fixing Any Types

### Step 1: Identify the Any Type

ESLint will show you the exact location:

```
src/components/MyComponent.tsx
  42:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

### Step 2: Determine the Correct Type

Ask yourself:
- Is there an existing type in `src/types/`?
- Can I use a generic type parameter?
- Should I use `unknown` instead?
- Do I need to create a new type definition?

### Step 3: Replace the Any Type

See the [ESLint Any Type Exceptions Guide](./eslint-any-type-exceptions.md) for examples and best practices.

### Step 4: Verify

```bash
npm run lint
npm run type-check
```

## Exceptions

In rare cases where `any` is truly necessary, you can add an exception:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Reason: Third-party library lacks types
const result = legacyLib.process(data) as any;
```

**Important**: Every exception must include a clear reason explaining why `any` is necessary.

See the [ESLint Any Type Exceptions Guide](./eslint-any-type-exceptions.md) for detailed guidance.

## TypeScript Configuration

### Strict Mode

The project uses TypeScript strict mode for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

### Type Checking

Run type checking without building:

```bash
npm run type-check
```

## Best Practices

### Use Unknown Instead of Any

```typescript
// ❌ Bad
function process(data: any) {
  return data.value;
}

// ✅ Good
function process(data: unknown) {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}
```

### Create Type Definitions

```typescript
// ❌ Bad
const [state, setState] = useState<any>(null);

// ✅ Good
interface MyState {
  value: string;
  count: number;
}
const [state, setState] = useState<MyState | null>(null);
```

### Use Generics

```typescript
// ❌ Bad
function map(items: any[], fn: (item: any) => any): any[] {
  return items.map(fn);
}

// ✅ Good
function map<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}
```

## Resources

- [ESLint Any Type Exceptions Guide](./eslint-any-type-exceptions.md)
- [TypeScript Handbook - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Fix Any Types Implementation Plan](.kiro/specs/fix-any-types/tasks.md)

## Contributing

When submitting PRs:

1. ✅ Ensure `npm run lint` passes
2. ✅ Ensure `npm run type-check` passes
3. ✅ Do not introduce new `any` types
4. ✅ If you must use `any`, document why with an ESLint exception comment
5. ✅ Consider fixing existing `any` types in files you're modifying

## Questions?

If you're unsure about how to fix an `any` type, refer to:
1. The [ESLint Any Type Exceptions Guide](./eslint-any-type-exceptions.md)
2. Existing type definitions in `src/types/`
3. The [Fix Any Types Design Document](.kiro/specs/fix-any-types/design.md)

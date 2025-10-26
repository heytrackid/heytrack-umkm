# ESLint Any Type Exceptions Guide

## Overview

The codebase enforces strict type safety by treating `@typescript-eslint/no-explicit-any` as an **error**. This prevents the use of `any` types, which can lead to runtime errors and reduce code maintainability.

## Rule Configuration

```javascript
"@typescript-eslint/no-explicit-any": "error"
```

This rule will cause ESLint to fail when `any` is used anywhere in the codebase.

## When to Use Exceptions

Exceptions should be **rare** and only used in the following legitimate cases:

### 1. Third-Party Library Type Gaps

When a third-party library lacks proper TypeScript definitions and creating a complete type definition is impractical:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Reason: Legacy library lacks type definitions
const result = legacyLibrary.process(data) as any;
```

### 2. Dynamic External Data

When dealing with truly dynamic external data that cannot be typed (e.g., user-provided JSON):

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Reason: User-provided JSON schema is dynamic
function parseUserJSON(json: string): any {
  return JSON.parse(json);
}
```

**Better Alternative**: Use `unknown` instead and validate with type guards:

```typescript
function parseUserJSON(json: string): unknown {
  return JSON.parse(json);
}

// Then use type guards
if (isValidUserData(data)) {
  // data is now properly typed
}
```

### 3. Complex Generic Constraints

In rare cases where TypeScript's type system cannot express the constraint:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Reason: Complex generic constraint not expressible in TS
type DeepPartial<T> = T extends any[] ? T : { [P in keyof T]?: DeepPartial<T[P]> };
```

## How to Add Exceptions

### Single Line Exception

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Reason: [Your justification here]
const value: any = externalLibrary.getValue();
```

### Block Exception (Use Sparingly)

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any -- Reason: [Your justification here] */
function legacyFunction(param: any): any {
  return param;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### File-Level Exception (Avoid if Possible)

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// Only use for legacy files being gradually migrated
```

## Best Practices

### ✅ DO

- Use `unknown` instead of `any` when the type is truly unknown
- Create proper type definitions for data structures
- Use type guards for runtime validation
- Use generics for reusable type-safe code
- Document why an exception is necessary

### ❌ DON'T

- Use `any` to bypass type errors
- Use `any` for convenience or to save time
- Use `any` without a clear justification comment
- Use file-level exceptions for new code

## Alternatives to Any

### Use `unknown`

```typescript
// ❌ Bad
function process(data: any) {
  return data.value;
}

// ✅ Good
function process(data: unknown) {
  if (isValidData(data)) {
    return data.value; // Type-safe after guard
  }
  throw new Error('Invalid data');
}
```

### Use Generics

```typescript
// ❌ Bad
function updateItem(index: number, field: string, value: any) {
  items[index][field] = value;
}

// ✅ Good
function updateItem<T extends Record<string, unknown>>(
  index: number,
  field: keyof T,
  value: T[keyof T]
) {
  items[index][field] = value;
}
```

### Use Union Types

```typescript
// ❌ Bad
function format(value: any): string {
  return String(value);
}

// ✅ Good
function format(value: string | number | boolean | null): string {
  return String(value);
}
```

### Use Type Guards

```typescript
// ❌ Bad
function processOrder(order: any) {
  return order.items.map((item: any) => item.price);
}

// ✅ Good
function processOrder(order: unknown) {
  if (isOrder(order)) {
    return order.items.map(item => item.price);
  }
  throw new Error('Invalid order');
}

function isOrder(value: unknown): value is Order {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    Array.isArray((value as Order).items)
  );
}
```

## Review Process

When reviewing code with `any` exceptions:

1. **Verify the justification** - Is the reason valid and well-documented?
2. **Check for alternatives** - Could `unknown`, generics, or union types work instead?
3. **Assess scope** - Is the exception as narrow as possible?
4. **Plan migration** - For legacy code, is there a plan to remove the exception?

## Migration Strategy

For existing code with `any` types:

1. Identify all `any` usages (ESLint will flag them)
2. Prioritize by impact (core business logic first)
3. Replace with proper types or `unknown`
4. Add type guards where needed
5. Only add exceptions as a last resort

## Questions?

If you're unsure whether an exception is justified, ask yourself:

- Can I use `unknown` instead?
- Can I create a proper type definition?
- Can I use a generic type parameter?
- Is this truly a limitation of TypeScript's type system?

If the answer to all is "no," then an exception may be warranted. Document it clearly!

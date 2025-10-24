# Type Safety Rules & Guidelines

## Overview
Proyek ini menggunakan strict TypeScript dan ESLint rules untuk mencegah penggunaan `any` type. Semua file harus mengikuti rules ini.

---

## ESLint Rules

### 1. **@typescript-eslint/no-explicit-any** - ERROR
❌ DILARANG:
```typescript
// BAD - Menggunakan 'any'
const handleData = (data: any) => {
  return data.value
}

// BAD - Type casting ke 'any'
const value = (response as any).data
```

✅ BENAR:
```typescript
// Gunakan interface/type yang spesifik
interface DataResponse {
  value: string
  id: number
}
const handleData = (data: DataResponse) => {
  return data.value
}

// Atau gunakan generics
const handleData = <T extends { value: string }>(data: T) => {
  return data.value
}
```

### 2. **@typescript-eslint/no-unsafe-assignment** - ERROR
❌ DILARANG:
```typescript
const data: MyType = unknownData // Mengassign unknown ke typed variable
```

✅ BENAR:
```typescript
// Gunakan type guard
if (isMyType(unknownData)) {
  const data: MyType = unknownData
}

// Atau gunakan validation
const data = MyTypeSchema.parse(unknownData)
```

### 3. **@typescript-eslint/no-unsafe-member-access** - ERROR
❌ DILARANG:
```typescript
const value = (data as any).prop.nested.value
```

✅ BENAR:
```typescript
// Define proper types
interface Data {
  prop: {
    nested: {
      value: string
    }
  }
}
const value = data.prop.nested.value
```

### 4. **@typescript-eslint/no-unsafe-return** - ERROR
❌ DILARANG:
```typescript
function getData(): MyType {
  return unknownData as any // Returns 'any' type
}
```

✅ BENAR:
```typescript
function getData(): MyType {
  if (isMyType(unknownData)) {
    return unknownData
  }
  throw new Error('Invalid data')
}
```

### 5. **@typescript-eslint/no-unsafe-call** - ERROR
❌ DILARANG:
```typescript
const result = (someFunction as any)()
```

✅ BENAR:
```typescript
type SomeFunction = () => ResultType
const result = (someFunction as SomeFunction)()
```

### 6. **@typescript-eslint/no-unsafe-argument** - ERROR
❌ DILARANG:
```typescript
function process(data: string) { }
process(unknownData as any)
```

✅ BENAR:
```typescript
function process(data: string) { }
if (typeof unknownData === 'string') {
  process(unknownData)
}
```

### 7. **@typescript-eslint/no-non-null-assertion** - ERROR
❌ DILARANG:
```typescript
const value = data!.property
const arr = data as string[]
```

✅ BENAR:
```typescript
// Gunakan optional chaining
const value = data?.property

// Atau check dulu
if (data) {
  const value = data.property
}

// Atau assert dengan type guard
const value = Array.isArray(data) ? data : []
```

### 8. **@typescript-eslint/explicit-function-return-type** - ERROR (with exceptions)
Semua function harus memiliki return type yang jelas.

❌ DILARANG:
```typescript
const getData = () => {
  return data
}

function process(item) {
  return item.value
}
```

✅ BENAR:
```typescript
const getData = (): DataType => {
  return data
}

function process(item: Item): string {
  return item.value
}

// Exception: Arrow functions dalam JSX/React
const Component = ({ data }: Props) => (
  <div>{data}</div>
)
```

---

## Handling `unknown` Type

Ketika Anda menerima data dari API, JSON parsing, atau sumber eksternal, gunakan `unknown` (bukan `any`):

### ❌ BAD:
```typescript
const response: any = await fetch(url).then(r => r.json())
const value = response.data.value
```

### ✅ GOOD:

#### Option 1: Zod/Validation Library
```typescript
import { z } from 'zod'

const DataSchema = z.object({
  data: z.object({
    value: z.string()
  })
})

const response = await fetch(url).then(r => r.json())
const validated = DataSchema.parse(response)
const value = validated.data.value
```

#### Option 2: Type Guard Function
```typescript
interface Data {
  data: {
    value: string
  }
}

function isData(data: unknown): data is Data {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    typeof data.data === 'object' &&
    data.data !== null &&
    'value' in data.data &&
    typeof data.data.value === 'string'
  )
}

const response: unknown = await fetch(url).then(r => r.json())
if (isData(response)) {
  const value = response.data.value
}
```

#### Option 3: Assertion Helper
```typescript
function assertType<T>(value: unknown, check: (v: unknown) => v is T): T {
  if (!check(value)) {
    throw new Error('Type assertion failed')
  }
  return value
}

const response = assertType(
  await fetch(url).then(r => r.json()),
  isData
)
```

---

## Supabase API Handling

### ❌ BAD: Don't use `as any`
```typescript
const { data, error } = await (supabase
  .from('table')
  .insert as any)(records)
```

### ✅ GOOD: Use proper types

```typescript
import type { Database } from '@/types'

type TableRow = Database['public']['Tables']['table_name']['Row']
type TableInsert = Database['public']['Tables']['table_name']['Insert']

// Type-safe insert
const records: TableInsert[] = [...]
const { data, error } = await supabase
  .from('table_name')
  .insert(records)

// If types are missing, define them properly
if (!error) {
  const row: TableRow = data[0]
}
```

---

## API Routes Type Safety

### ❌ BAD:
```typescript
export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const id = searchParams.get('id') // string | null
  
  // Langsung menggunakan tanpa check
  const record = await db.get(id) // ERROR!
}
```

### ✅ GOOD:
```typescript
import { z } from 'zod'

const QuerySchema = z.object({
  id: z.string().uuid()
})

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const query = QuerySchema.safeParse({
    id: searchParams.get('id')
  })
  
  if (!query.success) {
    return NextResponse.json({ error: query.error }, { status: 400 })
  }
  
  const record = await db.get(query.data.id)
  return NextResponse.json(record)
}
```

---

## Common Patterns

### 1. Array Methods
```typescript
// ❌ BAD
const items = data.map((item: any) => item.value)

// ✅ GOOD
interface Item {
  value: string
  id: number
}
const items: string[] = data.map((item: Item): string => item.value)
```

### 2. Object Iteration
```typescript
// ❌ BAD
Object.entries(obj).forEach(([key, value]: any) => {
  console.log(value)
})

// ✅ GOOD
const obj: Record<string, number> = { ... }
Object.entries(obj).forEach(([key, value]) => {
  console.log(value) // value is number
})
```

### 3. Async Functions
```typescript
// ❌ BAD
async function fetch(): Promise<any> {
  return data
}

// ✅ GOOD
interface Response {
  status: number
  data: unknown
}
async function fetch(): Promise<Response> {
  return { status: 200, data: ... }
}
```

### 4. Try-Catch
```typescript
// ❌ BAD
try {
  // ...
} catch (error: any) {
  console.log(error.message)
}

// ✅ GOOD
try {
  // ...
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.log(message)
}
```

---

## How to Fix Type Errors

### Step 1: Read the Error
```
src/file.ts(10,5): error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
```

### Step 2: Identify the Source
- Apakah dari Supabase query?
- Apakah dari JSON parsing?
- Apakah dari third-party library?

### Step 3: Apply Solution
- **Supabase**: Update type definitions
- **JSON**: Use Zod/validation
- **Library**: Import proper types atau buat type definitions

### Step 4: Test
```bash
npm run type-check
```

---

## Tools untuk Membantu

### 1. Zod (Validation)
```bash
npm install zod
```

### 2. TypeGuard Helper
File: `/src/lib/type-guards.ts`
```typescript
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isObject<T>(
  value: unknown,
  check: (v: any) => v is T
): value is T {
  return typeof value === 'object' && value !== null && check(value)
}
```

### 3. Type Definitions Generator
Gunakan untuk Supabase:
```bash
npx supabase gen types typescript > src/types/database.ts
```

---

## CI/CD Integration

Type checking otomatis akan di-run:
1. **Pre-commit hook**: Cek type sebelum commit
2. **CI Pipeline**: Cek type sebelum merge
3. **Development**: `npm run type-check` sebelum push

---

## Exceptions

Ada beberapa kasus dimana kita bisa exception:

### 1. ts-expect-error dengan description
```typescript
// @ts-expect-error: API returns wrong type, issue #123
const value = (response as any).incorrectlyTypedField
```

### 2. Library yang tidak memiliki types
```typescript
// Buat definition file di src/types/untyped-lib.d.ts
declare module 'untyped-lib' {
  export interface Config { ... }
  export function init(config: Config): void
}
```

---

## Testing

Jalankan type checking:
```bash
npm run type-check
```

Harusnya output:
```
✓ 0 errors
✓ Type checking passed
```

Jika ada error, tidak bisa commit!

---

## References
- [TypeScript Handbook - Strict Mode](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [ESLint TypeScript Plugin](https://typescript-eslint.io/)
- [Zod Documentation](https://zod.dev/)

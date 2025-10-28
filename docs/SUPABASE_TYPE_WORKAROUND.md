# Supabase Type Workaround

## Masalah

Supabase SSR client (`@supabase/ssr`) memiliki issue dengan type inference dimana table types di-infer sebagai `never` saat menggunakan `.insert()` atau `.update()`. Ini adalah known issue dengan Supabase SSR + TypeScript.

Error yang muncul:
```
Argument of type 'CustomerInsert' is not assignable to parameter of type 'never'
```

## Root Cause

Issue ini terjadi karena:
1. Supabase SSR client menggunakan generic types yang kompleks
2. TypeScript tidak bisa properly infer table types dari Database schema
3. Ada conflict antara `PostgrestVersion` di generated types dan SSR client

## Solusi

### Pendekatan yang Digunakan

Kita menggunakan **type-safe data preparation + runtime type assertion**:

```typescript
// 1. Prepare data dengan proper typing
const customerData = typedInsert<'customers'>({
  user_id: user.id,
  name: validatedData.name,
  // ... fields lainnya
})

// 2. Insert dengan type assertion
const { data, error } = await supabase
  .from('customers')
  .insert(customerData as any) // Safe karena data sudah di-type sebelumnya
  .select()
  .single()
```

### Kenapa Ini Aman?

1. **Data sudah di-validate** dengan Zod schema sebelum masuk ke function
2. **Type checking dilakukan** saat prepare data dengan `typedInsert<T>()`
3. **Type assertion hanya untuk bypass** Supabase client inference issue
4. **Runtime safety** tetap terjaga karena Supabase akan validate di database level

### Helper Functions

File: `src/lib/supabase/typed-insert.ts`

```typescript
export function typedInsert<T extends keyof Database['public']['Tables']>(
  data: TablesInsert<T>
): TablesInsert<T> {
  return data
}
```

Helper ini memastikan:
- Data structure match dengan table schema
- TypeScript error jika ada field yang salah
- Autocomplete tetap bekerja

## Alternatif Solusi (Tidak Digunakan)

### 1. Regenerate Types dengan Custom Config
❌ Tidak reliable, issue tetap muncul

### 2. Downgrade @supabase/ssr
❌ Kehilangan features dan security updates

### 3. Custom Type Definitions
❌ Terlalu complex, hard to maintain

### 4. Disable Type Checking
❌ Kehilangan type safety completely

## Best Practices

### ✅ DO

```typescript
// Validate input
const validation = Schema.safeParse(body)
if (!validation.success) return error

// Type-safe data prep
const data = typedInsert<'table_name'>({
  field1: value1,
  field2: value2,
})

// Insert with documented assertion
const { data: result } = await supabase
  .from('table_name')
  .insert(data as any) // Workaround for Supabase SSR type inference
  .select()
```

### ❌ DON'T

```typescript
// Jangan langsung insert tanpa typing
await supabase
  .from('table_name')
  .insert({ random: 'data' } as any) // Tidak aman!
```

## Status

- **Issue**: Known Supabase SSR limitation
- **Workaround**: Type-safe preparation + documented assertion
- **Safety**: ✅ Maintained through validation + helper functions
- **Build**: ✅ Successful
- **Runtime**: ✅ Works correctly

## References

- Supabase SSR Docs: https://supabase.com/docs/guides/auth/server-side/nextjs
- Related Issue: https://github.com/supabase/supabase/issues/...
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

---

**Last Updated**: 2025-10-28
**Status**: Active workaround, monitoring for upstream fix

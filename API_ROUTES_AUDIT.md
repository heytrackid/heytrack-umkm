# API Routes Audit Report

## 🔴 CRITICAL ISSUES

### 1. **expenses/route.ts** - Missing user_id filter
**Line:** GET method
**Issue:** Query tidak filter by `user_id` - semua user bisa lihat expenses user lain!
```typescript
// ❌ WRONG
let query = supabase
  .from('expenses')
  .select('...')
  // Missing .eq('user_id', user.id)
```

### 2. **sales/route.ts** - Missing auth & user_id filter
**Line:** GET & POST methods
**Issue:** 
- GET tidak ada auth check
- GET tidak filter by `user_id`
- POST tidak set `user_id`

### 3. **production-batches/route.ts** - Missing cache invalidation
**Issue:** POST tidak invalidate cache setelah create

### 4. **expenses/route.ts** - Inconsistent error variable
**Issue:** Menggunakan `err` instead of `error`

---

## 🟡 MEDIUM PRIORITY

### 5. **Multiple routes** - Old params pattern
**Files:** 
- `notifications/[id]/route.ts`
- `inventory/alerts/[id]/route.ts`
- `orders/[id]/status/route.ts`
- `ai/sessions/[id]/route.ts`
- `recipes/[id]/pricing/route.ts`
- `production-batches/[id]/route.ts`
- `expenses/[id]/route.ts`
- `sales/[id]/route.ts`

**Issue:** Menggunakan `{ params }: { params: { id: string } }` instead of new pattern:
```typescript
type RouteContext = {
  params: Promise<{ id: string }>
}
```

---

## 🟢 GOOD PRACTICES FOUND

### ✅ recipes/route.ts
- Proper auth check
- RLS filtering
- Cache invalidation
- Consistent error handling

### ✅ ingredients/[id]/route.ts
- Proper auth check
- RLS filtering
- Dependency checking before delete

### ✅ orders/[id]/route.ts
- Proper auth check
- RLS filtering
- Cache invalidation
- Atomic operations

---

## FIXES NEEDED

### Priority 1 (Security Critical)
1. ✅ Fix expenses GET - add user_id filter
2. ✅ Fix sales GET - add auth & user_id filter
3. ✅ Fix sales POST - add user_id

### Priority 2 (Consistency)
4. ✅ Add cache invalidation to production-batches
5. ✅ Fix error variable naming (err → error)
6. ✅ Update params pattern to new Next.js 15 style

### Priority 3 (Nice to have)
7. Standardize error messages
8. Add consistent logging
9. Add validation schemas where missing

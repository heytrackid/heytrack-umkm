# API Route Authentication Security Audit

**Audit Date:** October 30, 2025  
**Status:** 🔴 CRITICAL ISSUES FOUND

## Executive Summary

Ditemukan **3 route yang TIDAK terproteksi auth** dan **1 route dengan auth bypass risk**.

### Critical Findings

| Route | Issue | Risk Level | Status |
|-------|-------|------------|--------|
| `/api/analytics/web-vitals` | ❌ No auth check | 🔴 HIGH | NEEDS FIX |
| `/api/analytics/long-tasks` | ❌ No auth check | 🔴 HIGH | NEEDS FIX |
| `/api/errors` POST | ❌ No auth check | 🟡 MEDIUM | NEEDS FIX |
| `/api/reports/cash-flow` | ⚠️ Uses service role without user context | 🔴 CRITICAL | NEEDS FIX |

---

## 🔴 CRITICAL: Routes Without Auth Protection

### 1. `/api/analytics/web-vitals` (POST)

**File:** `src/app/api/analytics/web-vitals/route.ts`

**Issue:** Endpoint dapat diakses tanpa authentication
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // ❌ NO AUTH CHECK!
    apiLogger.info({ metric: body.name, ... })
```

**Risk:**
- Anyone can spam metrics
- Potential DoS attack vector
- Log pollution

**Fix Required:** Add auth check atau rate limiting

---

### 2. `/api/analytics/long-tasks` (POST)

**File:** `src/app/api/analytics/long-tasks/route.ts`

**Issue:** Endpoint dapat diakses tanpa authentication
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // ❌ NO AUTH CHECK!
    apiLogger.warn({ duration: body.duration, ... })
```

**Risk:**
- Same as web-vitals
- Log spam potential

**Fix Required:** Add auth check atau rate limiting

---

### 3. `/api/errors` (POST)

**File:** `src/app/api/errors/route.ts`

**Issue:** Client error logging tanpa auth
```typescript
export async function POST(request: NextRequest) {
  try {
    const validatedData = await validateRequestOrRespond(request, ErrorLogSchema)
    // ❌ NO AUTH CHECK!
    errorStore.push(errorRecord)
```

**Risk:**
- Error log spam
- Memory exhaustion (in-memory store)
- Potential info disclosure

**Fix Required:** Add auth check atau rate limiting

---

## 🔴 CRITICAL: Service Role Without User Context

### 4. `/api/reports/cash-flow` (GET)

**File:** `src/app/api/reports/cash-flow/route.ts`

**Issue:** Menggunakan service role client tanpa auth check
```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // ❌ NO AUTH CHECK!
    const supabase = createServiceRoleClient()
    
    // Fetches ALL users' data!
    const { data: transactions } = await supabase
      .from('financial_records')
      .select('*')
```

**Risk:** 🚨 **CRITICAL DATA BREACH**
- Bypasses RLS completely
- Returns ALL users' financial data
- No user_id filtering
- Massive security vulnerability

**Fix Required:** URGENT - Add auth check + user_id filter

---

## ✅ Protected Routes (Sample Check)

These routes have proper auth protection:

- ✅ `/api/recipes` - Has auth check + RLS
- ✅ `/api/orders` - Has auth check + RLS
- ✅ `/api/ingredients` - Has auth check + RLS
- ✅ `/api/hpp/*` - Has auth check + RLS
- ✅ `/api/notifications` - Has auth check + RLS
- ✅ `/api/production-batches` - Has auth check + RLS
- ✅ `/api/dashboard/stats` - Has auth check + RLS

---

## Recommended Fixes

### Priority 1: Fix `/api/reports/cash-flow` (CRITICAL)

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // ✅ ADD AUTH CHECK
    const supabase = await createClient() // Use regular client
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // ✅ FILTER BY USER_ID
    const { data: transactions } = await supabase
      .from('financial_records')
      .select('id, date, description, category, amount, reference')
      .eq('user_id', user.id) // ✅ RLS enforcement
      .gte('date', startDate)
      .lte('date', endDate)
```

### Priority 2: Fix Analytics Routes

**Option A: Add Auth (Recommended)**
```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    apiLogger.info({ userId: user.id, metric: body.name, ... })
```

**Option B: Add Rate Limiting**
```typescript
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const identifier = request.ip || 'anonymous'
  const { success } = await rateLimit(identifier, 10, 60) // 10 req/min
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
```

### Priority 3: Fix Error Logging

```typescript
export async function POST(request: NextRequest) {
  try {
    // ✅ ADD AUTH CHECK
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const validatedData = await validateRequestOrRespond(request, ErrorLogSchema)
    
    const errorRecord = {
      ...validatedData,
      user_id: user.id // ✅ Associate with user
    }
```

---

## Security Checklist for All Routes

Before deploying any API route, verify:

- [ ] **Auth Check:** `supabase.auth.getUser()` at start
- [ ] **RLS Filter:** `.eq('user_id', user.id)` in queries
- [ ] **Ownership Verification:** For [id] routes
- [ ] **Input Validation:** Zod schema validation
- [ ] **Error Handling:** Don't expose internal errors
- [ ] **Rate Limiting:** For public/analytics endpoints
- [ ] **Logging:** Use apiLogger with user context
- [ ] **Service Role:** Only when necessary + 'server-only'

---

## Action Items

### Immediate (Today)
1. 🚨 Fix `/api/reports/cash-flow` - CRITICAL DATA BREACH
2. 🔴 Fix analytics routes - Add auth or rate limiting
3. 🔴 Fix error logging - Add auth check

### Short Term (This Week)
4. Create rate limiting middleware
5. Add auth check template/snippet
6. Update API route checklist
7. Run security audit on all routes

### Long Term
8. Implement API gateway with auth middleware
9. Add automated security testing
10. Create route security documentation

---

## Testing Commands

```bash
# Find all routes without auth check
grep -L "auth.getUser()" src/app/api/**/route.ts

# Find service role usage
grep -r "createServiceRoleClient" src/app/api/

# Find routes without user_id filter
grep -L "eq('user_id'" src/app/api/**/route.ts
```

---

**Next Steps:** Implement fixes in priority order, starting with cash-flow route.

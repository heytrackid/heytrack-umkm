# 🔴 CRITICAL: Table Name Mismatch Found!

## Problem

**MAJOR INCONSISTENCY** between database schema and generated types!

### Database Schema (schema.sql)
```sql
-- ✅ EXISTS
CREATE TABLE IF NOT EXISTS operational_costs (...)

-- ✅ EXISTS  
CREATE TABLE IF NOT EXISTS stock_transactions (
  ...
  transaction_date DATE DEFAULT CURRENT_DATE,  -- ✅ Field exists!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- ❌ DOES NOT EXIST
CREATE TABLE IF NOT EXISTS expenses (...)  -- NOT IN SCHEMA!
```

### Generated Types (supabase-generated.ts)
```typescript
// ✅ EXISTS
operational_costs: { Row: {...} }

// ✅ EXISTS
stock_transactions: {
  Row: {
    created_at: string | null
    // ❌ transaction_date NOT in generated types!
  }
}

// ✅ EXISTS (but shouldn't?)
expenses: { Row: {...} }
```

### Code Usage
```typescript
// ❌ WRONG - uses 'expenses' table that doesn't exist in schema
.from('expenses')

// ✅ CORRECT - should use 'operational_costs'
.from('operational_costs')
```

---

## Root Cause

**Generated types are OUT OF SYNC with database schema!**

Possible reasons:
1. Schema was updated but types not regenerated
2. Types generated from different database
3. Manual edits to generated types
4. Migration not applied to database

---

## Impact

### Critical Issues
1. **API routes query wrong table** (`expenses` instead of `operational_costs`)
2. **Field mismatch** (`transaction_date` exists in DB but not in types)
3. **Runtime errors** when querying non-existent tables
4. **Type safety broken** - types don't match reality

### Affected Files
- `src/app/api/operational-costs/route.ts` - Uses `expenses` table ❌
- `src/app/api/expenses/route.ts` - Uses `expenses` table ❌
- `src/app/api/dashboard/stats/route.ts` - Uses `expenses` table ❌
- `src/app/api/ai/generate-recipe/route.ts` - Uses `expenses` table ❌

---

## Solution

### Option 1: Regenerate Types (RECOMMENDED)
```bash
# Regenerate types from actual database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase-generated.ts

# Or from local
npx supabase gen types typescript --local > src/types/supabase-generated.ts
```

### Option 2: Update Schema
If `expenses` table should exist:
```sql
-- Add expenses table to schema
CREATE TABLE IF NOT EXISTS expenses (
  -- ... fields
);
```

### Option 3: Fix Code (IMMEDIATE)
Update all code to use correct table names:
```typescript
// Change all
.from('expenses')

// To
.from('operational_costs')
```

---

## Immediate Action Required

### 1. Verify Database State
```sql
-- Check which tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('expenses', 'operational_costs');

-- Check stock_transactions columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'stock_transactions'
AND column_name IN ('transaction_date', 'created_at');
```

### 2. Decision Matrix

| Scenario | Action |
|----------|--------|
| Only `operational_costs` exists | Update code to use `operational_costs` |
| Only `expenses` exists | Update schema.sql |
| Both exist | Decide which to keep, migrate data |
| Neither exists | Apply schema migration |

### 3. Fix Priority

**HIGH PRIORITY:**
1. ✅ Verify which tables exist in production
2. ✅ Regenerate types from production DB
3. ✅ Update all code references
4. ✅ Test all affected endpoints

---

## Files to Update

If using `operational_costs`:
- [ ] `src/app/api/operational-costs/route.ts`
- [ ] `src/app/api/expenses/route.ts` (rename or redirect)
- [ ] `src/app/api/dashboard/stats/route.ts`
- [ ] `src/app/api/ai/generate-recipe/route.ts`
- [ ] `src/app/api/reports/profit/route.ts`
- [ ] `src/app/api/reports/cash-flow/route.ts`

If using `expenses`:
- [ ] Update `supabase/schema.sql`
- [ ] Create migration
- [ ] Apply to database
- [ ] Regenerate types

---

## Testing Required

After fix:
```bash
# Test operational costs endpoint
curl http://localhost:3000/api/operational-costs

# Test dashboard stats
curl http://localhost:3000/api/dashboard/stats

# Verify no "relation does not exist" errors
```

---

## Status

🔴 **CRITICAL - REQUIRES IMMEDIATE ATTENTION**

This is a **production-breaking issue** if:
- Code queries `expenses` table
- But database only has `operational_costs` table
- Result: All queries fail with "relation does not exist"

**Next Step:** Verify production database state ASAP!

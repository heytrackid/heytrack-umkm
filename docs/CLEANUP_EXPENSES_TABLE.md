# Expenses Table Cleanup - November 8, 2025

## Summary

Successfully removed the deprecated `expenses` table from the database after migrating all data to `financial_records`.

## What Was Done

### 1. Migration (Completed Earlier)
- ✅ Migrated 8 expense records from `expenses` → `financial_records`
- ✅ Updated all API endpoints to use `financial_records`
- ✅ Created backward compatibility view `expenses_view`

### 2. Cleanup (Completed Now)
- ✅ Dropped `expenses_view` (backward compatibility view)
- ✅ Dropped `expenses` table
- ✅ Removed foreign key constraint from `ingredient_purchases`
- ✅ Removed deprecated type definitions from `src/types/database.ts`

## Database State After Cleanup

### Active Tables
```
financial_records (PRIMARY)
├─ INCOME records (from orders)
└─ EXPENSE records (migrated from expenses)

operational_costs (SEPARATE)
└─ Recurring monthly costs (salary, rent, utilities)
```

### Removed Tables
```
❌ expenses (DROPPED)
❌ expenses_view (DROPPED)
```

## Code Changes

### Type Definitions Removed
```typescript
// REMOVED from src/types/database.ts
- ExpensesTable
- ExpensesInsert  
- ExpensesUpdate
```

### API Endpoints (Already Updated)
- `/api/expenses` → Uses `financial_records`
- `/api/expenses/[id]` → Uses `financial_records`
- `/api/reports/profit` → Uses `financial_records` + `operational_costs`
- `/api/dashboard/stats` → Uses `financial_records`

## Verification

```sql
-- Verify expenses table is gone
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'expenses';
-- Result: (empty)

-- Verify data in financial_records
SELECT type::text, COUNT(*), SUM(amount)
FROM financial_records
GROUP BY type;
-- Result: EXPENSE | 9 | 7,082,323
```

## Impact

✅ **No Breaking Changes**
- All API endpoints already updated
- All code already using `financial_records`
- Type definitions cleaned up

✅ **Benefits**
- Cleaner database schema
- No confusion between tables
- Single source of truth for expenses

## Rollback (If Needed)

If you need to restore the expenses table:

```sql
-- Recreate table structure
CREATE TABLE expenses (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  category varchar NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  expense_date date,
  created_at timestamptz DEFAULT now()
);

-- Restore data
INSERT INTO expenses
SELECT id, user_id, category, amount, description, date::date, created_at
FROM financial_records
WHERE type = 'EXPENSE';
```

## Related Documentation

- `docs/MIGRATION_EXPENSES_TO_FINANCIAL_RECORDS.md` - Full migration guide
- `src/types/database.ts` - Updated type definitions
- `src/app/api/expenses/` - API endpoints using financial_records

# Migration: Expenses to Financial Records

**Date:** November 8, 2025  
**Status:** ✅ Completed

## Overview

This migration consolidates expense tracking from the legacy `expenses` table into the unified `financial_records` table, improving data consistency and simplifying financial reporting.

## What Changed

### Database Schema

**Before:**
- `expenses` table - General expenses (DEPRECATED)
- `operational_costs` table - Recurring operational costs
- `financial_records` table - Unified financial tracking

**After:**
- ~~`expenses` table~~ - DEPRECATED (kept for reference, view created)
- `operational_costs` table - Recurring operational costs (unchanged)
- `financial_records` table - **Primary table** for all income and one-time expenses

### Data Migration

**Migrated:** 8 expense records from `expenses` → `financial_records`

```sql
-- Migration applied: migrate_expenses_to_financial_records
-- All expense records migrated with type = 'EXPENSE'
-- Backward compatibility view created: expenses_view
```

### API Endpoints Updated

#### `/api/expenses`
- ✅ GET - Now queries `financial_records` (type='EXPENSE')
- ✅ POST - Inserts into `financial_records`
- ✅ PUT - Updates `financial_records`
- ✅ DELETE - Deletes from `financial_records`

#### `/api/reports/profit`
- ✅ Now combines data from:
  - `financial_records` (one-time expenses)
  - `operational_costs` (recurring monthly costs)

#### Other Updated Endpoints
- ✅ `/api/dashboard/stats` - Uses `financial_records`
- ✅ `/api/ai/generate-recipe` - Uses `operational_costs` for daily op costs

## Table Usage Guide

### When to use `financial_records`
- ✅ One-time expenses (supplies, repairs, etc.)
- ✅ Income/revenue transactions
- ✅ Ad-hoc financial transactions
- ✅ Expense tracking with detailed metadata

### When to use `operational_costs`
- ✅ Recurring monthly costs (salary, rent, utilities)
- ✅ Template-based operational expenses
- ✅ Fixed overhead calculations
- ✅ Budget planning for recurring costs

## Code Examples

### Creating an Expense (New Way)

```typescript
// POST /api/expenses
const expense = {
  type: 'EXPENSE',
  category: 'Supplies',
  amount: 500000,
  description: 'Office supplies',
  date: '2025-11-08'
}

const response = await fetch('/api/expenses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(expense)
})
```

### Querying Expenses

```typescript
// GET /api/expenses
const response = await fetch('/api/expenses?start_date=2025-11-01&end_date=2025-11-30')
const { data, count } = await response.json()
```

### Creating Operational Cost

```typescript
// POST /api/operational-costs
const opCost = {
  category: 'rent',
  amount: 2000000,
  description: 'Sewa tempat usaha',
  date: '2025-11-01',
  recurring: true,
  frequency: 'monthly'
}

const response = await fetch('/api/operational-costs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(opCost)
})
```

## Backward Compatibility

A view `expenses_view` has been created for backward compatibility:

```sql
CREATE VIEW expenses_view AS
SELECT 
  id,
  user_id,
  category,
  amount,
  description,
  reference as receipt_number,
  date::date as expense_date,
  created_at,
  created_at as updated_at
FROM financial_records
WHERE type = 'EXPENSE';
```

## Verification

Check migration success:

```sql
-- Verify data counts
SELECT 
  'financial_records' as source,
  type::text,
  COUNT(*) as count,
  SUM(amount) as total
FROM financial_records
GROUP BY type
UNION ALL
SELECT 
  'operational_costs' as source,
  'OPERATIONAL' as type,
  COUNT(*) as count,
  SUM(amount) as total
FROM operational_costs
WHERE is_active = true;
```

**Expected Results:**
- `financial_records` (EXPENSE): 9 records ≈ Rp 7,082,323
- `operational_costs`: 8 records = Rp 6,950,000

## Table Cleanup

The `expenses` table has been **DROPPED** on November 8, 2025.

```sql
-- Migration: drop_expenses_table
-- Dropped: expenses table, expenses_view
-- All data preserved in financial_records
```

## Rollback Plan

⚠️ **Note:** The expenses table has been dropped. If rollback is needed, restore from backup or recreate from financial_records:

```sql
-- Recreate expenses table structure (if needed)
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  category varchar NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  expense_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Restore data from financial_records
INSERT INTO expenses (id, user_id, category, amount, description, expense_date, created_at)
SELECT id, user_id, category, amount, description, date::date, created_at
FROM financial_records
WHERE type = 'EXPENSE';
```

## Notes

- The `expenses` table is marked as DEPRECATED but not dropped
- All new expense entries should use `/api/expenses` (which writes to `financial_records`)
- Operational costs remain in separate table for recurring cost management
- Type definitions updated with deprecation notice

## Related Files

- `src/app/api/expenses/route.ts`
- `src/app/api/expenses/[id]/route.ts`
- `src/app/api/reports/profit/route.ts`
- `src/app/api/operational-costs/route.ts`
- `src/hooks/useExpenses.ts`
- `src/types/database.ts`

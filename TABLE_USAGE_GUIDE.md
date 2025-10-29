# Table Usage Guide: expenses vs operational_costs

## ✅ CONFIRMED: Both Tables Exist

Both `expenses` and `operational_costs` tables exist in the database.

---

## 📋 Table Structures

### `expenses` Table
```typescript
{
  id: string
  description: string
  category: string
  subcategory: string | null
  amount: number
  expense_date: string
  supplier: string | null
  payment_method: string | null
  status: string | null
  receipt_number: string | null
  is_recurring: boolean | null
  recurring_frequency: string | null
  user_id: string
  created_at: string | null
  updated_at: string | null
}
```

**Key Fields:**
- `expense_date` - When expense occurred
- `category` - Expense category
- `subcategory` - More specific categorization
- `is_recurring` - Whether it repeats
- `recurring_frequency` - How often it repeats

### `operational_costs` Table
```typescript
{
  id: string
  description: string
  category: string
  amount: number
  date: string | null
  frequency: string | null
  recurring: boolean | null
  is_active: boolean
  supplier: string | null
  payment_method: string | null
  reference: string | null
  notes: string | null
  user_id: string
  created_at: string | null
  updated_at: string | null
}
```

**Key Fields:**
- `date` - When cost occurred
- `is_active` - Whether cost is currently active
- `recurring` - Whether it repeats
- `frequency` - How often it repeats

---

## 🎯 Intended Purpose

### `expenses` Table
**Purpose:** General expense tracking

**Use Cases:**
- All business expenses
- One-time purchases
- Recurring expenses
- Supplier payments
- General financial tracking

**Examples:**
- Ingredient purchases
- Equipment purchases
- Marketing expenses
- Office supplies
- Miscellaneous costs

### `operational_costs` Table
**Purpose:** Operational overhead for HPP calculations

**Use Cases:**
- Fixed operational costs
- Costs allocated to production
- HPP calculation inputs
- Overhead distribution

**Examples:**
- Rent (allocated to production)
- Utilities (electricity, gas, water)
- Equipment depreciation
- Labor costs (if not tracked per production)
- Packaging materials

---

## 🔧 Current Usage in Code

### ✅ CORRECT Usage

**HPP Calculator Service:**
```typescript
// ✅ Uses operational_costs for HPP calculations
const { data: operationalCosts } = await supabase
  .from('operational_costs')
  .select('amount')
  .eq('user_id', userId)
  .eq('is_active', true)
```

### ❌ INCORRECT Usage

**Operational Costs API Route:**
```typescript
// ❌ Route is /api/operational-costs but queries expenses table
.from('expenses')
```

**Dashboard Stats:**
```typescript
// ❌ Should specify which table for what purpose
.from('expenses')
```

---

## 🎯 Recommended Usage Pattern

### Rule 1: HPP Calculations
**Use:** `operational_costs` table

```typescript
// For HPP overhead allocation
const { data: costs } = await supabase
  .from('operational_costs')
  .select('amount')
  .eq('is_active', true)
```

**Why:** 
- Only active costs affect current HPP
- Filtered for production-related costs
- Used for overhead distribution

### Rule 2: General Expense Tracking
**Use:** `expenses` table

```typescript
// For financial reports, expense tracking
const { data: expenses } = await supabase
  .from('expenses')
  .select('*')
  .gte('expense_date', startDate)
```

**Why:**
- Complete expense history
- All categories included
- Financial reporting

### Rule 3: Operational Cost Management
**Use:** `operational_costs` table

```typescript
// For managing costs that affect production
const { data: costs } = await supabase
  .from('operational_costs')
  .select('*')
  .eq('is_active', true)
```

**Why:**
- Production-specific costs
- Active/inactive toggle
- HPP calculation source

---

## 🔄 Relationship Between Tables

```
expenses (General)
    ↓
    ├─→ operational_costs (Production-specific)
    │   └─→ HPP Calculations
    │
    └─→ Financial Reports
```

**Flow:**
1. All costs recorded in `expenses`
2. Production-related costs also in `operational_costs`
3. `operational_costs` used for HPP
4. `expenses` used for financial reports

**OR (Alternative):**
1. General expenses → `expenses` table
2. Production costs → `operational_costs` table
3. Separate tracking, different purposes

---

## 🛠️ Fixes Needed

### Fix 1: Operational Costs API Route
**File:** `src/app/api/operational-costs/route.ts`

**Current:**
```typescript
.from('expenses')  // ❌ Wrong table
```

**Should be:**
```typescript
.from('operational_costs')  // ✅ Correct table
```

### Fix 2: Dashboard Stats
**File:** `src/app/api/dashboard/stats/route.ts`

**Current:**
```typescript
// Unclear which expenses
.from('expenses')
```

**Should be:**
```typescript
// For operational costs
.from('operational_costs')
.eq('is_active', true)

// OR for all expenses
.from('expenses')
// with clear comment
```

### Fix 3: AI Recipe Generator
**File:** `src/app/api/ai/generate-recipe/route.ts`

**Current:**
```typescript
.from('expenses')  // Unclear purpose
```

**Should be:**
```typescript
// For HPP estimation
.from('operational_costs')
.eq('is_active', true)
```

---

## 📝 Decision Matrix

| Use Case | Table | Reason |
|----------|-------|--------|
| HPP calculation | `operational_costs` | Only active production costs |
| Overhead allocation | `operational_costs` | Production-specific |
| Financial reports | `expenses` | Complete expense history |
| Expense tracking | `expenses` | All business expenses |
| Cost management | `operational_costs` | Production cost control |
| Budget analysis | `expenses` | All spending |
| Profit calculation | `expenses` | Total expenses |
| HPP overhead | `operational_costs` | Production overhead only |

---

## ✅ Action Items

### Immediate
- [ ] Fix `/api/operational-costs` route to use correct table
- [ ] Update dashboard stats to use correct table
- [ ] Fix AI recipe generator to use correct table
- [ ] Add comments explaining table choice

### Short Term
- [ ] Document data flow between tables
- [ ] Create migration guide if needed
- [ ] Add validation to prevent confusion
- [ ] Update API documentation

### Long Term
- [ ] Consider consolidating if redundant
- [ ] Or clearly separate purposes
- [ ] Add foreign key if related
- [ ] Create views for common queries

---

## 🎯 Recommendation

**Option A: Keep Both (Recommended)**
- `expenses` = All business expenses
- `operational_costs` = Production overhead for HPP
- Clear separation of concerns
- Different purposes

**Option B: Consolidate**
- Use only `expenses` table
- Add `is_operational` flag
- Add `affects_hpp` flag
- Simpler structure

**My Recommendation:** **Option A**
- Already have both tables
- Different use cases
- HPP needs filtered costs
- Financial reports need all expenses

---

## 📚 Next Steps

1. **Fix API routes** to use correct tables
2. **Add documentation** in code
3. **Create helper functions** for common queries
4. **Add type guards** to prevent confusion
5. **Update tests** to cover both tables

---

## 🚀 Status

**Current State:** ⚠️ Inconsistent usage
**Target State:** ✅ Clear separation
**Action Required:** Fix 3 API routes
**Priority:** 🟡 High (not critical, but confusing)

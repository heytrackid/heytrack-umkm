# 🔍 Database Comparison Report - Supabase vs Code Types

## ⚠️ ISSUES FOUND

### 1. **MISSING TABLES in Code Types**

#### ❌ `expenses` table (EXISTS in DB, MISSING in code)
**Database columns:**
- id, category, subcategory, amount, description
- expense_date, receipt_number, supplier, tax_amount
- is_recurring, recurring_frequency, payment_method, status
- tags, metadata, created_at, updated_at

**Action needed:** Add ExpensesTable to types

#### ❌ `app_settings` table (EXISTS in DB, MISSING in code)
**Database columns:**
- id, user_id, settings_data, created_at, updated_at

**Action needed:** Add AppSettingsTable to types

#### ❌ `whatsapp_templates` table (EXISTS in DB, MISSING in code)
**Database columns:**
- id, name, description, category, template_content
- variables, is_active, is_default, created_at, updated_at

**Action needed:** Add WhatsAppTemplatesTable to types

---

### 2. **FIELD NAME MISMATCHES**

#### 🔴 `ingredients` table
**Possible issue:** Code might use `minimum_stock` but DB has both:
- `min_stock` (original)
- `minimum_stock` (duplicate field)

**Resolution:** Standardize to use `min_stock`

---

### 3. **ENUM TYPES CHECK**

#### ✅ Verified Enums in DB:
- `order_status`: PENDING, CONFIRMED, IN_PROGRESS, READY, DELIVERED, CANCELLED
- `payment_method`: CASH, BANK_TRANSFER, CREDIT_CARD, DIGITAL_WALLET, OTHER
- `production_status`: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
- `record_type`: INCOME, EXPENSE, INVESTMENT, WITHDRAWAL
- `transaction_type`: PURCHASE, USAGE, ADJUSTMENT, WASTE
- `user_role`: super_admin, admin, manager, staff, viewer
- `business_unit`: kitchen, sales, inventory, finance, all

---

## 📊 COMPLETE TABLE MAPPING

### ✅ CORRECTLY MAPPED (19 tables):
1. ✅ ingredients
2. ✅ recipes
3. ✅ recipe_ingredients
4. ✅ customers
5. ✅ orders
6. ✅ order_items
7. ✅ productions
8. ✅ stock_transactions
9. ✅ payments
10. ✅ financial_records
11. ✅ inventory_alerts
12. ✅ usage_analytics
13. ✅ production_schedules
14. ✅ suppliers
15. ✅ supplier_ingredients
16. ✅ sync_events
17. ✅ system_metrics
18. ✅ inventory_stock_logs
19. ✅ daily_sales_summary
20. ✅ notifications
21. ✅ user_profiles

### ❌ MISSING IN CODE (3 tables):
22. ❌ **expenses** - Operational costs table
23. ❌ **app_settings** - User settings/preferences
24. ❌ **whatsapp_templates** - WhatsApp message templates

---

## 🔧 RECOMMENDED FIXES

### Priority 1: Add Missing Tables
```typescript
// Add to types/index.ts

export interface ExpensesTable {
  Row: {
    id: string
    category: string
    subcategory: string | null
    amount: number
    description: string
    expense_date: string | null
    receipt_number: string | null
    supplier: string | null
    tax_amount: number
    is_recurring: boolean
    recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
    payment_method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | null
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    tags: Json
    metadata: Json
    created_at: string
    updated_at: string
  }
  Insert: Omit<ExpensesTable['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<ExpensesTable['Insert']>
}

export interface AppSettingsTable {
  Row: {
    id: string
    user_id: string
    settings_data: Json
    created_at: string
    updated_at: string
  }
  Insert: Omit<AppSettingsTable['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<AppSettingsTable['Insert']>
}

export interface WhatsAppTemplatesTable {
  Row: {
    id: string
    name: string
    description: string | null
    category: string
    template_content: string
    variables: Json
    is_active: boolean
    is_default: boolean
    created_at: string
    updated_at: string
  }
  Insert: Omit<WhatsAppTemplatesTable['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<WhatsAppTemplatesTable['Insert']>
}
```

### Priority 2: Fix Database Schema
Remove duplicate `minimum_stock` field from ingredients table or update code to use it consistently.

---

## 📝 FILES TO UPDATE

1. `src/types/inventory.ts` - Add ExpensesTable
2. `src/types/index.ts` - Export new tables
3. `src/types/database.ts` - Add to exports
4. Update any components using expenses/settings/templates

---

## ✅ SUMMARY

- **Total Tables in DB:** 24
- **Tables in Code:** 21
- **Missing:** 3 (expenses, app_settings, whatsapp_templates)
- **Field Issues:** 1 (min_stock vs minimum_stock duplicate)
- **Enum Issues:** 0 (all correct)


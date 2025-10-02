# Ingredient Purchases - WAC & Expense Integration

## 🎯 Overview

Sistem ingredient purchases kini dilengkapi dengan:
1. **WAC (Weighted Average Cost)** - Perhitungan otomatis cost per unit berdasarkan riwayat pembelian
2. **Expense Tracking** - Setiap pembelian otomatis tercatat sebagai expense

## 📊 Weighted Average Cost (WAC)

### Apa itu WAC?

WAC adalah metode perhitungan cost per unit ingredient yang memperhitungkan harga beli dari beberapa purchase terakhir dengan bobot berdasarkan jumlah pembelian.

**Formula:**
```
WAC = Total Cost dari N pembelian terakhir / Total Quantity dari N pembelian terakhir
```

### Contoh Perhitungan

```
Purchase 1: 100 kg @ Rp 10,000/kg = Rp 1,000,000
Purchase 2: 50 kg @ Rp 12,000/kg = Rp 600,000
Purchase 3: 75 kg @ Rp 11,000/kg = Rp 825,000

WAC = (1,000,000 + 600,000 + 825,000) / (100 + 50 + 75)
WAC = 2,425,000 / 225
WAC = Rp 10,777.78/kg
```

### Implementasi

#### 1. Database Schema

```sql
-- Kolom WAC di tabel ingredients
ALTER TABLE ingredients 
ADD COLUMN weighted_average_cost DECIMAL(10, 2) DEFAULT 0 NOT NULL;

-- Kolom cost tracking di ingredient_purchases
ALTER TABLE ingredient_purchases 
ADD COLUMN cost_per_unit DECIMAL(10, 2);
```

#### 2. Database Function

```sql
CREATE FUNCTION calculate_ingredient_wac(p_ingredient_id UUID)
RETURNS DECIMAL(10, 2)
```

**Logic:**
- Jika stock = 0: Ambil rata-rata unit_price dari 10 purchase terakhir
- Jika stock > 0: Hitung WAC dari 10 purchase terakhir (weighted by quantity)
- Auto-update `ingredients.weighted_average_cost`

#### 3. Database Trigger

```sql
CREATE TRIGGER trigger_update_wac_on_purchase
  AFTER INSERT OR UPDATE OR DELETE ON ingredient_purchases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_wac();
```

**Kapan trigger berjalan:**
- ✅ Setelah INSERT purchase baru
- ✅ Setelah UPDATE purchase
- ✅ Setelah DELETE purchase

### Penggunaan WAC

1. **Inventory Valuation**: `Stock × WAC = Nilai Inventory`
2. **HPP Calculation**: WAC digunakan untuk menghitung cost produksi recipe
3. **Profit Analysis**: `Selling Price - (Sum of Ingredient WAC) = Profit`
4. **Reorder Decision**: Perbandingan WAC vs harga supplier terbaru

---

## 💰 Expense Integration

### Auto-Create Expense

Setiap kali purchase ingredient dibuat, sistem otomatis:

1. **Create Expense Record** di tabel `expenses`
2. **Link ke Purchase** via `expense_id`
3. **Categorize** sebagai "Inventory" expense

### Database Schema

```sql
-- Reference fields di expenses
ALTER TABLE expenses 
ADD COLUMN reference_type VARCHAR(50),
ADD COLUMN reference_id UUID;

-- Link dari ingredient_purchases
ALTER TABLE ingredient_purchases 
ADD COLUMN expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL;
```

### Expense Data Structure

```typescript
{
  category: 'Inventory',
  subcategory: ingredient.category,  // e.g., 'Flour', 'Dairy'
  amount: total_price,
  description: `Purchase: ${ingredient.name} (${quantity} ${unit})`,
  expense_date: purchase_date,
  supplier: supplier,
  payment_method: 'CASH',
  status: 'paid',
  tags: ['ingredient_purchase', 'inventory'],
  metadata: {
    ingredient_id: string,
    ingredient_name: string,
    quantity: number,
    unit: string,
    unit_price: number
  },
  reference_type: 'ingredient_purchase',
  reference_id: purchase_id
}
```

### Data Flow

```
User Creates Purchase
  ↓
1. Create Expense (category: Inventory)
  ↓
2. Create Purchase (with expense_id link)
  ↓
3. Update Expense (with reference_id)
  ↓
4. Update Ingredient Stock (+quantity)
  ↓
5. Trigger calculates WAC automatically
  ↓
Done!
```

### Delete Flow

```
User Deletes Purchase
  ↓
1. Delete linked Expense
  ↓
2. Delete Purchase record
  ↓
3. Revert Ingredient Stock (-quantity)
  ↓
4. Trigger recalculates WAC
  ↓
Done!
```

---

## 🔧 API Implementation

### POST /api/ingredient-purchases

**New Features:**
- ✅ Auto-create expense record
- ✅ Link purchase to expense
- ✅ Detailed metadata in expense
- ✅ Rollback expense if purchase fails
- ✅ WAC auto-calculated by trigger

**Response includes:**
```typescript
{
  ...purchase_data,
  ingredient: {
    ...ing_data,
    weighted_average_cost: number  // ← NEW!
  },
  expense: {                       // ← NEW!
    id: string,
    amount: number,
    expense_date: string
  }
}
```

### DELETE /api/ingredient-purchases

**New Features:**
- ✅ Delete linked expense first
- ✅ Then delete purchase
- ✅ Revert stock
- ✅ WAC auto-recalculated by trigger

---

## 📈 Frontend Updates

### Stats Cards (4 cards)

1. **Pembelian (Bulan Ini)**
   - Value: Count pembelian bulan ini
   - Description: Total semua pembelian

2. **Pengeluaran (Bulan Ini)**
   - Value: Total spending bulan ini
   - Description: "Auto-recorded ke expense"

3. **Supplier Aktif**
   - Value: Unique suppliers
   - Description: Total item dibeli

4. **Rata-rata Pembelian**
   - Value: Average purchase value
   - Description: "Per transaksi"

### Purchase Success Message

```
"Pembelian berhasil ditambahkan! Stock dan WAC telah diperbarui."
```

---

## 🧪 Testing Guide

### 1. Test WAC Calculation

```sql
-- Insert test purchase
INSERT INTO ingredient_purchases (ingredient_id, quantity, unit_price, total_price, purchase_date)
VALUES ('ingredient-uuid', 100, 10000, 1000000, '2025-01-01');

-- Check WAC updated
SELECT name, current_stock, weighted_average_cost 
FROM ingredients 
WHERE id = 'ingredient-uuid';
```

### 2. Test Expense Integration

```sql
-- Check expense created
SELECT e.* 
FROM expenses e
JOIN ingredient_purchases ip ON e.id = ip.expense_id
WHERE ip.id = 'purchase-uuid';

-- Check reference linking
SELECT 
  ip.id as purchase_id,
  ip.expense_id,
  e.reference_type,
  e.reference_id,
  e.amount
FROM ingredient_purchases ip
LEFT JOIN expenses e ON e.id = ip.expense_id
WHERE ip.id = 'purchase-uuid';
```

### 3. Test Delete Flow

```sql
-- Get expense_id before delete
SELECT expense_id FROM ingredient_purchases WHERE id = 'purchase-uuid';

-- Delete purchase (via API or SQL)
DELETE FROM ingredient_purchases WHERE id = 'purchase-uuid';

-- Verify expense deleted
SELECT * FROM expenses WHERE id = 'saved-expense-id';  -- Should return empty

-- Verify WAC recalculated
SELECT weighted_average_cost FROM ingredients WHERE id = 'ingredient-uuid';
```

### 4. Test Frontend

1. Buka `/ingredients/purchases`
2. Add new purchase
3. ✅ Check stats updated
4. ✅ Check success message mentions WAC
5. Navigate to `/expenses` or finance page
6. ✅ Verify expense auto-created with correct:
   - Category: "Inventory"
   - Amount matches purchase
   - Metadata contains ingredient info
7. Delete purchase
8. ✅ Verify expense also deleted
9. Check `/ingredients`
10. ✅ Verify WAC updated in ingredient list

---

## 📊 Benefits

### 1. Accurate Cost Tracking
- WAC provides realistic ingredient cost
- Better than using latest purchase price or manual average
- Accounts for price fluctuations

### 2. Simplified Expense Management
- No manual expense entry needed
- Auto-categorized and tagged
- Complete audit trail via reference links

### 3. Better Financial Insights
- Expense tracking shows inventory investment
- WAC enables accurate profit margin calculation
- Historical cost data for trend analysis

### 4. Automated Accounting
```
Purchase → Expense → Financial Reports
              ↓
         (Automatic!)
```

---

## 🔄 Integration Points

### 1. HPP (Harga Pokok Produksi) Calculation

```typescript
// Recipe HPP using WAC
recipe_cost = sum(ingredient.weighted_average_cost × quantity)
```

### 2. Financial Dashboard

```typescript
// Monthly inventory expense
SELECT SUM(amount) 
FROM expenses 
WHERE category = 'Inventory' 
AND expense_date >= start_of_month;
```

### 3. Supplier Performance

```typescript
// Average purchase price by supplier
SELECT 
  supplier,
  AVG(unit_price) as avg_price,
  COUNT(*) as purchase_count
FROM ingredient_purchases
GROUP BY supplier;
```

### 4. Cost Trend Analysis

```typescript
// WAC trend over time
SELECT 
  ingredient_id,
  ingredient.name,
  DATE_TRUNC('month', purchase_date) as month,
  AVG(unit_price) as avg_monthly_price
FROM ingredient_purchases ip
JOIN ingredients i ON i.id = ip.ingredient_id
GROUP BY ingredient_id, month
ORDER BY month DESC;
```

---

## 🚀 Future Enhancements

### Phase 2 (Optional)

1. **Multiple WAC Methods**
   - FIFO (First In First Out)
   - LIFO (Last In First Out)
   - Moving Average (berbeda dari WAC)

2. **Purchase Price Variance Analysis**
   ```
   Variance = Current Purchase Price - WAC
   Alert if variance > threshold (e.g., 10%)
   ```

3. **Bulk Purchase Discounts**
   - Track quantity-based pricing tiers
   - Suggest optimal purchase quantities

4. **Supplier Price Comparison**
   - Compare WAC across suppliers
   - Recommend best supplier by ingredient

5. **Expense Budget Tracking**
   - Set monthly inventory budget
   - Alert when approaching limit

6. **Tax Integration**
   - Support PPN calculation
   - Generate tax reports

---

## 📝 Technical Notes

### WAC Calculation Frequency

- **Real-time**: Calculated via database trigger
- **Performance**: Indexed on ingredient_purchases for fast calculation
- **Sample Size**: Last 10 purchases (configurable)

### Expense Categorization

```
Category Tree:
└── Inventory
    ├── Flour
    ├── Dairy
    ├── Spices
    └── [Other ingredient categories]
```

### Data Consistency

**Guaranteed by:**
1. Database transactions (atomic operations)
2. Foreign key constraints
3. Trigger-based calculations
4. Rollback on errors

**Edge Cases Handled:**
- Purchase with zero quantity → Rejected
- Delete non-existent purchase → 404 error
- Expense creation fails → Purchase rolled back
- Stock goes negative → Set to 0

---

## 🎉 Summary

### What's New

✅ **WAC (Weighted Average Cost)**
- Auto-calculated dari last 10 purchases
- Updated real-time via database trigger
- Digunakan untuk HPP calculation

✅ **Expense Integration**
- Every purchase → expense record
- Auto-categorized as "Inventory"
- Two-way reference linking
- Delete purchase → delete expense

✅ **Enhanced Analytics**
- Better cost tracking
- Accurate profit margins
- Complete financial audit trail

### Impact

**Before:**
- Manual expense entry
- Inaccurate ingredient costs
- Difficult financial analysis

**After:**
- 100% automated expense tracking
- Accurate WAC-based costing
- Complete financial visibility

---

**Last Updated**: 2025-01-01  
**Status**: ✅ Production Ready  
**Migrations Applied**:
- `add_wac_and_expense_integration`
- `create_wac_calculation_function`

**Dependencies**:
- Supabase Database
- `expenses` table
- `ingredients` table
- `ingredient_purchases` table

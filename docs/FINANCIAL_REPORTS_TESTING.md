# Financial Reports API - Testing Guide

## 🧪 Quick Start Testing

### Prerequisites
- Development server running: `npm run dev`
- Some test data in database (orders, expenses, ingredients)

---

## 🚀 Test Cash Flow Report

### Test 1: Basic Monthly Report
```bash
curl "http://localhost:3000/api/reports/cash-flow?start_date=2025-10-01&end_date=2025-10-31&period=daily" | jq .
```

**Expected Response:**
```json
{
  "summary": {
    "total_income": 1000000,
    "total_expenses": 600000,
    "net_cash_flow": 400000,
    ...
  },
  "cash_flow_by_period": [...],
  "category_breakdown": [...],
  "trend": {
    "direction": "increasing" | "decreasing" | "stable",
    ...
  }
}
```

### Test 2: With Period Comparison
```bash
curl "http://localhost:3000/api/reports/cash-flow?start_date=2025-10-01&end_date=2025-10-31&period=monthly&compare=true" | jq .
```

**Check:**
- ✅ `comparison.previous_period` exists
- ✅ Contains previous month data

### Test 3: Weekly Grouping
```bash
curl "http://localhost:3000/api/reports/cash-flow?start_date=2025-10-01&end_date=2025-10-31&period=weekly" | jq '.cash_flow_by_period'
```

**Check:**
- ✅ Data grouped by week
- ✅ Each period shows Sunday as week start

---

## 💰 Test Profit Report

### Test 1: Basic Profit Report
```bash
curl "http://localhost:3000/api/reports/profit?start_date=2025-10-01&end_date=2025-10-31" | jq .
```

**Expected Response:**
```json
{
  "summary": {
    "total_revenue": 1000000,
    "total_cogs": 400000,
    "gross_profit": 600000,
    "gross_profit_margin": 60,
    "total_operating_expenses": 200000,
    "net_profit": 400000,
    "net_profit_margin": 40,
    ...
  },
  "product_profitability": [...],
  "cogs_breakdown": [...]
}
```

**Verify Calculations:**
```
gross_profit = revenue - cogs
gross_margin = (gross_profit / revenue) × 100
net_profit = gross_profit - operating_expenses
net_margin = (net_profit / revenue) × 100
```

### Test 2: With Breakdown
```bash
curl "http://localhost:3000/api/reports/profit?start_date=2025-10-01&end_date=2025-10-31&include_breakdown=true" | jq '.product_profitability'
```

**Check:**
- ✅ Product list with profit per product
- ✅ Each product has `gross_margin` calculated
- ✅ `avg_cost_per_unit` uses WAC

### Test 3: COGS Breakdown
```bash
curl "http://localhost:3000/api/reports/profit?start_date=2025-10-01&end_date=2025-10-31" | jq '.cogs_breakdown'
```

**Check:**
- ✅ Shows ingredient costs
- ✅ Each ingredient has WAC value
- ✅ Percentage adds up to ~100%

---

## 📊 SQL Verification Queries

### Verify Cash Flow Data
```sql
-- Check income in period
SELECT 
  SUM(amount) as total_income,
  COUNT(*) as count
FROM expenses
WHERE category = 'Revenue'
  AND expense_date BETWEEN '2025-10-01' AND '2025-10-31';

-- Check expenses in period
SELECT 
  SUM(amount) as total_expenses,
  COUNT(*) as count
FROM expenses
WHERE category != 'Revenue'
  AND expense_date BETWEEN '2025-10-01' AND '2025-10-31';

-- Net cash flow
SELECT 
  (SELECT SUM(amount) FROM expenses WHERE category = 'Revenue' AND expense_date BETWEEN '2025-10-01' AND '2025-10-31') -
  (SELECT SUM(amount) FROM expenses WHERE category != 'Revenue' AND expense_date BETWEEN '2025-10-01' AND '2025-10-31')
  AS net_cash_flow;
```

### Verify Profit Data
```sql
-- Check delivered orders in period
SELECT 
  COUNT(*) as orders_count,
  SUM(total_amount) as total_revenue
FROM orders
WHERE status = 'DELIVERED'
  AND delivery_date BETWEEN '2025-10-01' AND '2025-10-31';

-- Check recipe COGS calculation
SELECT 
  r.id,
  r.name,
  SUM(ri.quantity * i.weighted_average_cost) as calculated_cogs
FROM recipes r
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
GROUP BY r.id, r.name;

-- Check operating expenses
SELECT 
  SUM(amount) as total_operating_expenses
FROM expenses
WHERE category != 'Revenue'
  AND expense_date BETWEEN '2025-10-01' AND '2025-10-31';
```

---

## ✅ Test Checklist

### Cash Flow Report
- [ ] Returns data for valid date range
- [ ] Correctly separates income vs expenses
- [ ] Net cash flow = income - expenses
- [ ] Category breakdown percentages add to 100%
- [ ] Trend direction calculated correctly
- [ ] Period grouping works (daily, weekly, monthly, yearly)
- [ ] Comparison with previous period works
- [ ] Top income/expenses lists correctly sorted

### Profit Report
- [ ] Only includes DELIVERED orders
- [ ] COGS calculated using current WAC values
- [ ] Gross profit = revenue - COGS
- [ ] Gross margin = (gross profit / revenue) × 100
- [ ] Operating expenses excluded from COGS
- [ ] Net profit = gross profit - operating expenses
- [ ] Product profitability calculated per product
- [ ] COGS breakdown by ingredient
- [ ] Top/least profitable products listed

---

## 🐛 Common Issues & Solutions

### Issue: No data returned

**Cause:** No transactions in date range

**Solution:**
```sql
-- Check if you have data
SELECT COUNT(*) FROM expenses WHERE expense_date BETWEEN '2025-10-01' AND '2025-10-31';
SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED' AND delivery_date BETWEEN '2025-10-01' AND '2025-10-31';
```

### Issue: COGS is zero in profit report

**Cause:** WAC not calculated or recipes not linked to ingredients

**Solution:**
```sql
-- Check WAC values
SELECT name, weighted_average_cost FROM ingredients;

-- Check recipe ingredients
SELECT r.name, COUNT(ri.id) as ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
GROUP BY r.id, r.name;

-- If WAC is 0, add some purchases
-- (This should trigger WAC calculation automatically)
```

### Issue: Wrong profit calculations

**Cause:** Orders not marked as DELIVERED or missing ingredients

**Solution:**
```sql
-- Check order statuses
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- Update test order to DELIVERED
UPDATE orders SET status = 'DELIVERED' WHERE order_no = 'TEST-001';
```

---

## 📈 Expected Results Example

### Sample Cash Flow Report
```json
{
  "summary": {
    "period": {
      "start": "2025-10-01",
      "end": "2025-10-31",
      "type": "daily"
    },
    "total_income": 5000000,
    "total_expenses": 3000000,
    "net_cash_flow": 2000000,
    "transaction_count": {
      "income": 25,
      "expenses": 45,
      "total": 70
    }
  },
  "trend": {
    "direction": "increasing",
    "change_percentage": 15.5,
    "average_cash_flow": 64516
  }
}
```

### Sample Profit Report
```json
{
  "summary": {
    "total_revenue": 5000000,
    "total_cogs": 2000000,
    "gross_profit": 3000000,
    "gross_profit_margin": 60,
    "total_operating_expenses": 1000000,
    "net_profit": 2000000,
    "net_profit_margin": 40,
    "orders_count": 25
  },
  "top_profitable_products": [
    {
      "product_name": "Chocolate Cake",
      "gross_profit": 500000,
      "gross_margin": 65.5,
      "avg_selling_price": 100000,
      "avg_cost_per_unit": 34500
    }
  ]
}
```

---

## 🎯 Performance Benchmarks

### Acceptable Response Times
- **Cash Flow Report**: < 500ms for 1 month daily data
- **Profit Report**: < 1000ms for 1 month with 100 orders
- **With Breakdown**: < 2000ms for detailed analysis

### If Slower
- Check database indexes
- Reduce date range
- Use monthly/yearly grouping instead of daily
- Consider caching

---

## 🔄 Testing Workflow

1. **Setup Test Data**
   ```sql
   -- Ensure you have some test data
   SELECT COUNT(*) FROM expenses;
   SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED';
   SELECT COUNT(*) FROM ingredients WHERE weighted_average_cost > 0;
   ```

2. **Test Cash Flow**
   ```bash
   # Basic test
   curl "http://localhost:3000/api/reports/cash-flow?start_date=2025-10-01&end_date=2025-10-31" | jq '.summary'
   
   # Verify calculations manually
   ```

3. **Test Profit**
   ```bash
   # Basic test
   curl "http://localhost:3000/api/reports/profit?start_date=2025-10-01&end_date=2025-10-31" | jq '.summary'
   
   # Check COGS breakdown
   curl "http://localhost:3000/api/reports/profit?start_date=2025-10-01&end_date=2025-10-31" | jq '.cogs_breakdown'
   ```

4. **Verify with SQL**
   - Run verification queries
   - Compare totals with API response

5. **Check Edge Cases**
   - Empty date range
   - Future dates
   - Single day period
   - Year-long period

---

## 📝 Next Steps

After testing API endpoints:
1. ✅ Build frontend UI for cash flow monitoring
2. ✅ Build frontend UI for profit monitoring
3. ✅ Add chart visualizations
4. ✅ Implement export to PDF/Excel
5. ✅ Add caching for performance

---

**Happy Testing! 🎉**

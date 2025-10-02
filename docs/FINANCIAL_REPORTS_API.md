# Financial Reports API Documentation

## 📊 Overview

This documentation covers two powerful financial reporting endpoints:
1. **Cash Flow Report** - Track money in/out with trend analysis
2. **Real Profit Report** - Calculate true profitability using WAC-based COGS

Both reports provide deep insights into your bakery's financial health.

---

## 📋 Table of Contents

- [Cash Flow Report](#cash-flow-report)
- [Real Profit Report](#real-profit-report)
- [Response Examples](#response-examples)
- [Calculation Formulas](#calculation-formulas)
- [Usage Examples](#usage-examples)

---

## 💰 Cash Flow Report

### Endpoint
```
GET /api/reports/cash-flow
```

### Description
Generates comprehensive cash flow analysis showing income vs expenses over time.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | string (YYYY-MM-DD) | First day of current month | Start date for report |
| `end_date` | string (YYYY-MM-DD) | Today | End date for report |
| `period` | string | `daily` | Grouping period: `daily`, `weekly`, `monthly`, `yearly` |
| `compare` | boolean | `false` | Compare with previous period |

### Response Structure

```typescript
{
  summary: {
    period: {
      start: string,           // "2025-10-01"
      end: string,             // "2025-10-31"
      type: string             // "daily"
    },
    total_income: number,      // Total revenue
    total_expenses: number,    // Total expenses
    net_cash_flow: number,     // Income - Expenses
    transaction_count: {
      income: number,
      expenses: number,
      total: number
    }
  },
  cash_flow_by_period: [{
    period: string,            // "2025-10-01"
    income: number,
    expenses: number,
    net_cash_flow: number,
    transaction_count: number
  }],
  category_breakdown: [{
    category: string,          // "Revenue", "Ingredient Purchases", etc
    total: number,
    count: number,
    percentage: number,        // % of total
    subcategories: [{
      name: string,
      total: number,
      count: number
    }]
  }],
  trend: {
    direction: string,         // "increasing" | "decreasing" | "stable"
    change_amount: number,
    change_percentage: number,
    average_cash_flow: number,
    highest_period: object,
    lowest_period: object
  },
  comparison: {               // Only if compare=true
    previous_period: {
      start: string,
      end: string,
      total_income: number,
      total_expenses: number,
      net_cash_flow: number
    }
  },
  top_income_sources: [{
    description: string,
    amount: number,
    date: string,
    category: string,
    subcategory: string
  }],
  top_expenses: [{
    description: string,
    amount: number,
    date: string,
    category: string,
    subcategory: string
  }],
  generated_at: string        // ISO timestamp
}
```

### Example Request

```bash
# Basic monthly report
GET /api/reports/cash-flow?start_date=2025-10-01&end_date=2025-10-31&period=daily

# With comparison to previous month
GET /api/reports/cash-flow?start_date=2025-10-01&end_date=2025-10-31&period=monthly&compare=true

# Yearly overview
GET /api/reports/cash-flow?start_date=2025-01-01&end_date=2025-12-31&period=yearly
```

### Key Features

✅ **Income vs Expense Tracking**
- Separate income (Revenue) from expenses
- Calculate net cash flow
- Track transaction counts

✅ **Period Grouping**
- Daily, weekly, monthly, or yearly views
- Flexible date range selection

✅ **Category Analysis**
- Breakdown by category and subcategory
- Percentage calculations
- Top income sources and expenses

✅ **Trend Analysis**
- Direction indicator (increasing/decreasing/stable)
- Change percentage
- Average cash flow
- Highest and lowest periods

✅ **Period Comparison**
- Compare with previous period
- Identify growth or decline patterns

---

## 💎 Real Profit Report

### Endpoint
```
GET /api/reports/profit
```

### Description
Calculates **real profitability** using Weighted Average Cost (WAC) for accurate COGS calculation.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | string (YYYY-MM-DD) | First day of current month | Start date for report |
| `end_date` | string (YYYY-MM-DD) | Today | End date for report |
| `period` | string | `monthly` | Grouping period: `daily`, `weekly`, `monthly`, `yearly` |
| `include_breakdown` | boolean | `false` | Include detailed product breakdown |

### Response Structure

```typescript
{
  summary: {
    period: {
      start: string,
      end: string,
      type: string
    },
    total_revenue: number,                  // Total sales revenue
    total_cogs: number,                     // Cost of Goods Sold (WAC-based)
    gross_profit: number,                   // Revenue - COGS
    gross_profit_margin: number,            // % of revenue
    total_operating_expenses: number,       // Operating costs
    net_profit: number,                     // Gross Profit - Operating Expenses
    net_profit_margin: number,              // % of revenue
    orders_count: number
  },
  profit_by_period: [{
    period: string,
    revenue: number,
    cogs: number,
    gross_profit: number,
    gross_margin: number,
    orders_count: number
  }],
  product_profitability: [{
    product_name: string,
    recipe_id: string,
    total_revenue: number,
    total_cogs: number,
    total_quantity: number,
    gross_profit: number,
    gross_margin: number,              // %
    avg_selling_price: number,
    avg_cost_per_unit: number         // WAC-based
  }],
  cogs_breakdown: [{
    ingredient_name: string,
    total_cost: number,
    total_quantity: number,
    wac: number,                      // Weighted Average Cost
    percentage: number                // % of total COGS
  }],
  operating_expenses_breakdown: [{
    category: string,
    total: number,
    count: number,
    percentage: number                // % of total operating expenses
  }],
  top_profitable_products: [...],     // Top 5 by gross profit
  least_profitable_products: [...],   // Bottom 5 by gross profit
  generated_at: string
}
```

### Example Request

```bash
# Basic monthly profit report
GET /api/reports/profit?start_date=2025-10-01&end_date=2025-10-31

# Detailed breakdown with product analysis
GET /api/reports/profit?start_date=2025-10-01&end_date=2025-10-31&include_breakdown=true

# Yearly profit analysis
GET /api/reports/profit?start_date=2025-01-01&end_date=2025-12-31&period=yearly
```

### Key Features

✅ **WAC-Based COGS Calculation**
- Uses actual Weighted Average Cost of ingredients
- Reflects real inventory costs
- Accurate product profitability

✅ **Gross Profit Analysis**
- Revenue - COGS = Gross Profit
- Gross profit margin percentage
- Trend over time

✅ **Net Profit Calculation**
- Includes operating expenses
- Real bottom-line profitability
- Net profit margin percentage

✅ **Product Profitability**
- Per-product profit analysis
- Identify best and worst performers
- Average selling price vs cost

✅ **COGS Breakdown**
- Cost breakdown by ingredient
- WAC per ingredient
- Percentage contribution to total COGS

✅ **Operating Expenses**
- Category breakdown
- Percentage of total
- Impact on net profit

---

## 📊 Calculation Formulas

### Cash Flow Calculations

```
Net Cash Flow = Total Income - Total Expenses

Change % = ((Recent - Previous) / |Previous|) * 100

Average Cash Flow = Sum(Cash Flows) / Number of Periods

Category % = (Category Amount / Total Amount) * 100
```

### Profit Calculations

```
COGS (per recipe) = Σ (Ingredient WAC × Quantity)

Gross Profit = Revenue - COGS

Gross Profit Margin = (Gross Profit / Revenue) × 100

Net Profit = Gross Profit - Operating Expenses

Net Profit Margin = (Net Profit / Revenue) × 100

Product Gross Margin = ((Revenue - COGS) / Revenue) × 100
```

### WAC (Weighted Average Cost)

```
WAC = Total Cost of Inventory / Total Quantity

Example:
- Purchase 1: 100 kg @ Rp 5,000/kg = Rp 500,000
- Purchase 2: 150 kg @ Rp 6,000/kg = Rp 900,000
- WAC = (500,000 + 900,000) / (100 + 150) = Rp 5,600/kg
```

---

## 🎯 Usage Examples

### Example 1: Monthly Cash Flow Analysis

```javascript
// Fetch October 2025 cash flow with comparison
fetch('/api/reports/cash-flow?start_date=2025-10-01&end_date=2025-10-31&period=daily&compare=true')
  .then(res => res.json())
  .then(data => {
    console.log('Total Income:', data.summary.total_income)
    console.log('Total Expenses:', data.summary.total_expenses)
    console.log('Net Cash Flow:', data.summary.net_cash_flow)
    console.log('Trend:', data.trend.direction)
    
    // Chart data
    data.cash_flow_by_period.forEach(period => {
      console.log(`${period.period}: Income ${period.income}, Expenses ${period.expenses}`)
    })
  })
```

### Example 2: Product Profitability Analysis

```javascript
// Get profit report with breakdown
fetch('/api/reports/profit?start_date=2025-10-01&end_date=2025-10-31&include_breakdown=true')
  .then(res => res.json())
  .then(data => {
    console.log('Gross Profit:', data.summary.gross_profit)
    console.log('Net Profit:', data.summary.net_profit)
    console.log('Net Margin:', data.summary.net_profit_margin + '%')
    
    // Top profitable products
    data.top_profitable_products.forEach(product => {
      console.log(`${product.product_name}: Profit ${product.gross_profit} (${product.gross_margin}%)`)
    })
    
    // COGS by ingredient
    data.cogs_breakdown.forEach(ing => {
      console.log(`${ing.ingredient_name}: ${ing.total_cost} (${ing.percentage}% of COGS)`)
    })
  })
```

### Example 3: Compare Monthly Performance

```javascript
// Compare October vs September
const octoberStart = '2025-10-01'
const octoberEnd = '2025-10-31'

Promise.all([
  fetch(`/api/reports/profit?start_date=${octoberStart}&end_date=${octoberEnd}`),
  fetch(`/api/reports/profit?start_date=2025-09-01&end_date=2025-09-30`)
]).then(async ([oct, sep]) => {
  const octoberData = await oct.json()
  const septemberData = await sep.json()
  
  const profitChange = octoberData.summary.net_profit - septemberData.summary.net_profit
  const changePercent = (profitChange / septemberData.summary.net_profit) * 100
  
  console.log(`Profit change: ${profitChange} (${changePercent.toFixed(2)}%)`)
})
```

---

## 🎨 Visualization Ideas

### Cash Flow Charts

1. **Line Chart**: Income vs Expenses over time
2. **Bar Chart**: Net cash flow by period
3. **Pie Chart**: Category breakdown
4. **Area Chart**: Cumulative cash flow trend

### Profit Charts

1. **Waterfall Chart**: Revenue → COGS → Gross Profit → Operating Expenses → Net Profit
2. **Bar Chart**: Product profitability comparison
3. **Pie Chart**: COGS breakdown by ingredient
4. **Line Chart**: Profit margins over time
5. **Scatter Plot**: Revenue vs Profit per product

---

## 🚨 Important Notes

### Data Accuracy

1. **Income tracking requires delivered orders**
   - Only `DELIVERED` orders are included
   - Income must be properly recorded in `expenses` table

2. **WAC must be up-to-date**
   - Ingredient WAC is calculated on purchases
   - Ensure all purchases are recorded
   - Use latest WAC for accurate COGS

3. **Operating expenses**
   - All non-revenue expenses are included
   - Categorize expenses properly for accurate breakdown

### Performance Considerations

1. **Date Range**
   - Larger date ranges take longer to process
   - Consider pagination for very large datasets

2. **Period Grouping**
   - Daily: Best for < 90 days
   - Weekly: Good for quarterly analysis
   - Monthly: Ideal for yearly reports
   - Yearly: For multi-year trends

3. **Caching**
   - Consider caching reports for frequently accessed periods
   - Invalidate cache when new transactions are added

---

## 📈 Business Insights

### Cash Flow Report Insights

- **Positive Trend** = Business growing, more income than expenses
- **Negative Trend** = Review expenses, increase sales
- **Category Analysis** = Identify major cost drivers
- **Seasonal Patterns** = Plan inventory and staffing

### Profit Report Insights

- **High Gross Margin** = Good pricing strategy
- **Low Gross Margin** = Review costs or increase prices
- **Product Analysis** = Focus on profitable products
- **COGS Trends** = Monitor ingredient cost changes
- **Net vs Gross Profit** = Operating efficiency indicator

---

## 🔍 Troubleshooting

### Issue: No data returned

**Check:**
1. Are there transactions in the date range?
2. Is the date format correct (YYYY-MM-DD)?
3. For profit report: Are there DELIVERED orders?

### Issue: COGS is zero

**Check:**
1. Are recipes linked to ingredients?
2. Is WAC calculated for ingredients?
3. Are ingredient purchases recorded?

### Issue: Incorrect profit calculations

**Check:**
1. Verify WAC values in ingredients table
2. Check recipe ingredient quantities
3. Ensure order items are linked to recipes
4. Verify operating expenses categorization

---

## 📚 Related Documentation

- [Ingredient Purchases & WAC](./INGREDIENT_PURCHASES_WAC.md)
- [Order Income Tracking](./ORDER_INCOME_TRACKING.md)
- [Expense Management](./EXPENSE_MANAGEMENT.md)

---

**Last Updated:** October 2025  
**API Version:** 1.0  
**Status:** Production Ready ✅

---
inclusion: always
---

# Query Optimization Guidelines

## When to Use `select('*')`

✅ **OK to use:**
- Small tables (< 10 columns)
- Truly need all fields
- Single record queries where all data is displayed
- Development/prototyping

## When to Specify Fields

🎯 **Must optimize:**
- Dashboard/stats endpoints (called frequently)
- List/pagination queries
- Tables with many columns (> 10)
- Tables with large text/JSON columns
- Only need subset of data

## Examples

### ❌ Before (Inefficient)
```typescript
// Dashboard - fetches all columns but only uses 3
const { data: orders } = await supabase
  .from('orders')
  .select('*')

const totalRevenue = orders?.reduce((sum, order) => 
  sum + order.total_amount, 0)
```

### ✅ After (Optimized)
```typescript
// Only fetch what you need
const { data: orders } = await supabase
  .from('orders')
  .select('id, total_amount, status')

const totalRevenue = orders?.reduce((sum, order) => 
  sum + order.total_amount, 0)
```

## Priority Areas to Optimize

1. **Dashboard endpoints** - Called on every page load
2. **List/pagination** - Returns many records
3. **Aggregation queries** - Only need specific fields for calculations
4. **Mobile endpoints** - Reduce payload size

## Quick Audit Command

```bash
# Find all select('*') in API routes
grep -r "select('\*')" src/app/api/
```

## Performance Impact

- **Dashboard stats**: ~70% reduction in data transfer
- **List queries**: ~40-60% reduction depending on table
- **Mobile**: Faster load times, less bandwidth

## When NOT to Optimize

- Single record detail views that show all fields
- Admin/debug endpoints
- Tables with < 5 columns
- If it adds complexity without measurable benefit

# Order Income Tracking - Quick Reference

## 🚀 Quick Start

### When is Income Created?

Income is automatically created in the `expenses` table when:

1. **Creating a new order with DELIVERED status**
   ```bash
   POST /api/orders
   { "status": "DELIVERED", "total_amount": 100000, ... }
   ```

2. **Updating order status to DELIVERED**
   ```bash
   PATCH /api/orders/{id}/status
   { "status": "DELIVERED" }
   ```

### Conditions
- ✅ Status must be (or become) `DELIVERED`
- ✅ `total_amount` must be > 0
- ✅ Must not already be `DELIVERED` (for updates)
- ✅ Order must not already have `financial_record_id` set

---

## 📊 API Response

### POST /api/orders Response
```json
{
  "id": "uuid",
  "order_no": "ORD-2025-001",
  "status": "DELIVERED",
  "total_amount": 500000,
  "financial_record_id": "uuid-of-income",
  "income_recorded": true
}
```

### PATCH /api/orders/[id]/status Response
```json
{
  "success": true,
  "order": { /* order data */ },
  "status_change": {
    "from": "READY",
    "to": "DELIVERED",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "automation": {
    "triggered": true,
    "workflows": ["order.completed", "inventory.update", "financial.record"]
  },
  "financial": {
    "income_recorded": true,
    "income_record_id": "uuid",
    "amount": 500000
  }
}
```

---

## 🔍 Quick Verification

### Check if order has income linked
```sql
SELECT order_no, status, total_amount, financial_record_id
FROM orders 
WHERE order_no = 'YOUR-ORDER-NO';
```

### View income record details
```sql
SELECT 
  e.*,
  o.order_no,
  o.status as order_status
FROM expenses e
JOIN orders o ON e.reference_id = o.id
WHERE e.reference_type = 'order' 
  AND o.order_no = 'YOUR-ORDER-NO';
```

### Count income records by month
```sql
SELECT 
  DATE_TRUNC('month', expense_date) as month,
  COUNT(*) as order_count,
  SUM(amount) as total_revenue
FROM expenses
WHERE category = 'Revenue' 
  AND subcategory = 'Order Income'
GROUP BY month
ORDER BY month DESC;
```

---

## 🐛 Troubleshooting

### Income not created?
**Check:**
1. Is `status = 'DELIVERED'`?
2. Is `total_amount > 0`?
3. Does order already have `financial_record_id`?
4. Check console logs for errors

### Find orphaned income records
```sql
SELECT e.*
FROM expenses e
LEFT JOIN orders o ON e.reference_id = o.id
WHERE e.reference_type = 'order' AND o.id IS NULL;
```

### Find orders without income
```sql
SELECT *
FROM orders
WHERE status = 'DELIVERED' 
  AND total_amount > 0 
  AND financial_record_id IS NULL;
```

---

## 📝 Income Record Structure

```json
{
  "category": "Revenue",
  "subcategory": "Order Income",
  "amount": 500000,
  "description": "Order #ORD-2025-001 - John Doe",
  "expense_date": "2025-01-15",
  "payment_method": "CASH",
  "status": "paid",
  "tags": ["order_income", "revenue", "sales"],
  "metadata": {
    "order_no": "ORD-2025-001",
    "customer_name": "John Doe",
    "customer_phone": "08123456789",
    "order_date": "2025-01-10",
    "delivery_date": "2025-01-15",
    "status_change": {
      "from": "READY",
      "to": "DELIVERED",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  },
  "reference_type": "order",
  "reference_id": "order-uuid"
}
```

---

## ✅ Test Checklist

- [ ] Create order with DELIVERED status → Income created
- [ ] Create order with PENDING status → No income
- [ ] Update PENDING → DELIVERED → Income created
- [ ] Update DELIVERED → DELIVERED → No duplicate
- [ ] Zero amount order → No income
- [ ] Failed order creation → Income rolled back
- [ ] Check `financial_record_id` is set
- [ ] Check income `reference_id` points to order
- [ ] Verify income amount matches order total
- [ ] Check metadata contains order details

---

## 📚 Full Documentation

For complete documentation, see:
- **ORDER_INCOME_TRACKING.md** - Comprehensive guide
- **IMPLEMENTATION_SUMMARY_ORDER_INCOME.md** - Implementation details

---

## 🎯 Key Points

1. **Automatic**: No manual intervention needed
2. **Safe**: Rollback on failure
3. **No Duplicates**: Checks prevent multiple income records
4. **Complete Audit**: Full order details in metadata
5. **Linked**: Bidirectional links between orders and income

---

## 💡 Common Use Cases

### 1. Get all income for a customer
```sql
SELECT e.*, o.order_no, o.customer_name
FROM expenses e
JOIN orders o ON e.reference_id = o.id
WHERE e.reference_type = 'order' 
  AND o.customer_name ILIKE '%customer%';
```

### 2. Monthly revenue report
```sql
SELECT 
  DATE_TRUNC('month', expense_date) as month,
  SUM(amount) as revenue,
  COUNT(*) as orders,
  AVG(amount) as avg_order_value
FROM expenses
WHERE category = 'Revenue' AND subcategory = 'Order Income'
GROUP BY month;
```

### 3. Revenue by payment method
```sql
SELECT 
  payment_method,
  SUM(amount) as total,
  COUNT(*) as count
FROM expenses
WHERE category = 'Revenue' AND subcategory = 'Order Income'
GROUP BY payment_method;
```

### 4. Find paid vs pending income
```sql
SELECT 
  status,
  SUM(amount) as total,
  COUNT(*) as count
FROM expenses
WHERE category = 'Revenue' AND subcategory = 'Order Income'
GROUP BY status;
```

---

## 🔐 Security Notes

- Income records use RLS (Row Level Security)
- Only authenticated users can create/view income
- Rollback mechanism prevents orphaned records
- Metadata is stored in JSONB for flexibility

---

## ⚡ Performance Tips

1. Index on `reference_type` and `reference_id`
2. Index on `category` and `subcategory`
3. Index on `expense_date` for date range queries
4. Use prepared statements for repeated queries

---

## 🎉 Success Indicators

✅ Log message: `💰 Income record created for order XXX: amount`
✅ Response includes `income_recorded: true`
✅ Order has `financial_record_id` set
✅ Income has `reference_id` pointing to order
✅ Income amount matches order total
✅ No errors in console logs

---

**Last Updated:** January 2025
**Status:** Production Ready ✅

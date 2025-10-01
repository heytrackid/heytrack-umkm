# Testing Guide - Order Income Tracking

## 🧪 How to Run Tests

### Prerequisites
1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Server should be accessible at `http://localhost:3000`

### Running the Test Suite

```bash
# Run the automated test script
node test-income-tracking.js
```

### Manual Testing with curl

#### Test 1: Create Order with DELIVERED Status
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_no": "TEST-001",
    "customer_name": "Test Customer",
    "customer_phone": "081234567890",
    "status": "DELIVERED",
    "total_amount": 150000,
    "order_date": "2025-10-01",
    "payment_status": "PAID",
    "payment_method": "CASH"
  }'
```

**Expected Result:**
- `income_recorded`: `true`
- `financial_record_id`: UUID value
- Order created with income record linked

#### Test 2: Update Order Status to DELIVERED
```bash
# First create order with PENDING status
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_no": "TEST-002",
    "customer_name": "Test Customer 2",
    "status": "PENDING",
    "total_amount": 200000,
    "order_date": "2025-10-01"
  }'

# Note the returned order ID, then update status
curl -X PATCH http://localhost:3000/api/orders/{ORDER_ID}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED",
    "notes": "Test delivery"
  }'
```

**Expected Result:**
- `financial.income_recorded`: `true`
- `financial.income_record_id`: UUID value
- `financial.amount`: 200000

## 📊 Verification with SQL

### Check Income Records
```sql
-- View all order income records
SELECT 
  e.id,
  e.amount,
  e.description,
  e.expense_date,
  e.status,
  e.metadata->>'order_no' as order_no,
  o.status as order_status,
  o.total_amount
FROM expenses e
LEFT JOIN orders o ON e.reference_id = o.id
WHERE e.category = 'Revenue' 
  AND e.subcategory = 'Order Income'
ORDER BY e.created_at DESC;
```

### Check Order-Income Links
```sql
-- Verify orders are properly linked to income
SELECT 
  o.order_no,
  o.status,
  o.total_amount,
  o.financial_record_id,
  e.id as income_id,
  e.amount as income_amount,
  e.reference_id
FROM orders o
LEFT JOIN expenses e ON o.financial_record_id = e.id
WHERE o.status = 'DELIVERED'
  AND o.total_amount > 0
ORDER BY o.created_at DESC;
```

### Find Orders Without Income
```sql
-- Find DELIVERED orders that should have income but don't
SELECT 
  order_no,
  status,
  total_amount,
  financial_record_id,
  created_at
FROM orders
WHERE status = 'DELIVERED' 
  AND total_amount > 0 
  AND financial_record_id IS NULL
ORDER BY created_at DESC;
```

### Find Orphaned Income Records
```sql
-- Find income records without valid order reference
SELECT e.*
FROM expenses e
LEFT JOIN orders o ON e.reference_id = o.id
WHERE e.reference_type = 'order' 
  AND o.id IS NULL;
```

## ✅ Test Checklist

### Test Case 1: Create Order with DELIVERED Status
- [ ] Order created successfully
- [ ] Income record created in expenses table
- [ ] `order.financial_record_id` is set
- [ ] `order.income_recorded` is `true`
- [ ] Income amount matches order total
- [ ] Income `reference_id` points to order
- [ ] Income `reference_type` is `'order'`
- [ ] Income category is `'Revenue'`
- [ ] Income subcategory is `'Order Income'`
- [ ] Income status reflects payment status

### Test Case 2: Update Order Status to DELIVERED
- [ ] Order status updated to DELIVERED
- [ ] Income record created
- [ ] `financial.income_recorded` is `true`
- [ ] `financial.income_record_id` is set
- [ ] Income metadata includes status_change object
- [ ] Response includes status_change details
- [ ] Automation workflows triggered

### Test Case 3: Update Already DELIVERED Order
- [ ] Order updated successfully
- [ ] NO new income record created
- [ ] `financial.income_recorded` is `false`
- [ ] Existing `financial_record_id` unchanged
- [ ] No duplicate income in database

### Test Case 4: Zero Amount Order
- [ ] Order created successfully
- [ ] NO income record created
- [ ] `order.income_recorded` is `false`
- [ ] `order.financial_record_id` is `null`

### Test Case 5: Rollback Test
- [ ] Try creating order with duplicate order_no
- [ ] Order creation fails
- [ ] Income record (if created) is deleted
- [ ] No orphaned income records
- [ ] Error response returned

## 🔍 Debugging Tips

### Check Server Logs
Look for these log messages:
- `💰 Income record created for order XXX: amount`
- `🔄 Order XXX: STATUS → DELIVERED`
- `Error creating income record:` (if something fails)

### Common Issues

#### Issue: Income not created
**Check:**
1. Is `total_amount > 0`?
2. Is status `DELIVERED`?
3. Check server logs for errors
4. Verify database connection

#### Issue: Duplicate income
**Check:**
1. Was status already `DELIVERED`?
2. Check if order already has `financial_record_id`
3. Run duplicate detection SQL

#### Issue: Wrong amount
**Check:**
1. Income amount should match order `total_amount`
2. Check for currency conversion issues
3. Verify database numeric precision

## 📝 Test Data Cleanup

### Delete Test Orders
```sql
DELETE FROM orders WHERE order_no LIKE 'TEST-%';
```

### Delete Test Income Records
```sql
DELETE FROM expenses 
WHERE category = 'Revenue' 
  AND subcategory = 'Order Income'
  AND description LIKE '%TEST-%';
```

## 🎯 Success Criteria

All of the following should be true:
- ✅ Income created on order creation with DELIVERED status
- ✅ Income created on status update to DELIVERED  
- ✅ No duplicate income for already DELIVERED orders
- ✅ No income for zero amount orders
- ✅ Rollback works on failure
- ✅ Orders linked to income via `financial_record_id`
- ✅ Income linked to orders via `reference_id`
- ✅ Response includes financial tracking info
- ✅ No orphaned records
- ✅ Amount matches correctly

## 📚 Related Documentation

- [ORDER_INCOME_TRACKING.md](./docs/ORDER_INCOME_TRACKING.md) - Full documentation
- [IMPLEMENTATION_SUMMARY_ORDER_INCOME.md](./docs/IMPLEMENTATION_SUMMARY_ORDER_INCOME.md) - Implementation details
- [ORDER_INCOME_QUICK_REF.md](./docs/ORDER_INCOME_QUICK_REF.md) - Quick reference guide

# Order Income Tracking Integration

## Overview

This document describes the automatic income tracking system for orders in the Bakery Management System. When an order is marked as DELIVERED (either during creation or through a status update), the system automatically creates a corresponding income record in the `expenses` table to track revenue.

## 📋 Table of Contents

- [Database Schema](#database-schema)
- [Income Record Structure](#income-record-structure)
- [API Endpoints](#api-endpoints)
- [Implementation Details](#implementation-details)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)

---

## Database Schema

### Orders Table Fields

```sql
orders (
  id UUID PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL, -- PENDING, CONFIRMED, IN_PROGRESS, READY, DELIVERED, CANCELLED
  order_date DATE NOT NULL,
  delivery_date DATE,
  delivery_time TEXT,
  total_amount NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  payment_status TEXT, -- UNPAID, PARTIAL, PAID
  payment_method TEXT, -- CASH, TRANSFER, CARD, etc.
  priority TEXT DEFAULT 'normal',
  notes TEXT,
  special_instructions TEXT,
  financial_record_id UUID REFERENCES expenses(id), -- Links to income record
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Expenses Table (Income Records)

```sql
expenses (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL, -- 'Revenue' for income
  subcategory TEXT NOT NULL, -- 'Order Income'
  amount NUMERIC NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  payment_method TEXT,
  status TEXT, -- 'paid' or 'pending'
  tags TEXT[],
  metadata JSONB,
  reference_type TEXT, -- 'order'
  reference_id UUID, -- References orders.id
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## Income Record Structure

When an order is marked as DELIVERED, the system creates an income record with the following structure:

```json
{
  "category": "Revenue",
  "subcategory": "Order Income",
  "amount": 500000, // Order total_amount
  "description": "Order #ORD-2025-001 - John Doe",
  "expense_date": "2025-01-15", // delivery_date or order_date
  "payment_method": "CASH",
  "status": "paid", // Based on payment_status
  "tags": ["order_income", "revenue", "sales"],
  "metadata": {
    "order_no": "ORD-2025-001",
    "customer_name": "John Doe",
    "customer_phone": "08123456789",
    "order_date": "2025-01-10",
    "delivery_date": "2025-01-15",
    "status_change": { // Only for status updates
      "from": "READY",
      "to": "DELIVERED",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  },
  "reference_type": "order",
  "reference_id": "uuid-of-order"
}
```

---

## API Endpoints

### 1. POST /api/orders

Creates a new order and automatically records income if status is DELIVERED.

**Request Body:**
```json
{
  "order_no": "ORD-2025-001",
  "customer_id": "uuid",
  "customer_name": "John Doe",
  "customer_phone": "08123456789",
  "status": "DELIVERED", // Must be DELIVERED to trigger income recording
  "order_date": "2025-01-10",
  "delivery_date": "2025-01-15",
  "delivery_time": "14:00",
  "total_amount": 500000,
  "discount": 50000,
  "tax_amount": 45000,
  "paid_amount": 500000,
  "payment_status": "PAID",
  "payment_method": "CASH",
  "priority": "normal",
  "notes": "Customer order",
  "special_instructions": "Gift wrap please",
  "items": [
    {
      "recipe_id": "uuid",
      "product_name": "Chocolate Cake",
      "quantity": 2,
      "unit_price": 250000,
      "total_price": 500000
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "order_no": "ORD-2025-001",
  "status": "DELIVERED",
  "total_amount": 500000,
  "financial_record_id": "uuid-of-income-record",
  "income_recorded": true,
  // ... other order fields
}
```

**Flow:**
1. If `status === 'DELIVERED'` and `total_amount > 0`:
   - Create income record in `expenses` table
   - Store income record ID
2. Create order with `financial_record_id` linking to income
3. Update income record with order's `reference_id`
4. Create order items
5. **Rollback:** If order creation fails, delete income record

---

### 2. PATCH /api/orders/[id]/status

Updates order status and creates income record when transitioning to DELIVERED.

**Request Body:**
```json
{
  "status": "DELIVERED",
  "notes": "Order completed and delivered successfully"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_no": "ORD-2025-001",
    "status": "DELIVERED",
    "financial_record_id": "uuid-of-income-record",
    // ... other fields
  },
  "status_change": {
    "from": "READY",
    "to": "DELIVERED",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "automation": {
    "triggered": true,
    "workflows": ["order.completed", "inventory.update", "financial.record", "customer.stats"]
  },
  "financial": {
    "income_recorded": true,
    "income_record_id": "uuid",
    "amount": 500000
  },
  "message": "Order status updated to DELIVERED with automatic workflow processing and income tracking"
}
```

**Flow:**
1. Fetch current order details
2. Check if status is changing to 'DELIVERED' (and wasn't already 'DELIVERED')
3. If conditions met and `total_amount > 0`:
   - Create income record in `expenses` table
   - Link income record to order
4. Update order status and set `financial_record_id`
5. Trigger automation workflows
6. **Rollback:** If order update fails, delete income record

---

## Implementation Details

### Income Recording Conditions

Income is recorded automatically when:
1. Order is created with `status = 'DELIVERED'` AND `total_amount > 0`
2. Order status is updated TO `'DELIVERED'` FROM any other status (but not already 'DELIVERED') AND `total_amount > 0`

### Income Record Fields Mapping

| Income Field | Source | Notes |
|-------------|---------|-------|
| `category` | Static | Always `'Revenue'` |
| `subcategory` | Static | Always `'Order Income'` |
| `amount` | `order.total_amount` | Total order value |
| `description` | Generated | Format: `Order #{order_no} - {customer_name}` |
| `expense_date` | `delivery_date` or `order_date` | Delivery date preferred, falls back to order date |
| `payment_method` | `order.payment_method` | Defaults to 'CASH' if null |
| `status` | Based on `payment_status` | 'paid' if payment_status is 'PAID', else 'pending' |
| `tags` | Static array | `['order_income', 'revenue', 'sales']` |
| `metadata` | Order details | Includes customer info, dates, and status change history |
| `reference_type` | Static | Always `'order'` |
| `reference_id` | `order.id` | Links back to order |

### Transaction Safety

The implementation includes rollback mechanisms:

**For POST /api/orders:**
```typescript
// If order creation fails after income record created
if (orderError && incomeRecordId) {
  await supabase.from('expenses')
    .delete()
    .eq('id', incomeRecordId)
}
```

**For PATCH /api/orders/[id]/status:**
```typescript
// If order update fails after income record created
if (updateError && incomeRecordId) {
  await supabase.from('expenses')
    .delete()
    .eq('id', incomeRecordId)
}
```

### Duplicate Prevention

- Income is only created once per order
- Status update checks: `previousStatus !== 'DELIVERED'`
- Order creation checks: `status === 'DELIVERED'`
- Orders with `financial_record_id` already set won't create duplicate income records

---

## Testing Guide

### Test Case 1: Create Order with DELIVERED Status

**Setup:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_no": "TEST-001",
    "customer_name": "Test Customer",
    "status": "DELIVERED",
    "total_amount": 100000,
    "order_date": "2025-01-15",
    "payment_status": "PAID"
  }'
```

**Expected Results:**
1. ✅ Order created successfully
2. ✅ Income record created in `expenses` table
3. ✅ `order.financial_record_id` is set
4. ✅ Income record has `reference_id` pointing to order
5. ✅ Response includes `income_recorded: true`

**Verification Query:**
```sql
-- Check order
SELECT id, order_no, status, total_amount, financial_record_id
FROM orders WHERE order_no = 'TEST-001';

-- Check income record
SELECT id, category, subcategory, amount, reference_type, reference_id
FROM expenses WHERE reference_type = 'order' AND reference_id = '{order-id}';
```

---

### Test Case 2: Update Order Status to DELIVERED

**Setup:**
```bash
# First create order with PENDING status
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_no": "TEST-002",
    "customer_name": "Test Customer 2",
    "status": "PENDING",
    "total_amount": 200000,
    "order_date": "2025-01-15"
  }'

# Then update status to DELIVERED
curl -X PATCH http://localhost:3000/api/orders/{order-id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED",
    "notes": "Order completed"
  }'
```

**Expected Results:**
1. ✅ Order status updated to DELIVERED
2. ✅ Income record created
3. ✅ `order.financial_record_id` is set
4. ✅ Response includes `financial.income_recorded: true`
5. ✅ Income metadata includes `status_change` object

---

### Test Case 3: Update Already DELIVERED Order (No Duplicate)

**Setup:**
```bash
# Update an already DELIVERED order
curl -X PATCH http://localhost:3000/api/orders/{delivered-order-id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED",
    "notes": "Re-confirming delivery"
  }'
```

**Expected Results:**
1. ✅ Order updated successfully
2. ❌ NO new income record created
3. ✅ Response includes `financial.income_recorded: false`
4. ✅ Existing `financial_record_id` remains unchanged

---

### Test Case 4: Rollback on Order Creation Failure

This test requires simulating a database constraint violation:

**Expected Behavior:**
1. Income record is created
2. Order creation fails (e.g., duplicate order_no)
3. Income record is automatically deleted (rollback)
4. Error response returned
5. No orphan income records left in database

---

### Test Case 5: Zero Amount Order (No Income)

**Setup:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_no": "TEST-003",
    "customer_name": "Free Sample",
    "status": "DELIVERED",
    "total_amount": 0,
    "order_date": "2025-01-15"
  }'
```

**Expected Results:**
1. ✅ Order created successfully
2. ❌ NO income record created (total_amount is 0)
3. ✅ `order.financial_record_id` is null
4. ✅ Response includes `income_recorded: false`

---

## Troubleshooting

### Issue: Income Record Not Created

**Possible Causes:**
1. `total_amount` is 0 or negative
2. Status is not 'DELIVERED'
3. Order already has `financial_record_id` set
4. Database permissions issue

**Solution:**
```sql
-- Check order details
SELECT status, total_amount, financial_record_id 
FROM orders WHERE order_no = 'YOUR-ORDER-NO';

-- Check expenses table permissions
SELECT * FROM expenses LIMIT 1; -- Should not error
```

---

### Issue: Duplicate Income Records

**Possible Causes:**
1. Order status updated multiple times to DELIVERED
2. Previous implementation bug created duplicates

**Solution:**
```sql
-- Find duplicate income records for an order
SELECT e.*, o.order_no, o.status
FROM expenses e
JOIN orders o ON e.reference_id = o.id
WHERE e.reference_type = 'order'
  AND o.id = 'your-order-id';

-- Clean up duplicates (keep only the earliest)
DELETE FROM expenses
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY reference_id ORDER BY created_at) as rn
    FROM expenses
    WHERE reference_type = 'order'
  ) t WHERE rn > 1
);
```

---

### Issue: Orphaned Income Records

**Possible Causes:**
1. Order deletion without cascading delete
2. Manual database manipulation

**Solution:**
```sql
-- Find orphaned income records (no matching order)
SELECT e.*
FROM expenses e
LEFT JOIN orders o ON e.reference_id = o.id
WHERE e.reference_type = 'order'
  AND o.id IS NULL;

-- Clean up orphaned records
DELETE FROM expenses
WHERE reference_type = 'order'
  AND reference_id NOT IN (SELECT id FROM orders);
```

---

### Issue: Income Amount Mismatch

**Possible Causes:**
1. Order total_amount changed after income creation
2. Manual modification

**Solution:**
```sql
-- Find mismatches
SELECT 
  o.order_no,
  o.total_amount as order_amount,
  e.amount as income_amount,
  o.total_amount - e.amount as difference
FROM orders o
JOIN expenses e ON o.financial_record_id = e.id
WHERE o.financial_record_id IS NOT NULL
  AND o.total_amount != e.amount;

-- Fix mismatches (update income to match order)
UPDATE expenses e
SET amount = o.total_amount,
    updated_at = NOW()
FROM orders o
WHERE e.id = o.financial_record_id
  AND e.amount != o.total_amount;
```

---

## Best Practices

### 1. Order Workflow
- Create orders with appropriate initial status (usually PENDING)
- Use status updates to progress orders through workflow
- Only mark as DELIVERED when actually delivered
- This ensures income is recorded at the correct time

### 2. Payment Tracking
- Set `payment_status` accurately ('PAID', 'PARTIAL', 'UNPAID')
- Income record status will reflect payment state
- Update payment_status separately if needed

### 3. Data Integrity
- Don't manually modify `financial_record_id`
- Don't delete income records directly
- Use API endpoints for all order operations
- Let the system handle income tracking automatically

### 4. Reporting
```sql
-- Monthly revenue from orders
SELECT 
  DATE_TRUNC('month', expense_date) as month,
  SUM(amount) as revenue,
  COUNT(*) as order_count
FROM expenses
WHERE category = 'Revenue' 
  AND subcategory = 'Order Income'
GROUP BY month
ORDER BY month DESC;

-- Revenue by payment method
SELECT 
  payment_method,
  SUM(amount) as revenue,
  COUNT(*) as order_count
FROM expenses
WHERE category = 'Revenue'
  AND subcategory = 'Order Income'
GROUP BY payment_method;
```

---

## Future Enhancements

### Potential Improvements:
1. **Income Adjustment**: Handle order modifications after delivery
2. **Refund Tracking**: Create negative income records for refunds
3. **Partial Deliveries**: Track income for partially delivered orders
4. **Commission Tracking**: Link income to sales staff
5. **Multi-Currency**: Support different currencies for international orders
6. **Tax Reporting**: Separate tax component in income records
7. **Recurring Orders**: Handle subscription-based income

---

## Conclusion

The order income tracking system provides:
- ✅ Automatic revenue recording
- ✅ Complete audit trail
- ✅ Financial data integrity
- ✅ Transaction safety with rollbacks
- ✅ Duplicate prevention
- ✅ Seamless integration with order workflow

This enables accurate financial reporting and real-time revenue visibility for the bakery business.

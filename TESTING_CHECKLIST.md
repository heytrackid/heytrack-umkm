# ✅ Testing Checklist - New Features

## 🧪 Manual Testing Guide

### 1. Stock Reservation System

#### Test 1.1: Reserve Stock on Order Confirmation
- [ ] Create new order with status "PENDING"
- [ ] Change order status to "CONFIRMED"
- [ ] Check `stock_reservations` table - should have new records
- [ ] Check `ingredients.reserved_stock` - should increase
- [ ] Check `inventory_availability` view - `available_stock` should decrease

**Expected SQL Results:**
```sql
-- Check reservations created
SELECT * FROM stock_reservations WHERE order_id = 'your-order-id';
-- Should show: status = 'ACTIVE', reserved_quantity > 0

-- Check ingredient stock
SELECT name, current_stock, reserved_stock, available_stock 
FROM inventory_availability 
WHERE id IN (SELECT ingredient_id FROM stock_reservations WHERE order_id = 'your-order-id');
-- Should show: reserved_stock increased, available_stock decreased
```

#### Test 1.2: Release Stock on Order Cancellation
- [ ] Take an order with status "CONFIRMED" (with reservations)
- [ ] Change order status to "CANCELLED"
- [ ] Check `stock_reservations.status` - should change to "RELEASED"
- [ ] Check `ingredients.reserved_stock` - should decrease
- [ ] Check `available_stock` - should increase back

**Expected SQL Results:**
```sql
-- Check reservations released
SELECT * FROM stock_reservations WHERE order_id = 'your-order-id';
-- Should show: status = 'RELEASED', released_at IS NOT NULL

-- Check stock restored
SELECT name, current_stock, reserved_stock, available_stock 
FROM inventory_availability;
-- Should show: reserved_stock decreased, available_stock increased
```

#### Test 1.3: Consume Stock on Order Delivery
- [ ] Take an order with status "CONFIRMED" (with reservations)
- [ ] Change order status to "DELIVERED"
- [ ] Check `stock_reservations.status` - should change to "CONSUMED"
- [ ] Check `ingredients.current_stock` - should decrease
- [ ] Check `ingredients.reserved_stock` - should decrease

**Expected SQL Results:**
```sql
-- Check reservations consumed
SELECT * FROM stock_reservations WHERE order_id = 'your-order-id';
-- Should show: status = 'CONSUMED', consumed_at IS NOT NULL

-- Check stock consumed
SELECT name, current_stock, reserved_stock, available_stock 
FROM inventory_availability;
-- Should show: current_stock decreased, reserved_stock decreased
```

#### Test 1.4: Check Order Fulfillment
- [ ] Call `StockReservationService.checkOrderFulfillment()`
- [ ] With sufficient stock - should return `can_fulfill: true`
- [ ] With insufficient stock - should return `can_fulfill: false` with details

**API Test:**
```bash
# This is internal service, test via order creation
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_no": "TEST-001",
    "status": "CONFIRMED",
    "items": [
      {
        "recipe_id": "recipe-with-low-stock",
        "quantity": 1000
      }
    ]
  }'
# Should fail or warn about insufficient stock
```

---

### 2. Production Batch Management

#### Test 2.1: Get Production Suggestions
- [ ] Create 3+ orders with status "CONFIRMED" for same recipe
- [ ] Call `GET /api/production/suggestions`
- [ ] Should return suggestion with `priority: "HIGH"`
- [ ] Should show correct `total_quantity` and `order_count`

**API Test:**
```bash
curl http://localhost:3000/api/production/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "data": [
    {
      "recipe_id": "...",
      "recipe_name": "Nasi Goreng",
      "total_quantity": 50,
      "order_count": 5,
      "estimated_cost": 500000,
      "priority": "HIGH"
    }
  ],
  "meta": {
    "total": 3,
    "high_priority": 1,
    "medium_priority": 1,
    "low_priority": 1
  }
}
```

#### Test 2.2: Create Batch from Orders
- [ ] Get order IDs from suggestions
- [ ] Call `POST /api/production/suggestions` with order_ids
- [ ] Check `productions` table - new batch created
- [ ] Check `orders.production_batch_id` - should be set
- [ ] Check `productions.total_orders` - should match order count

**API Test:**
```bash
curl -X POST http://localhost:3000/api/production/suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_ids": ["order-1", "order-2", "order-3"],
    "planned_date": "2024-11-02"
  }'

# Expected response:
{
  "success": true,
  "batch_id": "...",
  "message": "Production batch created for Nasi Goreng (50 units from 3 orders)"
}
```

**SQL Verification:**
```sql
-- Check batch created
SELECT * FROM productions WHERE id = 'batch-id';
-- Should show: batch_status = 'PLANNED', total_orders = 3

-- Check orders linked
SELECT id, order_no, production_batch_id 
FROM orders 
WHERE id IN ('order-1', 'order-2', 'order-3');
-- Should show: production_batch_id = 'batch-id'
```

#### Test 2.3: Complete Production Batch
- [ ] Call `ProductionBatchService.completeBatch()` with actual costs
- [ ] Check `productions.batch_status` - should be "COMPLETED"
- [ ] Check `productions.actual_*_cost` fields - should be set
- [ ] Check `productions.completed_time` - should be set

**SQL Test:**
```sql
-- Complete batch manually
UPDATE productions 
SET 
  batch_status = 'COMPLETED',
  actual_material_cost = 450000,
  actual_labor_cost = 100000,
  actual_overhead_cost = 50000,
  completed_time = NOW()
WHERE id = 'batch-id';

-- Verify
SELECT 
  batch_status, 
  actual_material_cost, 
  actual_labor_cost, 
  actual_overhead_cost,
  actual_total_cost,
  completed_time
FROM productions 
WHERE id = 'batch-id';
-- Should show: batch_status = 'COMPLETED', all costs set, total computed
```

---

### 3. Financial Tracking (Revenue + COGS)

#### Test 3.1: HPP Captured at Order Creation
- [ ] Create new order with items
- [ ] Check `order_items.hpp_at_order` - should be set
- [ ] Check `order_items.profit_amount` - should be computed
- [ ] Check `order_items.profit_margin` - should be computed

**SQL Verification:**
```sql
-- Check HPP captured
SELECT 
  recipe_id,
  quantity,
  unit_price,
  hpp_at_order,
  profit_amount,
  profit_margin
FROM order_items 
WHERE order_id = 'your-order-id';

-- Should show:
-- hpp_at_order = recipe.cost_per_unit (at time of order)
-- profit_amount = (unit_price - hpp_at_order) * quantity
-- profit_margin = (profit_amount / (unit_price * quantity)) * 100
```

#### Test 3.2: Income Record Created on Delivery
- [ ] Change order status to "DELIVERED"
- [ ] Check `financial_records` - should have new INCOME record
- [ ] Check `orders.financial_record_id` - should be set
- [ ] Verify amount matches `orders.total_amount`

**SQL Verification:**
```sql
-- Check income record
SELECT * FROM financial_records 
WHERE type = 'INCOME' 
  AND category = 'Revenue'
  AND reference LIKE '%your-order-no%';

-- Should show:
-- type = 'INCOME'
-- category = 'Revenue'
-- amount = order.total_amount
-- date = order.delivery_date or order.order_date
```

#### Test 3.3: COGS Record Created on Delivery
- [ ] Change order status to "DELIVERED"
- [ ] Check `financial_records` - should have new EXPENSE record with category "COGS"
- [ ] Verify amount matches sum of (hpp_at_order * quantity)
- [ ] Check profit = Revenue - COGS

**SQL Verification:**
```sql
-- Check COGS record
SELECT * FROM financial_records 
WHERE type = 'EXPENSE' 
  AND category = 'COGS'
  AND reference LIKE '%your-order-no%';

-- Should show:
-- type = 'EXPENSE'
-- category = 'COGS'
-- amount = SUM(order_items.hpp_at_order * order_items.quantity)

-- Calculate profit
SELECT 
  o.order_no,
  o.total_amount as revenue,
  SUM(oi.hpp_at_order * oi.quantity) as cogs,
  o.total_amount - SUM(oi.hpp_at_order * oi.quantity) as profit
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = 'your-order-id'
GROUP BY o.id, o.order_no, o.total_amount;
```

#### Test 3.4: API Response Includes Financial Info
- [ ] Call `PUT /api/orders/{id}/status` with status "DELIVERED"
- [ ] Response should include `financial` object
- [ ] Should show `income_recorded: true`
- [ ] Should show `cogs_recorded: true`
- [ ] Should show `revenue`, `cogs`, and `profit` amounts

**API Test:**
```bash
curl -X PUT http://localhost:3000/api/orders/your-order-id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "DELIVERED"}'

# Expected response:
{
  "success": true,
  "order": {...},
  "financial": {
    "income_recorded": true,
    "income_record_id": "...",
    "cogs_recorded": true,
    "cogs_record_id": "...",
    "revenue": 500000,
    "cogs": 250000,
    "profit": 250000
  }
}
```

---

### 4. Complete Order Lifecycle Test

#### Test 4.1: Full Flow from Creation to Delivery
- [ ] **Step 1:** Create order with status "PENDING"
  - Verify: Order created, no reservations, no financial records
  
- [ ] **Step 2:** Change status to "CONFIRMED"
  - Verify: Stock reserved, `reserved_stock` increased, `available_stock` decreased
  
- [ ] **Step 3:** Get production suggestions
  - Verify: Order appears in suggestions
  
- [ ] **Step 4:** Create production batch
  - Verify: Batch created, order linked to batch
  
- [ ] **Step 5:** Complete production
  - Verify: Batch status = COMPLETED, actual costs recorded
  
- [ ] **Step 6:** Change status to "DELIVERED"
  - Verify: 
    - Stock consumed (current_stock decreased)
    - Income record created
    - COGS record created
    - Profit calculated correctly

**SQL Verification Script:**
```sql
-- 1. Check order
SELECT * FROM orders WHERE id = 'test-order-id';

-- 2. Check reservations
SELECT * FROM stock_reservations WHERE order_id = 'test-order-id';

-- 3. Check stock levels
SELECT name, current_stock, reserved_stock, available_stock 
FROM inventory_availability;

-- 4. Check production batch
SELECT * FROM productions WHERE id = (
  SELECT production_batch_id FROM orders WHERE id = 'test-order-id'
);

-- 5. Check financial records
SELECT type, category, amount, reference 
FROM financial_records 
WHERE reference LIKE '%test-order%'
ORDER BY created_at;

-- 6. Calculate profit
SELECT 
  o.order_no,
  o.total_amount as revenue,
  SUM(oi.hpp_at_order * oi.quantity) as cogs,
  o.total_amount - SUM(oi.hpp_at_order * oi.quantity) as profit,
  ((o.total_amount - SUM(oi.hpp_at_order * oi.quantity)) / o.total_amount * 100) as profit_margin_pct
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = 'test-order-id'
GROUP BY o.id, o.order_no, o.total_amount;
```

---

### 5. Edge Cases & Error Handling

#### Test 5.1: Insufficient Stock
- [ ] Try to confirm order with quantity > available_stock
- [ ] Should log warning (non-blocking)
- [ ] Check reservation results for insufficient items

#### Test 5.2: Cancel Order After Partial Delivery
- [ ] Create order, confirm (reserve stock)
- [ ] Try to cancel after status = "DELIVERED"
- [ ] Should not allow (or handle gracefully)

#### Test 5.3: Multiple Orders Same Recipe
- [ ] Create 5 orders for same recipe
- [ ] Confirm all orders
- [ ] Check `reserved_stock` = sum of all quantities
- [ ] Create batch from all orders
- [ ] Verify batch quantity = sum of all orders

#### Test 5.4: Order Without Items
- [ ] Try to create order with empty items array
- [ ] Should handle gracefully (no reservations, no COGS)

#### Test 5.5: Recipe Without HPP
- [ ] Create order with recipe that has `cost_per_unit = null`
- [ ] Should set `hpp_at_order = 0`
- [ ] COGS should be 0
- [ ] Profit should equal revenue

---

## 🎯 Automated Test Cases (Future)

### Unit Tests
```typescript
// StockReservationService.test.ts
describe('StockReservationService', () => {
  test('reserves stock for order', async () => {
    // Test implementation
  })
  
  test('releases stock on cancellation', async () => {
    // Test implementation
  })
  
  test('consumes stock on delivery', async () => {
    // Test implementation
  })
})

// ProductionBatchService.test.ts
describe('ProductionBatchService', () => {
  test('creates batch from orders', async () => {
    // Test implementation
  })
  
  test('suggests batches by priority', async () => {
    // Test implementation
  })
})
```

### Integration Tests
```typescript
// order-lifecycle.test.ts
describe('Order Lifecycle', () => {
  test('complete flow: create → confirm → deliver', async () => {
    // 1. Create order
    // 2. Confirm order (reserve stock)
    // 3. Deliver order (consume stock, create financial records)
    // 4. Verify all side effects
  })
})
```

---

## 📊 Performance Tests

### Test 6.1: Bulk Order Creation
- [ ] Create 100 orders simultaneously
- [ ] Verify all reservations created correctly
- [ ] Check database performance (query time < 1s)

### Test 6.2: Large Batch Creation
- [ ] Create batch from 50+ orders
- [ ] Verify batch created in reasonable time (< 5s)
- [ ] Check all orders linked correctly

### Test 6.3: Stock Calculation Performance
- [ ] Query `inventory_availability` view with 1000+ ingredients
- [ ] Verify query time < 500ms
- [ ] Check computed columns are efficient

---

## ✅ Sign-Off Checklist

Before marking as complete, verify:

- [ ] All manual tests passed
- [ ] No TypeScript errors
- [ ] Database migration applied successfully
- [ ] API endpoints return expected responses
- [ ] Financial records created correctly
- [ ] Stock reservations work as expected
- [ ] Production batches link to orders
- [ ] Profit calculations are accurate
- [ ] Edge cases handled gracefully
- [ ] Performance is acceptable
- [ ] Documentation is complete

---

## 🐛 Known Issues / Limitations

1. **Stock Reservation Service** - Currently uses no-op for some methods (will be fully functional after migration)
2. **Production Batch** - Only creates batch for primary recipe (most needed), not all recipes in orders
3. **COGS Calculation** - Uses HPP at order time, not actual production cost (by design for consistency)
4. **Rollback** - Manual rollback required if errors occur mid-transaction (consider implementing transaction wrapper)

---

## 📝 Test Results Log

| Test ID | Description | Status | Date | Notes |
|---------|-------------|--------|------|-------|
| 1.1 | Reserve stock on confirmation | ⏳ Pending | - | - |
| 1.2 | Release stock on cancellation | ⏳ Pending | - | - |
| 1.3 | Consume stock on delivery | ⏳ Pending | - | - |
| 2.1 | Get production suggestions | ⏳ Pending | - | - |
| 2.2 | Create batch from orders | ⏳ Pending | - | - |
| 3.1 | HPP captured at order creation | ⏳ Pending | - | - |
| 3.2 | Income record on delivery | ⏳ Pending | - | - |
| 3.3 | COGS record on delivery | ⏳ Pending | - | - |
| 4.1 | Full lifecycle test | ⏳ Pending | - | - |

**Legend:**
- ⏳ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Partial

---

**Happy Testing! 🧪**

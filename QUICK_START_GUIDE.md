# 🚀 Quick Start Guide - New Features

## 📦 Stock Reservation System

### Automatic Reservation on Order Confirmation
```typescript
// When order status changes to CONFIRMED:
// Stock is automatically reserved

// Check available stock (considers reservations):
const { data } = await supabase
  .from('inventory_availability')
  .select('*')
  .eq('id', ingredientId)
  .single()

// Returns:
{
  current_stock: 100,
  reserved_stock: 30,
  available_stock: 70, // ← This is what you can promise
  availability_status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK'
}
```

### Manual Stock Reservation
```typescript
import { StockReservationService } from '@/services/inventory/StockReservationService'

// Reserve stock for order
const result = await StockReservationService.reserveIngredientsForOrder(
  orderId,
  userId,
  [
    { recipe_id: 'recipe-1', quantity: 10 },
    { recipe_id: 'recipe-2', quantity: 5 }
  ]
)

// Returns:
{
  order_id: '...',
  total_items: 2,
  reserved_items: 2,
  insufficient_items: [], // Items that couldn't be reserved
  can_fulfill: true
}
```

### Check Order Fulfillment Before Creating
```typescript
const check = await StockReservationService.checkOrderFulfillment([
  { recipe_id: 'recipe-1', quantity: 100 }
])

if (!check.can_fulfill) {
  console.log('Insufficient ingredients:', check.insufficient_ingredients)
  // [{ name: 'Beras', required: 100, available: 50, unit: 'kg' }]
}
```

---

## 🏭 Production Batch Management

### Get Suggested Batches
```typescript
// GET /api/production/suggestions
const response = await fetch('/api/production/suggestions')
const { data, meta } = await response.json()

// Returns batches sorted by priority:
[
  {
    recipe_id: '...',
    recipe_name: 'Nasi Goreng',
    total_quantity: 50, // Total from all orders
    order_count: 5, // Number of orders
    estimated_cost: 500000,
    priority: 'HIGH' // HIGH if urgent or 3+ orders
  }
]
```

### Create Batch from Orders
```typescript
// POST /api/production/suggestions
const response = await fetch('/api/production/suggestions', {
  method: 'POST',
  body: JSON.stringify({
    order_ids: ['order-1', 'order-2', 'order-3'],
    planned_date: '2024-11-02' // Optional
  })
})

const result = await response.json()
// {
//   success: true,
//   batch_id: '...',
//   message: 'Production batch created for Nasi Goreng (50 units from 3 orders)'
// }
```

### Complete Production Batch
```typescript
import { ProductionBatchService } from '@/services/production/ProductionBatchService'

await ProductionBatchService.completeBatch(
  batchId,
  userId,
  {
    material_cost: 450000,
    labor_cost: 100000,
    overhead_cost: 50000
  }
)

// Updates batch status to COMPLETED
// Records actual costs for analysis
```

---

## 💰 Financial Tracking (Revenue + COGS)

### Automatic on Order Delivery
```typescript
// PUT /api/orders/{id}/status
await fetch(`/api/orders/${orderId}/status`, {
  method: 'PUT',
  body: JSON.stringify({ status: 'DELIVERED' })
})

// Automatically creates:
// 1. Income Record (Revenue)
// 2. COGS Record (Cost of Goods Sold)
// 3. Calculates Profit

// Response includes:
{
  financial: {
    income_recorded: true,
    income_record_id: '...',
    cogs_recorded: true,
    cogs_record_id: '...',
    revenue: 500000,
    cogs: 250000,
    profit: 250000 // ← Actual profit!
  }
}
```

### Query Profit by Order
```typescript
const { data: orderItems } = await supabase
  .from('order_items')
  .select('quantity, unit_price, hpp_at_order, profit_amount, profit_margin')
  .eq('order_id', orderId)

// Each item shows:
{
  quantity: 10,
  unit_price: 50000,
  hpp_at_order: 25000, // HPP captured at order time
  profit_amount: 250000, // Computed: (50000 - 25000) * 10
  profit_margin: 50 // Computed: 50%
}
```

### Query Financial Records
```typescript
// Get all revenue
const { data: revenue } = await supabase
  .from('financial_records')
  .select('*')
  .eq('type', 'INCOME')
  .eq('category', 'Revenue')

// Get all COGS
const { data: cogs } = await supabase
  .from('financial_records')
  .select('*')
  .eq('type', 'EXPENSE')
  .eq('category', 'COGS')

// Calculate profit
const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0)
const totalCogs = cogs.reduce((sum, c) => sum + c.amount, 0)
const profit = totalRevenue - totalCogs
```

---

## 🔄 Complete Order Lifecycle

### 1. Create Order (Capture HPP)
```typescript
// POST /api/orders
{
  "order_no": "ORD-001",
  "status": "PENDING",
  "items": [
    {
      "recipe_id": "recipe-1",
      "quantity": 10,
      "unit_price": 50000
    }
  ]
}

// System automatically:
// - Fetches current HPP for each recipe
// - Stores hpp_at_order for profit tracking
// - Calculates expected profit
```

### 2. Confirm Order (Reserve Stock)
```typescript
// PUT /api/orders/{id}/status
{ "status": "CONFIRMED" }

// System automatically:
// - Reserves ingredients from inventory
// - Updates reserved_stock
// - Reduces available_stock
```

### 3. Create Production Batch
```typescript
// GET /api/production/suggestions
// → See which recipes need production

// POST /api/production/suggestions
{
  "order_ids": ["order-1", "order-2"],
  "planned_date": "2024-11-02"
}

// System automatically:
// - Groups orders by recipe
// - Creates production batch
// - Links orders to batch
```

### 4. Complete Production
```typescript
// Update production batch
await supabase
  .from('productions')
  .update({
    batch_status: 'COMPLETED',
    actual_material_cost: 450000,
    actual_labor_cost: 100000,
    actual_overhead_cost: 50000
  })
  .eq('id', batchId)
```

### 5. Deliver Order (Record Revenue & COGS)
```typescript
// PUT /api/orders/{id}/status
{ "status": "DELIVERED" }

// System automatically:
// - Consumes stock reservations
// - Deducts from current_stock
// - Creates Income record (Revenue)
// - Creates COGS record (Cost)
// - Calculates actual profit
```

### 6. Cancel Order (Release Stock)
```typescript
// PUT /api/orders/{id}/status
{ "status": "CANCELLED" }

// System automatically:
// - Releases stock reservations
// - Returns stock to available_stock
```

---

## 📊 Dashboard Queries

### Today's Production Schedule
```typescript
const { data: batches } = await supabase
  .from('productions')
  .select(`
    *,
    recipe:recipes(name, image_url),
    orders:orders(count)
  `)
  .eq('batch_status', 'PLANNED')
  .gte('planned_start_time', new Date().toISOString().split('T')[0])
  .order('planned_start_time')
```

### Pending Orders Needing Production
```typescript
const { data: orders } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .in('status', ['CONFIRMED', 'IN_PROGRESS'])
  .is('production_batch_id', null)
  .order('delivery_date')
```

### Low Stock Alerts (Considering Reservations)
```typescript
const { data: lowStock } = await supabase
  .from('inventory_availability')
  .select('*')
  .in('availability_status', ['LOW_STOCK', 'OUT_OF_STOCK'])
  .order('available_stock')
```

### Profit Analysis
```typescript
// Daily profit
const { data: dailyProfit } = await supabase
  .from('financial_records')
  .select('date, amount, type, category')
  .gte('date', startDate)
  .lte('date', endDate)
  .in('category', ['Revenue', 'COGS'])

// Group by date and calculate profit
const profitByDate = dailyProfit.reduce((acc, record) => {
  if (!acc[record.date]) {
    acc[record.date] = { revenue: 0, cogs: 0, profit: 0 }
  }
  if (record.category === 'Revenue') {
    acc[record.date].revenue += record.amount
  } else if (record.category === 'COGS') {
    acc[record.date].cogs += record.amount
  }
  acc[record.date].profit = acc[record.date].revenue - acc[record.date].cogs
  return acc
}, {})
```

---

## 🎯 Best Practices

### 1. Always Check Availability Before Confirming
```typescript
// Before changing status to CONFIRMED
const check = await StockReservationService.checkOrderFulfillment(orderItems)
if (!check.can_fulfill) {
  // Show warning to user
  // Suggest alternative recipes or delay delivery
}
```

### 2. Batch Similar Orders
```typescript
// Check suggestions daily
const suggestions = await fetch('/api/production/suggestions')
// Create batches for HIGH priority items
```

### 3. Track Actual vs Planned Costs
```typescript
// Compare hpp_at_order vs actual production costs
const { data: items } = await supabase
  .from('order_items')
  .select(`
    *,
    order:orders!inner(production_batch_id),
    production:productions(actual_material_cost, quantity)
  `)

// Calculate variance
items.forEach(item => {
  const plannedCost = item.hpp_at_order * item.quantity
  const actualCost = (production.actual_material_cost / production.quantity) * item.quantity
  const variance = actualCost - plannedCost
})
```

### 4. Monitor Reserved Stock
```typescript
// Alert if reserved stock is too high (indicates slow delivery)
const { data: highReservations } = await supabase
  .from('ingredients')
  .select('name, current_stock, reserved_stock, available_stock')
  .gt('reserved_stock', supabase.raw('current_stock * 0.5')) // >50% reserved
```

---

## 🐛 Troubleshooting

### Stock Not Reserving
```typescript
// Check if order status is CONFIRMED
// Check if order items exist
// Check StockReservationService logs
```

### COGS Not Created
```typescript
// Verify order status changed to DELIVERED
// Check if hpp_at_order is set on order_items
// Check financial_records table for COGS category
```

### Production Batch Not Linking
```typescript
// Verify orders don't already have production_batch_id
// Check if orders are in correct status (CONFIRMED/IN_PROGRESS)
// Verify recipe_id exists in order_items
```

---

## 📚 Related Files

- **Services:**
  - `src/services/inventory/StockReservationService.ts`
  - `src/services/production/ProductionBatchService.ts`

- **API Routes:**
  - `src/app/api/orders/route.ts`
  - `src/app/api/orders/[id]/status/route.ts`
  - `src/app/api/production/suggestions/route.ts`

- **Database:**
  - `supabase/migrations/20241031_add_stock_reservation_and_production_link.sql`

- **Types:**
  - `src/types/supabase-generated.ts`
  - `src/types/database.ts`

---

**🎉 You're all set! Start using the new features to manage your orders, production, and finances more efficiently!**

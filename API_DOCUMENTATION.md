# 📚 API Documentation - New Features

## 🎯 Overview

This document covers all new API endpoints and services added to enhance the order-production-inventory flow.

---

## 📦 Stock Reservation APIs

### Check Order Fulfillment (Internal Service)
```typescript
import { StockReservationService } from '@/services/inventory/StockReservationService'

// Check if order can be fulfilled
const result = await StockReservationService.checkOrderFulfillment([
  { recipe_id: 'recipe-1', quantity: 10 },
  { recipe_id: 'recipe-2', quantity: 5 }
])

// Response:
{
  can_fulfill: boolean
  insufficient_ingredients: Array<{
    name: string
    required: number
    available: number
    unit: string
  }>
}
```

### Reserve Stock (Internal Service)
```typescript
// Reserve ingredients for order
const result = await StockReservationService.reserveIngredientsForOrder(
  orderId,
  userId,
  [{ recipe_id: 'recipe-1', quantity: 10 }]
)

// Response:
{
  order_id: string
  total_items: number
  reserved_items: number
  insufficient_items: Array<{
    ingredient_id: string
    ingredient_name: string
    required: number
    available: number
    shortfall: number
  }>
  can_fulfill: boolean
}
```

---

## 🏭 Production Management APIs

### GET /api/production/suggestions
Get suggested production batches based on pending orders.

**Query Parameters:** None

**Response:**
```json
{
  "data": [
    {
      "recipe_id": "uuid",
      "recipe_name": "Nasi Goreng",
      "total_quantity": 50,
      "order_count": 5,
      "estimated_cost": 500000,
      "priority": "HIGH" // HIGH | MEDIUM | LOW
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

**Priority Logic:**
- `HIGH`: 3+ orders OR has urgent orders
- `MEDIUM`: 2 orders
- `LOW`: 1 order

**Example:**
```bash
curl http://localhost:3000/api/production/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### POST /api/production/suggestions
Create production batch from order IDs.

**Request Body:**
```json
{
  "order_ids": ["order-1", "order-2", "order-3"],
  "planned_date": "2024-11-02" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "batch_id": "uuid",
  "message": "Production batch created for Nasi Goreng (50 units from 3 orders)"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/production/suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_ids": ["order-1", "order-2"],
    "planned_date": "2024-11-02"
  }'
```

---

## 📊 Dashboard APIs

### GET /api/dashboard/production-schedule
Get today's production schedule, pending orders, and low stock alerts.

**Query Parameters:** None

**Response:**
```json
{
  "production_schedule": [
    {
      "id": "uuid",
      "quantity": 50,
      "batch_status": "PLANNED",
      "planned_start_time": "2024-11-01T08:00:00Z",
      "actual_start_time": null,
      "total_orders": 3,
      "recipe": {
        "id": "uuid",
        "name": "Nasi Goreng",
        "image_url": "https://...",
        "cost_per_unit": 25000
      }
    }
  ],
  "pending_orders": [
    {
      "id": "uuid",
      "order_no": "ORD-001",
      "customer_name": "John Doe",
      "delivery_date": "2024-11-02",
      "production_priority": "URGENT",
      "status": "CONFIRMED",
      "order_items": [
        {
          "recipe": {
            "name": "Nasi Goreng"
          }
        }
      ]
    }
  ],
  "low_stock_alerts": [
    {
      "id": "uuid",
      "name": "Beras",
      "current_stock": 10,
      "reserved_stock": 5,
      "available_stock": 5,
      "unit": "kg",
      "availability_status": "LOW_STOCK"
    }
  ],
  "summary": {
    "total_batches_today": 3,
    "planned_batches": 2,
    "in_progress_batches": 1,
    "completed_batches": 0,
    "pending_orders_count": 5,
    "urgent_orders": 2,
    "critical_stock_items": 1
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/dashboard/production-schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🍳 Recipe Availability APIs

### GET /api/recipes/availability
Check if a recipe can be made with current stock.

**Query Parameters:**
- `recipe_id` (required): Recipe UUID
- `quantity` (optional): Quantity to check (default: 1)

**Response:**
```json
{
  "recipe_id": "uuid",
  "recipe_name": "Nasi Goreng",
  "is_available": false,
  "max_quantity": 25,
  "missing_ingredients": [
    {
      "ingredient_id": "uuid",
      "ingredient_name": "Beras",
      "required": 100,
      "available": 50,
      "shortfall": 50,
      "unit": "kg",
      "lead_time_days": 3
    }
  ],
  "warnings": [
    "Beras is at or below reorder point (50 kg available)",
    "Beras has 3 days lead time - order soon!"
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/recipes/availability?recipe_id=uuid&quantity=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### POST /api/recipes/availability
Check multiple recipes at once.

**Request Body:**
```json
{
  "recipes": [
    { "recipe_id": "uuid-1", "quantity": 10 },
    { "recipe_id": "uuid-2", "quantity": 5 }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "recipe_id": "uuid-1",
      "recipe_name": "Nasi Goreng",
      "is_available": true,
      "max_quantity": 50,
      "missing_ingredients": [],
      "warnings": []
    },
    {
      "recipe_id": "uuid-2",
      "recipe_name": "Mie Goreng",
      "is_available": false,
      "max_quantity": 0,
      "missing_ingredients": [...],
      "warnings": [...]
    }
  ],
  "summary": {
    "total": 2,
    "available": 1,
    "unavailable": 1
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/recipes/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "recipes": [
      { "recipe_id": "uuid-1", "quantity": 10 },
      { "recipe_id": "uuid-2", "quantity": 5 }
    ]
  }'
```

---

## 📦 Inventory Management APIs

### GET /api/inventory/restock-suggestions
Get intelligent restock suggestions based on stock levels, reservations, and lead time.

**Query Parameters:** None

**Response:**
```json
{
  "data": [
    {
      "ingredient_id": "uuid",
      "ingredient_name": "Beras",
      "current_stock": 10,
      "reserved_stock": 5,
      "available_stock": 5,
      "reorder_point": 50,
      "suggested_order_quantity": 65,
      "lead_time_days": 3,
      "urgency": "CRITICAL",
      "reason": "Out of stock - cannot fulfill new orders"
    }
  ],
  "summary": {
    "total": 5,
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 1,
    "total_suggested_cost": 1500000
  }
}
```

**Urgency Levels:**
- `CRITICAL`: Out of stock (available_stock <= 0)
- `HIGH`: Very low stock (< 25% of reorder point)
- `MEDIUM`: Below reorder point (< 50% of reorder point)
- `LOW`: Approaching reorder point

**Lead Time Adjustment:**
- If lead time > 7 days, urgency is increased by one level

**Example:**
```bash
curl http://localhost:3000/api/inventory/restock-suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💰 Order Pricing APIs

### POST /api/orders/calculate-price
Calculate order price with customer discount and loyalty points.

**Request Body:**
```json
{
  "customer_id": "uuid", // Optional
  "items": [
    { "unit_price": 50000, "quantity": 10 },
    { "unit_price": 30000, "quantity": 5 }
  ],
  "delivery_fee": 10000, // Optional
  "tax_rate": 10, // Optional (percentage)
  "use_loyalty_points": 50 // Optional (points to use)
}
```

**Response:**
```json
{
  "subtotal": 650000,
  "discount_amount": 65000,
  "discount_percentage": 10,
  "tax_amount": 58500,
  "delivery_fee": 10000,
  "total_amount": 653500,
  "loyalty_points_earned": 65,
  "loyalty_points_used": 50,
  "customer_info": {
    "name": "John Doe",
    "discount_percentage": 10,
    "loyalty_points": 150
  }
}
```

**Pricing Logic:**
1. Calculate subtotal from items
2. Apply customer discount percentage
3. Apply loyalty points (1 point = Rp 1,000, max 1 point per Rp 1,000 spent)
4. Calculate tax on discounted amount
5. Add delivery fee
6. Calculate loyalty points earned (1 point per Rp 10,000 spent)

**Example:**
```bash
curl -X POST http://localhost:3000/api/orders/calculate-price \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_id": "uuid",
    "items": [
      { "unit_price": 50000, "quantity": 10 }
    ],
    "delivery_fee": 10000,
    "tax_rate": 10,
    "use_loyalty_points": 50
  }'
```

---

## 🔄 Enhanced Order APIs

### POST /api/orders
Create order with automatic HPP capture and stock reservation.

**Request Body:**
```json
{
  "order_no": "ORD-001",
  "customer_id": "uuid",
  "customer_name": "John Doe",
  "customer_phone": "08123456789",
  "status": "CONFIRMED", // Will auto-reserve stock
  "order_date": "2024-11-01",
  "delivery_date": "2024-11-02",
  "delivery_time": "14:00",
  "total_amount": 500000,
  "tax_amount": 50000,
  "delivery_fee": 10000,
  "discount": 50000,
  "payment_status": "UNPAID",
  "payment_method": "CASH",
  "notes": "Extra pedas",
  "items": [
    {
      "recipe_id": "uuid",
      "product_name": "Nasi Goreng",
      "quantity": 10,
      "unit_price": 50000,
      "total_price": 500000,
      "special_requests": "Extra pedas"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "order_no": "ORD-001",
  "customer_name": "John Doe",
  "status": "CONFIRMED",
  "total_amount": 500000,
  "created_at": "2024-11-01T10:00:00Z",
  "income_recorded": false,
  "cogs_recorded": false,
  "total_hpp": 250000,
  "profit": 250000
}
```

**Automatic Actions:**
- If status = `CONFIRMED` or `IN_PROGRESS`: Reserve stock
- If status = `DELIVERED`: Create Income + COGS records
- Always: Capture HPP at order time for profit tracking

---

### PUT /api/orders/{id}/status
Update order status with automatic workflow triggers.

**Request Body:**
```json
{
  "status": "DELIVERED",
  "notes": "Delivered successfully"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_no": "ORD-001",
    "status": "DELIVERED",
    "total_amount": 500000,
    "updated_at": "2024-11-01T15:00:00Z"
  },
  "status_change": {
    "from": "READY",
    "to": "DELIVERED",
    "timestamp": "2024-11-01T15:00:00Z"
  },
  "automation": {
    "triggered": true,
    "workflows": [
      "order.completed",
      "inventory.update",
      "financial.record",
      "customer.stats"
    ]
  },
  "financial": {
    "income_recorded": true,
    "income_record_id": "uuid",
    "cogs_recorded": true,
    "cogs_record_id": "uuid",
    "revenue": 500000,
    "cogs": 250000,
    "profit": 250000
  },
  "message": "Order status updated to DELIVERED with automatic workflow processing and income tracking"
}
```

**Automatic Actions by Status:**

| Status | Actions |
|--------|---------|
| `CONFIRMED` | Reserve stock |
| `CANCELLED` | Release stock reservations |
| `DELIVERED` | Consume stock + Create Income record + Create COGS record + Update customer loyalty |

---

## 🔍 Query Examples

### Get Available Recipes
```typescript
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'

const available = await RecipeAvailabilityService.getAvailableRecipes(userId)

// Returns:
[
  {
    recipe_id: 'uuid',
    recipe_name: 'Nasi Goreng',
    max_quantity: 50,
    cost_per_unit: 25000,
    selling_price: 50000
  }
]
```

### Calculate Order Price with Discount
```typescript
import { OrderPricingService } from '@/services/orders/OrderPricingService'

const pricing = await OrderPricingService.calculateOrderPrice(
  customerId,
  [
    { unit_price: 50000, quantity: 10 },
    { unit_price: 30000, quantity: 5 }
  ],
  {
    delivery_fee: 10000,
    tax_rate: 10,
    use_loyalty_points: 50
  }
)
```

### Update Customer Loyalty
```typescript
import { OrderPricingService } from '@/services/orders/OrderPricingService'

await OrderPricingService.updateCustomerLoyalty(
  customerId,
  65, // points earned
  50, // points used
  653500 // order amount
)
```

---

## 📊 Database Views

### inventory_availability
Real-time inventory availability considering reservations.

```sql
SELECT * FROM inventory_availability
WHERE user_id = 'your-user-id'
  AND availability_status IN ('LOW_STOCK', 'OUT_OF_STOCK');
```

**Columns:**
- `id`: Ingredient ID
- `name`: Ingredient name
- `current_stock`: Total physical stock
- `reserved_stock`: Stock reserved for orders
- `available_stock`: Stock available to promise (current - reserved)
- `min_stock`: Minimum stock level
- `reorder_point`: Reorder point
- `unit`: Unit of measurement
- `availability_status`: AVAILABLE | LOW_STOCK | BELOW_MIN | OUT_OF_STOCK
- `user_id`: User ID

---

## 🎯 Best Practices

### 1. Always Check Availability Before Confirming
```typescript
// Before confirming order
const availability = await RecipeAvailabilityService.checkMultipleRecipes(
  orderItems.map(item => ({
    recipe_id: item.recipe_id,
    quantity: item.quantity
  }))
)

const canFulfill = availability.results.every(r => r.is_available)
if (!canFulfill) {
  // Show warning or suggest alternatives
}
```

### 2. Calculate Price with Customer Discount
```typescript
// Before creating order
const pricing = await OrderPricingService.calculateOrderPrice(
  customerId,
  items,
  { delivery_fee, tax_rate, use_loyalty_points }
)

// Use pricing.total_amount for order
```

### 3. Monitor Production Schedule Daily
```typescript
// Dashboard component
const schedule = await fetch('/api/dashboard/production-schedule')
const { production_schedule, pending_orders, low_stock_alerts } = await schedule.json()

// Show alerts for:
// - Urgent orders without production batch
// - Critical stock items
// - Delayed batches
```

### 4. Check Restock Suggestions Weekly
```typescript
// Inventory management
const suggestions = await fetch('/api/inventory/restock-suggestions')
const { data } = await suggestions.json()

// Prioritize CRITICAL and HIGH urgency items
const urgent = data.filter(s => ['CRITICAL', 'HIGH'].includes(s.urgency))
```

---

## 🐛 Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error message",
  "details": {} // Optional additional details
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

**Example Error Handling:**
```typescript
try {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  })
  
  if (!response.ok) {
    const error = await response.json()
    console.error('Order creation failed:', error.error)
    // Show error to user
  }
  
  const result = await response.json()
  // Handle success
} catch (error) {
  console.error('Network error:', error)
  // Show network error to user
}
```

---

## 📚 Related Documentation

- **IMPLEMENTATION_SUMMARY.md** - Technical architecture & database changes
- **QUICK_START_GUIDE.md** - Usage examples & code snippets
- **TESTING_CHECKLIST.md** - Testing guide & verification steps

---

**🎉 Happy Coding!**

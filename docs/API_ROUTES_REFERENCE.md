# API Routes Reference

Complete reference for all API endpoints in HeyTrack.

## Authentication

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### POST /api/auth/signup
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

## Customers

### GET /api/customers
List all customers with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name, email, or phone

### POST /api/customers
Create a new customer.

**Request:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+62812345678",
  "address": "Customer Address",
  "customer_type": "retail",
  "discount_percentage": 0
}
```

### GET /api/customers/[id]
Get a single customer by ID.

### PUT /api/customers/[id]
Update a customer.

### DELETE /api/customers/[id]
Delete a customer (only if no orders exist).

## Ingredients

### GET /api/ingredients
List all ingredients.

**Query Parameters:**
- `page`, `limit`, `search`
- `category` (string): Filter by category

### POST /api/ingredients
Create a new ingredient.

**Request:**
```json
{
  "name": "Tepung Terigu",
  "category": "Bahan Kering",
  "unit": "kg",
  "current_stock": 10,
  "minimum_stock": 5,
  "price_per_unit": 12000
}
```

### GET /api/ingredients/[id]
Get a single ingredient.

### PUT /api/ingredients/[id]
Update an ingredient.

### DELETE /api/ingredients/[id]
Delete an ingredient.

### POST /api/ingredients/import
Bulk import ingredients from CSV/Excel.

## Ingredient Purchases

### GET /api/ingredient-purchases
List all ingredient purchases.

### POST /api/ingredient-purchases
Record a new ingredient purchase.

**Request:**
```json
{
  "ingredient_id": "uuid",
  "supplier_id": "uuid",
  "quantity": 10,
  "price_per_unit": 12000,
  "total_price": 120000,
  "purchase_date": "2025-11-11"
}
```

### GET /api/ingredient-purchases/[id]
Get a single purchase record.

### PUT /api/ingredient-purchases/[id]
Update a purchase record.

### DELETE /api/ingredient-purchases/[id]
Delete a purchase record.

## Recipes

### GET /api/recipes
List all recipes.

**Query Parameters:**
- `page`, `limit`, `search`
- `category` (string): Filter by category

### POST /api/recipes
Create a new recipe.

**Request:**
```json
{
  "name": "Kue Brownies",
  "category": "Kue",
  "selling_price": 50000,
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "quantity": 0.5
    }
  ]
}
```

### GET /api/recipes/[id]
Get a single recipe with ingredients.

### PUT /api/recipes/[id]
Update a recipe.

### DELETE /api/recipes/[id]
Delete a recipe.

### GET /api/recipes/[id]/pricing
Get detailed pricing breakdown for a recipe.

### GET /api/recipes/availability
Check ingredient availability for recipes.

### GET /api/recipes/optimized
Get optimized recipe list (cached, fast).

## Orders

### GET /api/orders
List all orders.

**Query Parameters:**
- `page`, `limit`, `search`
- `status` (string): Filter by status
- `start_date`, `end_date` (string): Date range filter

### POST /api/orders
Create a new order.

**Request:**
```json
{
  "customer_id": "uuid",
  "order_date": "2025-11-11",
  "delivery_date": "2025-11-12",
  "items": [
    {
      "recipe_id": "uuid",
      "quantity": 10,
      "price_per_unit": 50000
    }
  ],
  "payment_method": "cash",
  "payment_status": "paid"
}
```

### GET /api/orders/[id]
Get a single order with items.

### PUT /api/orders/[id]
Update an order.

### DELETE /api/orders/[id]
Delete an order.

### PATCH /api/orders/[id]/status
Update order status.

**Request:**
```json
{
  "status": "completed"
}
```

### POST /api/orders/calculate-price
Calculate order price before creating.

**Request:**
```json
{
  "items": [
    {
      "recipe_id": "uuid",
      "quantity": 10
    }
  ],
  "customer_id": "uuid"
}
```

### POST /api/orders/import
Bulk import orders from CSV/Excel.

## HPP (Cost of Goods Sold)

### POST /api/hpp/calculate
Calculate HPP for a recipe.

**Request:**
```json
{
  "recipe_id": "uuid",
  "quantity": 10
}
```

**Response:**
```json
{
  "recipe_id": "uuid",
  "hpp_per_unit": 25000,
  "total_hpp": 250000,
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "name": "Tepung Terigu",
      "quantity": 5,
      "cost": 60000
    }
  ]
}
```

### GET /api/hpp/calculations
List HPP calculation history.

### GET /api/hpp/overview
Get HPP overview and statistics.

### GET /api/hpp/comparison
Compare HPP across recipes or time periods.

### GET /api/hpp/recommendations
Get pricing recommendations based on HPP.

### GET /api/hpp/alerts
Get HPP alerts (high cost, low margin).

### POST /api/hpp/pricing-assistant
Get AI-powered pricing suggestions.

## Production

### GET /api/production-batches
List all production batches.

### POST /api/production-batches
Create a new production batch.

**Request:**
```json
{
  "recipe_id": "uuid",
  "quantity": 100,
  "scheduled_date": "2025-11-12",
  "status": "planned"
}
```

### GET /api/production-batches/[id]
Get a single production batch.

### PUT /api/production-batches/[id]
Update a production batch.

### DELETE /api/production-batches/[id]
Delete a production batch.

### GET /api/production/suggestions
Get production suggestions based on orders and inventory.

## Financial

### GET /api/financial/records
List all financial records.

**Query Parameters:**
- `type` (string): income, expense, operational_cost
- `start_date`, `end_date` (string): Date range

### POST /api/financial/records
Create a new financial record.

**Request:**
```json
{
  "type": "expense",
  "category": "Bahan Baku",
  "amount": 120000,
  "description": "Pembelian tepung",
  "date": "2025-11-11"
}
```

### GET /api/financial/records/[id]
Get a single financial record.

### PUT /api/financial/records/[id]
Update a financial record.

### DELETE /api/financial/records/[id]
Delete a financial record.

## Expenses

### GET /api/expenses
List all expenses.

### POST /api/expenses
Create a new expense.

### GET /api/expenses/[id]
Get a single expense.

### PUT /api/expenses/[id]
Update an expense.

### DELETE /api/expenses/[id]
Delete an expense.

## Operational Costs

### GET /api/operational-costs
List all operational costs.

### POST /api/operational-costs
Create a new operational cost.

**Request:**
```json
{
  "name": "Listrik",
  "amount": 500000,
  "frequency": "monthly",
  "category": "Utilities"
}
```

### GET /api/operational-costs/[id]
Get a single operational cost.

### PUT /api/operational-costs/[id]
Update an operational cost.

### DELETE /api/operational-costs/[id]
Delete an operational cost.

### POST /api/operational-costs/quick-setup
Quick setup for common operational costs.

## Reports

### GET /api/reports/profit
Generate profit report.

**Query Parameters:**
- `start_date`, `end_date` (string): Date range
- `group_by` (string): day, week, month

**Response:**
```json
{
  "total_revenue": 5000000,
  "total_cost": 3000000,
  "gross_profit": 2000000,
  "profit_margin": 40,
  "breakdown": [
    {
      "date": "2025-11-11",
      "revenue": 500000,
      "cost": 300000,
      "profit": 200000
    }
  ]
}
```

### GET /api/reports/cash-flow
Generate cash flow report.

**Query Parameters:**
- `start_date`, `end_date` (string): Date range

## Dashboard

### GET /api/dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "total_orders": 150,
  "total_revenue": 5000000,
  "total_customers": 50,
  "low_stock_items": 5,
  "pending_orders": 10
}
```

### GET /api/dashboard/hpp-summary
Get HPP summary for dashboard.

### GET /api/dashboard/production-schedule
Get upcoming production schedule.

## Charts

### GET /api/charts/financial-trends
Get financial trends data for charts.

**Query Parameters:**
- `start_date`, `end_date` (string): Date range
- `metric` (string): revenue, profit, expenses

### GET /api/charts/inventory-trends
Get inventory trends data for charts.

## Inventory

### GET /api/inventory/alerts
Get inventory alerts (low stock, expiring items).

### GET /api/inventory/restock-suggestions
Get restock suggestions based on usage patterns.

## Suppliers

### GET /api/suppliers
List all suppliers.

### POST /api/suppliers
Create a new supplier.

**Request:**
```json
{
  "name": "Supplier Name",
  "contact_person": "John Doe",
  "phone": "+62812345678",
  "email": "supplier@example.com",
  "address": "Supplier Address"
}
```

### GET /api/suppliers/[id]
Get a single supplier.

### PUT /api/suppliers/[id]
Update a supplier.

### DELETE /api/suppliers/[id]
Delete a supplier.

### POST /api/suppliers/import
Bulk import suppliers from CSV/Excel.

## Sales

### GET /api/sales
List all sales records.

### POST /api/sales
Create a new sales record.

### GET /api/sales/[id]
Get a single sales record.

### PUT /api/sales/[id]
Update a sales record.

### DELETE /api/sales/[id]
Delete a sales record.

## WhatsApp Templates

### GET /api/whatsapp-templates
List all WhatsApp message templates.

### POST /api/whatsapp-templates
Create a new template.

**Request:**
```json
{
  "name": "Order Confirmation",
  "template": "Halo {customer_name}, pesanan Anda #{order_number} telah dikonfirmasi.",
  "category": "order"
}
```

### GET /api/whatsapp-templates/[id]
Get a single template.

### PUT /api/whatsapp-templates/[id]
Update a template.

### DELETE /api/whatsapp-templates/[id]
Delete a template.

### POST /api/whatsapp-templates/generate-defaults
Generate default templates.

## Notifications

### GET /api/notifications
List all notifications for the current user.

### POST /api/notifications
Create a new notification.

### GET /api/notifications/[id]
Get a single notification.

### PUT /api/notifications/[id]
Mark notification as read.

### DELETE /api/notifications/[id]
Delete a notification.

### POST /api/notifications/mark-all-read
Mark all notifications as read.

### GET /api/notifications/preferences
Get notification preferences.

### PUT /api/notifications/preferences
Update notification preferences.

## AI Features

### POST /api/ai/chat-enhanced
Send a message to the AI chatbot.

**Request:**
```json
{
  "message": "Berapa HPP untuk Kue Brownies?",
  "session_id": "uuid"
}
```

### POST /api/ai/generate-recipe
Generate a recipe using AI.

**Request:**
```json
{
  "name": "Kue Coklat",
  "description": "Kue coklat lembut dengan topping kacang",
  "ingredients": ["coklat", "tepung", "telur"]
}
```

### GET /api/ai/context
Get AI context for the current user.

### GET /api/ai/suggestions
Get AI suggestions based on user data.

### GET /api/ai/sessions
List AI chat sessions.

### POST /api/ai/sessions
Create a new AI chat session.

### GET /api/ai/sessions/[id]
Get a single AI chat session.

### POST /api/ai/bootstrap
Bootstrap AI with initial data.

## Export

### POST /api/export/global
Export data to Excel/CSV.

**Request:**
```json
{
  "type": "orders",
  "format": "xlsx",
  "start_date": "2025-11-01",
  "end_date": "2025-11-30"
}
```

## Admin

### GET /api/admin/metrics
Get system metrics.

### GET /api/admin/error-logs
Get error logs.

### GET /api/admin/export-logs
Get export logs.

### GET /api/admin/performance-logs
Get performance logs.

### GET /api/admin/chatbot-analytics
Get chatbot analytics.

## Analytics

### POST /api/analytics/web-vitals
Record web vitals metrics.

### POST /api/analytics/long-tasks
Record long task metrics.

## Health & Diagnostics

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T10:00:00Z",
  "uptime": 3600
}
```

### GET /api/diagnostics
System diagnostics.

### POST /api/errors
Log client-side errors.

## Security

---

## Common Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": { ... }
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Authentication

All API routes (except `/api/auth/*` and `/api/health`) require authentication via Supabase session cookie or Bearer token.

**Headers:**
```
Authorization: Bearer <access_token>
```

Or use Supabase client which handles authentication automatically.

## Rate Limiting

API routes are protected by rate limiting:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate, constraint violation)
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0

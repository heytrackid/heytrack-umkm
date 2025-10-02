# 🔌 API Documentation

Complete API reference for Bakery Management System.

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000/api` (development)  
**Last Updated**: 2025-10-01

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Ingredients](#ingredients)
4. [Recipes](#recipes)
5. [Orders](#orders)
6. [Customers](#customers)
7. [Expenses](#expenses)
8. [Reports](#reports)
9. [AI Services](#ai-services)
10. [Settings](#settings)

---

## 🔐 Authentication

Currently using Supabase Auth. All API endpoints use service role key for admin access.

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 📊 Dashboard

### GET `/api/dashboard/stats`
Get comprehensive dashboard statistics.

**Response:**
```json
{
  "orders": {
    "total": 150,
    "pending": 12,
    "thisMonth": 45,
    "revenue": 25000000
  },
  "customers": {
    "total": 85,
    "new": 8,
    "active": 62
  },
  "ingredients": {
    "total": 45,
    "lowStock": 7,
    "outOfStock": 2
  },
  "recipes": {
    "total": 25,
    "active": 20
  }
}
```

---

## 🥖 Ingredients

### GET `/api/ingredients`
List all ingredients.

**Query Parameters:**
- `search` (string, optional): Search by name
- `category` (string, optional): Filter by category
- `low_stock` (boolean, optional): Filter low stock items

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tepung Terigu",
      "category": "flour",
      "unit": "kg",
      "current_stock": 25.5,
      "min_stock": 10,
      "weighted_average_cost": 12000,
      "total_value": 306000,
      "supplier_name": "Toko Bahan Kue",
      "last_purchase_date": "2024-01-15",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 45
}
```

### POST `/api/ingredients`
Create new ingredient.

**Request Body:**
```json
{
  "name": "Tepung Terigu Premium",
  "category": "flour",
  "unit": "kg",
  "current_stock": 50,
  "min_stock": 15,
  "weighted_average_cost": 15000,
  "supplier_name": "PT Bogasari",
  "notes": "Protein tinggi untuk roti"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tepung Terigu Premium",
    "category": "flour",
    ...
  }
}
```

### GET `/api/ingredients/[id]`
Get ingredient by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Tepung Terigu",
  "category": "flour",
  "current_stock": 25.5,
  "weighted_average_cost": 12000,
  "purchases": [
    {
      "id": "uuid",
      "quantity": 10,
      "price_per_unit": 12500,
      "total_cost": 125000,
      "purchase_date": "2024-01-15"
    }
  ],
  "stock_movements": [
    {
      "date": "2024-01-15",
      "quantity": 10,
      "type": "purchase",
      "reference": "PO-001"
    }
  ]
}
```

### PUT `/api/ingredients/[id]`
Update ingredient.

**Request Body:**
```json
{
  "name": "Tepung Terigu Premium",
  "min_stock": 20,
  "notes": "Updated notes"
}
```

### DELETE `/api/ingredients/[id]`
Delete ingredient.

**Response:**
```json
{
  "success": true,
  "message": "Ingredient deleted successfully"
}
```

### POST `/api/ingredient-purchases`
Record ingredient purchase.

**Request Body:**
```json
{
  "ingredient_id": "uuid",
  "quantity": 25,
  "price_per_unit": 12500,
  "purchase_date": "2024-01-20",
  "supplier_name": "PT Bogasari",
  "notes": "Pembelian rutin"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": {
    "id": "uuid",
    "total_cost": 312500
  },
  "ingredient_updated": {
    "new_stock": 50.5,
    "new_weighted_average_cost": 12300
  }
}
```

---

## 📖 Recipes

### GET `/api/recipes`
List all recipes.

**Query Parameters:**
- `search` (string): Search by name
- `category` (string): Filter by category

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Roti Tawar",
      "category": "bread",
      "yield_amount": 1,
      "yield_unit": "loaf",
      "cost_per_unit": 15000,
      "selling_price": 25000,
      "margin_percentage": 40,
      "ingredients_count": 8,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/recipes`
Create new recipe.

**Request Body:**
```json
{
  "name": "Roti Tawar Premium",
  "category": "bread",
  "yield_amount": 1,
  "yield_unit": "loaf",
  "selling_price": 30000,
  "description": "Roti tawar dengan mentega premium",
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "quantity": 0.5,
      "unit": "kg",
      "notes": "Tepung protein tinggi"
    },
    {
      "ingredient_id": "uuid",
      "quantity": 0.05,
      "unit": "kg",
      "notes": "Mentega premium"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "id": "uuid",
    "name": "Roti Tawar Premium",
    "cost_per_unit": 18000,
    "margin_percentage": 40
  }
}
```

### POST `/api/recipes/[id]/hpp`
Calculate HPP (COGS) for recipe.

**Response:**
```json
{
  "recipe_id": "uuid",
  "recipe_name": "Roti Tawar",
  "calculation": {
    "total_ingredient_cost": 15000,
    "overhead_cost": 2000,
    "labor_cost": 3000,
    "total_cost_per_unit": 20000,
    "selling_price": 30000,
    "profit_margin": 10000,
    "margin_percentage": 33.33
  },
  "ingredients": [
    {
      "name": "Tepung Terigu",
      "quantity": 0.5,
      "unit": "kg",
      "cost_per_unit": 12000,
      "total_cost": 6000
    }
  ]
}
```

---

## 📦 Orders

### GET `/api/orders`
List all orders.

**Query Parameters:**
- `status` (string): Filter by status (PENDING, CONFIRMED, DELIVERED, etc.)
- `customer_id` (uuid): Filter by customer
- `date_from` (date): Start date filter
- `date_to` (date): End date filter

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "order_no": "ORD-2024-001",
      "customer_id": "uuid",
      "customer_name": "John Doe",
      "customer_phone": "08123456789",
      "order_date": "2024-01-20",
      "delivery_date": "2024-01-22",
      "status": "DELIVERED",
      "payment_status": "PAID",
      "payment_method": "CASH",
      "total_amount": 150000,
      "notes": "Delivery at 10 AM",
      "financial_record_id": "uuid",
      "items": [
        {
          "recipe_id": "uuid",
          "recipe_name": "Roti Tawar",
          "quantity": 5,
          "price_per_unit": 25000,
          "subtotal": 125000
        }
      ],
      "created_at": "2024-01-20T08:00:00Z",
      "updated_at": "2024-01-22T10:30:00Z"
    }
  ],
  "count": 150
}
```

### POST `/api/orders`
Create new order.

**Request Body:**
```json
{
  "customer_id": "uuid",
  "customer_name": "Jane Smith",
  "customer_phone": "08198765432",
  "order_date": "2024-01-20",
  "delivery_date": "2024-01-22",
  "payment_method": "TRANSFER",
  "notes": "Please pack carefully",
  "items": [
    {
      "recipe_id": "uuid",
      "quantity": 3,
      "price_per_unit": 25000
    },
    {
      "recipe_id": "uuid",
      "quantity": 2,
      "price_per_unit": 35000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_no": "ORD-2024-002",
    "total_amount": 145000,
    "status": "PENDING"
  }
}
```

### PATCH `/api/orders/[id]/status`
Update order status (with auto-sync to income).

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
    "status": "DELIVERED",
    "financial_record_id": "uuid"
  },
  "status_change": {
    "from": "READY",
    "to": "DELIVERED",
    "timestamp": "2024-01-22T10:30:00Z"
  },
  "automation": {
    "triggered": true,
    "workflows": ["order.completed", "inventory.update", "financial.record"]
  },
  "financial": {
    "income_recorded": true,
    "income_record_id": "uuid",
    "amount": 150000
  },
  "message": "Order status updated to DELIVERED with automatic workflow processing and income tracking"
}
```

**Valid Status Transitions:**
- `PENDING` → `CONFIRMED`, `CANCELLED`
- `CONFIRMED` → `IN_PROGRESS`, `CANCELLED`
- `IN_PROGRESS` → `READY`, `CANCELLED`
- `READY` → `DELIVERED`, `CANCELLED`
- `DELIVERED` (final)
- `CANCELLED` (final)

---

## 👥 Customers

### GET `/api/customers`
List all customers.

**Query Parameters:**
- `search` (string): Search by name, phone, or email

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "08123456789",
      "email": "john@example.com",
      "address": "Jl. Raya No. 123",
      "total_orders": 15,
      "total_spent": 2500000,
      "last_order_date": "2024-01-20",
      "created_at": "2023-12-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/customers`
Create new customer.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "08198765432",
  "email": "jane@example.com",
  "address": "Jl. Merdeka No. 45",
  "notes": "VIP customer"
}
```

---

## 💰 Expenses

### GET `/api/expenses`
List all expenses (including revenue/income).

**Query Parameters:**
- `category` (string): Filter by category
- `date_from` (date): Start date
- `date_to` (date): End date
- `type` (string): 'income' or 'expense'

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "category": "Revenue",
      "subcategory": "Order Income",
      "amount": 150000,
      "description": "Order #ORD-2024-001 - John Doe",
      "expense_date": "2024-01-22",
      "payment_method": "CASH",
      "status": "paid",
      "reference_type": "order",
      "reference_id": "uuid",
      "tags": ["order_income", "revenue", "sales"],
      "metadata": {
        "order_no": "ORD-2024-001",
        "customer_name": "John Doe"
      },
      "created_at": "2024-01-22T10:30:00Z"
    },
    {
      "id": "uuid",
      "category": "Bahan Baku",
      "amount": 500000,
      "description": "Pembelian tepung terigu 40kg",
      "expense_date": "2024-01-20",
      "payment_method": "TRANSFER",
      "status": "paid",
      "created_at": "2024-01-20T14:00:00Z"
    }
  ]
}
```

### POST `/api/expenses`
Create expense or manual income.

**Request Body (Expense):**
```json
{
  "category": "Utilities",
  "subcategory": "Listrik",
  "amount": 500000,
  "description": "Biaya listrik bulan Januari",
  "expense_date": "2024-01-31",
  "payment_method": "TRANSFER",
  "status": "paid"
}
```

**Request Body (Manual Income):**
```json
{
  "category": "Revenue",
  "subcategory": "Pre-Order",
  "amount": 1000000,
  "description": "Pre-order untuk acara pernikahan",
  "expense_date": "2024-01-25",
  "payment_method": "TRANSFER",
  "status": "paid",
  "tags": ["pre_order", "wedding"]
}
```

### DELETE `/api/expenses/[id]`
Delete expense/income record.

**Response:**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

## 📈 Reports

### GET `/api/reports/cash-flow`
Generate cash flow report.

**Query Parameters:**
- `period` (string): 'week', 'month', 'year', 'custom'
- `start_date` (date): Required if period='custom'
- `end_date` (date): Required if period='custom'

**Response:**
```json
{
  "period": {
    "type": "month",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_income": 25000000,
    "total_expenses": 18000000,
    "net_cash_flow": 7000000,
    "income_count": 45,
    "expense_count": 120
  },
  "income": {
    "total": 25000000,
    "by_category": [
      {
        "category": "Revenue",
        "subcategory": "Order Income",
        "amount": 23000000,
        "percentage": 92,
        "count": 42
      },
      {
        "category": "Revenue",
        "subcategory": "Pre-Order",
        "amount": 2000000,
        "percentage": 8,
        "count": 3
      }
    ]
  },
  "expenses": {
    "total": 18000000,
    "by_category": [
      {
        "category": "Bahan Baku",
        "amount": 12000000,
        "percentage": 66.67,
        "count": 85
      },
      {
        "category": "Gaji Karyawan",
        "amount": 4000000,
        "percentage": 22.22,
        "count": 2
      },
      {
        "category": "Utilities",
        "amount": 2000000,
        "percentage": 11.11,
        "count": 33
      }
    ]
  },
  "transactions": [
    {
      "date": "2024-01-22",
      "description": "Order #ORD-2024-001",
      "category": "Revenue",
      "type": "income",
      "amount": 150000,
      "payment_method": "CASH"
    }
  ]
}
```

### GET `/api/reports/profit`
Generate profit report with WAC-based COGS.

**Query Parameters:**
- `period` (string): 'week', 'month', 'year', 'custom'
- `start_date` (date): Required if period='custom'
- `end_date` (date): Required if period='custom'

**Response:**
```json
{
  "period": {
    "type": "month",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "revenue": 25000000,
    "cogs": 15000000,
    "gross_profit": 10000000,
    "gross_margin_percentage": 40,
    "operating_expenses": 6000000,
    "net_profit": 4000000,
    "net_margin_percentage": 16
  },
  "product_profitability": [
    {
      "product_id": "uuid",
      "product_name": "Roti Tawar",
      "units_sold": 120,
      "revenue": 3000000,
      "cogs": 1800000,
      "gross_profit": 1200000,
      "margin_percentage": 40
    }
  ],
  "cogs_breakdown": {
    "total": 15000000,
    "by_ingredient": [
      {
        "ingredient": "Tepung Terigu",
        "quantity_used": 150,
        "unit": "kg",
        "weighted_average_cost": 12000,
        "total_cost": 1800000,
        "percentage": 12
      }
    ]
  },
  "expense_breakdown": {
    "total": 6000000,
    "by_category": [
      {
        "category": "Gaji Karyawan",
        "amount": 4000000,
        "percentage": 66.67
      },
      {
        "category": "Utilities",
        "amount": 2000000,
        "percentage": 33.33
      }
    ]
  }
}
```

---

## 🤖 AI Services

### POST `/api/ai/chat`
Chat with AI assistant.

**Request Body:**
```json
{
  "message": "Bagaimana cara meningkatkan profit margin?",
  "context": {
    "current_page": "dashboard",
    "user_data": {}
  }
}
```

**Response:**
```json
{
  "response": "Berikut beberapa cara meningkatkan profit margin...",
  "suggestions": [
    "Optimize ingredient costs",
    "Review pricing strategy",
    "Reduce waste"
  ]
}
```

### POST `/api/ai/pricing`
Get AI-powered pricing recommendations.

**Request Body:**
```json
{
  "recipe_id": "uuid"
}
```

**Response:**
```json
{
  "recipe": {
    "id": "uuid",
    "name": "Roti Tawar",
    "current_price": 25000,
    "cost_per_unit": 15000
  },
  "recommendations": {
    "suggested_price": 27500,
    "min_price": 22500,
    "max_price": 32500,
    "optimal_margin": 45,
    "reasoning": "Based on market analysis and cost structure..."
  },
  "market_comparison": {
    "average_market_price": 28000,
    "competitor_range": {
      "min": 23000,
      "max": 35000
    }
  }
}
```

### POST `/api/ai/dashboard-insights`
Get AI insights for dashboard.

**Response:**
```json
{
  "insights": [
    {
      "type": "opportunity",
      "title": "Peluang Peningkatan Revenue",
      "description": "Order bulan ini meningkat 15% dari bulan lalu",
      "action": "Tingkatkan stock untuk produk populer"
    },
    {
      "type": "warning",
      "title": "Bahan Baku Low Stock",
      "description": "7 bahan baku di bawah minimum stock",
      "action": "Segera lakukan pembelian"
    }
  ]
}
```

### POST `/api/ai/customer-insights`
Get AI insights about customers.

**Response:**
```json
{
  "insights": {
    "top_customers": [
      {
        "name": "John Doe",
        "total_spent": 2500000,
        "order_count": 15,
        "favorite_products": ["Roti Tawar", "Croissant"]
      }
    ],
    "customer_segments": [
      {
        "segment": "VIP (>2M)",
        "count": 5,
        "revenue_contribution": 40
      }
    ],
    "churn_risk": [
      {
        "customer": "Jane Smith",
        "last_order": "2023-11-15",
        "days_inactive": 77,
        "risk_level": "high"
      }
    ],
    "recommendations": [
      "Send promotional offer to inactive customers",
      "Create loyalty program for VIP customers"
    ]
  }
}
```

---

## ⚙️ Settings

### GET `/api/whatsapp-templates`
List WhatsApp message templates.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Order Confirmation",
      "category": "order",
      "content": "Halo {{customer_name}}, pesanan Anda {{order_no}} telah dikonfirmasi...",
      "variables": ["customer_name", "order_no", "delivery_date"],
      "is_active": true
    }
  ]
}
```

### POST `/api/whatsapp-templates`
Create new template.

**Request Body:**
```json
{
  "name": "Order Reminder",
  "category": "order",
  "content": "Pengingat: Pesanan {{order_no}} akan dikirim besok...",
  "variables": ["order_no", "delivery_date"],
  "is_active": true
}
```

---

## 🔄 Auto-Sync Behavior

### Order → Income Auto-Sync

When an order status is changed to `DELIVERED`:

1. **Income Record Created** in `expenses` table:
   - `category`: 'Revenue'
   - `subcategory`: 'Order Income'
   - `amount`: Order total amount
   - `expense_date`: Delivery date
   - `reference_type`: 'order'
   - `reference_id`: Order ID
   - `tags`: ['order_income', 'revenue', 'sales']

2. **Order Updated** with:
   - `financial_record_id`: Links to created income record
   - Enables tracking and prevents duplicate income creation

3. **Automation Workflows Triggered**:
   - Inventory updates
   - Customer statistics
   - Financial reconciliation

### Rollback on Failure

If order status update fails after income creation, the income record is automatically deleted to maintain data consistency.

---

## ⚠️ Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)",
  "code": "ERROR_CODE (optional)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

---

## 📝 Notes

1. **Dates**: All dates use ISO 8601 format (`YYYY-MM-DD` or full timestamp)
2. **Currency**: All amounts in IDR (Indonesian Rupiah), stored as integers
3. **UUIDs**: All IDs are UUIDs v4
4. **Pagination**: Currently not implemented, returns all records
5. **Rate Limiting**: Not implemented yet
6. **Caching**: No caching layer currently

---

## 🚀 Future Enhancements

- [ ] Add pagination for large datasets
- [ ] Implement rate limiting
- [ ] Add webhook support for real-time updates
- [ ] Implement API key authentication
- [ ] Add batch operations endpoints
- [ ] Implement GraphQL support
- [ ] Add export endpoints (PDF, CSV)

---

**End of Documentation**

For questions or support, please contact the development team.

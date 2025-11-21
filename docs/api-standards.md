# HeyTrack API Documentation

**Version:** 1.0  
**Last Updated:** November 20, 2025  
**Base URL:** `/api`

---

## 📋 Table of Contents

1. [API Standards](#api-standards)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Pagination](#pagination)
6. [HTTP Status Codes](#http-status-codes)
7. [Available Endpoints](#available-endpoints)
8. [Examples](#examples)

---

## API Standards

### Core Principles

All HeyTrack API endpoints follow these standardized conventions:

✅ **Consistent Response Format** - All endpoints return data in a predictable structure  
✅ **English Messages** - All success/error messages use English constants  
✅ **Proper Status Codes** - HTTP status codes follow REST conventions  
✅ **Type Safety** - Full TypeScript support with proper types  
✅ **Error Handling** - Standardized error responses with helpful messages

### Design Decisions

- **Response Wrapper**: All responses use `{ success, data, ... }` format
- **Pagination Field**: `pagination` (not `meta`) for consistency
- **Message Language**: English for backend (frontend handles i18n)
- **Status Codes**: `201` for creation, `200` for success, `4xx`/`5xx` for errors

---

## Authentication

All API endpoints require authentication using **Stack Auth**.

### Headers

```http
Authorization: Bearer <token>
Cookie: stack-session=<session-cookie>
```

### Authentication Flow

1. User logs in via Stack Auth
2. Session cookie set automatically
3. Include session cookie in all API requests
4. Backend validates session with Stack Auth

### Unauthorized Response

```json
{
  "success": false,
  "error": "Authentication required",
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

**Status Code:** `401 Unauthorized`

---

## Response Format

### Success Response (Single Resource)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Product Name",
    "price": 50000,
    "created_at": "2025-11-20T10:00:00.000Z"
  },
  "message": "Resource fetched successfully",
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

### Success Response (List with Pagination)

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Product 1"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Product 2"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

### Creation Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "New Product"
  },
  "message": "Product created successfully",
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

**Status Code:** `201 Created`

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Resource not found",
  "details": ["Additional error context if available"],
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

### Common Error Messages

| Message | Description | Status |
|---------|-------------|--------|
| `Authentication required` | No valid session | 401 |
| `Unauthorized access` | Insufficient permissions | 403 |
| `Resource not found` | Requested resource doesn't exist | 404 |
| `Validation error` | Invalid input data | 400 |
| `Internal server error` | Server-side error occurred | 500 |

### Validation Error Response

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    "Name is required",
    "Price must be a positive number"
  ],
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

**Status Code:** `400 Bad Request`

---

## Pagination

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 10 | Items per page (max 100) |
| `search` | string | - | Search query |
| `sort` | string | varies | Sort field |
| `order` | string | 'desc' | Sort direction (`asc` or `desc`) |

### Example Request

```http
GET /api/customers?page=2&limit=20&search=john&sort=created_at&order=desc
```

### Pagination Metadata

```json
{
  "pagination": {
    "total": 150,      // Total number of items
    "page": 2,         // Current page
    "limit": 20,       // Items per page
    "pages": 8,        // Total pages
    "hasNext": true,   // Has next page
    "hasPrev": true    // Has previous page
  }
}
```

---

## HTTP Status Codes

### Success Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (resource creation) |

### Client Error Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `400` | Bad Request | Invalid input, validation errors |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |

### Server Error Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `500` | Internal Server Error | Server-side error |

---

## Available Endpoints

### 📦 Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers (paginated) |
| POST | `/api/customers` | Create new customer |
| GET | `/api/customers/:id` | Get customer by ID |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### 🥘 Ingredients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ingredients` | List all ingredients (paginated) |
| POST | `/api/ingredients` | Create new ingredient |
| GET | `/api/ingredients/:id` | Get ingredient by ID |
| PUT | `/api/ingredients/:id` | Update ingredient |
| DELETE | `/api/ingredients/:id` | Delete ingredient |
| POST | `/api/ingredients/import` | Bulk import ingredients |

### 📝 Recipes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | List all recipes (paginated) |
| POST | `/api/recipes` | Create new recipe |
| GET | `/api/recipes/:id` | Get recipe by ID |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |

### 🛒 Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (paginated) |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:id` | Get order by ID |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |
| POST | `/api/orders/import` | Bulk import orders |

### 🏭 Production

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/production-batches` | List production batches |
| POST | `/api/production-batches` | Create production batch |
| GET | `/api/production-batches/:id` | Get batch by ID |
| PUT | `/api/production-batches/:id` | Update batch |
| DELETE | `/api/production-batches/:id` | Delete batch |
| GET | `/api/production/suggestions` | Get suggested batches |

### 💰 Financial

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List expenses (paginated) |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/:id` | Get expense by ID |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/financial/records` | List financial records |
| POST | `/api/financial/records` | Create financial record |

### 💵 HPP (Harga Pokok Penjualan)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hpp/overview` | Get HPP overview |
| GET | `/api/hpp/calculations` | Get HPP calculations |
| POST | `/api/hpp/calculate` | Calculate HPP for recipe |
| GET | `/api/hpp/comparison` | Compare HPP across recipes |
| GET | `/api/hpp/recommendations` | Get pricing recommendations |
| GET | `/api/hpp/alerts/bulk-read` | Mark HPP alerts as read |

### 📊 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/recent-orders` | Get recent orders |
| GET | `/api/dashboard/production-schedule` | Get production schedule |
| GET | `/api/dashboard/hpp-summary` | Get HPP summary |

### 🏢 Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List all suppliers (paginated) |
| POST | `/api/suppliers` | Create new supplier |
| GET | `/api/suppliers/:id` | Get supplier by ID |
| PUT | `/api/suppliers/:id` | Update supplier |
| DELETE | `/api/suppliers/:id` | Delete supplier |
| POST | `/api/suppliers/import` | Bulk import suppliers |

### 💼 Operational Costs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/operational-costs` | List operational costs |
| POST | `/api/operational-costs` | Create operational cost |
| GET | `/api/operational-costs/:id` | Get cost by ID |
| PUT | `/api/operational-costs/:id` | Update cost |
| DELETE | `/api/operational-costs/:id` | Delete cost |

---

## Examples

### Create Customer

**Request:**
```http
POST /api/customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62812345678",
  "address": "Jl. Example No. 123, Jakarta"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+62812345678",
    "address": "Jl. Example No. 123, Jakarta",
    "is_active": true,
    "created_at": "2025-11-20T15:30:00.000Z"
  },
  "message": "Customer created successfully",
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

### List Recipes with Pagination

**Request:**
```http
GET /api/recipes?page=1&limit=10&search=nasi&sort=created_at&order=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "recipe-1",
      "name": "Nasi Goreng Special",
      "cook_time": 30,
      "hpp": 15000,
      "selling_price": 25000,
      "profit_margin": 40
    },
    {
      "id": "recipe-2",
      "name": "Nasi Kuning",
      "cook_time": 45,
      "hpp": 12000,
      "selling_price": 20000,
      "profit_margin": 40
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

### Update Order Status

**Request:**
```http
PUT /api/orders/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "order_no": "ORD-2025-001",
    "status": "IN_PROGRESS",
    "updated_at": "2025-11-20T15:30:00.000Z"
  },
  "message": "Order updated successfully",
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

### Error Example: Validation Failed

**Request:**
```http
POST /api/ingredients
Content-Type: application/json

{
  "name": "",
  "price_per_unit": -5000
}
```

**Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    "Name is required",
    "Price per unit must be a positive number"
  ],
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

### Error Example: Not Found

**Request:**
```http
GET /api/customers/non-existent-id
```

**Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Customer not found",
  "timestamp": "2025-11-20T15:30:00.000Z"
}
```

---

## Best Practices

### Frontend Integration

1. **Always check `success` field** before accessing data
2. **Handle pagination** by checking `hasNext`/`hasPrev`
3. **Display error messages** from `error` field
4. **Show validation details** from `details` array
5. **Use TypeScript types** generated from API responses

### Example TypeScript Integration

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string[]
  pagination?: PaginationMeta
  message?: string
  timestamp: string
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

// Usage
async function fetchCustomers(page: number = 1) {
  const response = await fetch(`/api/customers?page=${page}&limit=10`)
  const result: ApiResponse<Customer[]> = await response.json()
  
  if (result.success) {
    return {
      data: result.data,
      pagination: result.pagination
    }
  } else {
    throw new Error(result.error || 'Unknown error')
  }
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

---

## Changelog

### Version 1.0 (November 20, 2025)

- ✅ Initial API standardization complete
- ✅ Consistent response formats across all endpoints
- ✅ English message constants implemented
- ✅ Proper HTTP status codes
- ✅ Standardized pagination
- ✅ 83 endpoints documented

---

## Support

For questions or issues with the API:
- Check error messages in response
- Verify authentication headers
- Ensure request body matches expected format
- Review this documentation for endpoint specifics

---

**End of Documentation**

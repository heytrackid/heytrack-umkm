export const runtime = 'nodejs'

import { CUSTOMER_FIELDS } from '@/lib/database/query-fields'
import { CustomerInsertSchema } from '@/lib/validations/domains/customer'
import { createApiRoute } from '@/lib/api/route-factory'
import { ListQuerySchema, createListHandler, createCreateHandler } from '@/lib/api/crud-helpers'

// GET /api/customers - List all customers with pagination, search, and sorting
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/customers',
    querySchema: ListQuerySchema,
  },
  createListHandler({
    table: 'customers',
    selectFields: CUSTOMER_FIELDS.LIST,
    defaultSort: 'name',
    defaultOrder: 'asc',
    searchFields: ['name', 'email', 'phone'],
  })
)

// POST /api/customers - Create new customer
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/customers',
    bodySchema: CustomerInsertSchema,
  },
  createCreateHandler(
    {
      table: 'customers',
      selectFields: 'id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, created_at, updated_at',
    },
    'Customer created successfully'
  )
)

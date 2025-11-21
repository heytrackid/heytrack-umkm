export const runtime = 'nodejs'

import { ListQuerySchema, createCreateHandler, createListHandler } from '@/lib/api/crud-helpers'
import { createApiRoute } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { SupplierInsertSchema } from '@/lib/validations/domains/supplier'


// GET /api/suppliers - List all suppliers with pagination, search, and sorting
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/suppliers',
    querySchema: ListQuerySchema,
  },
  createListHandler({
    table: 'suppliers',
    selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at',
    defaultSort: 'name',
    defaultOrder: 'asc',
    searchFields: ['name', 'contact_person', 'email'],
  })
)

// POST /api/suppliers - Create new supplier
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/suppliers',
    bodySchema: SupplierInsertSchema,
  },
  createCreateHandler(
    {
      table: 'suppliers',
      selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at',
    },
    SUCCESS_MESSAGES.SUPPLIER_CREATED
  )
)

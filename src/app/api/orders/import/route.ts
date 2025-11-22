// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { z } from 'zod'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { cacheInvalidation } from '@/lib/cache'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { apiLogger } from '@/lib/logger'
import { OrderImportService } from '@/services/orders/OrderImportService'
import type { NextResponse } from 'next/server'

const ImportedOrderSchema = z.object({
  order_no: z.string().min(1),
  customer_name: z.string().min(1),
  recipe_name: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().min(0),
  customer_phone: z.string().optional(),
  customer_email: z.string().email().optional(),
  customer_address: z.string().optional(),
  status: z.string(),
  delivery_date: z.string().optional(),
  notes: z.string().optional()
}).strict()

const ImportOrdersSchema = z.object({
  orders: z.array(ImportedOrderSchema).min(1, 'Minimal satu pesanan untuk import')
}).strict()

async function postHandler(context: RouteContext, _query?: never, body?: z.infer<typeof ImportOrdersSchema>): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    // Parse and validate request
    const { orders } = body

    // Create service instance and process orders
    const orderImportService = new OrderImportService(supabase)

    // Get all recipes for mapping
    const recipeMap = await orderImportService.fetchRecipes(user.id)

    // Process orders
    const result = orderImportService.processOrders(orders, recipeMap, user.id)
    const { errors, customersToCreate, ordersToCreate } = result

    // Return validation errors if any
    if (errors.length > 0) {
      return handleAPIError(new Error(`Found ${errors.length} validation errors`), 'API Route')
    }

    // Create customers and orders
    const createdOrders = await orderImportService.createCustomersAndOrders(customersToCreate, ordersToCreate, user.id)

    cacheInvalidation.orders()
    cacheInvalidation.customers()

    return createSuccessResponse({ count: createdOrders.length, data: createdOrders }, SUCCESS_MESSAGES.ORDERS_IMPORTED, undefined, 201)
  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/orders/import')
    return handleAPIError(error, 'POST /api/orders/import')
  }
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/orders/import',
    bodySchema: ImportOrdersSchema
  },
  postHandler
)
export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { NextResponse } from 'next/server'

const RecentOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional().default(5),
})

// GET /api/dashboard/recent-orders - Get recent orders
async function getRecentOrdersHandler(
  context: RouteContext,
  query?: z.infer<typeof RecentOrdersQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const { limit = 5 } = query || {}

  const { data, error } = await supabase
    .from('orders' as never)
    .select(`
      id,
      order_number,
      total_amount,
      status,
      created_at,
      customers (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/dashboard/recent-orders',
    querySchema: RecentOrdersQuerySchema,
  },
  getRecentOrdersHandler
)

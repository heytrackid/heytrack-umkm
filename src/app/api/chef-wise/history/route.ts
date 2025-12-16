import { createApiRoute } from '@/lib/api/route-factory'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10)
})

export const runtime = 'nodejs'

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/chef-wise/history',
    querySchema,
    requireAuth: true,
  },
  async (context, validatedQuery) => {
    const query = validatedQuery as z.infer<typeof querySchema>
    const { page, limit } = query
    const offset = (page - 1) * limit

    try {
      // Fetch from chefwise_generations table
      const { data: generations, error, count } = await context.supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('chefwise_generations' as any)
        .select('*', { count: 'exact' })
        .eq('user_id', context.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        // Error logging
        // eslint-disable-next-line no-console
        console.error('Error fetching chefwise history:', error)
        // Return empty data if table doesn't exist yet
        return NextResponse.json({
          success: true,
          data: {
            generations: [],
            total: 0,
            page,
            totalPages: 0
          }
        })
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return NextResponse.json({
        success: true,
        data: {
          generations: generations || [],
          total: count || 0,
          page,
          totalPages
        }
      })
    } catch (error) {
      // Error logging
      // eslint-disable-next-line no-console
      console.error('Error in chefwise history:', error)
      return NextResponse.json({
        success: false,
        error: 'Gagal mengambil riwayat generate resep'
      }, { status: 500 })
    }
  }
)

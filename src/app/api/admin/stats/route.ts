export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/admin/auth'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createClient } from '@/utils/supabase/server'

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/admin/stats',
    requireAuth: true
  },
  async (_context: RouteContext) => {
    await requireAdmin()

    const supabase = await createClient()

    // Get total counts - use user_profiles instead of users
    const [
      { count: totalUsers },
      { count: totalOrders },
      { count: totalRecipes },
      { count: totalIngredients },
      { count: totalCustomers }
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('recipes').select('*', { count: 'exact', head: true }),
      supabase.from('ingredients').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true })
    ])

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      { count: newOrders },
      { count: newRecipes },
      { count: newCustomers }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('recipes').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('customers').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString())
    ])

    return NextResponse.json({
      totals: {
        users: totalUsers || 0,
        orders: totalOrders || 0,
        recipes: totalRecipes || 0,
        ingredients: totalIngredients || 0,
        customers: totalCustomers || 0
      },
      recentActivity: {
        newOrders: newOrders || 0,
        newRecipes: newRecipes || 0,
        newCustomers: newCustomers || 0
      }
    })
  }
)

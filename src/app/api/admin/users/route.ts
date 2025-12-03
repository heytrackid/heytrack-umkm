export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/admin/auth'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createClient } from '@/utils/supabase/server'

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/admin/users',
    requireAuth: true
  },
  async (_context: RouteContext) => {
    await requireAdmin()

    const supabase = await createClient()

    // Use user_profiles table instead of users
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ success: false, error: `Failed to fetch users: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, users: users || [] })
  }
)

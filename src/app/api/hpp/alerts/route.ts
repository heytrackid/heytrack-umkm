import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
// GET /api/hpp/alerts - List HPP alerts with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get('unread_only') === 'true'
        const recipeId = searchParams.get('recipe_id')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')

        const supabase = createServerSupabaseAdmin()

        // Build query
        let query = supabase
            .from('hpp_alerts')
            .select('*, resep(nama)', { count: 'exact' })
            .eq('is_dismissed', false)
            .order('created_at', { ascending: false })

        // Apply filters
        if (unreadOnly) {
            query = query.eq('is_read', false)
        }

        if (recipeId) {
            query = query.eq('recipe_id', recipeId)
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data: alerts, error, count } = await query

        if (error) {
            apiLogger.error({ error: error }, 'Error fetching alerts:')
            return NextResponse.json(
                { error: 'Failed to fetch alerts', details: error.message },
                { status: 500 }
            )
        }

        // Get unread count
        const { count: unreadCount, error: unreadError } = await supabase
            .from('hpp_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .eq('is_dismissed', false)

        if (unreadError) {
            apiLogger.error({ error: unreadError }, 'Error fetching unread count:')
        }

        return NextResponse.json({
            success: true,
            data: alerts || [],
            meta: {
                total: count || 0,
                unread_count: unreadCount || 0,
                limit,
                offset
            }
        })

    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in alerts endpoint:')
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

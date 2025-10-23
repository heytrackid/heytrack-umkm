import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/hpp/alerts/:id/read - Mark alert as read
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: alertId } = await params

        if (!alertId) {
            return NextResponse.json(
                { error: 'Missing alert ID' },
                { status: 400 }
            )
        }

        const supabase = createServerSupabaseAdmin()

        // Update alert to mark as read
        const { data: alert, error } = await supabase
            .from('hpp_alerts')
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', alertId)
            .select()
            .single()

        if (error) {
            console.error('Error marking alert as read:', error)
            return NextResponse.json(
                { error: 'Failed to mark alert as read', details: error.message },
                { status: 500 }
            )
        }

        if (!alert) {
            return NextResponse.json(
                { error: 'Alert not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: alert
        })

    } catch (error: any) {
        console.error('Error in mark alert as read endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

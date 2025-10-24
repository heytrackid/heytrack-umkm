import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import type { HPPAlertsTable } from '@/types'

// POST /api/hpp/alerts/:id/dismiss - Dismiss alert
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

        // Update alert to mark as dismissed
        const updateData: HPPAlertsTable['Update'] = {
            is_dismissed: true,
            dismissed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        
        const { data: alert, error } = await supabase
            .from('hpp_alerts')
            .update(updateData)
            .eq('id', alertId)
            .select()
            .single()

        if (error) {
            console.error('Error dismissing alert:', error)
            return NextResponse.json(
                { error: 'Failed to dismiss alert', details: error.message },
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
        console.error('Error in dismiss alert endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

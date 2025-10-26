import { createServiceRoleClient } from '@/utils/supabase'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import type { HPPAlertsTable } from '@/types'
import { getErrorMessage } from '@/lib/type-guards'
import { apiLogger } from '@/lib/logger'
// POST /api/hpp/alerts/:id/read - Mark alert as read
export async function POST(
    _request: NextRequest,
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

        const supabase = createServiceRoleClient()

        // Update alert to mark as read
        const updateData: HPPAlertsTable['Update'] = {
            is_read: true,
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        
        const { data: alert, error } = await supabase
            .from('hpp_alerts')
            .update(updateData)
            .eq('id', alertId)
            .select()
            .single()

        if (error) {
            apiLogger.error({ error: error }, 'Error marking alert as read:')
            return NextResponse.json(
                { error: 'Failed to mark alert as read', details: (error as any).message },
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

    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in mark alert as read endpoint:')
        return NextResponse.json(
            { error: 'Internal server error', details: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

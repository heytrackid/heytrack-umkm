import { archiveOldHPPSnapshots } from '@/lib/cron-jobs'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Cron endpoint for HPP data archival
 * Should be called monthly on the 1st at 02:00
 * 
 * Vercel Cron configuration:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/hpp-archive",
 *     "schedule": "0 2 1 * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
    try {
        // Verify the request is from Vercel Cron or authorized source
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.log('🗄️ [CRON] Starting HPP data archival...')

        const result = await archiveOldHPPSnapshots()

        console.log('✅ [CRON] HPP data archival complete', result)

        return NextResponse.json({
            success: true,
            data: result
        })

    } catch (error: any) {
        console.error('❌ [CRON] Error in HPP data archival:', error)
        return NextResponse.json(
            { error: 'HPP data archival failed', details: error.message },
            { status: 500 }
        )
    }
}

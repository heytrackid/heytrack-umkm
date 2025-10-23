import { createDailyHPPSnapshots } from '@/lib/cron-jobs'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Cron endpoint for daily HPP snapshot creation
 * Should be called daily at 00:00
 * 
 * Vercel Cron configuration:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/hpp-snapshots",
 *     "schedule": "0 0 * * *"
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

        console.log('🕐 [CRON] Starting daily HPP snapshot creation...')

        const result = await createDailyHPPSnapshots()

        console.log('✅ [CRON] Daily HPP snapshot creation complete', result)

        return NextResponse.json({
            success: true,
            data: result
        })

    } catch (error: any) {
        console.error('❌ [CRON] Error in HPP snapshot creation:', error)
        return NextResponse.json(
            { error: 'HPP snapshot creation failed', details: error.message },
            { status: 500 }
        )
    }
}

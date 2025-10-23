import { detectHPPAlertsForAllUsers } from '@/lib/cron-jobs'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Cron endpoint for HPP alert detection
 * Should be called every 6 hours
 * 
 * Vercel Cron configuration:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/hpp-alerts",
 *     "schedule": "0 star-slash-6 star star star"
 *   }]
 * }
 * Replace star-slash with the actual characters
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

        console.log('🔔 [CRON] Starting HPP alert detection...')

        const result = await detectHPPAlertsForAllUsers()

        console.log('✅ [CRON] HPP alert detection complete', result)

        return NextResponse.json({
            success: true,
            data: result
        })

    } catch (error: any) {
        console.error('❌ [CRON] Error in HPP alert detection:', error)
        return NextResponse.json(
            { error: 'HPP alert detection failed', details: error.message },
            { status: 500 }
        )
    }
}

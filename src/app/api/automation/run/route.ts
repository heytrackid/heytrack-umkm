import { NextResponse } from 'next/server'
import { cronJobs } from '@/lib/cron-jobs'

import { apiLogger } from '@/lib/logger'
/**
 * API Endpoint to manually trigger automation tasks
 * 
 * POST /api/automation/run
 * Body: { task: 'reorder' | 'notifications' | 'engine' | 'all' }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { task = 'all' } = body

    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      task,
      status: 'success'
    }

    switch (task) {
      case 'reorder':
        apiLogger.info('📋 Running auto reorder check...')
        results.reorder = await cronJobs.checkInventoryReorder()
        break

      case 'notifications':
        apiLogger.info('🔔 Processing smart notifications...')
        results.notifications = await cronJobs.processSmartNotifications()
        break

      case 'engine':
        apiLogger.info('⚙️ Running automation engine...')
        await cronJobs.runAutomationEngine()
        results.engine = { status: 'completed' }
        break

      case 'cleanup':
        apiLogger.info('🧹 Cleaning up old notifications...')
        await cronJobs.cleanupOldNotifications()
        results.cleanup = { status: 'completed' }
        break

      case 'all':
        apiLogger.info('🚀 Running all automation tasks...')
        results.reorder = await cronJobs.checkInventoryReorder()
        results.notifications = await cronJobs.processSmartNotifications()
        await cronJobs.runAutomationEngine()
        results.engine = { status: 'completed' }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid task. Use: reorder, notifications, engine, cleanup, or all' },
          { status: 400 }
        )
    }

    apiLogger.info({ params: task }, '✅ Automation task completed:')

    return NextResponse.json(results)
  } catch (error: unknown) {
    apiLogger.error({ error: error }, '❌ Error running automation:')
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to run automation', message: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Get automation status
 * 
 * GET /api/automation/run
 */
export async function GET() {
  try {
    const status = await cronJobs.getAutomationStatus()

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      automation: status,
      available_tasks: [
        'reorder - Check inventory reorder needs',
        'notifications - Process smart notifications',
        'engine - Run automation engine',
        'cleanup - Clean up old notifications',
        'all - Run all tasks'
      ]
    })
  } catch (error: unknown) {
    apiLogger.error({ error: error }, '❌ Error getting automation status:')
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to get automation status', message: errorMessage },
      { status: 500 }
    )
  }
}

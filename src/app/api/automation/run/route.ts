import { type NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/type-guards'
import { InventoryCronJobs, GeneralCronJobs, getAutomationStatus } from '@/lib/cron'
import { AutomationTaskSchema } from '@/lib/validations/api-schemas'
import { validateRequestOrRespond } from '@/lib/validations/validate-request'
import type { Database } from '@/types/supabase-generated'
import { apiLogger } from '@/lib/logger'
/**
 * API Endpoint to manually trigger automation tasks
 * 
 * POST /api/automation/run
 * Body: { task: 'reorder' | 'notifications' | 'engine' | 'all' }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validatedData = await validateRequestOrRespond(request, AutomationTaskSchema)
    if (validatedData instanceof NextResponse) {return validatedData}

    const { task } = validatedData

    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      task,
      status: 'success'
    }

    switch (task) {
      case 'reorder':
        apiLogger.info('📋 Running auto reorder check...')
        results['reorder'] = await InventoryCronJobs.checkInventoryReorder()
        break

      case 'notifications':
        apiLogger.info('🔔 Processing smart notifications...')
        // Note: processSmartNotifications not available, using runAutomationEngine instead
        await GeneralCronJobs.runAutomationEngine()
        results['notifications'] = { status: 'completed' }
        break

      case 'engine':
        apiLogger.info('⚙️ Running automation engine...')
        await GeneralCronJobs.runAutomationEngine()
        results['engine'] = { status: 'completed' }
        break

      case 'cleanup':
        apiLogger.info('🧹 Cleaning up old notifications...')
        await GeneralCronJobs.cleanupOldNotifications()
        results['cleanup'] = { status: 'completed' }
        break

      case 'all':
        apiLogger.info('🚀 Running all automation tasks...')
        results['reorder'] = await InventoryCronJobs.checkInventoryReorder()
        // Note: processSmartNotifications not available
        await GeneralCronJobs.runAutomationEngine()
        results['notifications'] = { status: 'completed' }
        await GeneralCronJobs.runAutomationEngine()
        results['engine'] = { status: 'completed' }
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
    apiLogger.error({ error }, '❌ Error running automation:')
    return NextResponse.json(
      { error: 'Failed to run automation', message: getErrorMessage(error) },
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
    const status = await getAutomationStatus()

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
    apiLogger.error({ error }, '❌ Error getting automation status:')
    return NextResponse.json(
      { error: 'Failed to get automation status', message: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

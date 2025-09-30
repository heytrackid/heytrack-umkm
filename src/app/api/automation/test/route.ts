import { NextRequest, NextResponse } from 'next/server'
import { triggerWorkflow } from '@/lib/automation-engine'
import { smartNotificationSystem } from '@/lib/smart-notifications'
import { generateProductionSchedule } from '@/lib/production-automation'

// POST /api/automation/test - Test automation workflows
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType, data } = body

    console.log(`🧪 Testing automation workflow: ${testType}`)

    const results = []

    switch (testType) {
      case 'order_completion':
        results.push(await testOrderCompletionWorkflow(data))
        break
      
      case 'inventory_automation':
        results.push(await testInventoryAutomation(data))
        break
      
      case 'smart_notifications':
        results.push(await testSmartNotifications(data))
        break
      
      case 'production_planning':
        results.push(await testProductionPlanning(data))
        break
      
      case 'full_integration':
        const fullTest = await testFullIntegration(data)
        results.push(...fullTest)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      testType,
      results,
      summary: generateTestSummary(results),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in automation testing:', error)
    return NextResponse.json(
      { error: 'Test execution failed', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/automation/test - Get automation system status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeMetrics = searchParams.get('includeMetrics') === 'true'

    const status = {
      workflowAutomation: {
        enabled: true,
        eventQueue: 'Active',
        lastProcessed: new Date().toISOString()
      },
      smartNotifications: {
        enabled: true,
        totalNotifications: smartNotificationSystem.getNotifications().length,
        unreadCount: smartNotificationSystem.getUnreadCount(),
        summary: smartNotificationSystem.getSummary()
      },
      productionPlanning: {
        enabled: true,
        activeSchedules: 'Available',
        lastGenerated: new Date().toISOString()
      }
    }

    // Include detailed metrics if requested
    if (includeMetrics) {
      status.detailedMetrics = {
        notifications: smartNotificationSystem.getNotifications(),
        // Add more metrics as needed
      }
    }

    return NextResponse.json({
      status: 'healthy',
      automation: status,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })

  } catch (error) {
    console.error('Error getting automation status:', error)
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    )
  }
}

// Test Functions

async function testOrderCompletionWorkflow(data: any) {
  console.log('🧪 Testing order completion workflow...')
  
  try {
    // Test order data
    const testOrderId = data.orderId || 'test_order_' + Date.now()
    
    // Trigger order completion workflow
    await triggerWorkflow('order.completed', testOrderId, {
      order: {
        id: testOrderId,
        order_no: 'ORD-TEST-001',
        total_amount: 150000,
        customer_id: 'test_customer'
      }
    })

    return {
      test: 'order_completion',
      status: 'passed',
      message: 'Order completion workflow triggered successfully',
      orderId: testOrderId,
      automationTriggered: true
    }
  } catch (error) {
    return {
      test: 'order_completion',
      status: 'failed',
      message: error.message,
      automationTriggered: false
    }
  }
}

async function testInventoryAutomation(data: any) {
  console.log('🧪 Testing inventory automation...')
  
  try {
    // Test low stock scenario
    const testIngredient = {
      id: 'test_ingredient_' + Date.now(),
      name: 'Test Ingredient',
      current_stock: 5,
      min_stock: 20,
      unit: 'kg'
    }

    // Trigger low stock event
    await triggerWorkflow('inventory.low_stock', testIngredient.id, {
      ingredient: testIngredient,
      currentStock: testIngredient.current_stock,
      minStock: testIngredient.min_stock,
      severity: 'critical'
    })

    return {
      test: 'inventory_automation',
      status: 'passed',
      message: 'Low stock automation triggered successfully',
      ingredient: testIngredient.name,
      automationTriggered: true
    }
  } catch (error) {
    return {
      test: 'inventory_automation',
      status: 'failed',
      message: error.message,
      automationTriggered: false
    }
  }
}

async function testSmartNotifications(data: any) {
  console.log('🧪 Testing smart notifications...')
  
  try {
    // Test different types of notifications
    const testNotifications = [
      {
        type: 'warning',
        category: 'inventory',
        priority: 'high',
        title: 'Test Stock Alert',
        message: 'This is a test notification for inventory management'
      },
      {
        type: 'info',
        category: 'financial',
        priority: 'medium',
        title: 'Test Financial Alert',
        message: 'This is a test notification for financial metrics'
      },
      {
        type: 'success',
        category: 'orders',
        priority: 'low',
        title: 'Test Order Update',
        message: 'This is a test notification for order updates'
      }
    ]

    const addedNotifications = []
    for (const notification of testNotifications) {
      const added = smartNotificationSystem.addNotification(notification)
      addedNotifications.push(added.id)
    }

    // Test notification summary
    const summary = smartNotificationSystem.getSummary()

    return {
      test: 'smart_notifications',
      status: 'passed',
      message: 'Smart notifications system working correctly',
      notificationsAdded: addedNotifications.length,
      summary,
      totalNotifications: smartNotificationSystem.getNotifications().length
    }
  } catch (error) {
    return {
      test: 'smart_notifications',
      status: 'failed',
      message: error.message
    }
  }
}

async function testProductionPlanning(data: any) {
  console.log('🧪 Testing production planning...')
  
  try {
    // Test data for production planning
    const testOrders = []
    const testIngredients = []
    const testRecipes = []

    // Generate production schedule with empty test data
    const schedules = await generateProductionSchedule(testOrders, testIngredients, testRecipes)

    return {
      test: 'production_planning',
      status: 'passed',
      message: 'Production planning system working correctly',
      schedulesGenerated: schedules.length,
      totalTasks: schedules.reduce((sum, schedule) => sum + schedule.tasks.length, 0),
      schedules: schedules.map(s => ({
        id: s.id,
        date: s.date,
        tasksCount: s.tasks.length,
        totalDuration: s.totalDuration,
        workloadPercent: s.workloadPercent
      }))
    }
  } catch (error) {
    return {
      test: 'production_planning',
      status: 'failed',
      message: error.message
    }
  }
}

async function testFullIntegration(data: any) {
  console.log('🧪 Testing full integration workflow...')
  
  const results = []

  try {
    // 1. Test order completion flow
    console.log('1. Testing order completion...')
    const orderResult = await testOrderCompletionWorkflow({
      orderId: 'integration_test_' + Date.now()
    })
    results.push(orderResult)

    // 2. Test inventory automation
    console.log('2. Testing inventory automation...')
    const inventoryResult = await testInventoryAutomation({})
    results.push(inventoryResult)

    // 3. Test notifications
    console.log('3. Testing smart notifications...')
    const notificationResult = await testSmartNotifications({})
    results.push(notificationResult)

    // 4. Test production planning
    console.log('4. Testing production planning...')
    const productionResult = await testProductionPlanning({})
    results.push(productionResult)

    // 5. Test business metrics processing
    console.log('5. Testing business metrics processing...')
    await smartNotificationSystem.processBusinessMetrics({
      inventory: [
        { id: '1', name: 'Test Ingredient', current_stock: 5, min_stock: 20, unit: 'kg' }
      ],
      orders: [
        { id: '1', status: 'CONFIRMED', delivery_date: new Date().toISOString() }
      ],
      financial: {
        metrics: {
          grossMargin: 15, // Low margin to trigger alert
          netProfit: 100000,
          revenue: 500000,
          inventoryValue: 200000
        }
      }
    })

    results.push({
      test: 'business_metrics_processing',
      status: 'passed',
      message: 'Business metrics processed and notifications generated',
      notificationsCount: smartNotificationSystem.getNotifications().length
    })

  } catch (error) {
    results.push({
      test: 'full_integration',
      status: 'failed',
      message: error.message
    })
  }

  return results
}

function generateTestSummary(results: any[]) {
  const passed = results.filter(r => r.status === 'passed').length
  const failed = results.filter(r => r.status === 'failed').length
  const total = results.length

  return {
    total,
    passed,
    failed,
    successRate: total > 0 ? (passed / total * 100).toFixed(1) + '%' : '0%',
    overallStatus: failed === 0 ? 'all_passed' : 'some_failed'
  }
}
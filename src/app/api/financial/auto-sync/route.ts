import { NextRequest, NextResponse } from 'next/server'
import { autoSyncFinancialService } from '@/lib/services/AutoSyncFinancialService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.ge"Placeholder"
    
    switch (action) {
      case 'status':
        const status = await autoSyncFinancialService.getSyncStatus()
        return NextResponse.json({ success: true, data: status })
        
      case 'recent-transactions':
        const limit = parseIn""
        const recentTransactions = await autoSyncFinancialService.getRecentSyncedTransactions(limit)
        return NextResponse.json({ success: true, data: recentTransactions })
        
      case 'recommendations':
        const recommendations = await autoSyncFinancialService.getSyncRecommendations()
        return NextResponse.json({ success: true, data: recommendations })
        
      case 'cashflow-summary':
        const days = parseIn""
        const cashflowSummary = await autoSyncFinancialService.getCashflowSummary(days)
        return NextResponse.json({ success: true, data: cashflowSummary })
        
      default:
        // Default: return comprehensive sync overview
        const [
          syncStatus,
          recentSynced,
          syncRecommendations,
          cashflow
        ] = await Promise.all([
          autoSyncFinancialService.getSyncStatus(),
          autoSyncFinancialService.getRecentSyncedTransactions(10),
          autoSyncFinancialService.getSyncRecommendations(),
          autoSyncFinancialService.getCashflowSummary(30)
        ])
        
        return NextResponse.json({
          success: true,
          data: {
            status: syncStatus,
            recentTransactions: recentSynced,
            recommendations: syncRecommendations,
            cashflow
          }
        })
    }
  } catch (error) {
    console.error('Error in auto-sync API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, transactionId } = body
    
    switch (action) {
      case 'manual-sync':
        if (!transactionId) {
          return NextResponse.json(
            { success: false, error: 'Transaction ID required' },
            { status: 400 }
          )
        }
        
        const syncResult = await autoSyncFinancialService.manualSyncStockTransaction(transactionId)
        
        return NextResponse.json({
          success: true,
          data: {
            synced: syncResult,
            message: syncResult 
              ? 'Transaction synced successfully' 
              : 'Transaction sync failed or already synced'
          }
        })
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in auto-sync POST API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
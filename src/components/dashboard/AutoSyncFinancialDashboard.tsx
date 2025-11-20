import dynamic from 'next/dynamic'
import { createLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
const logger = createLogger('AutoSyncFinancialDashboard')

interface SyncStatus {
  isEnabled: boolean
  lastSyncTime?: string
  totalSynced: number
  totalErrors: number
  syncHealth: 'error' | 'healthy' | 'warning'
}

interface SyncedTransaction {
  id: string
  transactionId: string
  type: string
  amount: number
  syncedAt: string
  source: string
  reference: string
}

interface SyncRecommendations {
  recommendations: string[]
  missingSync: number
  healthScore: number
}

interface CashflowSummary {
  totalExpenses: number
  totalIncome: number
  netCashflow: number
  expenseBreakdown: Record<string, number>
  recentTransactions: Array<{
    date: string
    description: string
    amount: number
    type: 'EXPENSE' | 'INCOME'
    category: string
  }>
}

interface AutoSyncData {
  status: SyncStatus
  recentTransactions: SyncedTransaction[]
  recommendations: SyncRecommendations
  cashflow: CashflowSummary
}

// Server-side data fetching langsung dari database
async function fetchAutoSyncData(): Promise<{ success: boolean; data?: AutoSyncData | null; error?: string } | null> {
  const logger = createLogger('AutoSyncFinancialDashboard')
  try {
    const supabase = await createClient()

    // Ambil data financial records terbaru
    const { data: financialRecords, error: financialError } = await supabase
      .from('financial_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (financialError) {
      throw new Error(`Failed to fetch financial records: ${financialError.message}`)
    }

    // Ambil data orders untuk hitung sync status
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_no, status, total_amount, financial_record_id, created_at, delivery_date')
      .order('created_at', { ascending: false })
      .limit(100)

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`)
    }

    // Hitung status sync
    const totalOrders = orders?.length ?? 0
    const syncedOrders = orders?.filter(o => o.financial_record_id).length ?? 0
    const totalErrors = totalOrders - syncedOrders
    const syncRatio = totalOrders > 0 ? syncedOrders / totalOrders : 1
    const syncHealth: 'error' | 'healthy' | 'warning' =
      syncRatio > 0.95 ? 'healthy' :
      syncRatio > 0.8 ? 'warning' : 'error'

    // Hitung cashflow summary
    const totalIncome = financialRecords?.filter(r => r.type === 'INCOME').reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0
    const totalExpenses = financialRecords?.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0
    const netCashflow = totalIncome - totalExpenses

    // Expense breakdown by category
    const expenseBreakdown: Record<string, number> = {}
    financialRecords?.filter(r => r.type === 'EXPENSE').forEach(record => {
      const category = record.category ?? 'Other'
      expenseBreakdown[category] = (expenseBreakdown[category] ?? 0) + (record.amount ?? 0)
    })

    // Recent transactions untuk cashflow
    const recentTransactions = financialRecords?.slice(0, 5).map(record => ({
      date: record.date ?? record.created_at ?? '',
      description: record.description ?? '',
      amount: record.amount ?? 0,
      type: record.type as 'EXPENSE' | 'INCOME',
      category: record.category ?? ''
    })) ?? []

    // Recent synced transactions
    const recentSyncedTransactions: SyncedTransaction[] = financialRecords?.slice(0, 10).map(record => ({
      id: record.id,
      transactionId: record.id,
      type: record.type ?? '',
      amount: record.amount ?? 0,
      syncedAt: record.created_at ?? '',
      source: 'auto_sync',
      reference: record.reference ?? ''
    })) ?? []

    // Recommendations
    const recommendations: string[] = []
    if (syncHealth === 'error') {
      recommendations.push('Perbaiki sinkronisasi otomatis - banyak order belum tersinkron')
    } else if (syncHealth === 'warning') {
      recommendations.push('Periksa order yang belum tersinkron keuangan')
    }

    const autoSyncData: AutoSyncData = {
      status: {
        isEnabled: true,
        lastSyncTime: new Date().toISOString(),
        totalSynced: syncedOrders,
        totalErrors,
        syncHealth
      },
      recentTransactions: recentSyncedTransactions,
      recommendations: {
        recommendations,
        missingSync: totalErrors,
        healthScore: Math.round(syncRatio * 100)
      },
      cashflow: {
        totalExpenses,
        totalIncome,
        netCashflow,
        expenseBreakdown,
        recentTransactions
      }
    }

    return {
      success: true,
      data: autoSyncData
    }
  } catch (error) {
    logger.error({ error }, 'Failed to fetch auto-sync data from database')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Client component for interactive features
const AutoSyncClient = dynamic(
  () => import('./AutoSyncFinancialDashboardClient')
    .then(m => ({ default: m.AutoSyncFinancialDashboardClient }))
    .catch((error) => {
      const logger = createLogger('AutoSyncFinancialDashboard')
      logger.error({ error }, 'Failed to load AutoSyncFinancialDashboardClient')
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load auto-sync dashboard</div> }
    }),
  {
    loading: () => <div>Loading auto-sync dashboard...</div>,
    ssr: false
  }
)

export const AutoSyncFinancialDashboard = async () => {
  const autoSyncData = await fetchAutoSyncData()

  if (!autoSyncData?.success || !autoSyncData.data) {
    return <div>Failed to load auto-sync data</div>
  }

  return <AutoSyncClient initialData={autoSyncData.data} />
}
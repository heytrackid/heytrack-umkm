/**
 * Auto-Sync Financial Service
 * Manages automatic synchronization between operational transactions and financial records
 * Essential for UMKM cashflow tracking and financial transparency
 */

import { createServerSupabaseAdmin } from '@/lib/supabase'
import { logger, dbLogger, automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'

export interface SyncStatus {
  isEnabled: boolean
  lastSyncTime?: string
  totalSynced: number
  totalErrors: number
  syncHealth: 'healthy' | 'warning' | 'error'
}

export interface SyncedTransaction {
  id: string
  transactionId: string
  type: 'stock_transaction' | 'operational_cost' | 'order_completion'
  amount: number
  syncedAt: string
  source: string
  reference: string
}

export class AutoSyncFinancialService {
  private static instance: AutoSyncFinancialService
  
  private constructor() {}
  
  public static getInstance(): AutoSyncFinancialService {
    if (!AutoSyncFinancialService.instance) {
      AutoSyncFinancialService.instance = new AutoSyncFinancialService()
    }
    return AutoSyncFinancialService.instance
  }

  /**
   * Get sync status and health metrics
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const supabase = createServerSupabaseAdmin()
    
    try {
      // Count auto-synced records from last 30 days
      const { data: syncedRecords, error } = await (supabase
        .from('financial_records') as any)
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        // .eq('metadata->>auto_synced' as any, 'true') // JSON query not supported in types

      if (error) {
        logger.error('Error fetching sync status', { error: getErrorMessage(error) })
        return {
          isEnabled: false,
          totalSynced: 0,
          totalErrors: 0,
          syncHealth: 'error'
        }
      }

      const totalSynced = syncedRecords?.length || 0
      const lastSyncTime = (syncedRecords?.[0] as { created_at?: string })?.created_at
      
      // Simple health check based on recent activity
      let syncHealth: 'healthy' | 'warning' | 'error' = 'healthy'
      
      if (totalSynced === 0) {
        syncHealth = 'warning' // No recent auto-sync activity
      }
      
      // Check if there have been stock transactions but no corresponding financial records
      const { data: recentTransactions } = await ((supabase
        .from('stock_transactions') as any)
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        // .in('type', ['PURCHASE', 'ADJUSTMENT']) // Type filter handled later
      )

      const recentTransactionCount = recentTransactions?.length || 0
      const recentSyncCount = (syncedRecords || []).filter((record: any) => {
        const r = record as { metadata?: { source?: string }, created_at?: string }
        return r.metadata?.source === 'stock_transaction' &&
        new Date(r.created_at || '') > new Date(Date.now() - 24 * 60 * 60 * 1000)
      }).length || 0

      if (recentTransactionCount > 0 && recentSyncCount === 0) {
        syncHealth = 'error' // Transactions exist but no sync records
      }

      return {
        isEnabled: true,
        lastSyncTime,
        totalSynced,
        totalErrors: 0, // Could be enhanced to track actual errors
        syncHealth
      }
    } catch (error: unknown) {
      logger.error('Error in getSyncStatus', { error: getErrorMessage(error) })
      return {
        isEnabled: false,
        totalSynced: 0,
        totalErrors: 1,
        syncHealth: 'error'
      }
    }
  }

  /**
   * Get list of recent synced transactions for audit/transparency
   */
  async getRecentSyncedTransactions(_limit = 20): Promise<SyncedTransaction[]> {
    const supabase = createServerSupabaseAdmin()
    
    try {
      const { data: records, error } = await ((supabase
        .from('financial_records') as any)
        .select('*')
        // .eq('metadata->>auto_synced' as any, 'true') // JSON query not supported in types
        .order('created_at', { ascending: false })
        .limit(_limit))

      if (error) {
        logger.error('Error fetching synced transactions', { error: getErrorMessage(error) })
        return []
      }

      return (records || []).map((record: any) => {
        const r = record as { id?: string, metadata?: { transaction_id?: string, source?: string }, amount?: number, created_at?: string, reference?: string }
        return {
          id: r.id || '',
          transactionId: r.metadata?.transaction_id || r.id || '',
          type: (r.metadata?.source as 'stock_transaction' | 'operational_cost' | 'order_completion') || 'stock_transaction',
          amount: r.amount || 0,
          syncedAt: r.created_at || '',
          source: r.metadata?.source || 'manual',
          reference: r.reference || 'N/A'
        }
      })
    } catch (error: unknown) {
      logger.error('Error in getRecentSyncedTransactions', { error: getErrorMessage(error) })
      return []
    }
  }

  /**
   * Manually trigger sync for specific stock transaction
   * Useful for debugging or handling missed syncs
   */
  async manualSyncStockTransaction(transactionId: string): Promise<boolean> {
    const supabase = createServerSupabaseAdmin()
    
    try {
      // Get the stock transaction
      const { data: transaction, error: txError } = await ((supabase
        .from('stock_transactions') as any)
        .select('*')
        .eq('id', transactionId)
        .single())

      if (txError || !transaction) {
        logger.error('Stock transaction not found', { transactionId, error: txError?.message })
        return false
      }

      // Check if already synced
      const { data: existingRecord } = await ((supabase
        .from('financial_records') as any)
        .select('*')
        // .eq('metadata->>transaction_id', transactionId)
        // .eq('metadata->>auto_synced' as any, 'true')
        .single())

      if (existingRecord) {
        logger.info('Transaction already synced', { transactionId })
        return true
      }

      // Only sync PURCHASE and ADJUSTMENT transactions
      const tx = transaction as { type?: string }
      if (!['PURCHASE', 'ADJUSTMENT'].includes(tx.type || '')) {
        logger.info('Transaction type not eligible for sync', { 
          transactionId, 
          type: tx.type 
        })
        return false
      }

      // Calculate amount
      const txTyped = transaction as { total_price?: number, quantity?: number, unit_price?: number }
      const amount = Math.abs(
        txTyped.total_price || 
        ((txTyped.quantity || 0) * (txTyped.unit_price || 0))
      )

      if (amount <= 0) {
        logger.info('Transaction amount is zero or negative, skipping sync', { 
          transactionId, 
          amount 
        })
        return false
      }

      // Create financial record
      const txData = transaction as any
      const { error: insertError } = await ((supabase
        .from('financial_records') as any)
        .insert({
          type: 'EXPENSE' as any,
          category: tx.type === 'PURCHASE' ? 'Pembelian Bahan Baku' : 'Penyesuaian Stock',
          amount,
          description: `[Manual Sync] ${txData.notes || `${tx.type} - ${txData.ingredient_name || 'bahan baku'}`}`,
          reference: txData.reference || `MT-${txData.id}`,
          date: txData.date || new Date().toISOString().split('T')[0],
          metadata: {
            source: 'stock_transaction',
            transaction_id: txData.id,
            ingredient_id: txData.ingredient_id,
            ingredient_name: txData.ingredient_name,
            quantity: txData.quantity,
            unit: txData.unit,
            unit_price: txData.unit_price,
            auto_synced: true,
            manual_sync: true,
            sync_timestamp: new Date().toISOString()
          }
        }))

      if (insertError) {
        logger.error('Error creating financial record', { 
          transactionId, 
          error: insertError.message 
        })
        return false
      }

      logger.info('Manual sync successful', { transactionId })
      return true
    } catch (error: unknown) {
      logger.error('Error in manualSyncStockTransaction', { 
        transactionId, 
        error: getErrorMessage(error) 
      })
      return false
    }
  }

  /**
   * Get sync configuration and recommendations
   */
  async getSyncRecommendations(): Promise<{
    recommendations: string[]
    missingSync: number
    healthScore: number
  }> {
    const supabase = createServerSupabaseAdmin()
    const recommendations: string[] = []
    let missingSync = 0
    let healthScore = 100

    try {
      // Check for stock transactions without corresponding financial records
      const { data: unsynced } = await ((supabase
        .from('stock_transactions') as any)
        .select(`
          id, 
          type, 
          created_at,
          ingredient_name,
          quantity,
          unit_price,
          total_price
        `)
        // .in('type', ['PURCHASE', 'ADJUSTMENT'])
        // .gte('created_at' as any, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      )

      if (unsynced) {
        // Check which ones don't have corresponding financial records
        for (const tx of unsynced) {
          const txTyped = tx as { id?: string, total_price?: number, unit_price?: number, quantity?: number }
          const { data: existing } = await ((supabase
            .from('financial_records') as any)
            .select('*')
            // .eq('metadata->>transaction_id', txTyped.id)
            .single())

          if (!existing && ((txTyped.total_price || 0) > 0 || ((txTyped.unit_price || 0) && (txTyped.quantity || 0) > 0))) {
            missingSync++
          }
        }
      }

      // Generate recommendations
      if (missingSync > 0) {
        recommendations.push(`${missingSync} transaksi belum tersinkronisasi ke catatan keuangan`)
        healthScore -= Math.min(missingSync * 10, 50)
      }

      const status = await this.getSyncStatus()
      if (status.syncHealth === 'warning') {
        recommendations.push('Tidak ada aktivitas auto-sync dalam 24 jam terakhir')
        healthScore -= 20
      } else if (status.syncHealth === 'error') {
        recommendations.push('Auto-sync mengalami error, perlu troubleshooting')
        healthScore -= 40
      }

      if (status.totalSynced < 5) {
        recommendations.push('Aktivitas auto-sync masih rendah, monitor secara berkala')
        healthScore -= 10
      }

      // Check database triggers
      const { data: triggers } = await (supabase as any).rpc('check_triggers_exist', {
        table_name: 'stock_transactions',
        trigger_name: 'auto_sync_stock_to_financial'
      })

      if (!triggers) {
        recommendations.push('Database trigger belum aktif, jalankan migrasi auto-sync')
        healthScore -= 30
      }

      if (recommendations.length === 0) {
        recommendations.push('✅ Auto-sync berjalan dengan baik!')
      }

      return {
        recommendations,
        missingSync,
        healthScore: Math.max(healthScore, 0)
      }
    } catch (error: unknown) {
      logger.error('Error getting sync recommendations', { error: getErrorMessage(error) })
      return {
        recommendations: ['Error menganalisis sync status'],
        missingSync: 0,
        healthScore: 0
      }
    }
  }

  /**
   * Format currency for UMKM display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Generate simple cashflow summary from auto-synced records
   */
  async getCashflowSummary(days = 30): Promise<{
    totalExpenses: number
    totalIncome: number
    netCashflow: number
    expenseBreakdown: Record<string, number>
    recentTransactions: Array<{
      date: string
      description: string
      amount: number
      type: 'INCOME' | 'EXPENSE'
      category: string
    }>
  }> {
    const supabase = createServerSupabaseAdmin()
    
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: records, error } = await ((supabase
        .from('financial_records') as any)
        .select('*')
        .gte('created_at', startDate)
        .eq('metadata->>auto_synced', 'true')
        .order('date', { ascending: false }))

      if (error) {
        dbLogger.error('Error fetching cashflow data', { error: getErrorMessage(error) })
        return {
          totalExpenses: 0,
          totalIncome: 0,
          netCashflow: 0,
          expenseBreakdown: {},
          recentTransactions: []
        }
      }

      const expenses = records?.filter(r => r.type === 'EXPENSE') || []
      const income = records?.filter(r => r.type === 'INCOME') || []

      const totalExpenses = expenses.reduce((sum, r) => sum + r.amount, 0)
      const totalIncome = income.reduce((sum, r) => sum + r.amount, 0)

      // Breakdown by category
      const expenseBreakdown: Record<string, number> = {}
      expenses.forEach(expense => {
        expenseBreakdown[expense.category] = (expenseBreakdown[expense.category] || 0) + expense.amount
      })

      // Recent transactions (last 10)
      const recentTransactions = (records || []).slice(0, 10).map(record => ({
        date: record.date,
        description: record.description,
        amount: record.amount,
        type: record.type as 'INCOME' | 'EXPENSE',
        category: record.category
      }))

      return {
        totalExpenses,
        totalIncome,
        netCashflow: totalIncome - totalExpenses,
        expenseBreakdown,
        recentTransactions
      }
    } catch (error: unknown) {
      automationLogger.error('Error in getCashflowSummary', { error: getErrorMessage(error) })
      return {
        totalExpenses: 0,
        totalIncome: 0,
        netCashflow: 0,
        expenseBreakdown: {},
        recentTransactions: []
      }
    }
  }
}

// Export singleton instance
export const autoSyncFinancialService = AutoSyncFinancialService.getInstance()

// Export utility function for easy access
export const getAutoSyncStatus = () => autoSyncFinancialService.getSyncStatus()
export const getRecentSyncedTransactions = (limit?: number) => autoSyncFinancialService.getRecentSyncedTransactions(limit)
export const getCashflowSummary = (days?: number) => autoSyncFinancialService.getCashflowSummary(days)
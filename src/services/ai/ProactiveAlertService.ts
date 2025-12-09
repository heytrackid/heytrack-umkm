/**
 * Proactive Alert Service for FinanceWise
 * Real-time financial monitoring and alert generation
 */

import { AlertGenerator } from '@/lib/automation/financial-automation/alert-generator'
import type { FinancialAlert } from '@/lib/automation/types'
import { apiLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

export interface AlertTrigger {
  type: 'order_created' | 'expense_added' | 'revenue_decline' | 'expense_spike' | 'cash_flow_low' | 'health_check' | 'budget_exceeded'
  userId: string
  data: Record<string, unknown>
  timestamp: string
}

export interface AlertHistory {
  id: string
  user_id: string
  alert_type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  triggered_at: string
  acknowledged: boolean
  data: Record<string, unknown>
}

interface LocalFinancialMetrics {
  revenue: number
  totalExpenses: number
  cashBalance: number
  monthlyBurn: number
  runway: number
  profit: number
  profitMargin: number
  netMargin: number
  grossMargin: number
  grossProfit: number
  netProfit: number
  revenueGrowth: number
  expenseGrowth: number
  inventoryValue: number
}

export class ProactiveAlertService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Trigger real-time alert based on financial events
   */
  async triggerAlert(trigger: AlertTrigger): Promise<FinancialAlert[]> {
    const userId = this.context.userId

    try {
      // Check if we recently sent similar alert (prevent spam)
      const recentAlerts = await this.getRecentAlerts(trigger.type, 24) // 24 hours
      if (recentAlerts.length > 0) {
        apiLogger.info({ userId, triggerType: trigger.type }, 'Alert recently sent, skipping')
        return []
      }

      // Get current financial metrics
      const metrics = await this.getCurrentLocalFinancialMetrics()
      
      // Generate alerts based on trigger type
      let alerts: FinancialAlert[] = []

      switch (trigger.type) {
        case 'order_created':
          alerts = await this.handleOrderCreated(metrics, trigger.data)
          break
        case 'expense_added':
          alerts = await this.handleExpenseAdded(metrics, trigger.data)
          break
        case 'revenue_decline':
          alerts = await this.handleRevenueDecline(metrics, trigger.data)
          break
        case 'expense_spike':
          alerts = await this.handleExpenseSpike(metrics, trigger.data)
          break
        case 'cash_flow_low':
          alerts = await this.handleCashFlowLow(metrics, trigger.data)
          break
      }

      // Store alerts in database
      if (alerts.length > 0) {
        await this.storeAlerts(alerts, trigger)
        apiLogger.info({ userId, alertCount: alerts.length, triggerType: trigger.type }, 'Proactive alerts generated')
      }

      return alerts
    } catch (error) {
      apiLogger.error({ error, userId, triggerType: trigger.type }, 'Failed to trigger proactive alert')
      return []
    }
  }

  /**
   * Check for automated alerts when financial data changes
   */
  async checkFinancialHealth(): Promise<FinancialAlert[]> {
    const userId = this.context.userId

    try {
      const metrics = await this.getCurrentLocalFinancialMetrics()
      
      // Convert to FinancialMetrics format expected by AlertGenerator
      const alertMetrics = {
        revenue: metrics.revenue,
        grossProfit: metrics.grossProfit,
        netProfit: metrics.netProfit,
        grossMargin: metrics.grossMargin,
        netMargin: metrics.netMargin,
        inventoryValue: metrics.inventoryValue
      }
      
      // Use existing AlertGenerator for basic threshold checks
      const thresholdAlerts = AlertGenerator.generateFinancialAlerts(alertMetrics, [], {
        lowProfitabilityThreshold: 15,
        highExpenseThreshold: 0.8,
        enabled: true,
        maxConcurrentJobs: 5,
        retryAttempts: 3,
        notificationEnabled: true,
        defaultProfitMargin: 30,
        minimumProfitMargin: 15,
        maximumProfitMargin: 60,
        autoReorderDays: 7,
        safetyStockMultiplier: 1.5,
        productionLeadTime: 2,
        batchOptimizationThreshold: 10,
        cashFlowWarningDays: 30,
        enableInventory: true,
        enableFinancial: true,
        enableProduction: true,
        enableOrders: true
      })

      // Add proactive trend-based alerts
      const trendAlerts = await this.generateTrendAlerts(metrics)
      
      const allAlerts = [...thresholdAlerts, ...trendAlerts]

      // Store significant alerts
      const criticalAlerts = allAlerts.filter(alert => alert.type === 'critical' || alert.type === 'warning')
      if (criticalAlerts.length > 0) {
        await this.storeAlerts(criticalAlerts, { type: 'health_check', userId, data: metrics as unknown as Record<string, unknown>, timestamp: new Date().toISOString() })
      }

      return criticalAlerts
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to check financial health')
      return []
    }
  }

  private async handleOrderCreated(_metrics: LocalFinancialMetrics, orderData: Record<string, unknown>): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = []

    // Check if this order improves streak
    const recentOrders = await this.getRecentOrders(7) // Last 7 days
    const dailyAverage = recentOrders.length / 7
    
    if (dailyAverage > 10) { // Good business volume
      alerts.push({
        type: 'info',
        message: `🎉 Bisnis bagus! Rata-rata ${dailyAverage.toFixed(1)} pesanan/hari minggu ini`,
        metric: 'dailyOrders',
        value: dailyAverage,
        threshold: 10
      })
    }

    // Check if high-value order
    const totalAmount = Number(orderData['total_amount']) || 0
    if (totalAmount > 500000) { // > Rp 500k
      alerts.push({
        type: 'info',
        message: `💰 Pesanan besar! Rp ${totalAmount.toLocaleString('id-ID')} - pertahankan kualitas`,
        metric: 'orderValue',
        value: totalAmount,
        threshold: 500000
      })
    }

    return alerts
  }

  private async handleExpenseAdded(_metrics: LocalFinancialMetrics, expenseData: Record<string, unknown>): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = []
    const category = String(expenseData['category'] || 'other')
    const amount = Number(expenseData['amount']) || 0

    // Check for unusual expense amounts
    const avgExpense = await this.getAverageExpense(category)
    if (amount > avgExpense * 2) { // 2x average
      alerts.push({
        type: 'warning',
        message: `⚠️ Pengeluaran ${category} tinggi: Rp ${amount.toLocaleString('id-ID')} (${((amount/avgExpense - 1) * 100).toFixed(0)}% di atas rata-rata)`,
        metric: 'expenseAmount',
        value: amount,
        threshold: avgExpense * 2
      })
    }

    // Check if expense pushes monthly budget over limit
    const monthlyTotal = await this.getMonthlyExpenseTotal(category)
    const budgetLimit = avgExpense * 30 * 1.5 // 1.5x normal monthly budget
    
    if (monthlyTotal > budgetLimit) {
      alerts.push({
        type: 'critical',
        message: `🚨 Budget ${category} terlampaui! Total: Rp ${monthlyTotal.toLocaleString('id-ID')}`,
        metric: 'monthlyBudget',
        value: monthlyTotal,
        threshold: budgetLimit
      })
    }

    return alerts
  }

  private async handleRevenueDecline(metrics: LocalFinancialMetrics, _data: Record<string, unknown>): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = []

    if (metrics.revenueGrowth < -20) { // Revenue dropped > 20%
      alerts.push({
        type: 'critical',
        message: `📉 Revenue turun drastis ${Math.abs(metrics.revenueGrowth).toFixed(1)}%! Pertimbangkan promosi atau menu baru`,
        metric: 'revenueGrowth',
        value: metrics.revenueGrowth,
        threshold: -20
      })
    } else if (metrics.revenueGrowth < -10) { // Revenue dropped > 10%
      alerts.push({
        type: 'warning',
        message: `📊 Revenue turun ${Math.abs(metrics.revenueGrowth).toFixed(1)}%. Waktunya evaluasi strategi`,
        metric: 'revenueGrowth',
        value: metrics.revenueGrowth,
        threshold: -10
      })
    }

    return alerts
  }

  private async handleExpenseSpike(metrics: LocalFinancialMetrics, _data: Record<string, unknown>): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = []

    if (metrics.expenseGrowth > 30) { // Expenses up > 30%
      alerts.push({
        type: 'critical',
        message: `💸 Biaya naik ${metrics.expenseGrowth.toFixed(1)}%! Segera review pengeluaran`,
        metric: 'expenseGrowth',
        value: metrics.expenseGrowth,
        threshold: 30
      })
    } else if (metrics.expenseGrowth > 15) { // Expenses up > 15%
      alerts.push({
        type: 'warning',
        message: `📈 Biaya naik ${metrics.expenseGrowth.toFixed(1)}%. Monitor pengeluaran berikutnya`,
        metric: 'expenseGrowth',
        value: metrics.expenseGrowth,
        threshold: 15
      })
    }

    return alerts
  }

  private async handleCashFlowLow(metrics: LocalFinancialMetrics, _data: Record<string, unknown>): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = []

    if (metrics.runway < 0.5) { // Less than 2 weeks
      alerts.push({
        type: 'critical',
        message: `🚨 Cash flow kritis! Modal kerja tersisa < 2 minggu. Segera tingkatkan revenue atau cari tambahan modal`,
        metric: 'runway',
        value: metrics.runway,
        threshold: 0.5
      })
    } else if (metrics.runway < 1) { // Less than 1 month
      alerts.push({
        type: 'warning',
        message: `⚠️ Cash flow perlu perhatian. Modal kerja tersisa ${(metrics.runway * 30).toFixed(0)} hari`,
        metric: 'runway',
        value: metrics.runway,
        threshold: 1
      })
    }

    return alerts
  }

  private async generateTrendAlerts(_metrics: LocalFinancialMetrics): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = []

    // Check consecutive days of low revenue
    const lowRevenueDays = await this.getConsecutiveLowRevenueDays()
    if (lowRevenueDays >= 3) {
      alerts.push({
        type: 'warning',
        message: `📉 Revenue rendah selama ${lowRevenueDays} hari berturut-turut. Waktunya action!`,
        metric: 'lowRevenueStreak',
        value: lowRevenueDays,
        threshold: 3
      })
    }

    // Check profit margin trend
    const marginTrend = await this.getProfitMarginTrend()
    if (marginTrend < -5) { // Margin declining > 5% over 30 days
      alerts.push({
        type: 'warning',
        message: `📉 Margin profit menurun. Review HPP dan harga jual produk`,
        metric: 'marginTrend',
        value: marginTrend,
        threshold: -5
      })
    }

    return alerts
  }

  // Helper methods
  private async getCurrentLocalFinancialMetrics(): Promise<LocalFinancialMetrics> {
    const userId = this.context.userId
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get revenue
    const { data: orders } = await this.context.supabase
      .from('orders')
      .select('total_amount, order_date')
      .eq('user_id', userId)
      .eq('status', 'DELIVERED')
      .gte('order_date', startDate)
      .lte('order_date', endDate)

    const revenue = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

    // Get expenses
    const { data: expenses } = await this.context.supabase
      .from('financial_records')
      .select('amount, date')
      .eq('user_id', userId)
      .eq('type', 'EXPENSE')
      .gte('date', startDate)
      .lte('date', endDate)

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0)

    // Calculate cash balance
    const { data: cashRecords } = await this.context.supabase
      .from('financial_records')
      .select('amount, type')
      .eq('user_id', userId)

    const cashBalance = (cashRecords || []).reduce((balance, record) => {
      const amount = Number(record.amount || 0)
      return record.type === 'INCOME' ? balance + amount : balance - amount
    }, 0)

    const monthlyBurn = totalExpenses
    const runway = monthlyBurn > 0 ? Math.max(0, cashBalance) / monthlyBurn : 12
    const profit = revenue - totalExpenses
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

    return {
      revenue,
      totalExpenses,
      cashBalance: Math.max(0, cashBalance),
      monthlyBurn,
      runway,
      profit,
      profitMargin,
      netMargin: profitMargin,
      grossMargin: profitMargin,
      grossProfit: profit,
      netProfit: profit,
      revenueGrowth: 0, // Would need previous period data
      expenseGrowth: 0, // Would need previous period data
      inventoryValue: 0 // Would need inventory data
    }
  }

  private async getRecentAlerts(alertType: string, hours: number): Promise<AlertHistory[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.context.supabase as any)
      .from('financial_alerts')
      .select('*')
      .eq('user_id', this.context.userId)
      .eq('alert_type', alertType)
      .gte('triggered_at', since)

    return (data || []) as AlertHistory[]
  }

  private async storeAlerts(alerts: FinancialAlert[], trigger: AlertTrigger): Promise<void> {
    const alertRecords = alerts.map(alert => ({
      user_id: this.context.userId,
      alert_type: trigger.type,
      severity: alert.type,
      title: this.getAlertTitle(alert.type),
      message: alert.message,
      triggered_at: new Date().toISOString(),
      acknowledged: false,
      data: {
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        triggerData: trigger.data
      }
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.context.supabase as any)
      .from('financial_alerts')
      .insert(alertRecords)

    if (error) {
      apiLogger.error({ error, alertCount: alerts.length }, 'Failed to store alerts')
    }
  }

  private getAlertTitle(severity: string): string {
    const titles = {
      'critical': '🚨 Alert Kritis',
      'warning': '⚠️ Peringatan',
      'info': 'ℹ️ Informasi'
    }
    return titles[severity as keyof typeof titles] || 'Notifikasi'
  }

  private async getRecentOrders(days: number): Promise<Array<{ total_amount: number | null; created_at: string | null }>> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const { data } = await this.context.supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('user_id', this.context.userId)
      .eq('status', 'DELIVERED')
      .gte('created_at', since)

    return data || []
  }

  private async getAverageExpense(category: string): Promise<number> {
    const { data } = await this.context.supabase
      .from('financial_records')
      .select('amount')
      .eq('user_id', this.context.userId)
      .eq('type', 'EXPENSE')
      .eq('category', category)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    if (!data || data.length === 0) return 100000 // Default Rp 100k
    
    const total = data.reduce((sum, record) => sum + (record.amount || 0), 0)
    return total / data.length
  }

  private async getMonthlyExpenseTotal(category: string): Promise<number> {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data } = await this.context.supabase
      .from('financial_records')
      .select('amount')
      .eq('user_id', this.context.userId)
      .eq('type', 'EXPENSE')
      .eq('category', category)
      .gte('date', startOfMonth.toISOString())

    return (data || []).reduce((sum, record) => sum + (record.amount || 0), 0)
  }

  private async getConsecutiveLowRevenueDays(): Promise<number> {
    // Simplified implementation - would need more complex logic for real use
    const { data } = await this.context.supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('user_id', this.context.userId)
      .eq('status', 'DELIVERED')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (!data || data.length === 0) return 7

    // Group by day and check for low revenue days
    const dailyRevenue = new Map<string, number>()
    data.forEach(order => {
      const day = order.created_at?.split('T')[0]
      if (day) {
        dailyRevenue.set(day, (dailyRevenue.get(day) || 0) + (order.total_amount || 0))
      }
    })

    let consecutiveDays = 0
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const revenue = dailyRevenue.get(dateStr || '') || 0
      if (revenue < 100000) { // Less than Rp 100k considered low
        consecutiveDays++
      } else {
        break
      }
    }

    return consecutiveDays
  }

  private async getProfitMarginTrend(): Promise<number> {
    // Simplified - would need more sophisticated trend analysis
    return 0
  }
}

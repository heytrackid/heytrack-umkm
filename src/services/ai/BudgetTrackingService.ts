/**
 * Budget Tracking Service for FinanceWise
 * Real-time budget management and monitoring
 */

import { apiLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

export interface Budget {
  id: string
  user_id: string
  name: string
  description?: string
  budget_type: 'monthly' | 'weekly' | 'daily' | 'project'
  category: 'total' | 'ingredients' | 'operations' | 'marketing' | 'labor' | 'utilities' | 'other'
  target_amount: number
  current_spent: number
  period_start: string
  period_end: string
  alert_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BudgetTransaction {
  id: string
  budget_id: string
  user_id: string
  amount: number
  transaction_type: 'expense' | 'adjustment'
  description?: string
  reference_id?: string
  created_at: string
}

export interface BudgetStatus {
  budget: Budget
  spent_percentage: number
  remaining_amount: number
  days_remaining: number
  daily_average: number
  is_over_threshold: boolean
  is_over_budget: boolean
  projected_overspend: number
}

export interface BudgetCreateRequest {
  name: string
  description?: string
  budget_type: 'monthly' | 'weekly' | 'daily' | 'project'
  category: 'total' | 'ingredients' | 'operations' | 'marketing' | 'labor' | 'utilities' | 'other'
  target_amount: number
  period_start: string
  period_end?: string
  alert_threshold?: number
}

export class BudgetTrackingService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Create a new budget
   */
  async createBudget(request: BudgetCreateRequest): Promise<Budget> {
    const userId = this.context.userId

    try {
      // Auto-calculate period_end based on budget_type if not provided
      const periodEnd = request.period_end || this.calculatePeriodEnd(request.period_start, request.budget_type)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.context.supabase as any)
        .from('budget_tracking')
        .insert({
          user_id: userId,
          name: request.name,
          description: request.description,
          budget_type: request.budget_type,
          category: request.category,
          target_amount: request.target_amount,
          period_start: request.period_start,
          period_end: periodEnd,
          alert_threshold: request.alert_threshold || 0.8
        })
        .select()
        .single()

      if (error) {
        apiLogger.error({ error, userId }, 'Failed to create budget')
        throw new Error('Gagal membuat budget')
      }

      const budget = data as Budget
      apiLogger.info({ userId, budgetId: budget.id, budgetType: request.budget_type }, 'Budget created successfully')
      return budget
    } catch (error) {
      apiLogger.error({ error, userId }, 'Budget creation failed')
      throw error
    }
  }

  /**
   * Get all budgets for user
   */
  async getBudgets(includeInactive: boolean = false): Promise<Budget[]> {
    const userId = this.context.userId

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (this.context.supabase as any)
        .from('budget_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) {
        apiLogger.error({ error, userId }, 'Failed to fetch budgets')
        throw new Error('Gagal mengambil data budget')
      }

      return (data || []) as Budget[]
    } catch (error) {
      apiLogger.error({ error, userId }, 'Budget fetch failed')
      throw error
    }
  }

  /**
   * Get budget with current status
   */
  // Remove unused variables to eliminate warnings
  async getBudgetStatus(budgetId: string): Promise<BudgetStatus> {
    const userId = this.context.userId

    try {
      const budget = await this.getBudgetById(budgetId)
      
      // Calculate current status
      const spentPercentage = (budget.current_spent / budget.target_amount) * 100
      const remainingAmount = Math.max(0, budget.target_amount - budget.current_spent)
      const periodEnd = budget.period_end || budget.period_start
      const daysRemaining = Math.max(0, Math.ceil((new Date(periodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      const dailyAverage = daysRemaining > 0 ? budget.current_spent / Math.max(1, this.getDaysElapsed(budget.period_start)) : 0
      
      // Project overspend based on current spending rate
      const projectedOverspend = dailyAverage > 0 && daysRemaining > 0 
        ? Math.max(0, (budget.current_spent + (dailyAverage * daysRemaining)) - budget.target_amount)
        : 0

      return {
        budget,
        spent_percentage: Math.round(spentPercentage * 100) / 100,
        remaining_amount: Math.round(remainingAmount),
        days_remaining: daysRemaining,
        daily_average: Math.round(dailyAverage),
        is_over_threshold: spentPercentage > (budget.alert_threshold * 100),
        is_over_budget: spentPercentage > 100,
        projected_overspend: Math.round(projectedOverspend)
      }
    } catch (error) {
      apiLogger.error({ error, userId, budgetId }, 'Failed to get budget status')
      throw error
    }
  }

  /**
   * Get all budget statuses for dashboard
   */
  async getAllBudgetStatuses(): Promise<BudgetStatus[]> {
    const userId = this.context.userId

    try {
      const budgets = await this.getBudgets()
      const statuses = await Promise.all(budgets.map(budget => this.getBudgetStatus(budget.id)))
      
      return statuses.sort((a, b) => b.spent_percentage - a.spent_percentage)
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to get all budget statuses')
      throw error
    }
  }

  /**
   * Update budget
   */
  async updateBudget(budgetId: string, updates: Partial<BudgetCreateRequest>): Promise<Budget> {
    const userId = this.context.userId

    try {
      const updateData = { ...updates }
      
      if (updates.period_end) {
        updateData.period_end = updates.period_end
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.context.supabase as any)
        .from('budget_tracking')
        .update(updateData)
        .eq('id', budgetId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        apiLogger.error({ error, userId, budgetId }, 'Failed to update budget')
        throw new Error('Gagal mengupdate budget')
      }

      const budget = data as Budget
      apiLogger.info({ userId, budgetId: budget.id }, 'Budget updated successfully')
      return budget
    } catch (error) {
      apiLogger.error({ error, userId, budgetId }, 'Budget update failed')
      throw error
    }
  }

  /**
   * Delete budget
   */
  async deleteBudget(budgetId: string): Promise<void> {
    const userId = this.context.userId

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.context.supabase as any)
        .from('budget_tracking')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', userId)

      if (error) {
        apiLogger.error({ error, userId, budgetId }, 'Failed to delete budget')
        throw new Error('Gagal menghapus budget')
      }

      apiLogger.info({ userId, budgetId }, 'Budget deleted successfully')
    } catch (error) {
      apiLogger.error({ error, userId, budgetId }, 'Budget deletion failed')
      throw error
    }
  }

  /**
   * Record expense against budget (called when financial records are created)
   */
  async recordExpense(
    amount: number, 
    category: string, 
    description?: string, 
    referenceId?: string
  ): Promise<void> {
    const userId = this.context.userId

    try {
      // Find matching budgets
      const budgets = await this.getBudgets()
      const matchingBudgets = budgets.filter(budget => 
        budget.is_active && 
        this.isDateInBudgetPeriod(new Date(), budget.period_start, budget.period_end) &&
        (budget.category === 'total' || budget.category === this.mapCategoryToBudget(category))
      )

      for (const budget of matchingBudgets) {
        // Add transaction
        await this.addBudgetTransaction(budget.id, amount, 'expense', description, referenceId)
        
        // Update budget spent amount
        const newSpent = budget.current_spent + amount
        await this.updateBudgetSpent(budget.id, newSpent)

        // Check for alerts
        const spentPercentage = (newSpent / budget.target_amount) * 100
        const thresholdPercentage = budget.alert_threshold * 100

        if (spentPercentage > thresholdPercentage && spentPercentage - amount <= thresholdPercentage) {
          // Just crossed threshold - trigger alert
          await this.triggerBudgetAlert(budget, spentPercentage, 'threshold_exceeded')
        }

        if (spentPercentage > 100 && spentPercentage - amount <= 100) {
          // Just exceeded budget - trigger alert
          await this.triggerBudgetAlert(budget, spentPercentage, 'budget_exceeded')
        }
      }
    } catch (error) {
      apiLogger.error({ error, userId, amount, category }, 'Failed to record expense against budget')
      // Don't throw error here - budget tracking failure shouldn't break expense recording
    }
  }

  /**
   * Get budget analytics
   */
  async getBudgetAnalytics(_period: 'month' | 'week' | 'year' = 'month'): Promise<{
    summary: {
      totalBudget: number;
      totalSpent: number;
      averageUtilization: number;
      overBudgetCount: number;
      nearThresholdCount: number;
      totalBudgets: number;
    };
    categoryBreakdown: Record<string, { budgeted: number; spent: number; count: number }>;
    budgets: BudgetStatus[];
  }> {
    const userId = this.context.userId

    try {
      const budgets = await this.getBudgets()
      const statuses = await Promise.all(budgets.map(budget => this.getBudgetStatus(budget.id)))

      // Calculate analytics
      const totalBudget = budgets.reduce((sum, b) => sum + b.target_amount, 0)
      const totalSpent = budgets.reduce((sum, b) => sum + b.current_spent, 0)
      const averageUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

      const overBudgetCount = statuses.filter(s => s.is_over_budget).length
      const nearThresholdCount = statuses.filter(s => s.is_over_threshold && !s.is_over_budget).length

      // Category breakdown
      const categoryBreakdown = budgets.reduce((acc, budget) => {
        const categoryKey = budget.category || 'other'
        if (!acc[categoryKey]) {
          acc[categoryKey] = { budgeted: 0, spent: 0, count: 0 }
        }
        acc[categoryKey].budgeted += budget.target_amount
        acc[categoryKey].spent += budget.current_spent
        acc[categoryKey].count += 1
        return acc
      }, {} as Record<string, { budgeted: number; spent: number; count: number }>)

      return {
        summary: {
          totalBudget: Math.round(totalBudget),
          totalSpent: Math.round(totalSpent),
          averageUtilization: Math.round(averageUtilization * 100) / 100,
          overBudgetCount,
          nearThresholdCount,
          totalBudgets: budgets.length
        },
        categoryBreakdown,
        budgets: statuses
      }
    } catch (error) {
      apiLogger.error({ error, userId, period: _period }, 'Failed to get budget analytics')
      throw error
    }
  }

  /**
   * Auto-renew monthly budgets (should be called by scheduled job)
   */
  async autoRenewBudgets(): Promise<number> {
    const userId = this.context.userId
    let renewedCount = 0

    try {
      const budgets = await this.getBudgets()
      const today = new Date()

      for (const budget of budgets) {
        if (budget.budget_type === 'monthly' && this.shouldRenewBudget(budget, today)) {
          // Create new budget for next month
          const nextMonthStart = new Date(budget.period_start)
          nextMonthStart.setMonth(nextMonthStart.getMonth() + 1)
          
          const nextMonthEnd = new Date(budget.period_end)
          nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1)

          await this.createBudget({
            name: budget.name,
            ...(budget.description ? { description: budget.description } : {}),
            budget_type: budget.budget_type,
            category: budget.category,
            target_amount: budget.target_amount,
            period_start: nextMonthStart.toISOString().split('T')[0]!,
            period_end: nextMonthEnd.toISOString().split('T')[0]!,
            alert_threshold: budget.alert_threshold
          })

          renewedCount++
        }
      }

      if (renewedCount > 0) {
        apiLogger.info({ userId, renewedCount }, 'Budgets auto-renewed successfully')
      }

      return renewedCount
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to auto-renew budgets')
      return 0
    }
  }

  // Helper methods
  private async getBudgetById(budgetId: string): Promise<Budget> {
    const userId = this.context.userId

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.context.supabase as any)
      .from('budget_tracking')
      .select('*')
      .eq('id', budgetId)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error('Budget tidak ditemukan')
    }

    return data as Budget
  }

  private calculatePeriodEnd(startDate: string, _budgetType: string): string {
    const start = new Date(startDate)
    let end: Date

    switch (_budgetType) {
      case 'daily':
        end = new Date(start)
        end.setDate(start.getDate() + 1)
        break
      case 'weekly':
        end = new Date(start)
        end.setDate(start.getDate() + 7)
        break
      case 'monthly':
        end = new Date(start)
        end.setMonth(start.getMonth() + 1)
        break
      case 'project':
        end = new Date(start)
        end.setDate(start.getDate() + 30) // Default 30 days for projects
        break
      default:
        end = new Date(start)
        end.setMonth(start.getMonth() + 1)
    }

    return end.toISOString().split('T')[0]!
  }

  private getDaysElapsed(startDate: string): number {
    const start = new Date(startDate)
    const today = new Date()
    return Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  }

  private isDateInBudgetPeriod(date: Date, periodStart: string, periodEnd: string): boolean {
    const check = date
    const start = new Date(periodStart)
    const end = new Date(periodEnd)
    return check >= start && check <= end
  }

  private mapCategoryToBudget(category: string): string {
    // Map financial record categories to budget categories
    const categoryMap: Record<string, string> = {
      'bahan_baku': 'ingredients',
      'operasional': 'operations',
      'marketing': 'marketing',
      'gaji': 'labor',
      'listrik': 'utilities',
      'air': 'utilities',
      'sewa': 'operations',
      'lainnya': 'other'
    }

    return categoryMap[category] || 'other'
  }

  private async addBudgetTransaction(
    budgetId: string, 
    amount: number, 
    type: 'expense' | 'adjustment', 
    description?: string, 
    referenceId?: string
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.context.supabase as any)
      .from('budget_transactions')
      .insert({
        budget_id: budgetId,
        user_id: this.context.userId,
        amount,
        transaction_type: type,
        description,
        reference_id: referenceId
      })

    if (error) {
      throw new Error('Gagal menambahkan transaksi budget')
    }
  }

  private async updateBudgetSpent(budgetId: string, newSpent: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.context.supabase as any)
      .from('budget_tracking')
      .update({ current_spent: newSpent })
      .eq('id', budgetId)
      .eq('user_id', this.context.userId)

    if (error) {
      throw new Error('Gagal mengupdate jumlah budget terpakai')
    }
  }

  private async triggerBudgetAlert(budget: Budget, spentPercentage: number, alertType: string): Promise<void> {
    const alertMessage = alertType === 'budget_exceeded'
      ? `🚨 Budget "${budget.name}" terlampaui! Terpakai ${spentPercentage.toFixed(1)}% dari budget Rp ${budget.target_amount.toLocaleString('id-ID')}`
      : `⚠️ Budget "${budget.name}" hampir terlampaui! Terpakai ${spentPercentage.toFixed(1)}% dari budget Rp ${budget.target_amount.toLocaleString('id-ID')}`

    // Insert alert directly into database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.context.supabase as any)
      .from('financial_alerts')
      .insert({
        user_id: this.context.userId,
        alert_type: 'budget_exceeded',
        severity: alertType === 'budget_exceeded' ? 'critical' : 'warning',
        title: alertType === 'budget_exceeded' ? '🚨 Budget Terlampaui' : '⚠️ Budget Hampir Terlampaui',
        message: alertMessage,
        data: {
          budgetId: budget.id,
          budgetName: budget.name,
          spentPercentage,
          alertType
        }
      })

    if (error) {
      apiLogger.error({ error, budgetId: budget.id }, 'Failed to store budget alert')
    }
  }

  private shouldRenewBudget(budget: Budget, today: Date): boolean {
    const periodEnd = new Date(budget.period_end)
    const daysUntilEnd = Math.ceil((periodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilEnd <= 0 && daysUntilEnd >= -7 // Renew if expired within last 7 days
  }
}

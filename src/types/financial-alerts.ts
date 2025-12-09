/**
 * Temporary type definitions for financial_alerts table
 * These will be replaced by generated types when Docker is available
 */

export interface FinancialAlertRow {
  id: string
  user_id: string
  alert_type: 'order_created' | 'expense_added' | 'revenue_decline' | 'expense_spike' | 'cash_flow_low' | 'health_check' | 'budget_exceeded'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  triggered_at: string
  acknowledged: boolean
  acknowledged_at?: string
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface BudgetTrackingRow {
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

export interface BudgetTransactionRow {
  id: string
  budget_id: string
  user_id: string
  amount: number
  transaction_type: 'expense' | 'adjustment'
  description?: string
  reference_id?: string
  created_at: string
}

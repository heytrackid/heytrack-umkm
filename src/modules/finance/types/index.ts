// Finance types - basic definitions for now
export interface FinancialRecord {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
  category: string
  amount: number
  description: string
  reference?: string
  date: string
  created_at: string
}

export interface FinancialRecordFormData extends Omit<FinancialRecord, 'id' | 'created_at'> {
  payment_method?: string
  reference_no?: string
  notes?: string
  is_recurring?: boolean
  recurring_period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
}

export interface FinancialSummary {
  total_income: number
  total_expenses: number
  net_profit: number
  profit_margin: number
  period: string
}

export interface CashFlow {
  date: string
  income: number
  expenses: number
  balance: number
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  budget_limit?: number
  is_active: boolean
}

export interface Budget {
  id: string
  category: string
  planned_amount: number
  actual_amount: number
  period: string
  variance: number
  variance_percentage: number
}

// Chart data types for financial visualization
export interface FinancialChartData {
  date: string
  income: number
  expenses: number
  profit: number
}

export interface ExpenseBreakdown {
  category: string
  amount: number
  percentage: number
  color: string
}

// Alias exports for backward compatibility
export type Expense = FinancialRecord
export type BudgetItem = Budget

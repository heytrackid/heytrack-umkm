import { createServiceRoleClient } from '@/utils/supabase'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
interface FinancialTransaction {
  id: string
  reference_id?: string
  date: string | null
  description: string
  category: string
  subcategory?: string
  amount: string | number
  type: string
  user_id: string
  created_at: string | null
  reference?: string | null
}

interface PeriodCashFlow {
  period: string
  income: number
  expenses: number
  net_cash_flow: number
  transaction_count: number
}

interface CategoryBreakdown {
  category: string
  total: number
  count: number
  percentage: number
  subcategories: Subcategory[]
}

interface Subcategory {
  name: string
  total: number
  count: number
}

interface CategoryBreakdownProcessing {
  category: string
  total: number
  count: number
  percentage: number
  subcategories: Record<string, Subcategory>
}

/**
 * GET /api/reports/cash-flow
 * 
 * Generate Cash Flow Report
 * 
 * Query Parameters:
 * - start_date: Start date (YYYY-MM-DD)
 * - end_date: End date (YYYY-MM-DD)
 * - period: 'daily' | 'weekly' | 'monthly' | 'yearly'
 * - compare: 'true' | 'false' (compare with previous period)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const startDate = searchParams.get('start_date') || new Date(new Date().setDate(1)).toISOString().split('T')[0] // First day of current month
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0] // Today
    const period = searchParams.get('period') || 'daily'
    const compare = searchParams.get('compare') === 'true'

    const supabase = createServiceRoleClient()

    // Get all transactions (income and expenses) within date range
    const { data: transactions, error: transError } = await supabase
      .from('financial_records')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (transError) {
      apiLogger.error({ error: transError }, 'Error fetching transactions:')
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Separate income and expenses
    const validTransactions = (transactions || []).filter((t: any) => t.date !== null) as FinancialTransaction[]
    const income = validTransactions.filter((t: FinancialTransaction) => (t as any).category === 'Revenue')
    const expenses = validTransactions.filter((t: FinancialTransaction) => (t as any).category !== 'Revenue')

    // Calculate totals
    const totalIncome = income.reduce((sum: number, t: FinancialTransaction) => sum + Number((t as any).amount), 0)
    const totalExpenses = expenses.reduce((sum: number, t: FinancialTransaction) => sum + Number((t as any).amount), 0)
    const netCashFlow = totalIncome - totalExpenses

    // Group by period
    const cashFlowByPeriod = groupByPeriod(validTransactions, period)

    // Category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(validTransactions)

    // Trend analysis
    const trend = calculateTrend(cashFlowByPeriod)

    // Compare with previous period if requested
    let comparison = null
    if (compare) {
      comparison = await calculateComparison(supabase, startDate, endDate, period)
    }

    // Transform transactions for frontend
    const transactionsList = validTransactions.map((t: FinancialTransaction) => ({
      id: (t as any).id,
      reference_id: t.reference_id || (t as any).id,
      date: t.date || '',
      description: (t as any).description,
      category: (t as any).category === 'Revenue' ? (t.subcategory || 'Penjualan Produk') : (t as any).category,
      amount: Number(t.amount),
      type: (t as any).category === 'Revenue' ? 'income' : 'expense'
    }))

    // Build response
    const response = {
      summary: {
        period: {
          start: startDate,
          end: endDate,
          type: period
        },
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_cash_flow: netCashFlow,
        income_by_category: groupByCategory(income),
        expenses_by_category: groupByCategory(expenses),
        transaction_count: {
          income: income.length,
          expenses: expenses.length,
          total: transactions?.length || 0
        }
      },
      transactions: transactionsList,
      cash_flow_by_period: cashFlowByPeriod,
      category_breakdown: categoryBreakdown,
      trend: trend,
      comparison: comparison,
      top_income_sources: getTopTransactions(income, 5),
      top_expenses: getTopTransactions(expenses, 5),
      generated_at: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error generating cash flow report:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper: Group transactions by period
function groupByPeriod(transactions: FinancialTransaction[], period: string) {
  const grouped: Record<string, PeriodCashFlow> = {}

  transactions.forEach(transaction => {
    let key = ''
    const date = new Date((transaction as any).date)

    switch (period) {
      case 'daily':
        key = (transaction as any).date
        break
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'yearly':
        key = `${date.getFullYear()}`
        break
      default:
        key = (transaction as any).date
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        income: 0,
        expenses: 0,
        net_cash_flow: 0,
        transaction_count: 0
      }
    }

    const currentGroup = grouped[key]!
    const amount = Number((transaction as any).amount)
    if ((transaction as any).category === 'Revenue') {
      currentGroup.income += amount
    } else {
      currentGroup.expenses += amount
    }
    (currentGroup as any).net_cash_flow = currentGroup.income - currentGroup.expenses
    currentGroup.transaction_count++
  })

  return Object.values(grouped).sort((a: PeriodCashFlow, b: PeriodCashFlow) =>
    a.period.localeCompare(b.period)
  )
}

// Helper: Calculate category breakdown
function calculateCategoryBreakdown(transactions: FinancialTransaction[]) {
  const breakdown: Record<string, CategoryBreakdownProcessing> = {}

  transactions.forEach(transaction => {
    const category = (transaction as any).category
    const subcategory = transaction.subcategory || 'Other'

    if (!breakdown[category]) {
      breakdown[category] = {
        category: category,
        total: 0,
        count: 0,
        percentage: 0,
        subcategories: {} as Record<string, Subcategory>
      }
    }

    const amount = Number((transaction as any).amount)
    breakdown[category].total += amount
    breakdown[category].count++

    if (!breakdown[category].subcategories[subcategory]) {
      breakdown[category].subcategories[subcategory] = {
        name: subcategory,
        total: 0,
        count: 0
      }
    }
    breakdown[category].subcategories[subcategory].total += amount
    breakdown[category].subcategories[subcategory].count++
  })

  // Calculate percentages
  const totalAmount = Object.values(breakdown).reduce((sum: number, cat: CategoryBreakdownProcessing) => sum + (cat as any).total, 0)
  Object.values(breakdown).forEach((cat: CategoryBreakdownProcessing) => {
    cat.percentage = totalAmount > 0 ? ((cat as any).total / totalAmount) * 100 : 0
    ;(cat as any as CategoryBreakdown).subcategories = Object.values(cat.subcategories)
  })

  return Object.values(breakdown).map(cat => cat as any as CategoryBreakdown).sort((a: CategoryBreakdown, b: CategoryBreakdown) => (b as any).total - (a as any).total)
}

// Helper: Group by category for summary
function groupByCategory(transactions: unknown[]) {
  const grouped: Record<string, number> = {}
  transactions.forEach(t => {
    const category = (t as any).category === 'Revenue' ? ((t as any).subcategory || 'Penjualan Produk') : (t as any).category
    grouped[category] = (grouped[category] || 0) + Number((t as any).amount)
  })
  return grouped
}

// Helper: Calculate trend
function calculateTrend(cashFlowByPeriod: unknown[]) {
  if (cashFlowByPeriod.length < 2) {
    return {
      direction: 'stable',
      change_percentage: 0,
      average_cash_flow: (cashFlowByPeriod[0] as any)?.net_cash_flow || 0
    }
  }

  const recent = (cashFlowByPeriod[cashFlowByPeriod.length - 1] as any).net_cash_flow
  const previous = (cashFlowByPeriod[cashFlowByPeriod.length - 2] as any).net_cash_flow

  const change = recent - previous
  const changePercentage = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0

  const avgCashFlow = cashFlowByPeriod.reduce((sum: number, p) => sum + (p as any).net_cash_flow, 0) / cashFlowByPeriod.length

  return {
    direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
    change_amount: change,
    change_percentage: changePercentage,
    average_cash_flow: avgCashFlow,
    highest_period: cashFlowByPeriod.reduce((max, p) => (p as any).net_cash_flow > (max as any).net_cash_flow ? p : max),
    lowest_period: cashFlowByPeriod.reduce((min, p) => (p as any).net_cash_flow < (min as any).net_cash_flow ? p : min)
  }
}

// Helper: Calculate comparison with previous period
async function calculateComparison(supabase: ReturnType<typeof createServiceRoleClient>, startDate: string, endDate: string, period: string) {
  // Remove unused period parameter
  const start = new Date(startDate)
  const end = new Date(endDate)
  const duration = end.getTime() - start.getTime()

  const prevStart = new Date(start.getTime() - duration)
  const prevEnd = new Date(start.getTime() - 1)

  const { data: prevTransactions } = await supabase
    .from('financial_records')
    .select('*')
    .gte('date', prevStart.toISOString().split('T')[0])
    .lte('date', prevEnd.toISOString().split('T')[0])

  if (!prevTransactions) {
    return null
  }

  const prevIncome = prevTransactions.filter((t: FinancialTransaction) => (t as any).category === 'Revenue')
  const prevExpenses = prevTransactions.filter((t: FinancialTransaction) => (t as any).category !== 'Revenue')

  const prevTotalIncome = prevIncome.reduce((sum: number, t: FinancialTransaction) => sum + Number((t as any).amount), 0)
  const prevTotalExpenses = prevExpenses.reduce((sum: number, t: FinancialTransaction) => sum + Number((t as any).amount), 0)
  const prevNetCashFlow = prevTotalIncome - prevTotalExpenses

  return {
    previous_period: {
      start: prevStart.toISOString().split('T')[0],
      end: prevEnd.toISOString().split('T')[0],
      total_income: prevTotalIncome,
      total_expenses: prevTotalExpenses,
      net_cash_flow: prevNetCashFlow
    }
  }
}

// Helper: Get top transactions
function getTopTransactions(transactions: unknown[], limit: number) {
  return transactions
    .sort((a, b) => Number((b as any).amount) - Number((a as any).amount))
    .slice(0, limit)
    .map(t => ({
      description: (t as any).description,
      amount: Number((t as any).amount),
      date: (t as any).date,
      category: (t as any).category,
      subcategory: (t as any).subcategory
    }))
}

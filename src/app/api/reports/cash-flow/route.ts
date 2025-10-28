import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'
import { safeParseAmount, safeString } from '@/lib/api-helpers'

type FinancialRecord = Database['public']['Tables']['financial_records']['Row']

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
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')
    const periodParam = searchParams.get('period')
    const compare = searchParams.get('compare') === 'true'
    
    const startDate = startDateParam || new Date(new Date().setDate(1)).toISOString().split('T')[0] // First day of current month
    const endDate = endDateParam || new Date().toISOString().split('T')[0] // Today
    const period = periodParam || 'daily'

    const supabase = createServiceRoleClient()

    // Get all transactions (income and expenses) within date range
    const { data: transactions, error: transError } = await supabase
      .from('financial_records')
      .select('id, date, description, category, amount, reference')
      .gte('date', startDateParam ? startDateParam : new Date(new Date().setDate(1)).toISOString().split('T')[0])
      .lte('date', endDateParam ? endDateParam : new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (transError) {
      apiLogger.error({ error: transError }, 'Error fetching transactions:')
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Separate income and expenses
    const validTransactions = (transactions || []).filter((t: FinancialRecord) => t.date !== null)
    const income = validTransactions.filter((t: FinancialRecord) => t.category === 'Revenue')
    const expenses = validTransactions.filter((t: FinancialRecord) => t.category !== 'Revenue')

    // Calculate totals
    const totalIncome = income.reduce((sum: number, t: FinancialRecord) => sum + safeParseAmount(t.amount), 0)
    const totalExpenses = expenses.reduce((sum: number, t: FinancialRecord) => sum + safeParseAmount(t.amount), 0)
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
      comparison = await calculateComparison(
        supabase, 
        (startDateParam ? startDateParam : new Date(new Date().setDate(1)).toISOString().split('T')[0]) as string, 
        (endDateParam ? endDateParam : new Date().toISOString().split('T')[0]) as string
      )
    }

    // Transform transactions for frontend
    const transactionsList = validTransactions.map((t: FinancialRecord) => ({
      id: t.id,
      reference_id: t.reference || t.id,
      date: t.date || '',
      description: safeString(t.description),
      category: safeString(t.category),
      amount: safeParseAmount(t.amount),
      type: t.category === 'Revenue' ? 'income' : 'expense'
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
      trend,
      comparison,
      top_income_sources: getTopTransactions(income, 5),
      top_expenses: getTopTransactions(expenses, 5),
      generated_at: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error generating cash flow report:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper: Group transactions by period
function groupByPeriod(transactions: FinancialRecord[], period: string) {
  const grouped: Record<string, PeriodCashFlow> = {}

  transactions.forEach(transaction => {
    let key = ''
    const date = new Date(transaction.date || '')

    switch (period) {
      case 'daily':
        key = transaction.date ?? ''
        break
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toString() !== 'Invalid Date' ? (weekStart.toISOString().split('T')[0] ?? '') : ''
        break
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'yearly':
        key = `${date.getFullYear()}`
        break
      default:
        key = transaction.date ?? ''
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
    const amount = safeParseAmount(transaction.amount)
    if (transaction.category === 'Revenue') {
      currentGroup.income += amount
    } else {
      currentGroup.expenses += amount
    }
    currentGroup.net_cash_flow = currentGroup.income - currentGroup.expenses
    currentGroup.transaction_count++
  })

  return Object.values(grouped).sort((a: PeriodCashFlow, b: PeriodCashFlow) =>
    a.period.localeCompare(b.period)
  )
}

// Helper: Calculate category breakdown
function calculateCategoryBreakdown(transactions: FinancialRecord[]) {
  const breakdown: Record<string, CategoryBreakdownProcessing> = {}

  transactions.forEach(transaction => {
    const category = safeString(transaction.category)
    const subcategory = 'Other' // No subcategory in financial_records

    if (!breakdown[category]) {
      breakdown[category] = {
        category,
        total: 0,
        count: 0,
        percentage: 0,
        subcategories: {} as Record<string, Subcategory>
      }
    }

    const amount = safeParseAmount(transaction.amount)
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
  const totalAmount = Object.values(breakdown).reduce((sum: number, cat: CategoryBreakdownProcessing) => sum + cat.total, 0)
  Object.values(breakdown).forEach((cat: CategoryBreakdownProcessing) => {
    cat.percentage = totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0
    ;(cat as unknown as CategoryBreakdown).subcategories = Object.values(cat.subcategories)
  })

  return Object.values(breakdown).map(cat => cat as unknown as CategoryBreakdown).sort((a: CategoryBreakdown, b: CategoryBreakdown) => b.total - a.total)
}

// Helper: Group by category for summary
function groupByCategory(transactions: FinancialRecord[]) {
  const grouped: Record<string, number> = {}
  transactions.forEach(t => {
    const category = safeString(t.category)
    grouped[category] = (grouped[category] || 0) + safeParseAmount(t.amount)
  })
  return grouped
}

// Helper: Calculate trend
function calculateTrend(cashFlowByPeriod: PeriodCashFlow[]) {
  if (cashFlowByPeriod.length < 2) {
    return {
      direction: 'stable' as const,
      change_percentage: 0,
      average_cash_flow: cashFlowByPeriod[0]?.net_cash_flow || 0
    }
  }

  const recentItem = cashFlowByPeriod[cashFlowByPeriod.length - 1]
  const previousItem = cashFlowByPeriod[cashFlowByPeriod.length - 2]
  
  if (!recentItem || !previousItem) {
    return {
      direction: 'stable' as const,
      change_percentage: 0,
      average_cash_flow: 0
    }
  }

  const recent = recentItem.net_cash_flow
  const previous = previousItem.net_cash_flow

  const change = recent - previous
  const changePercentage = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0

  const avgCashFlow = cashFlowByPeriod.reduce((sum: number, p) => sum + p.net_cash_flow, 0) / cashFlowByPeriod.length

  return {
    direction: (change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'),
    change_amount: change,
    change_percentage: changePercentage,
    average_cash_flow: avgCashFlow,
    highest_period: cashFlowByPeriod.reduce((max, p) => p.net_cash_flow > max.net_cash_flow ? p : max),
    lowest_period: cashFlowByPeriod.reduce((min, p) => p.net_cash_flow < min.net_cash_flow ? p : min)
  }
}

// Helper: Calculate comparison with previous period
async function calculateComparison(supabase: ReturnType<typeof createServiceRoleClient>, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const duration = end.getTime() - start.getTime()

  const prevStart = new Date(start.getTime() - duration)
  const prevEnd = new Date(start.getTime() - 1)

  const { data: prevTransactions } = await supabase
    .from('financial_records')
    .select('category, amount')
    .gte('date', prevStart.toISOString().split('T')[0])
    .lte('date', prevEnd.toISOString().split('T')[0])

  if (!prevTransactions) {
    return null
  }

  const prevIncome = prevTransactions.filter((t: FinancialRecord) => t.category === 'Revenue')
  const prevExpenses = prevTransactions.filter((t: FinancialRecord) => t.category !== 'Revenue')

  const prevTotalIncome = prevIncome.reduce((sum: number, t: FinancialRecord) => sum + safeParseAmount(t.amount), 0)
  const prevTotalExpenses = prevExpenses.reduce((sum: number, t: FinancialRecord) => sum + safeParseAmount(t.amount), 0)
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
function getTopTransactions(transactions: FinancialRecord[], limit: number) {
  return transactions
    .sort((a, b) => safeParseAmount(b.amount) - safeParseAmount(a.amount))
    .slice(0, limit)
    .map(t => ({
      description: safeString(t.description),
      amount: safeParseAmount(t.amount),
      date: t.date,
      category: safeString(t.category)
    }))
}

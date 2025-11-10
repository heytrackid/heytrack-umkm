// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'


 import { apiLogger } from '@/lib/logger'
 import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'


// Partial type for cash flow queries (only fields we fetch)
interface FinancialRecordPartial {
  id: string
  date: string | null
  description: string
  category: string
  amount: number
  reference: string | null
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

const normalizeDateParam = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
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
async function getHandler(request: NextRequest) {
  try {
    // ✅ CRITICAL FIX: Add authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')
    const periodParam = searchParams.get('period')
    const compare = searchParams.get('compare') === 'true'
    
    const defaultStartDate = new Date(new Date().setDate(1)).toISOString().split('T')[0] // First day of current month
    const defaultEndDate = new Date().toISOString().split('T')[0] // Today

    const startDate = normalizeDateParam(startDateParam) ?? defaultStartDate
    const endDate = normalizeDateParam(endDateParam) ?? defaultEndDate
    const period = periodParam ?? 'daily'

    // ✅ CRITICAL FIX: Filter by user_id for RLS
    const { data: transactions, error: transError } = await supabase
      .from('financial_records')
      .select('id, date, description, category, amount, reference')
      .eq('user_id', user['id']) // ✅ RLS enforcement
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
    const validTransactions = (transactions ?? []).filter((t: FinancialRecordPartial) => t.date !== null)
    const income = validTransactions.filter((t: FinancialRecordPartial) => t.category === 'Revenue')
    const expenses = validTransactions.filter((t: FinancialRecordPartial) => t.category !== 'Revenue')

    // Calculate totals
    const totalIncome = income.reduce((sum: number, t: FinancialRecordPartial) => sum + (t.amount ?? 0), 0)
    const totalExpenses = expenses.reduce((sum: number, t: FinancialRecordPartial) => sum + (t.amount ?? 0), 0)
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
        user['id'], // ✅ Pass user_id
        startDate ?? '',
        endDate ?? ''
      )
    }

    // Transform transactions for frontend
    const transactionsList = validTransactions.map((t: FinancialRecordPartial) => ({
      id: t['id'],
      reference_id: t.reference ?? t['id'],
       date: t.date ?? '',
       description: String(t.description),
       category: String(t.category),
       amount: t.amount ?? 0,
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
          total: transactions?.length ?? 0
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

  } catch (error) {
    apiLogger.error({ error }, 'Error generating cash flow report:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withSecurity(getHandler, SecurityPresets.enhanced())

// Helper: Group transactions by period
function groupByPeriod(transactions: FinancialRecordPartial[], period: string) {
  const grouped: Record<string, PeriodCashFlow> = {}

  transactions.forEach(transaction => {
    let key = ''
    const date = transaction.date ? new Date(transaction.date) : null

    switch (period) {
      case 'daily':
        key = transaction.date ?? ''
        break
      case 'weekly': {
        if (!date || Number.isNaN(date.getTime())) {
          key = ''
          break
        }
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = Number.isNaN(weekStart.getTime())
          ? ''
          : weekStart.toISOString().split('T')[0] ?? ''
        break
      }
      case 'monthly':
        key = date && !Number.isNaN(date.getTime())
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : ''
        break
      case 'yearly':
        key = date && !Number.isNaN(date.getTime()) ? `${date.getFullYear()}` : ''
        break
      default:
        key = transaction.date ?? ''
    }

    grouped[key] ??= {
      period: key,
      income: 0,
      expenses: 0,
      net_cash_flow: 0,
      transaction_count: 0
    }

    const currentGroup = grouped[key] ?? {
      income: 0,
      expenses: 0,
      net_cash_flow: 0,
      transaction_count: 0
    }
    const amount = transaction.amount ?? 0
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
function calculateCategoryBreakdown(transactions: FinancialRecordPartial[]) {
  const breakdown: Record<string, CategoryBreakdownProcessing> = {}

  transactions.forEach(transaction => {
    const category = String(transaction.category)
    const subcategory = 'Other' // No subcategory in financial_records

    breakdown[category] ??= {
      category,
      total: 0,
      count: 0,
      percentage: 0,
      subcategories: {} as Record<string, Subcategory>
    }

    const amount = transaction.amount ?? 0
    breakdown[category].total += amount
    breakdown[category].count++

    breakdown[category].subcategories[subcategory] ??= {
      name: subcategory,
      total: 0,
      count: 0
    }
    breakdown[category].subcategories[subcategory].total += amount
    breakdown[category].subcategories[subcategory].count++
  })

  // Calculate percentages
  const totalAmount = Object.values(breakdown).reduce((sum: number, cat: CategoryBreakdownProcessing) => sum + cat.total, 0)
  Object.values(breakdown).forEach((cat: CategoryBreakdownProcessing) => {
    cat.percentage = totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0
    // Convert subcategories record to array
    ;(cat as unknown as CategoryBreakdown).subcategories = Object.values(cat.subcategories)
  })

  return Object.values(breakdown).map((cat: CategoryBreakdownProcessing) => {
    const result: CategoryBreakdown = {
      category: cat.category,
      total: cat.total,
      count: cat.count,
      percentage: cat.percentage,
      subcategories: Object.values(cat.subcategories)
    }
    return result
  }).sort((a: CategoryBreakdown, b: CategoryBreakdown) => b.total - a.total)
}

// Helper: Group by category for summary
function groupByCategory(transactions: FinancialRecordPartial[]) {
  const grouped: Record<string, number> = {}
  transactions.forEach(t => {
    const category = String(t.category)
    grouped[category] = (grouped[category] ?? 0) + (t.amount ?? 0)
  })
  return grouped
}

// Helper: Calculate trend
function calculateTrend(cashFlowByPeriod: PeriodCashFlow[]) {
  if (cashFlowByPeriod.length < 2) {
    return {
      direction: 'stable' as const,
      change_percentage: 0,
      average_cash_flow: cashFlowByPeriod[0]?.net_cash_flow ?? 0
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

  let direction: 'decreasing' | 'increasing' | 'stable' = 'stable'
  if (change > 0) {
    direction = 'increasing'
  } else if (change < 0) {
    direction = 'decreasing'
  }

  return {
    direction,
    change_amount: change,
    change_percentage: changePercentage,
    average_cash_flow: avgCashFlow,
    highest_period: cashFlowByPeriod.reduce((max, p) => p.net_cash_flow > max.net_cash_flow ? p : max),
    lowest_period: cashFlowByPeriod.reduce((min, p) => p.net_cash_flow < min.net_cash_flow ? p : min)
  }
}

// Helper: Calculate comparison with previous period
async function calculateComparison(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const duration = end.getTime() - start.getTime()

  const prevStart = new Date(start.getTime() - duration)
  const prevEnd = new Date(start.getTime() - 1)

  // ✅ CRITICAL FIX: Filter by user_id
  const { data: prevTransactions } = await supabase
    .from('financial_records')
    .select('category, amount')
    .eq('user_id', userId) // ✅ RLS enforcement
    .gte('date', prevStart.toISOString().split('T')[0])
    .lte('date', prevEnd.toISOString().split('T')[0])

  if (!prevTransactions) {
    return null
  }

  // Type for the limited query result
  interface LimitedRecord { category: string; amount: number }
  
  const prevIncome = prevTransactions.filter((t: LimitedRecord) => t.category === 'Revenue')
  const prevExpenses = prevTransactions.filter((t: LimitedRecord) => t.category !== 'Revenue')

  const prevTotalIncome = prevIncome.reduce((sum: number, t: LimitedRecord) => sum + (value => value ?? 0)(t.amount), 0)
  const prevTotalExpenses = prevExpenses.reduce((sum: number, t: LimitedRecord) => sum + (value => value ?? 0)(t.amount), 0)
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
function getTopTransactions(transactions: FinancialRecordPartial[], limit: number) {
  return transactions
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
    .slice(0, limit)
    .map(t => ({
      description: String(t.description),
      amount: t.amount ?? 0,
      date: t.date,
      category: String(t.category)
    }))
}

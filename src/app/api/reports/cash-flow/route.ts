import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

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
    
    const supabase = createServerSupabaseAdmin()
    
    // Get all transactions (income and expenses) within date range
    const { data: transactions, error: transError } = await (supabase as any)
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: true })
    
    if (transError) {
      console.error('Error fetching transactions:', transError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }
    
    // Separate income and expenses
    const income = transactions?.filter((t: any) => t.category === 'Revenue') || []
    const expenses = transactions?.filter((t: any) => t.category !== 'Revenue') || []
    
    // Calculate totals
    const totalIncome = income.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    const totalExpenses = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    const netCashFlow = totalIncome - totalExpenses
    
    // Group by period
    const cashFlowByPeriod = groupByPeriod(transactions || [], period)
    
    // Category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(transactions || [])
    
    // Trend analysis
    const trend = calculateTrend(cashFlowByPeriod)
    
    // Compare with previous period if requested
    let comparison = null
    if (compare) {
      comparison = await calculateComparison(supabase, startDate, endDate, period)
    }
    
    // Transform transactions for frontend
    const transactionsList = transactions?.map((t: any) => ({
      id: t.id,
      reference_id: t.reference_id || t.id,
      date: t.expense_date,
      description: t.description,
      category: t.category === 'Revenue' ? (t.subcategory || 'Penjualan Produk') : t.category,
      amount: Number(t.amount),
      type: t.category === 'Revenue' ? 'income' : 'expense'
    })) || []

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
    
  } catch (error: any) {
    console.error('Error generating cash flow report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper: Group transactions by period
function groupByPeriod(transactions: any[], period: string) {
  const grouped: Record<string, any> = {}
  
  transactions.forEach(transaction => {
    let key = ''
    const date = new Date(transaction.expense_date)
    
    switch (period) {
      case 'daily':
        key = transaction.expense_date
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
        key = transaction.expense_date
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
    
    const amount = Number(transaction.amount)
    if (transaction.category === 'Revenue') {
      grouped[key].income += amount
    } else {
      grouped[key].expenses += amount
    }
    grouped[key].net_cash_flow = grouped[key].income - grouped[key].expenses
    grouped[key].transaction_count++
  })
  
  return Object.values(grouped).sort((a: any, b: any) => 
    a.period.localeCompare(b.period)
  )
}

// Helper: Calculate category breakdown
function calculateCategoryBreakdown(transactions: any[]) {
  const breakdown: Record<string, any> = {}
  
  transactions.forEach(transaction => {
    const category = transaction.category
    const subcategory = transaction.subcategory || 'Other'
    
    if (!breakdown[category]) {
      breakdown[category] = {
        category: category,
        total: 0,
        count: 0,
        percentage: 0,
        subcategories: {}
      }
    }
    
    const amount = Number(transaction.amount)
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
  const totalAmount = Object.values(breakdown).reduce((sum: number, cat: any) => sum + cat.total, 0)
  Object.values(breakdown).forEach((cat: any) => {
    cat.percentage = totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0
    cat.subcategories = Object.values(cat.subcategories)
  })
  
  return Object.values(breakdown).sort((a: any, b: any) => b.total - a.total)
}

// Helper: Group by category for summary
function groupByCategory(transactions: any[]) {
  const grouped: Record<string, number> = {}
  transactions.forEach(t => {
    const category = t.category === 'Revenue' ? (t.subcategory || 'Penjualan Produk') : t.category
    grouped[category] = (grouped[category] || 0) + Number(t.amount)
  })
  return grouped
}

// Helper: Calculate trend
function calculateTrend(cashFlowByPeriod: any[]) {
  if (cashFlowByPeriod.length < 2) {
    return {
      direction: 'stable',
      change_percentage: 0,
      average_cash_flow: cashFlowByPeriod[0]?.net_cash_flow || 0
    }
  }
  
  const recent = cashFlowByPeriod[cashFlowByPeriod.length - 1].net_cash_flow
  const previous = cashFlowByPeriod[cashFlowByPeriod.length - 2].net_cash_flow
  
  const change = recent - previous
  const changePercentage = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0
  
  const avgCashFlow = cashFlowByPeriod.reduce((sum, p) => sum + p.net_cash_flow, 0) / cashFlowByPeriod.length
  
  return {
    direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
    change_amount: change,
    change_percentage: changePercentage,
    average_cash_flow: avgCashFlow,
    highest_period: cashFlowByPeriod.reduce((max, p) => p.net_cash_flow > max.net_cash_flow ? p : max),
    lowest_period: cashFlowByPeriod.reduce((min, p) => p.net_cash_flow < min.net_cash_flow ? p : min)
  }
}

// Helper: Calculate comparison with previous period
async function calculateComparison(supabase: any, startDate: string, endDate: string, period: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const duration = end.getTime() - start.getTime()
  
  const prevStart = new Date(start.getTime() - duration)
  const prevEnd = new Date(start.getTime() - 1)
  
  const { data: prevTransactions } = await supabase
    .from('expenses')
    .select('*')
    .gte('expense_date', prevStart.toISOString().split('T')[0])
    .lte('expense_date', prevEnd.toISOString().split('T')[0])
  
  if (!prevTransactions) {
    return null
  }
  
  const prevIncome = prevTransactions.filter((t: any) => t.category === 'Revenue')
  const prevExpenses = prevTransactions.filter((t: any) => t.category !== 'Revenue')
  
  const prevTotalIncome = prevIncome.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
  const prevTotalExpenses = prevExpenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
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
function getTopTransactions(transactions: any[], limit: number) {
  return transactions
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, limit)
    .map(t => ({
      description: t.description,
      amount: Number(t.amount),
      date: t.expense_date,
      category: t.category,
      subcategory: t.subcategory
    }))
}

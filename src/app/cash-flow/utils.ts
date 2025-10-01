import type { CashFlowData, Transaction, ChartDataPoint } from './constants'

/**
 * Calculate date range based on period type
 */
export function calculateDateRange(period: 'week' | 'month' | 'year' | 'custom', startDate?: string, endDate?: string) {
  const today = new Date()
  let calculatedStartDate = startDate
  let calculatedEndDate = endDate || today.toISOString().split('T')[0]

  if (!startDate) {
    if (period === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      calculatedStartDate = weekAgo.toISOString().split('T')[0]
    } else if (period === 'month') {
      calculatedStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    } else if (period === 'year') {
      calculatedStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
    }
  }

  return { startDate: calculatedStartDate, endDate: calculatedEndDate }
}

/**
 * Prepare chart data from transactions
 */
export function prepareChartData(transactions: Transaction[]): ChartDataPoint[] {
  if (!transactions || transactions.length === 0) return []

  const dataByDate: Record<string, { date: string; income: number; expense: number; net: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

    if (!dataByDate[date]) {
      dataByDate[date] = { date, income: 0, expense: 0, net: 0 }
    }

    if (transaction.type === 'income') {
      dataByDate[date].income += transaction.amount
    } else {
      dataByDate[date].expense += transaction.amount
    }
    dataByDate[date].net = dataByDate[date].income - dataByDate[date].expense
  })

  return Object.values(dataByDate).sort((a, b) => {
    // Sort by date
    return a.date.localeCompare(b.date)
  }).slice(-14) // Last 14 days
}

/**
 * Validate transaction form data
 */
export function validateTransactionForm(formData: {
  description: string
  category: string
  amount: string
  date: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!formData.description.trim()) {
    errors.push('Deskripsi transaksi wajib diisi')
  }

  if (!formData.category) {
    errors.push('Kategori wajib dipilih')
  }

  if (!formData.amount || isNaN(parseFloat(formData.amount))) {
    errors.push('Jumlah harus berupa angka yang valid')
  } else {
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      errors.push('Jumlah harus lebih dari 0')
    }
  }

  if (!formData.date) {
    errors.push('Tanggal wajib diisi')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format currency for display (similar to settings formatCurrency)
 */
export function formatCurrency(amount: number): string {
  // This would typically come from settings context, but for utility purposes
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Calculate summary totals from transactions
 */
export function calculateSummary(transactions: Transaction[]) {
  const total_income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const total_expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const net_cash_flow = total_income - total_expenses

  // Calculate by category
  const income_by_category: Record<string, number> = {}
  const expenses_by_category: Record<string, number> = {}

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      income_by_category[transaction.category] = (income_by_category[transaction.category] || 0) + transaction.amount
    } else {
      expenses_by_category[transaction.category] = (expenses_by_category[transaction.category] || 0) + transaction.amount
    }
  })

  return {
    total_income,
    total_expenses,
    net_cash_flow,
    income_by_category,
    expenses_by_category
  }
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: CashFlowData, filename: string) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount']
  const rows = data.transactions.map(transaction => [
    transaction.date,
    `"${transaction.description}"`,
    transaction.category,
    transaction.type,
    transaction.amount.toString()
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

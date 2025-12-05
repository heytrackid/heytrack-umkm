'use client'

import { ArrowDownIcon, ArrowUpIcon, DollarSign, Filter, Plus, Search, TrendingDown, TrendingUp } from '@/components/icons'
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { CashFlowLoading } from '@/components/loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChartComponent, PieChartComponent } from '@/components/ui/charts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { useCreateFinancialRecord, useFinancialRecords } from '@/hooks/useFinancialRecords'
import { handleError } from '@/lib/error-handling'
import type { FinancialRecord } from '@/types/database'




interface CashFlowSummary {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  transactionCount: number
}

const CashFlowPage = () => {
  const { formatCurrency } = useCurrency()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // React Query hooks
  const createMutation = useCreateFinancialRecord()

  // Build query parameters for filtering
  const queryParams = {
    ...(typeFilter !== 'all' && typeFilter === 'income' && { type: 'INCOME' as const }),
    ...(typeFilter !== 'all' && typeFilter === 'expense' && { type: 'EXPENSE' as const }),
    ...(searchTerm && { search: searchTerm }),
  }

   const { data, isLoading: loading, error: _error } = useFinancialRecords(queryParams)

  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    description: '',
    category: '',
    amount: '',
    date: '',
  })

  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.description || !newTransaction.category || !newTransaction.amount) {
        handleError(new Error('Validation failed'), 'Add transaction validation', true, 'Mohon lengkapi semua field')
        return
      }

      const transactionData = {
        type: newTransaction.type,
        description: newTransaction.description,
        category: newTransaction.category,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
        user_id: user?.id || '',
      } as const

      await createMutation.mutateAsync(transactionData)

      setIsAddDialogOpen(false)
      setNewTransaction({
        type: 'EXPENSE',
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]!
      })
      } catch (error) {
      // Error handling is done by the mutation, but provide fallback
      handleError(error, 'Add transaction', true, 'Gagal menambahkan transaksi')
    }
  }

  // Memoize filtered records with date range
   const filteredRecords = useMemo(() => {
     const records = data ?? []
     return records.filter((record) => {
       const matchesSearch = record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             record.category?.toLowerCase().includes(searchTerm.toLowerCase())
       
       // Date range filter
       let matchesDateRange = true
       if (dateRange?.from && dateRange?.to && record.date) {
         try {
           const recordDate = parseISO(record.date)
           matchesDateRange = isWithinInterval(recordDate, { start: dateRange.from, end: dateRange.to })
         } catch {
           matchesDateRange = true
         }
       }
       
       return matchesSearch && record.date && matchesDateRange
     })
   }, [data, searchTerm, dateRange])

  // Chart data for trends
  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; income: number; expense: number }> = {}
    
    filteredRecords.forEach((record) => {
      if (!record.date) return
      const dateKey = format(parseISO(record.date), 'dd MMM', { locale: idLocale })
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, income: 0, expense: 0 }
      }
      
      if (record.type === 'INCOME') {
        dailyData[dateKey]!.income += record.amount
      } else {
        dailyData[dateKey]!.expense += record.amount
      }
    })
    
    return Object.values(dailyData).slice(-14) // Last 14 days
  }, [filteredRecords])

  // Pie chart data for expense categories
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    
    filteredRecords
      .filter((r) => r.type === 'EXPENSE')
      .forEach((record) => {
        const category = record.category || 'Lainnya'
        categoryTotals[category] = (categoryTotals[category] || 0) + record.amount
      })
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 categories
  }, [filteredRecords])

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  // Ensure current page is valid after filtering
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages))
  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  // Memoize summary calculations
  const summary: CashFlowSummary = useMemo(() => {
    const totalIncome = filteredRecords.filter((r) => r.type === 'INCOME').reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = filteredRecords.filter((r) => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0)
    
    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      transactionCount: filteredRecords.length
    }
  }, [filteredRecords])



  // Show loading state for entire page
  if (loading) {
    return (
      <AppLayout pageTitle="Arus Kas">
        <CashFlowLoading />
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Arus Kas">
      <div className="space-y-6">
        <PageHeader
          title="Arus Kas"
          description="Kelola pemasukan dan pengeluaran bisnis Anda"
          action={
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Transaksi Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tipe Transaksi</label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value: 'INCOME' | 'EXPENSE') => setNewTransaction(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Pemasukan</SelectItem>
                        <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deskripsi</label>
                    <Input
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi transaksi"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Kategori</label>
                    <Input
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Kategori (contoh: Operasional, Penjualan)"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Jumlah</label>
                    <Input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tanggal</label>
                    <Input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddTransaction} className="w-full">
                    Simpan Transaksi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Pemasukan</span>
                  <div className="p-2 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg">
                    <ArrowUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                    {formatCurrency(summary.totalIncome)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Pengeluaran</span>
                  <div className="p-2 bg-rose-100/50 dark:bg-rose-900/20 rounded-lg">
                    <ArrowDownIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">
                    {formatCurrency(summary.totalExpenses)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Arus Kas Bersih</span>
                  <div className={`p-2 rounded-lg ${summary.netCashFlow >= 0 ? 'bg-emerald-100/50 dark:bg-emerald-900/20' : 'bg-rose-100/50 dark:bg-rose-900/20'}`}>
                    {summary.netCashFlow >= 0 ? (
                      <TrendingUp className={`h-4 w-4 ${summary.netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} aria-label="Positive cash flow" />
                    ) : (
                      <TrendingDown className={`h-4 w-4 ${summary.netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} aria-label="Negative cash flow" />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                    {formatCurrency(summary.netCashFlow)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Transaksi</span>
                  <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-label="Total Transaksi" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {summary.transactionCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari transaksi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Tipe Transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Pilih periode"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        {filteredRecords.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Trend Chart */}
            <AreaChartComponent
              data={chartData}
              title="Tren Arus Kas"
              description="Pemasukan vs Pengeluaran"
              dataKey={['income', 'expense']}
              xAxisKey="date"
              config={{
                income: { label: 'Pemasukan', color: 'hsl(142, 76%, 36%)' },
                expense: { label: 'Pengeluaran', color: 'hsl(0, 84%, 60%)' },
              }}
              height={250}
              showLegend
            />
            
            {/* Expense Categories Pie Chart */}
            {pieChartData.length > 0 && (
              <PieChartComponent
                data={pieChartData}
                title="Kategori Pengeluaran"
                description="Distribusi pengeluaran per kategori"
                dataKey="value"
                nameKey="name"
                height={250}
                donut
                showLegend
              />
            )}
          </div>
        )}



        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <EmptyState
                {...EmptyStatePresets.financial}
                actions={[
                  {
                    label: 'Tambah Transaksi',
                    onClick: () => setIsAddDialogOpen(true),
                    icon: Plus
                  }
                ]}
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {paginatedRecords.map((record: FinancialRecord) => (
                        <TableRow key={record.id}>
                           <TableCell>
                             {record.date ? format(new Date(record.date), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                           </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>{record.category}</TableCell>
                          <TableCell>
                            <Badge variant={record.type === 'INCOME' ? 'default' : 'destructive'}>
                              {record.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                   {paginatedRecords.map((record: FinancialRecord) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{record.description}</p>
                           <p className="text-sm text-muted-foreground">
                             {record.date ? format(new Date(record.date), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                           </p>
                        </div>
                        <Badge variant={record.type === 'INCOME' ? 'default' : 'destructive'}>
                          {record.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{record.category}</span>
                        <span className={`font-medium ${
                          record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} dari {filteredRecords.length} transaksi
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            return page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 1
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            const prevPage = array[index - 1]
                            const showEllipsis = prevPage && page - prevPage > 1
                            
                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsis && <span className="px-2">...</span>}
                                <Button
                                  variant={currentPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              </div>
                            )
                          })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default CashFlowPage
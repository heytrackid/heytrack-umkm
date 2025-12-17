'use client'

import { Filter, Plus } from '@/components/icons'
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useCallback, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { CashFlowLoading } from '@/components/loading'
import { SharedDataTable } from '@/components/shared/SharedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChartComponent, PieChartComponent } from '@/components/ui/charts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BreadcrumbPatterns, PageBreadcrumb, StatCardPatterns, StatsCards } from '@/components/ui/index'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { useCreateFinancialRecord, useDeleteFinancialRecord, useFinancialRecords } from '@/hooks/useFinancialRecords'
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
  useAuth()

  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // React Query hooks
  const createMutation = useCreateFinancialRecord()
  const deleteMutation = useDeleteFinancialRecord()

  // Build query parameters
  const queryParams = {
    ...(typeFilter !== 'all' && typeFilter === 'income' && { type: 'INCOME' as const }),
    ...(typeFilter !== 'all' && typeFilter === 'expense' && { type: 'EXPENSE' as const }),
  }

  const { data, isLoading: loading, refetch } = useFinancialRecords(queryParams)

  // Form state
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0] ?? '',
  })

  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.description || !newTransaction.category || !newTransaction.amount) {
        handleError(new Error('Validation failed'), 'Add transaction validation', true, 'Mohon lengkapi semua field')
        return
      }

      const today = new Date().toISOString().split('T')[0] ?? ''
      await createMutation.mutateAsync({
        type: newTransaction.type,
        description: newTransaction.description,
        category: newTransaction.category,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date || today,
      })

      setIsAddDialogOpen(false)
      setNewTransaction({
        type: 'EXPENSE',
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]!
      })
    } catch (error) {
      handleError(error, 'Add transaction', true, 'Gagal menambahkan transaksi')
    }
  }

  const handleDeleteTransaction = useCallback((record: FinancialRecord) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      deleteMutation.mutate(record.id)
    }
  }, [deleteMutation])

  // Filter by date range
  const filteredRecords = useMemo(() => {
    const records = data ?? []
    return records.filter((record) => {
      if (!dateRange?.from || !dateRange?.to || !record.date) return true
      try {
        const recordDate = parseISO(record.date)
        return isWithinInterval(recordDate, { start: dateRange.from, end: dateRange.to })
      } catch {
        return true
      }
    })
  }, [data, dateRange])

  // Chart data
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
    return Object.values(dailyData).slice(-14)
  }, [filteredRecords])

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
      .slice(0, 6)
  }, [filteredRecords])

  // Summary
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

  // Table columns for SharedDataTable
  const columns = useMemo(() => [
    {
      key: 'date' as const,
      header: 'Tanggal',
      render: (value: unknown) => value ? format(new Date(value as string), 'dd MMM yyyy', { locale: idLocale }) : '-',
    },
    {
      key: 'description' as const,
      header: 'Deskripsi',
    },
    {
      key: 'category' as const,
      header: 'Kategori',
    },
    {
      key: 'type' as const,
      header: 'Tipe',
      filterable: true,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Pemasukan', value: 'INCOME' },
        { label: 'Pengeluaran', value: 'EXPENSE' },
      ],
      render: (value: unknown) => (
        <Badge variant={value === 'INCOME' ? 'default' : 'destructive'}>
          {value === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
        </Badge>
      ),
    },
    {
      key: 'amount' as const,
      header: 'Jumlah',
      render: (value: unknown, item: FinancialRecord) => (
        <span className={`font-medium ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
          {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(value as number)}
        </span>
      ),
    },
  ], [formatCurrency])

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
        <PageBreadcrumb items={BreadcrumbPatterns.cashFlow} />

        <PageHeader
          title="Arus Kas"
          description="Kelola pemasukan dan pengeluaran bisnis Anda"
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          }
        />

        {/* Add Transaction Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <Button onClick={handleAddTransaction} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Summary Cards */}
        <StatsCards stats={StatCardPatterns.cashFlow({
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          netCashFlow: summary.netCashFlow,
          transactionCount: summary.transactionCount,
          formatCurrency
        })} />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
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
          </CardContent>
        </Card>

        {/* Charts */}
        {filteredRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Transactions Table using SharedDataTable */}
        <SharedDataTable
          data={filteredRecords}
          columns={columns}
          title="Riwayat Transaksi"
          onAdd={() => setIsAddDialogOpen(true)}
          onDelete={handleDeleteTransaction}
          onRefresh={() => refetch()}
          addButtonText="Tambah Transaksi"
          searchPlaceholder="Cari transaksi..."
          emptyMessage="Belum ada transaksi"
          emptyDescription="Mulai catat pemasukan dan pengeluaran bisnis Anda"
          exportable
          refreshable
          enablePagination
          pageSizeOptions={[10, 25, 50]}
          initialPageSize={10}
        />
      </div>
    </AppLayout>
  )
}

export default CashFlowPage

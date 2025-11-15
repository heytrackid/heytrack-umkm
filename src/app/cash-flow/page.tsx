'use client'

import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Filter, Plus, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'

interface FinancialRecord {
  id: string
  description: string
  category: string
  amount: number
  date: string
  type: 'INCOME' | 'EXPENSE'
  reference: string
  created_at: string
}

interface CashFlowSummary {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  transactionCount: number
}

const CashFlowPage = () => {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()

  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (dateFilter !== 'all') {
        const today = new Date()
        const startDate = new Date()

        switch (dateFilter) {
          case 'today':
            // startDate is already today
            break
          case 'week':
            startDate.setDate(today.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(today.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(today.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(today.getFullYear() - 1)
            break
        }

        params.set('start_date', startDate.toISOString().split('T')[0])
        params.set('end_date', today.toISOString().split('T')[0])
      }

      if (typeFilter !== 'all') {
        params.set('type', typeFilter)
      }

      const response = await fetch(`/api/financial/records?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setRecords(result.data)
        }
      }
    } catch (error) {
      apiLogger.error({ error }, 'Error fetching financial records')
      toast({
        title: 'Error',
        description: 'Gagal memuat data arus kas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [dateFilter, typeFilter, toast])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.description || !newTransaction.category || !newTransaction.amount) {
        toast({
          title: 'Error',
          description: 'Mohon lengkapi semua field',
          variant: 'destructive'
        })
        return
      }

      const response = await fetch('/api/financial/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: newTransaction.type,
          description: newTransaction.description,
          category: newTransaction.category,
          amount: parseFloat(newTransaction.amount),
          date: newTransaction.date
        })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Transaksi berhasil ditambahkan'
        })
        setIsAddDialogOpen(false)
        setNewTransaction({
          type: 'EXPENSE',
          description: '',
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        })
        fetchRecords()
      } else {
        throw new Error('Failed to add transaction')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menambahkan transaksi',
        variant: 'destructive'
      })
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const summary: CashFlowSummary = {
    totalIncome: filteredRecords.filter(r => r.type === 'INCOME').reduce((sum, r) => sum + r.amount, 0),
    totalExpenses: filteredRecords.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0),
    netCashFlow: 0,
    transactionCount: filteredRecords.length
  }
  summary.netCashFlow = summary.totalIncome - summary.totalExpenses

  const expenseCategories = filteredRecords
    .filter(r => r.type === 'EXPENSE')
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount
      return acc
    }, {} as Record<string, number>)

  return (
    <AppLayout pageTitle="Arus Kas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" aria-label="Arus Kas" />
              Arus Kas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola pemasukan dan pengeluaran bisnis Anda
            </p>
          </div>
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
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arus Kas Bersih</CardTitle>
              {summary.netCashFlow >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" aria-label="Positive cash flow" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" aria-label="Negative cash flow" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netCashFlow)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" aria-label="Total Transaksi" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.transactionCount}
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
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">7 Hari Terakhir</SelectItem>
                  <SelectItem value="month">30 Hari Terakhir</SelectItem>
                  <SelectItem value="quarter">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="year">1 Tahun Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories Breakdown */}
        {Object.keys(expenseCategories).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Breakdown Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(expenseCategories)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-12 rounded" />
                ))}
              </div>
             ) : filteredRecords.length === 0 ? (
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
                       {filteredRecords.map((record) => (
                         <TableRow key={record.id}>
                           <TableCell>
                             {format(new Date(record.date), 'dd MMM yyyy', { locale: idLocale })}
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
                   {filteredRecords.map((record) => (
                     <Card key={record.id} className="p-4">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <p className="font-medium">{record.description}</p>
                           <p className="text-sm text-muted-foreground">
                             {format(new Date(record.date), 'dd MMM yyyy', { locale: idLocale })}
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
               </>
             )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default CashFlowPage
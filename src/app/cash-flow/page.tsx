'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useSettings } from '@/contexts/settings-context'
import { useResponsive } from '@/hooks/use-mobile'
import PrefetchLink from '@/components/ui/prefetch-link'
import {
  DollarSign,
  Download,
  Calendar,
  AlertCircle,
  Loader2,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Receipt,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
  reference_id?: string
}

interface CashFlowData {
  summary: {
    total_income: number
    total_expenses: number
    net_cash_flow: number
    income_by_category: Record<string, number>
    expenses_by_category: Record<string, number>
  }
  transactions: Transaction[]
}

export default function CashFlowPage() {
  const { formatCurrency } = useSettings()
  const { isMobile } = useResponsive()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null)
  
  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Transaction form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  const incomeCategories = [
    'Penjualan Produk',
    'Jasa Catering',
    'Pre-Order',
    'Penjualan Online',
    'Event & Wedding',
    'Lainnya'
  ]
  
  const expenseCategories = [
    'Bahan Baku',
    'Gaji Karyawan',
    'Operasional',
    'Utilities',
    'Marketing',
    'Transportasi',
    'Peralatan',
    'Sewa Tempat',
    'Lainnya'
  ]

  useEffect(() => {
    fetchCashFlowData()
  }, [selectedPeriod, startDate, endDate])

  const fetchCashFlowData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const today = new Date()
      let calculatedStartDate = startDate
      let calculatedEndDate = endDate || today.toISOString().split('T')[0]
      
      if (!startDate) {
        if (selectedPeriod === 'week') {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          calculatedStartDate = weekAgo.toISOString().split('T')[0]
        } else if (selectedPeriod === 'month') {
          calculatedStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        } else if (selectedPeriod === 'year') {
          calculatedStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
        }
      }

      const params = new URLSearchParams()
      if (calculatedStartDate) params.append('start_date', calculatedStartDate)
      if (calculatedEndDate) params.append('end_date', calculatedEndDate)

      const response = await fetch(`/api/reports/cash-flow?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data arus kas')
      }

      const data = await response.json()
      setCashFlowData(data)
    } catch (err: any) {
      console.error('Error fetching cash flow data:', err)
      setError(err.message || 'Terjadi kesalahan saat mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async () => {
    if (!formData.description || !formData.category || !formData.amount) {
      alert('Mohon isi semua field!')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Jumlah harus lebih dari 0')
      return
    }

    try {
      setLoading(true)

      if (transactionType === 'expense') {
        // Save to expenses table
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: formData.description,
            category: formData.category,
            amount: amount,
            expense_date: formData.date,
          })
        })

        if (!response.ok) throw new Error('Gagal menyimpan pengeluaran')
      }

      // Reset form
      setFormData({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      })
      setIsAddDialogOpen(false)
      
      // Refresh data
      await fetchCashFlowData()
      
    } catch (err: any) {
      console.error('Error adding transaction:', err)
      alert('Gagal menambah transaksi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!confirm(`Hapus transaksi "${transaction.description}"?`)) return

    try {
      setLoading(true)

      if (transaction.type === 'expense' && transaction.reference_id) {
        const response = await fetch(`/api/expenses/${transaction.reference_id}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Gagal menghapus transaksi')
      }

      await fetchCashFlowData()
    } catch (err: any) {
      console.error('Error deleting transaction:', err)
      alert('Gagal menghapus transaksi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data - group by date - MOVED BEFORE EARLY RETURNS
  const chartData = React.useMemo(() => {
    if (!cashFlowData || !cashFlowData.transactions) return []
    
    const dataByDate: Record<string, { date: string; income: number; expense: number; net: number }> = {}
    
    cashFlowData.transactions.forEach(transaction => {
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
  }, [cashFlowData])

  const exportReport = async (format: 'csv' | 'xlsx') => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      params.append('export', format)

      const response = await fetch(`/api/reports/cash-flow?${params.toString()}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arus-kas-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting report:', err)
      alert('Gagal mengekspor laporan')
    }
  }

  if (loading && !cashFlowData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Memuat data arus kas...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchCashFlowData}>Coba Lagi</Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  if (!cashFlowData) return null

  const { summary, transactions } = cashFlowData

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Arus Kas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'justify-between items-center'}`}>
          <div>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Arus Kas
            </h1>
            <p className="text-muted-foreground">
              Kelola semua transaksi pemasukan dan pengeluaran
            </p>
          </div>
          
          <div className={`flex gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className={isMobile ? 'w-full' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Transaksi Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipe Transaksi</Label>
                    <Select 
                      value={transactionType} 
                      onValueChange={(value: 'income' | 'expense') => {
                        setTransactionType(value)
                        setFormData(prev => ({ ...prev, category: '' }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">
                          <div className="flex items-center gap-2">
                            <ArrowUpCircle className="h-4 w-4 text-green-600" />
                            Pemasukan
                          </div>
                        </SelectItem>
                        <SelectItem value="expense">
                          <div className="flex items-center gap-2">
                            <ArrowDownCircle className="h-4 w-4 text-red-600" />
                            Pengeluaran
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {(transactionType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Deskripsi</Label>
                    <Textarea
                      placeholder="Contoh: Pembelian tepung terigu 10kg"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jumlah (Rp)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddTransaction} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              onClick={() => exportReport('csv')}
              className={isMobile ? 'w-full' : ''}
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter Periode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-4'}`}>
              <div>
                <label className="text-sm font-medium mb-2 block">Periode</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Minggu Ini</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                    <SelectItem value="year">Tahun Ini</SelectItem>
                    <SelectItem value="custom">Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPeriod === 'custom' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-end">
                <Button onClick={fetchCashFlowData} className="w-full" disabled={loading}>
                  {loading ? 'Memuat...' : 'Terapkan Filter'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* Total Income */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Total Pemasukan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_income)}
              </p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4" />
                Total Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_expenses)}
              </p>
            </CardContent>
          </Card>

          {/* Net Cash Flow */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Arus Kas Bersih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${
                summary.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.net_cash_flow)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Trend Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tren Arus Kas
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Grafik pemasukan, pengeluaran, dan arus kas bersih
                  </CardDescription>
                </div>
                <div className={`flex ${isMobile ? 'flex-col w-full' : 'gap-2'} ${!isMobile && 'gap-2'}`}>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[140px]'} h-9`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">7 Hari</SelectItem>
                      <SelectItem value="month">30 Hari</SelectItem>
                      <SelectItem value="year">1 Tahun</SelectItem>
                      <SelectItem value="custom">Kustom</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedPeriod === 'custom' && (
                    <div className={`flex gap-2 ${isMobile ? 'mt-2' : ''}`}>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`h-9 ${isMobile ? 'flex-1' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                        placeholder="Mulai"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`h-9 ${isMobile ? 'flex-1' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                        placeholder="Akhir"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                        return value.toString()
                      }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-2">{payload[0].payload.date}</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                  <span>Pemasukan: {formatCurrency(payload[0].value as number)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                  <span>Pengeluaran: {formatCurrency(payload[1].value as number)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                  <span>Arus Kas Bersih: {formatCurrency(payload[2].value as number)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => {
                        const labels: Record<string, string> = {
                          income: 'Pemasukan',
                          expense: 'Pengeluaran',
                          net: 'Arus Kas Bersih'
                        }
                        return labels[value] || value
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>
              Semua transaksi pemasukan dan pengeluaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada transaksi di periode ini</p>
                <p className="text-sm mt-2">Klik "Tambah Transaksi" untuk memulai</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction, index) => (
                  <div 
                    key={`${transaction.id}-${index}`} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{transaction.description}</p>
                        <div className="flex gap-2 items-center text-xs text-muted-foreground">
                          <span>{transaction.date}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      {transaction.type === 'expense' && transaction.reference_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {(Object.keys(summary.income_by_category || {}).length > 0 || 
          Object.keys(summary.expenses_by_category || {}).length > 0) && (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* Income by Category */}
            {Object.keys(summary.income_by_category || {}).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pemasukan per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(summary.income_by_category).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{category}</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expenses by Category */}
            {Object.keys(summary.expenses_by_category || {}).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(summary.expenses_by_category).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{category}</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

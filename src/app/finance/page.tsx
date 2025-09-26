'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SmartFinancialDashboard } from '@/components/automation/smart-financial-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFinancialRecords, useSupabaseMutations } from '@/hooks/useSupabaseData'
import { 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  BarChart3,
  AlertTriangle
} from 'lucide-react'

// Sample data
const sampleTransactions = [
  {
    id: '1',
    type: 'INCOME',
    category: 'Penjualan',
    amount: 2450000,
    description: 'Penjualan harian 25 Jan 2024',
    date: '2024-01-25',
    reference: 'SAL-20240125',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '2',
    type: 'EXPENSE',
    category: 'Bahan Baku',
    amount: 600000,
    description: 'Pembelian tepung terigu 50kg',
    date: '2024-01-25',
    reference: 'PO-2024-001',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED'
  },
  {
    id: '3',
    type: 'INCOME',
    category: 'Penjualan',
    amount: 1850000,
    description: 'Penjualan B2B PT. Kue Mantap',
    date: '2024-01-24',
    reference: 'ORD-20240124-002',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED'
  },
  {
    id: '4',
    type: 'EXPENSE',
    category: 'Operasional',
    amount: 300000,
    description: 'Biaya listrik bulan Januari',
    date: '2024-01-24',
    reference: 'UTIL-001',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED'
  },
  {
    id: '5',
    type: 'EXPENSE',
    category: 'Gaji',
    amount: 2500000,
    description: 'Gaji karyawan minggu ke-4',
    date: '2024-01-23',
    reference: 'SAL-W4-2024',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '6',
    type: 'INCOME',
    category: 'Penjualan',
    amount: 1200000,
    description: 'Pesanan catering ulang tahun',
    date: '2024-01-22',
    reference: 'ORD-20240122-003',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '7',
    type: 'EXPENSE',
    category: 'Equipment',
    amount: 850000,
    description: 'Service mixer besar',
    date: '2024-01-21',
    reference: 'MAINT-001',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '8',
    type: 'INCOME',
    category: 'Lain-lain',
    amount: 150000,
    description: 'Penjualan kemasan bekas',
    date: '2024-01-20',
    reference: 'MISC-001',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  }
]

const transactionTypes = [
  { value: 'INCOME', label: 'Pemasukan', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
  { value: 'EXPENSE', label: 'Pengeluaran', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' }
]

const incomeCategories = ['Penjualan', 'Investasi', 'Lain-lain']
const expenseCategories = ['Bahan Baku', 'Gaji', 'Operasional', 'Equipment', 'Marketing', 'Transport']
const paymentMethods = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET']

export default function FinancePage() {
  const { records: financialRecords, loading: recordsLoading, error: recordsError } = useFinancialRecords()
  const { addFinancialRecord, loading: mutationLoading, error: mutationError } = useSupabaseMutations()
  
  const [transactions, setTransactions] = useState(sampleTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [dateFilter, setDateFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('Semua')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'Semua' || transaction.type === typeFilter
    const matchesCategory = categoryFilter === 'Semua' || transaction.category === categoryFilter
    const matchesDate = !dateFilter || transaction.date === dateFilter
    return matchesSearch && matchesType && matchesCategory && matchesDate
  })

  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: any = {
      'CASH': 'Tunai',
      'BANK_TRANSFER': 'Transfer Bank',
      'CREDIT_CARD': 'Kartu Kredit',
      'DIGITAL_WALLET': 'E-Wallet'
    }
    return methods[method] || method
  }

  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome * 100) : 0

  const stats = {
    totalIncome,
    totalExpense,
    netProfit,
    profitMargin,
    totalTransactions: transactions.length
  }

  // Monthly summary (simplified for demo)
  const thisMonth = {
    income: totalIncome,
    expense: totalExpense,
    profit: netProfit
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Keuangan</h1>
            <p className="text-muted-foreground">Kelola pemasukan, pengeluaran dan laporan keuangan</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Transaksi Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Transaksi Keuangan Baru</DialogTitle>
                </DialogHeader>
                <FinanceForm onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {stats.totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">bulan ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                Rp {stats.totalExpense.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">bulan ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keuntungan Bersih</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {stats.netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Margin: {stats.profitMargin.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaksi</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">total transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Smart Financial Dashboard */}
        {recordsLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Memuat data keuangan...</span>
              </div>
            </CardContent>
          </Card>
        ) : recordsError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-destructive">
                <AlertTriangle className="h-4 w-4 mx-auto mb-4" />
                <p>Error loading financial data: {recordsError}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SmartFinancialDashboard 
            data={{
              sales: financialRecords
                .filter(t => t.type === 'INCOME')
                .map(t => ({ amount: t.amount, cost: t.amount * 0.6, date: t.date })),
              expenses: financialRecords
                .filter(t => t.type === 'EXPENSE')
                .map(t => ({ amount: t.amount, category: t.category, date: t.date })),
              inventory: []
            }} 
          />
        )}

        {/* Quick Analytics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Breakdown Pemasukan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incomeCategories.map(category => {
                  const amount = transactions
                    .filter(t => t.type === 'INCOME' && t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0)
                  const percentage = totalIncome > 0 ? (amount / totalIncome * 100) : 0
                  
                  return (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}</span>
                      <div className="text-right">
                        <div className="font-medium">Rp {amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Breakdown Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expenseCategories.slice(0, 4).map(category => {
                  const amount = transactions
                    .filter(t => t.type === 'EXPENSE' && t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0)
                  const percentage = totalExpense > 0 ? (amount / totalExpense * 100) : 0
                  
                  return (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}</span>
                      <div className="text-right">
                        <div className="font-medium">Rp {amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentMethods.map(method => {
                  const count = transactions.filter(t => t.paymentMethod === method).length
                  const amount = transactions
                    .filter(t => t.paymentMethod === method)
                    .reduce((sum, t) => t.type === 'INCOME' ? sum + t.amount : sum - t.amount, 0)
                  
                  return (
                    <div key={method} className="flex justify-between text-sm">
                      <span>{getPaymentMethodLabel(method)}</span>
                      <div className="text-right">
                        <div className="font-medium">{count}x</div>
                        <div className="text-xs text-muted-foreground">
                          Rp {Math.abs(amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari deskripsi atau referensi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="Semua">Semua Tipe</option>
                  {transactionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="Semua">Semua Kategori</option>
                  {[...incomeCategories, ...expenseCategories].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Tanggal</th>
                    <th className="p-4 font-medium">Deskripsi</th>
                    <th className="p-4 font-medium">Kategori</th>
                    <th className="p-4 font-medium">Tipe</th>
                    <th className="p-4 font-medium">Jumlah</th>
                    <th className="p-4 font-medium">Metode</th>
                    <th className="p-4 font-medium">Referensi</th>
                    <th className="p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const typeInfo = getTypeInfo(transaction.type)
                    
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{transaction.date}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{transaction.category}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={typeInfo.color}>
                            {transaction.type === 'INCOME' ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className={`font-medium ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm">{transaction.reference}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredTransactions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada transaksi ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah filter atau buat transaksi baru
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transaction Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Transaksi {selectedTransaction?.reference}</DialogTitle>
            </DialogHeader>
            {selectedTransaction && <TransactionDetailView transaction={selectedTransaction} />}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

// Finance Form Component
function FinanceForm({ onClose }: { onClose: () => void }) {
  const [selectedType, setSelectedType] = useState('INCOME')
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Tipe Transaksi</Label>
          <select 
            className="w-full p-2 border border-input rounded-md bg-background"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <select className="w-full p-2 border border-input rounded-md bg-background">
            {(selectedType === 'INCOME' ? incomeCategories : expenseCategories).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="amount">Jumlah</Label>
          <Input id="amount" type="number" placeholder="1000000" />
        </div>
        <div>
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          <select className="w-full p-2 border border-input rounded-md bg-background">
            {paymentMethods.map(method => (
              <option key={method} value={method}>{getPaymentMethodLabel(method)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="date">Tanggal</Label>
          <Input id="date" type="date" />
        </div>
        <div>
          <Label htmlFor="reference">Referensi</Label>
          <Input id="reference" placeholder="SAL-20240125" />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" placeholder="Deskripsi transaksi..." />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button>Simpan Transaksi</Button>
      </div>
    </div>
  )
}

// Transaction Detail View Component
function TransactionDetailView({ transaction }: { transaction: any }) {
  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }
  
  const typeInfo = getTypeInfo(transaction.type)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Informasi Transaksi</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span>{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referensi:</span>
              <span className="font-mono">{transaction.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipe:</span>
              <Badge className={typeInfo.color}>
                {transaction.type === 'INCOME' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {typeInfo.label}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline">{transaction.status}</Badge>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Detail Keuangan</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori:</span>
              <span>{transaction.category}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Jumlah:</span>
              <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode:</span>
              <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-medium">Deskripsi</h3>
        <p className="mt-1 text-sm text-muted-foreground">{transaction.description}</p>
      </div>
    </div>
  )
}

function getPaymentMethodLabel(method: string) {
  const methods: any = {
    'CASH': 'Tunai',
    'BANK_TRANSFER': 'Transfer Bank',
    'CREDIT_CARD': 'Kartu Kredit',
    'DIGITAL_WALLET': 'E-Wallet'
  }
  return methods[method] || method
}
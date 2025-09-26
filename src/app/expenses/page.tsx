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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SmartExpenseAutomation } from '@/components/automation/smart-expense-automation'
import { 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  BarChart3,
  AlertTriangle,
  Receipt,
  Building,
  Zap,
  Car,
  Users,
  Wrench,
  Phone,
  Wifi
} from 'lucide-react'

// Expense categories with icons
const expenseCategories = [
  { value: 'rent', label: 'Sewa Tempat', icon: Building, color: 'bg-blue-100 text-blue-800' },
  { value: 'utilities', label: 'Listrik & Air', icon: Zap, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'salary', label: 'Gaji Karyawan', icon: Users, color: 'bg-green-100 text-green-800' },
  { value: 'maintenance', label: 'Perawatan', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
  { value: 'transport', label: 'Transportasi', icon: Car, color: 'bg-purple-100 text-purple-800' },
  { value: 'communication', label: 'Komunikasi', icon: Phone, color: 'bg-pink-100 text-pink-800' },
  { value: 'internet', label: 'Internet', icon: Wifi, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: 'Lain-lain', icon: Receipt, color: 'bg-gray-100 text-gray-800' }
]

const paymentMethods = [
  { value: 'cash', label: 'Tunai' },
  { value: 'bank_transfer', label: 'Transfer Bank' },
  { value: 'credit_card', label: 'Kartu Kredit' },
  { value: 'digital_wallet', label: 'E-Wallet' }
]

// Sample operational expenses data
const sampleExpenses = [
  {
    id: '1',
    date: '2024-01-25',
    category: 'rent',
    description: 'Sewa toko bulan Januari 2024',
    amount: 5000000,
    payment_method: 'bank_transfer',
    vendor: 'Tuan Tanah',
    receipt_number: 'RCP-001',
    notes: 'Pembayaran tepat waktu',
    status: 'paid',
    recurring: true,
    recurring_period: 'monthly'
  },
  {
    id: '2',
    date: '2024-01-24',
    category: 'utilities',
    description: 'Tagihan listrik bulan Desember 2023',
    amount: 850000,
    payment_method: 'bank_transfer',
    vendor: 'PLN',
    receipt_number: 'PLN-202312-001',
    notes: 'Pemakaian tinggi karena oven baru',
    status: 'paid',
    recurring: true,
    recurring_period: 'monthly'
  },
  {
    id: '3',
    date: '2024-01-23',
    category: 'salary',
    description: 'Gaji karyawan minggu ke-4 Januari',
    amount: 2500000,
    payment_method: 'cash',
    vendor: 'Staff',
    receipt_number: 'SAL-W4-001',
    notes: 'Termasuk bonus kinerja',
    status: 'paid',
    recurring: true,
    recurring_period: 'weekly'
  },
  {
    id: '4',
    date: '2024-01-22',
    category: 'maintenance',
    description: 'Service mixer dan oven besar',
    amount: 750000,
    payment_method: 'cash',
    vendor: 'CV. Teknik Jaya',
    receipt_number: 'SRV-001',
    notes: 'Maintenance rutin bulanan',
    status: 'paid',
    recurring: false,
    recurring_period: null
  },
  {
    id: '5',
    date: '2024-01-20',
    category: 'transport',
    description: 'Bensin delivery dan operasional',
    amount: 300000,
    payment_method: 'cash',
    vendor: 'SPBU',
    receipt_number: 'FUEL-001',
    notes: 'Untuk motor delivery',
    status: 'paid',
    recurring: false,
    recurring_period: null
  },
  {
    id: '6',
    date: '2024-01-19',
    category: 'communication',
    description: 'Pulsa dan paket data bulan Januari',
    amount: 150000,
    payment_method: 'digital_wallet',
    vendor: 'Telkomsel',
    receipt_number: 'TEL-001',
    notes: 'Untuk komunikasi dengan pelanggan',
    status: 'paid',
    recurring: true,
    recurring_period: 'monthly'
  }
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(sampleExpenses)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    const matchesDate = !dateFilter || expense.date === dateFilter
    return matchesSearch && matchesCategory && matchesStatus && matchesDate
  })

  const getCategoryInfo = (categoryValue: string) => {
    return expenseCategories.find(cat => cat.value === categoryValue) || expenseCategories[expenseCategories.length - 1]
  }

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const monthlyRecurring = expenses
    .filter(expense => expense.recurring && expense.recurring_period === 'monthly')
    .reduce((sum, expense) => sum + expense.amount, 0)
  const weeklyRecurring = expenses
    .filter(expense => expense.recurring && expense.recurring_period === 'weekly')
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const stats = {
    totalExpenses,
    monthlyRecurring,
    weeklyRecurring,
    totalCount: expenses.length,
    averageExpense: totalExpenses / expenses.length
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Biaya Operasional</h1>
            <p className="text-muted-foreground">Kelola biaya operasional harian dan bulanan bakery</p>
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
                  Tambah Biaya
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Biaya Operasional Baru</DialogTitle>
                </DialogHeader>
                <ExpenseForm onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Biaya</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                Rp {stats.totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">periode ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Biaya Bulanan</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                Rp {stats.monthlyRecurring.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">berulang bulanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Biaya Mingguan</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                Rp {stats.weeklyRecurring.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">berulang mingguan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                Rp {stats.averageExpense.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">per transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {expenseCategories.map(category => {
                const categoryExpenses = expenses.filter(exp => exp.category === category.value)
                const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                const IconComponent = category.icon
                
                return (
                  <div key={category.value} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${category.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{category.label}</p>
                        <p className="text-sm text-muted-foreground">{categoryExpenses.length} transaksi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rp {totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari deskripsi, vendor, atau nomor kwitansi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Terlambat</SelectItem>
                  </SelectContent>
                </Select>

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

        {/* Expenses List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Tanggal</th>
                    <th className="p-4 font-medium">Kategori</th>
                    <th className="p-4 font-medium">Deskripsi</th>
                    <th className="p-4 font-medium">Vendor</th>
                    <th className="p-4 font-medium">Jumlah</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Berulang</th>
                    <th className="p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const categoryInfo = getCategoryInfo(expense.category)
                    const IconComponent = categoryInfo.icon
                    
                    return (
                      <tr key={expense.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{expense.date}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={categoryInfo.color}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {categoryInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {expense.receipt_number}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span>{expense.vendor}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-red-600">
                            Rp {expense.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge 
                            className={
                              expense.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : expense.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {expense.status === 'paid' ? 'Lunas' : 
                             expense.status === 'pending' ? 'Pending' : 'Terlambat'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {expense.recurring ? (
                            <Badge variant="outline" className="text-blue-600">
                              {expense.recurring_period === 'monthly' ? 'Bulanan' : 
                               expense.recurring_period === 'weekly' ? 'Mingguan' : 'Ya'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Tidak</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedExpense(expense)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedExpense(expense)
                                setIsEditDialogOpen(true)
                              }}
                            >
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

        {/* Smart Expense Automation */}
        <SmartExpenseAutomation />

        {filteredExpenses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada biaya ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah filter atau tambah biaya operasional baru
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Expense Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Biaya Operasional</DialogTitle>
            </DialogHeader>
            {selectedExpense && <ExpenseDetailView expense={selectedExpense} />}
          </DialogContent>
        </Dialog>

        {/* Edit Expense Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Biaya Operasional</DialogTitle>
            </DialogHeader>
            {selectedExpense && (
              <ExpenseForm 
                expense={selectedExpense}
                onClose={() => setIsEditDialogOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

// Expense Form Component
function ExpenseForm({ expense, onClose }: { expense?: any, onClose: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState(expense?.category || 'rent')
  const [isRecurring, setIsRecurring] = useState(expense?.recurring || false)
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Tanggal</Label>
          <Input 
            id="date" 
            type="date" 
            defaultValue={expense?.date || new Date().toISOString().split('T')[0]} 
          />
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Input 
            id="description" 
            placeholder="Deskripsi biaya operasional..." 
            defaultValue={expense?.description}
          />
        </div>
        <div>
          <Label htmlFor="amount">Jumlah</Label>
          <Input 
            id="amount" 
            type="number" 
            placeholder="500000" 
            defaultValue={expense?.amount}
          />
        </div>
        <div>
          <Label htmlFor="vendor">Vendor/Penerima</Label>
          <Input 
            id="vendor" 
            placeholder="Nama vendor atau penerima" 
            defaultValue={expense?.vendor}
          />
        </div>
        <div>
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          <Select defaultValue={expense?.payment_method}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="receiptNumber">Nomor Kwitansi</Label>
          <Input 
            id="receiptNumber" 
            placeholder="RCP-001" 
            defaultValue={expense?.receipt_number}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="recurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="rounded border-border"
        />
        <Label htmlFor="recurring">Biaya berulang</Label>
      </div>
      
      {isRecurring && (
        <div>
          <Label htmlFor="recurringPeriod">Periode Berulang</Label>
          <Select defaultValue={expense?.recurring_period || 'monthly'}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="quarterly">Per Quarter</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label htmlFor="notes">Catatan</Label>
        <Textarea 
          id="notes" 
          placeholder="Catatan tambahan..." 
          defaultValue={expense?.notes}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button>{expense ? 'Update' : 'Simpan'} Biaya</Button>
      </div>
    </div>
  )
}

// Expense Detail View Component
function ExpenseDetailView({ expense }: { expense: any }) {
  const categoryInfo = getCategoryInfo(expense.category)
  const IconComponent = categoryInfo.icon

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Informasi Biaya</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span>{expense.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori:</span>
              <Badge className={categoryInfo.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {categoryInfo.label}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge 
                className={
                  expense.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : expense.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {expense.status === 'paid' ? 'Lunas' : 
                 expense.status === 'pending' ? 'Pending' : 'Terlambat'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kwitansi:</span>
              <span className="font-mono">{expense.receipt_number}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Detail Pembayaran</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span>{expense.vendor}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Jumlah:</span>
              <span className="text-red-600">
                Rp {expense.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode:</span>
              <span>{paymentMethods.find(m => m.value === expense.payment_method)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Berulang:</span>
              <span>
                {expense.recurring ? 
                  (expense.recurring_period === 'monthly' ? 'Bulanan' : 
                   expense.recurring_period === 'weekly' ? 'Mingguan' : 'Ya') 
                  : 'Tidak'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-medium">Deskripsi</h3>
        <p className="mt-1 text-sm text-muted-foreground">{expense.description}</p>
      </div>
      {expense.notes && (
        <div>
          <h3 className="font-medium">Catatan</h3>
          <p className="mt-1 text-sm text-muted-foreground">{expense.notes}</p>
        </div>
      )}
    </div>
  )
}

function getCategoryInfo(categoryValue: string) {
  return expenseCategories.find(cat => cat.value === categoryValue) || expenseCategories[expenseCategories.length - 1]
}
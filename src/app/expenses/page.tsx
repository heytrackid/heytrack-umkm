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
// Lazy loading imports - now using modular approach
import { LazySmartExpenseAutomation } from '@/modules/finance'
import { LazyMiniChart } from '@/modules/charts'
import { ComponentSkeletons } from '@/shared/components/utility/LazyWrapper'
import { Suspense } from 'react'

// Mobile UX imports
import { useResponsive } from '@/hooks/use-mobile'
import { PullToRefresh, SwipeActions } from '@/components/ui/mobile-gestures'
import { MobileInput, MobileSelect } from '@/components/ui/mobile-forms'
// MiniChart now imported via lazy loading

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
  
  // Mobile responsive hooks
  const { isMobile, isTablet } = useResponsive()
  
  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real app, refetch expenses data
    setExpenses([...sampleExpenses])
  }

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
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className={`flex gap-4 ${
            isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'
          }`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>Biaya Operasional</h1>
              <p className="text-muted-foreground">Kelola biaya operasional harian dan bulanan bakery</p>
            </div>
            <div className={`flex gap-2 ${
              isMobile ? 'w-full flex-col' : ''
            }`}>
              <Button variant="outline" className={isMobile ? 'w-full' : ''}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className={isMobile ? 'w-full' : ''}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Biaya
                  </Button>
                </DialogTrigger>
                <DialogContent className={`max-w-2xl ${
                  isMobile ? 'w-full mx-4 rounded-lg' : ''
                }`}>
                  <DialogHeader>
                    <DialogTitle className={isMobile ? 'text-lg' : ''}>
                      Tambah Biaya Operasional Baru
                    </DialogTitle>
                  </DialogHeader>
                  <ExpenseForm onClose={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

        {/* Stats Cards */}
        <div className={`grid gap-4 ${
          isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'md:grid-cols-4'
        }`}>
          <Card className={isMobile ? 'p-3' : ''}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${
              isMobile ? 'px-0 pt-0' : ''
            }`}>
              <CardTitle className={`font-medium ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Total Biaya</CardTitle>
              <DollarSign className={`text-muted-foreground ${
                isMobile ? 'h-3 w-3' : 'h-4 w-4'
              }`} />
            </CardHeader>
            <CardContent className={isMobile ? 'px-0 pb-0' : ''}>
              <div className={`font-bold text-red-600 ${
                isMobile ? 'text-lg' : 'text-2xl'
              }`}>
                Rp {stats.totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">periode ini</p>
              {isMobile && (
                <div className="mt-2 h-8">
                  <Suspense fallback={<ComponentSkeletons.Chart height={30} />}>
                    <LazyMiniChart 
                      data={[{ day: 1, amount: stats.totalExpenses }]}
                      type="bar" 
                      dataKey="amount" 
                      color="#dc2626" 
                      height={30}
                    />
                  </Suspense>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={isMobile ? 'p-3' : ''}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${
              isMobile ? 'px-0 pt-0' : ''
            }`}>
              <CardTitle className={`font-medium ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Biaya Bulanan</CardTitle>
              <Calendar className={`text-orange-500 ${
                isMobile ? 'h-3 w-3' : 'h-4 w-4'
              }`} />
            </CardHeader>
            <CardContent className={isMobile ? 'px-0 pb-0' : ''}>
              <div className={`font-bold text-orange-600 ${
                isMobile ? 'text-lg' : 'text-2xl'
              }`}>
                Rp {stats.monthlyRecurring.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">berulang bulanan</p>
              {isMobile && (
                <div className="mt-2 h-8">
                  <Suspense fallback={<ComponentSkeletons.Chart height={30} />}>
                    <LazyMiniChart 
                      data={[{ day: 1, amount: stats.monthlyRecurring }]}
                      type="bar" 
                      dataKey="amount" 
                      color="#ea580c" 
                      height={30}
                    />
                  </Suspense>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={isMobile ? 'p-3' : ''}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${
              isMobile ? 'px-0 pt-0' : ''
            }`}>
              <CardTitle className={`font-medium ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Biaya Mingguan</CardTitle>
              <TrendingUp className={`text-purple-500 ${
                isMobile ? 'h-3 w-3' : 'h-4 w-4'
              }`} />
            </CardHeader>
            <CardContent className={isMobile ? 'px-0 pb-0' : ''}>
              <div className={`font-bold text-purple-600 ${
                isMobile ? 'text-lg' : 'text-2xl'
              }`}>
                Rp {stats.weeklyRecurring.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">berulang mingguan</p>
              {isMobile && (
                <div className="mt-2 h-8">
                  <Suspense fallback={<ComponentSkeletons.Chart height={30} />}>
                    <LazyMiniChart 
                      data={[{ day: 1, amount: stats.weeklyRecurring }]}
                      type="bar" 
                      dataKey="amount" 
                      color="#9333ea" 
                      height={30}
                    />
                  </Suspense>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={isMobile ? 'p-3' : ''}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${
              isMobile ? 'px-0 pt-0' : ''
            }`}>
              <CardTitle className={`font-medium ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Rata-rata</CardTitle>
              <BarChart3 className={`text-blue-500 ${
                isMobile ? 'h-3 w-3' : 'h-4 w-4'
              }`} />
            </CardHeader>
            <CardContent className={isMobile ? 'px-0 pb-0' : ''}>
              <div className={`font-bold text-blue-600 ${
                isMobile ? 'text-lg' : 'text-2xl'
              }`}>
                Rp {stats.averageExpense.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">per transaksi</p>
              {isMobile && (
                <div className="mt-2 h-8">
                  <Suspense fallback={<ComponentSkeletons.Chart height={30} />}>
                    <LazyMiniChart 
                      data={[{ day: 1, amount: stats.averageExpense }]}
                      type="line" 
                      dataKey="amount" 
                      color="#2563eb" 
                      height={30}
                    />
                  </Suspense>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>
              Breakdown per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-3 ${
              isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'md:grid-cols-4'
            }`}>
              {expenseCategories.map(category => {
                const categoryExpenses = expenses.filter(exp => exp.category === category.value)
                const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                const IconComponent = category.icon
                
                return (
                  <div key={category.value} className={`flex items-center justify-between border rounded-lg ${
                    isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full ${category.color} ${
                        isMobile ? 'p-1.5' : 'p-2'
                      }`}>
                        <IconComponent className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isMobile ? 'text-sm' : ''
                        }`}>{category.label}</p>
                        <p className={`text-muted-foreground ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>{categoryExpenses.length} transaksi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        isMobile ? 'text-sm' : ''
                      }`}>Rp {totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className={`pt-6 ${
            isMobile ? 'px-4' : ''
          }`}>
            <div className={`flex gap-4 ${
              isMobile ? 'flex-col space-y-4' : 'flex-col md:flex-row'
            }`}>
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute text-muted-foreground ${
                    isMobile ? 'left-3 top-3 h-4 w-4' : 'left-2.5 top-2.5 h-4 w-4'
                  }`} />
                  {isMobile ? (
                    <MobileInput
                      placeholder="Cari deskripsi, vendor, atau nomor kwitansi..."
                      value={searchTerm}
                      onChange={setSearchTerm}
                      className="pl-10"
                    />
                  ) : (
                    <Input
                      placeholder="Cari deskripsi, vendor, atau nomor kwitansi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  )}
                </div>
              </div>
              <div className={`flex gap-2 ${
                isMobile ? 'flex-col space-y-2' : 'flex-wrap'
              }`}>
                {isMobile ? (
                  <>
                    <MobileSelect
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                      placeholder="Semua Kategori"
                      options={[
                        { value: "all", label: "Semua Kategori" },
                        ...expenseCategories.map(category => ({
                          value: category.value,
                          label: category.label
                        }))
                      ]}
                    />
                    <MobileSelect
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="Semua Status"
                      options={[
                        { value: "all", label: "Semua Status" },
                        { value: "paid", label: "Lunas" },
                        { value: "pending", label: "Pending" },
                        { value: "overdue", label: "Terlambat" }
                      ]}
                    />
                    <MobileInput
                      value={dateFilter}
                      onChange={setDateFilter}
                      placeholder="Pilih tanggal"
                      type="date"
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        {isMobile ? (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category)
              const IconComponent = categoryInfo.icon
              
              return (
                <SwipeActions
                  key={expense.id}
                  actions={[
                    {
                      id: 'view',
                      label: 'Lihat',
                      icon: <Eye className="h-4 w-4" />,
                      color: 'blue' as const,
                      onClick: () => {
                        setSelectedExpense(expense)
                        setIsViewDialogOpen(true)
                      }
                    },
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: <Edit className="h-4 w-4" />,
                      color: 'yellow' as const,
                      onClick: () => {
                        setSelectedExpense(expense)
                        setIsEditDialogOpen(true)
                      }
                    },
                    {
                      id: 'delete',
                      label: 'Hapus',
                      icon: <Trash2 className="h-4 w-4" />,
                      color: 'red' as const,
                      onClick: () => console.log('Delete expense', expense.id)
                    }
                  ]}
                >
                  <Card className="cursor-pointer transition-shadow" onClick={() => {
                    setSelectedExpense(expense)
                    setIsViewDialogOpen(true)
                  }}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{expense.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{expense.date}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <Badge className={categoryInfo.color}>
                              <IconComponent className="h-2.5 w-2.5 mr-1" />
                              {categoryInfo.label}
                            </Badge>
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
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Jumlah</p>
                            <p className="font-bold text-lg text-red-600">
                              -Rp {expense.amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Vendor</p>
                            <p className="text-sm font-medium">{expense.vendor}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-1 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground font-mono">{expense.receipt_number}</p>
                          </div>
                          <div>
                            {expense.recurring ? (
                              <Badge variant="outline" className="text-blue-600 text-xs">
                                {expense.recurring_period === 'monthly' ? 'Bulanan' : 
                                 expense.recurring_period === 'weekly' ? 'Mingguan' : 'Berulang'}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sekali</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SwipeActions>
              )
            })}
          </div>
        ) : (
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
        )}

        {/* Smart Expense Automation - now using modular lazy loading */}
        <Suspense fallback={<ComponentSkeletons.Dashboard />}>
          <LazySmartExpenseAutomation />
        </Suspense>

        {filteredExpenses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>Tidak ada biaya ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah filter atau tambah biaya operasional baru
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Expense Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className={`max-w-2xl ${
            isMobile ? 'w-full mx-4 rounded-lg' : ''
          }`}>
            <DialogHeader>
              <DialogTitle className={isMobile ? 'text-lg' : ''}>
                Detail Biaya Operasional
              </DialogTitle>
            </DialogHeader>
            {selectedExpense && <ExpenseDetailView expense={selectedExpense} />}
          </DialogContent>
        </Dialog>

        {/* Edit Expense Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className={`max-w-2xl ${
            isMobile ? 'w-full mx-4 rounded-lg' : ''
          }`}>
            <DialogHeader>
              <DialogTitle className={isMobile ? 'text-lg' : ''}>
                Edit Biaya Operasional
              </DialogTitle>
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
      </PullToRefresh>
    </AppLayout>
  )
}

// Expense Form Component
function ExpenseForm({ expense, onClose }: { expense?: any, onClose: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState(expense?.category || 'rent')
  const [isRecurring, setIsRecurring] = useState(expense?.recurring || false)
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState(expense?.description || '')
  const [amount, setAmount] = useState(expense?.amount?.toString() || '')
  const [vendor, setVendor] = useState(expense?.vendor || '')
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method || '')
  const [receiptNumber, setReceiptNumber] = useState(expense?.receipt_number || '')
  const [notes, setNotes] = useState(expense?.notes || '')
  const [recurringPeriod, setRecurringPeriod] = useState(expense?.recurring_period || 'monthly')
  const { isMobile } = useResponsive()
  
  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-2'
      }`}>
        <div>
          <Label htmlFor="date">Tanggal</Label>
          {isMobile ? (
            <MobileInput
              value={date}
              onChange={setDate}
              type="date"
            />
          ) : (
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          {isMobile ? (
            <MobileSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Pilih kategori"
              options={expenseCategories.map(category => ({
                value: category.value,
                label: category.label
              }))}
            />
          ) : (
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
          )}
        </div>
        <div className={isMobile ? '' : 'col-span-2'}>
          <Label htmlFor="description">Deskripsi</Label>
          {isMobile ? (
            <MobileInput
              value={description}
              onChange={setDescription}
              placeholder="Deskripsi biaya operasional..."
            />
          ) : (
            <Input 
              id="description" 
              placeholder="Deskripsi biaya operasional..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="amount">Jumlah</Label>
          {isMobile ? (
            <MobileInput
              value={amount}
              onChange={setAmount}
              placeholder="500000"
              type="number"
            />
          ) : (
            <Input 
              id="amount" 
              type="number" 
              placeholder="500000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="vendor">Vendor/Penerima</Label>
          {isMobile ? (
            <MobileInput
              value={vendor}
              onChange={setVendor}
              placeholder="Nama vendor atau penerima"
            />
          ) : (
            <Input 
              id="vendor" 
              placeholder="Nama vendor atau penerima" 
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          {isMobile ? (
            <MobileSelect
              value={paymentMethod}
              onChange={setPaymentMethod}
              placeholder="Pilih metode pembayaran"
              options={paymentMethods.map(method => ({
                value: method.value,
                label: method.label
              }))}
            />
          ) : (
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
          )}
        </div>
        <div>
          <Label htmlFor="receiptNumber">Nomor Kwitansi</Label>
          {isMobile ? (
            <MobileInput
              value={receiptNumber}
              onChange={setReceiptNumber}
              placeholder="RCP-001"
            />
          ) : (
            <Input 
              id="receiptNumber" 
              placeholder="RCP-001" 
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
          )}
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
          {isMobile ? (
            <MobileSelect
              value={recurringPeriod}
              onChange={setRecurringPeriod}
              placeholder="Pilih periode"
              options={[
                { value: "weekly", label: "Mingguan" },
                { value: "monthly", label: "Bulanan" },
                { value: "quarterly", label: "Per Quarter" },
                { value: "yearly", label: "Tahunan" }
              ]}
            />
          ) : (
            <Select value={recurringPeriod} onValueChange={setRecurringPeriod}>
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
          )}
        </div>
      )}
      
      <div>
        <Label htmlFor="notes">Catatan</Label>
        {isMobile ? (
          <MobileInput
            value={notes}
            onChange={setNotes}
            placeholder="Catatan tambahan..."
            multiline
            rows={3}
          />
        ) : (
          <Textarea 
            id="notes" 
            placeholder="Catatan tambahan..." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
      </div>
      
      <div className={`flex gap-2 pt-4 ${
        isMobile ? 'flex-col' : 'justify-end'
      }`}>
        <Button variant="outline" onClick={onClose} className={isMobile ? 'w-full' : ''}>
          Batal
        </Button>
        <Button className={isMobile ? 'w-full' : ''}>
          {expense ? 'Update' : 'Simpan'} Biaya
        </Button>
      </div>
    </div>
  )
}

// Expense Detail View Component
function ExpenseDetailView({ expense }: { expense: any }) {
  const { isMobile } = useResponsive()
  const categoryInfo = getCategoryInfo(expense.category)
  const IconComponent = categoryInfo.icon

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-2'
      }`}>
        <div>
          <h3 className={`font-medium ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>Informasi Biaya</h3>
          <div className={`mt-2 space-y-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span>{expense.date}</span>
            </div>
            <div className={`flex ${
              isMobile ? 'flex-col space-y-1' : 'justify-between'
            }`}>
              <span className="text-muted-foreground">Kategori:</span>
              <Badge className={categoryInfo.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {categoryInfo.label}
              </Badge>
            </div>
            <div className={`flex ${
              isMobile ? 'flex-col space-y-1' : 'justify-between'
            }`}>
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
              <span className="font-mono break-all">{expense.receipt_number}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className={`font-medium ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>Detail Pembayaran</h3>
          <div className={`mt-2 space-y-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span>{expense.vendor}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Jumlah:</span>
              <span className={`text-red-600 ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
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
        <h3 className={`font-medium ${
          isMobile ? 'text-base' : 'text-lg'
        }`}>Deskripsi</h3>
        <p className={`mt-1 text-muted-foreground ${
          isMobile ? 'text-sm' : 'text-sm'
        }`}>{expense.description}</p>
      </div>
      {expense.notes && (
        <div>
          <h3 className={`font-medium ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>Catatan</h3>
          <p className={`mt-1 text-muted-foreground ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>{expense.notes}</p>
        </div>
      )}
    </div>
  )
}

function getCategoryInfo(categoryValue: string) {
  return expenseCategories.find(cat => cat.value === categoryValue) || expenseCategories[expenseCategories.length - 1]
}
'use client'

import { useState, useCallback, Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import lazy loading utilities
import { ComponentSkeletons } from '@/shared/components/utility/LazyWrapper'

// Import lazy-loaded inventory components
import { 
  LazySmartInventoryManager, 
  LazyInventoryTrendsChart,
  preloadInventoryComponents
} from '@/modules/inventory/components/LazyComponents'
import { useIngredients, useSupabaseMutations } from '@/hooks/useSupabaseData'
import { useResponsive } from '@/hooks/use-mobile'
import {
  PullToRefresh,
  SwipeActions
} from '@/components/ui/mobile-gestures'
import { MobileTable } from '@/components/ui/mobile-table'
import {
  MobileForm,
  MobileInput,
  MobileNumberInput,
  MobileSelect
} from '@/components/ui/mobile-forms'
import {
  MobileLineChart,
  MobileAreaChart
} from '@/components/ui/mobile-charts'
import { MiniChartWithLoading } from '@/components/lazy/chart-features'
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Trash2,
  Calendar,
  Eye,
  History,
  ShoppingCart,
  Factory
} from 'lucide-react'

// No sample data - start with empty state

const transactionTypes = [
  { value: 'PURCHASE', label: 'Pembelian', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: ArrowUp },
  { value: 'USAGE', label: 'Pemakaian', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: Factory },
  { value: 'ADJUSTMENT', label: 'Penyesuaian', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: RotateCcw },
  { value: 'WASTE', label: 'Terbuang', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: Trash2 }
]

export default function InventoryPage() {
  const { isMobile, isTablet } = useResponsive()
  const { data: ingredients, loading: ingredientsLoading, error: ingredientsError } = useIngredients()
  const { updateStock, loading: mutationLoading, error: mutationError } = useSupabaseMutations()
  
  // Preload inventory components on mount
  useCallback(() => {
    preloadInventoryComponents()
  }, [])
  
  const [transactions, setTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [dateFilter, setDateFilter] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'Semua' || transaction.type === typeFilter
    const matchesDate = !dateFilter || transaction.date === dateFilter
    return matchesSearch && matchesType && matchesDate
  })

  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    // Simulate refresh - in real app, refetch data from API
    await new Promise(resolve => setTimeout(resolve, 1000))
  }, [])

  // Calculate stats
  const stats = {
    totalTransactions: transactions.length,
    totalPurchaseValue: transactions
      .filter(t => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + t.totalValue, 0),
    totalUsageValue: Math.abs(transactions
      .filter(t => t.type === 'USAGE')
      .reduce((sum, t) => sum + t.totalValue, 0)),
    totalWasteValue: Math.abs(transactions
      .filter(t => t.type === 'WASTE')
      .reduce((sum, t) => sum + t.totalValue, 0))
  }

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bahan Baku</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Header */}
          <div className={`flex gap-4 ${
            isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'
          }`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>Inventory</h1>
              <p className="text-muted-foreground">Kelola transaksi stok dan inventory</p>
            </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Transaksi Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Buat Transaksi Inventory Baru</DialogTitle>
              </DialogHeader>
              <TransactionForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

          {/* Stats Cards */}
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'md:grid-cols-4'
          }`}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">semua transaksi</p>
              {stats.totalTransactions > 0 && (
                <MiniChartWithLoading
                  data={transactions.slice(-7).map((_, index) => ({
                    day: index + 1,
                    count: 1
                  }))}
                  type="line"
                  dataKey="count"
                  color="#6b7280"
                  className="mt-2"
                  height={30}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Pembelian</CardTitle>
              <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-gray-600 dark:text-gray-400 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                Rp {stats.totalPurchaseValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">total pembelian</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Pemakaian</CardTitle>
              <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-gray-600 dark:text-gray-400 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                Rp {stats.totalUsageValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">untuk produksi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Waste</CardTitle>
              <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-gray-600 dark:text-gray-400 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                Rp {stats.totalWasteValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">bahan terbuang</p>
            </CardContent>
          </Card>
        </div>

          {/* Inventory Trends Chart */}
          <Card>
            <CardHeader className={isMobile ? 'pb-2' : ''}>
              <CardTitle className={isMobile ? 'text-lg' : ''}>
                Tren Inventory
              </CardTitle>
              <p className={`text-muted-foreground ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Analisis pergerakan stok, pembelian, pemakaian, dan waste
              </p>
            </CardHeader>
            <CardContent>
              <div className={isMobile ? 'overflow-x-auto' : ''}>
                {/* Using Suspense with lazy component */}
                <Suspense fallback={<ComponentSkeletons.Chart height={400} />}>
                  <LazyInventoryTrendsChart />
                </Suspense>
              </div>
            </CardContent>
          </Card>

        {/* Smart Inventory Manager */}
        {ingredientsLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Memuat data ingredients...</span>
              </div>
            </CardContent>
          </Card>
        ) : ingredientsError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-destructive">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p>Error loading ingredients: {ingredientsError}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Suspense fallback={<ComponentSkeletons.Dashboard />}>
            <LazySmartInventoryManager ingredients={ingredients} />
          </Suspense>
        )}

          {/* Filters */}
          <Card>
            <CardContent className={`pt-6 ${isMobile ? 'px-4' : ''}`}>
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
                        placeholder="Cari bahan atau referensi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e)}
                        className="pl-10"
                      />
                    ) : (
                      <Input
                        placeholder="Cari bahan atau referensi..."
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
                    <MobileSelect
                      value={typeFilter}
                      onChange={setTypeFilter}
                      placeholder="Semua Tipe"
                      options={[
                        { value: "Semua", label: "Semua Tipe" },
                        ...transactionTypes.map(type => ({
                          value: type.value,
                          label: type.label
                        }))
                      ]}
                    />
                  ) : (
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Semua Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semua">Semua Tipe</SelectItem>
                        {transactionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {isMobile ? (
                    <MobileInput
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e)}
                      placeholder="Pilih tanggal"
                    />
                  ) : (
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-40"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardContent className="p-0">
              <MobileTable
                data={filteredTransactions}
                columns={[
                  {
                    key: 'date',
                    label: 'Tanggal',
                    accessor: 'date',
                    render: (value, transaction) => (
                      <div className="flex items-center gap-2">
                        <Calendar className={`text-muted-foreground ${
                          isMobile ? 'h-3 w-3' : 'h-4 w-4'
                        }`} />
                        <span className={isMobile ? 'text-sm' : ''}>{transaction.date}</span>
                      </div>
                    ),
                    width: isMobile ? '100px' : '120px'
                  },
                  {
                    key: 'ingredient',
                    label: 'Bahan',
                    accessor: 'ingredientName',
                    render: (value, transaction) => (
                      <div>
                        <p className={`font-medium ${
                          isMobile ? 'text-sm' : ''
                        }`}>{transaction.ingredientName}</p>
                        {transaction.supplier && (
                          <p className={`text-muted-foreground ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            {transaction.supplier}
                          </p>
                        )}
                      </div>
                    ),
                    width: isMobile ? '120px' : '150px'
                  },
                  {
                    key: 'type',
                    label: 'Tipe',
                    accessor: 'type',
                    render: (value, transaction) => {
                      const typeInfo = getTypeInfo(transaction.type)
                      const Icon = typeInfo.icon
                      return (
                        <Badge className={`${typeInfo.color} ${
                          isMobile ? 'text-xs px-2 py-0.5' : ''
                        }`}>
                          <Icon className={`mr-1 ${
                            isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
                          }`} />
                          {isMobile ? typeInfo.label.slice(0, 3) : typeInfo.label}
                        </Badge>
                      )
                    },
                    width: isMobile ? '70px' : '100px'
                  },
                  {
                    key: 'quantity',
                    label: 'Qty',
                    accessor: 'quantity',
                    render: (value, transaction) => (
                      <span className={`${
                        transaction.quantity > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                      } ${isMobile ? 'text-sm' : ''}`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
                      </span>
                    ),
                    width: isMobile ? '80px' : '100px'
                  },
                  {
                    key: 'unitPrice',
                    label: 'Harga/Unit',
                    accessor: 'unitPrice',
                    render: (value, transaction) => (
                      <span className={isMobile ? 'text-sm' : ''}>
                        Rp {transaction.unitPrice.toLocaleString()}
                      </span>
                    ),
                    width: isMobile ? '90px' : '120px'
                  },
                  {
                    key: 'totalValue',
                    label: 'Total',
                    accessor: 'totalValue',
                    render: (value, transaction) => (
                      <span className={`font-medium ${
                        transaction.totalValue > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                      } ${isMobile ? 'text-sm' : ''}`}>
                        {transaction.totalValue > 0 ? '+' : ''}Rp {transaction.totalValue.toLocaleString()}
                      </span>
                    ),
                    width: isMobile ? '100px' : '120px'
                  },
                  {
                    key: 'reference',
                    label: 'Ref',
                    accessor: 'reference',
                    render: (value, transaction) => (
                      <span className={`font-mono ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>{transaction.reference}</span>
                    ),
                    width: isMobile ? '80px' : '100px'
                  }
                ]}
                onRowClick={(transaction) => {
                  setSelectedTransaction(transaction)
                  setIsViewDialogOpen(true)
                }}
                actions={[
                  {
                    label: 'Lihat',
                    icon: <Eye className="h-4 w-4" />,
                    onClick: (transaction: any) => {
                      setSelectedTransaction(transaction)
                      setIsViewDialogOpen(true)
                    }
                  }
                ]}
                emptyMessage="Tidak ada transaksi ditemukan"
              />
            </CardContent>
          </Card>

          {/* Transaction Detail Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className={`max-w-2xl ${
              isMobile ? 'w-full mx-4 rounded-lg' : ''
            }`}>
              <DialogHeader>
                <DialogTitle className={isMobile ? 'text-lg' : ''}>
                  Detail Transaksi {selectedTransaction?.reference}
                </DialogTitle>
              </DialogHeader>
              {selectedTransaction && <TransactionDetailView transaction={selectedTransaction} />}
            </DialogContent>
          </Dialog>
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}

// Transaction Form Component
function TransactionForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ingredient">Bahan</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pilih bahan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ING-001">Tepung Terigu Premium</SelectItem>
              <SelectItem value="ING-002">Mentega Premium</SelectItem>
              <SelectItem value="ING-003">Telur Ayam</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Tipe Transaksi</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe transaksi" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" placeholder="50" />
        </div>
        <div>
          <Label htmlFor="unitPrice">Harga Satuan</Label>
          <Input id="unitPrice" type="number" placeholder="12000" />
        </div>
        <div>
          <Label htmlFor="date">Tanggal</Label>
          <Input id="date" type="date" />
        </div>
        <div>
          <Label htmlFor="reference">Referensi</Label>
          <Input id="reference" placeholder="PO-2024-001" />
        </div>
      </div>
      <div>
        <Label htmlFor="supplier">Supplier (opsional)</Label>
        <Input id="supplier" placeholder="CV. Bahan Berkah" />
      </div>
      <div>
        <Label htmlFor="notes">Catatan</Label>
        <Input id="notes" placeholder="Catatan transaksi..." />
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
  const Icon = typeInfo.icon

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
                <Icon className="h-3 w-3 mr-1" />
                {typeInfo.label}
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Detail Bahan</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bahan:</span>
              <span>{transaction.ingredientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className={transaction.quantity > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}>
                {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga Satuan:</span>
              <span>Rp {transaction.unitPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Total Nilai:</span>
              <span className={transaction.totalValue > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}>
                {transaction.totalValue > 0 ? '+' : ''}Rp {transaction.totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      {transaction.supplier && (
        <div>
          <h3 className="font-medium">Supplier</h3>
          <p className="mt-1 text-sm">{transaction.supplier}</p>
        </div>
      )}
      {transaction.notes && (
        <div>
          <h3 className="font-medium">Catatan</h3>
          <p className="mt-1 text-sm text-muted-foreground">{transaction.notes}</p>
        </div>
      )}
    </div>
  )
}
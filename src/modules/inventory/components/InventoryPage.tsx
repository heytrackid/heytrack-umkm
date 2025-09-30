'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppLayout from '@/components/layout/app-layout'

// Lazy loaded components from inventory domain
import SmartInventoryManager from './SmartInventoryManager'
import InventoryTrendsChart from './InventoryTrendsChart'

// Hooks from inventory domain
import { useInventoryData, useInventoryAlerts } from '../hooks/useInventoryData'

// Shared hooks
import { useResponsive } from '@/shared/hooks'

// Mobile components
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
import { MiniChartWithLoading } from '@/components/lazy/chart-features'

// Utils and constants from inventory domain  
import { formatDate } from '@/shared/utils'
import { useCurrency } from '@/hooks/useCurrency'
import { STOCK_TRANSACTION_TYPES } from '../constants'

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


export default function InventoryPage() {
  const { formatCurrency } = useCurrency()
  const { isMobile, isTablet } = useResponsive()
  
  // Use inventory domain hooks
  const { ingredients, loading: ingredientsLoading, error: ingredientsError, refresh } = useInventoryData()
  const { alerts } = useInventoryAlerts()
  
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
    return STOCK_TRANSACTION_TYPES[type as keyof typeof STOCK_TRANSACTION_TYPES] || STOCK_TRANSACTION_TYPES.PURCHASE
  }

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refresh()
    // Refresh transactions as well
    await new Promise(resolve => setTimeout)
  }, [refresh])

  // Calculate stats using shared utilities
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

  if (ingredientsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Memuat data inventory...</span>
        </div>
      </AppLayout>
    )
  }

  if (ingredientsError) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-destructive">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>Error loading inventory: {ingredientsError}</p>
              <Button onClick={refresh} className="mt-4">
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    )
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
                  {formatCurrency(stats.totalPurchaseValue)}
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
                  {formatCurrency(stats.totalUsageValue)}
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
                  {formatCurrency(stats.totalWasteValue)}
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
                <InventoryTrendsChart />
              </div>
            </CardContent>
          </Card>

          {/* Smart Inventory Manager */}
          <SmartInventoryManager 
            ingredients={ingredients} 
            onReorderTriggered={(ingredient, quantity) => {
              console.log('Reorder triggered:', ingredient.name, quantity)
              // Handle reorder logic here
            }}
          />

          {/* Filters and Transaction List would continue here... */}
          
          {/* Alert Section */}
          {alerts && alerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Stock Alerts</h2>
              {alerts.map((alert, index) => (
                <Card key={index} className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.actionRequired}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}

// Transaction Form Component (placeholder - will be moved to separate file)
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
              {Object.values(STOCK_TRANSACTION_TYPES).map(type => (
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
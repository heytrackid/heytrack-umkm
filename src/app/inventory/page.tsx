'use client'

import { useState, useCallback } from 'react'
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
import { useIngredients } from '@/hooks/useDatabase'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Trash2,
  Eye,
  History,
  Factory
} from 'lucide-react'

const transactionTypes = [
  { value: 'PURCHASE', label: 'Pembelian', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: ArrowUp },
  { value: 'USAGE', label: 'Pemakaian', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: Factory },
  { value: 'ADJUSTMENT', label: 'Penyesuaian', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: RotateCcw },
  { value: 'WASTE', label: 'Terbuang', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: Trash2 }
]

export default function InventoryPage() {
  const { isMobile, isTablet } = useResponsive()
  const { data: ingredients, loading: ingredientsLoading, error: ingredientsError } = useIngredients()
  
  const [transactions, setTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [dateFilter, setDateFilter] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch = transaction?.ingredientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction?.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'Semua' || transaction.type === typeFilter
    const matchesDate = !dateFilter || transaction.date === dateFilter
    return matchesSearch && matchesType && matchesDate
  })

  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }

  // Calculate stats
  const stats = {
    totalTransactions: transactions.length,
    totalPurchaseValue: transactions
      .filter((t: any) => t.type === 'PURCHASE')
      .reduce((sum: number, t: any) => sum + (t.totalValue || 0), 0),
    totalUsageValue: Math.abs(transactions
      .filter((t: any) => t.type === 'USAGE')
      .reduce((sum: number, t: any) => sum + (t.totalValue || 0), 0)),
    totalWasteValue: Math.abs(transactions
      .filter((t: any) => t.type === 'WASTE')
      .reduce((sum: number, t: any) => sum + (t.totalValue || 0), 0))
  }

  return (
    <AppLayout>
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
          <Card>
            <CardHeader>
              <CardTitle className={isMobile ? 'text-lg' : ''}>
                Kelola Bahan Baku
              </CardTitle>
              <p className="text-muted-foreground">
                Daftar bahan baku yang tersedia
              </p>
            </CardHeader>
            <CardContent>
              {ingredients && ingredients.length > 0 ? (
                <div className="space-y-4">
                  {ingredients.map((ingredient: any) => (
                    <div key={ingredient.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ingredient.current_stock} {ingredient.unit} tersedia
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp {ingredient.price_per_unit?.toLocaleString()}/{ingredient.unit}</p>
                        <Badge variant={ingredient.current_stock < ingredient.minimum_stock ? 'destructive' : 'secondary'}>
                          {ingredient.current_stock < ingredient.minimum_stock ? 'Stok Rendah' : 'Stok Aman'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-2">Belum ada bahan baku</p>
                  <p className="text-muted-foreground mb-4">
                    Mulai dengan menambahkan bahan baku pertama
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Bahan Baku
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
                  <Input
                    placeholder="Cari bahan atau referensi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className={`flex gap-2 ${
                isMobile ? 'flex-col space-y-2' : 'flex-wrap'
              }`}>
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
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <p className="text-muted-foreground">
              Daftar transaksi inventory bahan baku
            </p>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction: any, index: number) => {
                  const typeInfo = getTypeInfo(transaction.type)
                  const Icon = typeInfo.icon
                  return (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                         onClick={() => {
                           setSelectedTransaction(transaction)
                           setIsViewDialogOpen(true)
                         }}>
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{transaction.ingredientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date} - {transaction.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                        <p className="text-sm mt-1">
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium mb-2">Belum ada transaksi</p>
                <p className="text-muted-foreground mb-4">
                  Transaksi inventory akan muncul di sini
                </p>
              </div>
            )}
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
              <span>Rp {transaction.unitPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Total Nilai:</span>
              <span className={transaction.totalValue > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}>
                {transaction.totalValue > 0 ? '+' : ''}Rp {transaction.totalValue?.toLocaleString()}
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
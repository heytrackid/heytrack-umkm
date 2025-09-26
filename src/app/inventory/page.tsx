'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

// Sample data
const sampleTransactions = [
  {
    id: '1',
    ingredientId: 'ING-001',
    ingredientName: 'Tepung Terigu Premium',
    type: 'PURCHASE',
    quantity: 50,
    unit: 'kg',
    unitPrice: 12000,
    totalValue: 600000,
    date: '2024-01-25',
    reference: 'PO-2024-001',
    supplier: 'CV. Bahan Berkah',
    notes: 'Pembelian rutin mingguan'
  },
  {
    id: '2',
    ingredientId: 'ING-001',
    ingredientName: 'Tepung Terigu Premium',
    type: 'USAGE',
    quantity: -25,
    unit: 'kg',
    unitPrice: 12000,
    totalValue: -300000,
    date: '2024-01-25',
    reference: 'BATCH-20240125-001',
    supplier: null,
    notes: 'Digunakan untuk produksi roti tawar'
  },
  {
    id: '3',
    ingredientId: 'ING-002',
    ingredientName: 'Mentega Premium',
    type: 'PURCHASE',
    quantity: 10,
    unit: 'kg',
    unitPrice: 35000,
    totalValue: 350000,
    date: '2024-01-24',
    reference: 'PO-2024-002',
    supplier: 'PT. Dairy Fresh',
    notes: 'Mentega berkualitas tinggi'
  },
  {
    id: '4',
    ingredientId: 'ING-003',
    ingredientName: 'Telur Ayam',
    type: 'USAGE',
    quantity: -5,
    unit: 'kg',
    unitPrice: 28000,
    totalValue: -140000,
    date: '2024-01-24',
    reference: 'BATCH-20240124-004',
    supplier: null,
    notes: 'Produksi croissant dan roti'
  },
  {
    id: '5',
    ingredientId: 'ING-004',
    ingredientName: 'Gula Pasir',
    type: 'ADJUSTMENT',
    quantity: -1.2,
    unit: 'kg',
    unitPrice: 15000,
    totalValue: -18000,
    date: '2024-01-23',
    reference: 'ADJ-001',
    supplier: null,
    notes: 'Stock opname - selisih minus'
  },
  {
    id: '6',
    ingredientId: 'ING-005',
    ingredientName: 'Cokelat Batang',
    type: 'WASTE',
    quantity: -0.5,
    unit: 'kg',
    unitPrice: 85000,
    totalValue: -42500,
    date: '2024-01-22',
    reference: 'WASTE-001',
    supplier: null,
    notes: 'Cokelat rusak karena penyimpanan'
  }
]

const transactionTypes = [
  { value: 'PURCHASE', label: 'Pembelian', color: 'bg-green-100 text-green-800', icon: ArrowUp },
  { value: 'USAGE', label: 'Pemakaian', color: 'bg-blue-100 text-blue-800', icon: Factory },
  { value: 'ADJUSTMENT', label: 'Penyesuaian', color: 'bg-yellow-100 text-yellow-800', icon: RotateCcw },
  { value: 'WASTE', label: 'Terbuang', color: 'bg-red-100 text-red-800', icon: Trash2 }
]

export default function InventoryPage() {
  const [transactions, setTransactions] = useState(sampleTransactions)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">semua transaksi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Pembelian</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {stats.totalPurchaseValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">total pembelian</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Pemakaian</CardTitle>
              <ArrowDown className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                Rp {stats.totalUsageValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">untuk produksi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Waste</CardTitle>
              <Trash2 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                Rp {stats.totalWasteValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">bahan terbuang</p>
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
                    placeholder="Cari bahan atau referensi..."
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
                    <th className="p-4 font-medium">Bahan</th>
                    <th className="p-4 font-medium">Tipe</th>
                    <th className="p-4 font-medium">Quantity</th>
                    <th className="p-4 font-medium">Harga Satuan</th>
                    <th className="p-4 font-medium">Total Nilai</th>
                    <th className="p-4 font-medium">Referensi</th>
                    <th className="p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const typeInfo = getTypeInfo(transaction.type)
                    const Icon = typeInfo.icon
                    
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
                            <p className="font-medium">{transaction.ingredientName}</p>
                            {transaction.supplier && (
                              <p className="text-sm text-muted-foreground">
                                {transaction.supplier}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={typeInfo.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className={transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
                          </span>
                        </td>
                        <td className="p-4">
                          <span>Rp {transaction.unitPrice.toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <span className={transaction.totalValue > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {transaction.totalValue > 0 ? '+' : ''}Rp {transaction.totalValue.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm">{transaction.reference}</span>
                        </td>
                        <td className="p-4">
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
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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

// Transaction Form Component
function TransactionForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ingredient">Bahan</Label>
          <select className="w-full p-2 border border-input rounded-md bg-background">
            <option value="">Pilih bahan</option>
            <option value="ING-001">Tepung Terigu Premium</option>
            <option value="ING-002">Mentega Premium</option>
            <option value="ING-003">Telur Ayam</option>
          </select>
        </div>
        <div>
          <Label htmlFor="type">Tipe Transaksi</Label>
          <select className="w-full p-2 border border-input rounded-md bg-background">
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
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
              <span className={transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga Satuan:</span>
              <span>Rp {transaction.unitPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Total Nilai:</span>
              <span className={transaction.totalValue > 0 ? 'text-green-600' : 'text-red-600'}>
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
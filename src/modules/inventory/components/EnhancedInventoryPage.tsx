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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import AppLayout from '@/components/layout/app-layout'
import Link from 'next/link'

// Enhanced components
import { WeightedAverageCostAnalysis } from './WeightedAverageCostAnalysis'

// Existing components
import SmartInventoryManager from './SmartInventoryManager'
import InventoryTrendsChart from './InventoryTrendsChart'

// Hooks
import { useInventoryData, useInventoryAlerts } from '../hooks/useInventoryData'
import { useResponsive } from '@/shared/hooks'

// Mobile components
import {
  PullToRefresh,
  SwipeActions
} from '@/components/ui/mobile-gestures'
import { MobileTable } from '@/components/ui/mobile-table'

// Utils and constants
import { formatCurrency, formatDate } from '@/shared/utils'
import { STOCK_TRANSACTION_TYPES } from '../constants'

import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calculator,
  HelpCircle,
  Info,
  Lightbulb,
  BookOpen,
  Target,
  Eye,
  History,
  ShoppingCart,
  Factory,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Sample data dengan lebih realistic pricing
const sampleIngredients = [
  {
    id: 'ing-1',
    name: 'Tepung Terigu Premium',
    unit: 'kg',
    current_stock: 45,
    min_stock: 10,
    price_per_unit: 15000
  },
  {
    id: 'ing-2', 
    name: 'Gula Pasir',
    unit: 'kg',
    current_stock: 25,
    min_stock: 5,
    price_per_unit: 18000
  },
  {
    id: 'ing-3',
    name: 'Mentega',
    unit: 'kg', 
    current_stock: 8,
    min_stock: 2,
    price_per_unit: 45000
  }
]

const sampleTransactions = [
  // Tepung Terigu - multiple purchases dengan harga berbeda
  {
    id: 't-1',
    ingredient_id: 'ing-1',
    type: 'PURCHASE',
    quantity: 25,
    unit_price: 14500,
    total_price: 362500,
    created_at: '2024-01-15T10:00:00Z',
    reference: 'PO-001'
  },
  {
    id: 't-2',
    ingredient_id: 'ing-1', 
    type: 'PURCHASE',
    quantity: 30,
    unit_price: 15200,
    total_price: 456000,
    created_at: '2024-01-25T14:30:00Z',
    reference: 'PO-002'
  },
  {
    id: 't-3',
    ingredient_id: 'ing-1',
    type: 'PURCHASE', 
    quantity: 20,
    unit_price: 15800,
    total_price: 316000,
    created_at: '2024-02-05T09:15:00Z',
    reference: 'PO-003'
  },
  {
    id: 't-4',
    ingredient_id: 'ing-1',
    type: 'USAGE',
    quantity: -10,
    unit_price: 15167,
    total_price: -151670,
    created_at: '2024-02-08T16:45:00Z',
    reference: 'RCP-001'
  },
  // Gula Pasir
  {
    id: 't-5',
    ingredient_id: 'ing-2',
    type: 'PURCHASE',
    quantity: 20,
    unit_price: 17500,
    total_price: 350000,
    created_at: '2024-01-20T11:00:00Z',
    reference: 'PO-004'
  },
  {
    id: 't-6',
    ingredient_id: 'ing-2',
    type: 'PURCHASE',
    quantity: 15,
    unit_price: 18500,
    total_price: 277500,
    created_at: '2024-02-01T13:20:00Z',
    reference: 'PO-005'
  }
]

// Tooltip edukasi untuk UMKM
const UMKMTooltip = ({ title, content, children }: { title: string, content: string, children: React.ReactNode }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 cursor-help">
          {children}
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 p-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-gray-600">{content}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export default function EnhancedInventoryPage() {
  const { isMobile, isTablet } = useResponsive()
  
  const [ingredients] = useState(sampleIngredients)
  const [transactions] = useState(sampleTransactions)
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [showPricingAnalysis, setShowPricingAnalysis] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Filter ingredients
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate weighted average for ingredient
  const handleShowPricingAnalysis = (ingredient: any) => {
    setSelectedIngredient(ingredient)
    setShowPricingAnalysis(true)
  }

  // Handle price update
  const handleUpdatePrice = useCallback((newPrice: number, method: string) => {
    // In real app, this would update the database
    console.log(`Update ${selectedIngredient?.name} price to ${newPrice} using ${method} method`)
    
    // Show success message
    alert(`✅ Harga ${selectedIngredient?.name} berhasil diupdate ke Rp ${newPrice.toLocaleString('id-ID')} menggunakan metode ${method}`)
  }, [selectedIngredient])

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredIngredients.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredIngredients.map(ingredient => ingredient.id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      alert(`Delete ${selectedItems.length} items?`)
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length > 0) {
      alert(`Edit ${selectedItems.length} items?`)
    }
  }

  // Get stock alert level with neutral colors
  const getStockAlertLevel = (ingredient: any) => {
    const ratio = ingredient.current_stock / ingredient.min_stock
    if (ratio <= 1) return { level: 'critical', color: 'bg-gray-800', text: 'Stock Kritis' }
    if (ratio <= 2) return { level: 'warning', color: 'bg-gray-600', text: 'Stock Rendah' }
    return { level: 'safe', color: 'bg-gray-400', text: 'Stock Aman' }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/inventory">Inventory</Link>
              </BreadcrumbLink>
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
            }`}>
              Inventory & Harga Rata-rata
            </h1>
            <p className="text-muted-foreground">
              Kelola stok dan hitung harga yang tepat untuk HPP
            </p>
          </div>
          <Link href="/inventory/ingredients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan Baku
            </Button>
          </Link>
        </div>

        {/* Educational Banner */}
        <Alert className="border-gray-200 bg-gray-50">
          <Lightbulb className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            💡 <strong>Tips UMKM:</strong> Harga bahan baku bisa naik-turun. Dengan sistem harga rata-rata, HPP Anda lebih akurat dan profit lebih stabil!
          </AlertDescription>
        </Alert>

        {/* Search, Filter, and Bulk Actions */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari bahan baku..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Bahan</SelectItem>
                <SelectItem value="low_stock">Stock Rendah</SelectItem>
                <SelectItem value="normal">Stock Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm text-gray-600">
                {selectedItems.length} item dipilih
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEdit}
                className="ml-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          )}
        </div>

        {/* Ingredients Table with Pricing Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Daftar Bahan Baku
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Klik "Analisis Harga" untuk melihat harga rata-rata yang tepat
                </p>
              </div>
              <UMKMTooltip
                title="Kenapa Perlu Analisis Harga?"
                content="Harga bahan baku berubah-ubah. Misalnya tepung beli minggu lalu Rp14.500/kg, minggu ini Rp15.800/kg. Pakai harga mana buat HPP? Sistem ini bantu Anda dapat harga rata-rata yang paling akurat!"
              >
                <BookOpen className="h-5 w-5 text-gray-500" />
              </UMKMTooltip>
            </div>
          </CardHeader>
          <CardContent>
            {filteredIngredients.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.length === filteredIngredients.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Nama Bahan</TableHead>
                      <TableHead>Status Stock</TableHead>
                      <TableHead>Stock Saat Ini</TableHead>
                      <TableHead>Harga List</TableHead>
                      <TableHead>Nilai Stock</TableHead>
                      <TableHead>Transaksi</TableHead>
                      <TableHead className="w-32">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredients.map((ingredient) => {
                      const stockAlert = getStockAlertLevel(ingredient)
                      const ingredientTransactions = transactions.filter(t => t.ingredient_id === ingredient.id)
                      const hasMultiplePurchases = ingredientTransactions.filter(t => t.type === 'PURCHASE').length > 1
                      
                      return (
                        <TableRow key={ingredient.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(ingredient.id)}
                              onCheckedChange={() => handleSelectItem(ingredient.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold">{ingredient.name}</span>
                              {hasMultiplePurchases && (
                                <Badge variant="outline" className="text-xs text-gray-600 border-gray-200 w-fit mt-1">
                                  <Calculator className="h-3 w-3 mr-1" />
                                  Multi Harga
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${stockAlert.color} text-white text-xs`}>
                              {stockAlert.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{ingredient.current_stock} {ingredient.unit}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{formatCurrency(ingredient.price_per_unit)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatCurrency(ingredient.current_stock * ingredient.price_per_unit)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {ingredientTransactions.filter(t => t.type === 'PURCHASE').length} pembelian
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShowPricingAnalysis(ingredient)}
                              >
                                <Calculator className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Tidak ada bahan baku yang ditemukan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Educational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Target className="h-5 w-5" />
                Manfaat Harga Rata-rata untuk UMKM
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm space-y-2">
              <p>✅ <strong>HPP lebih akurat:</strong> Tidak pakai harga lama yang bisa bikin rugi</p>
              <p>✅ <strong>Profit stabil:</strong> Harga jual berdasarkan cost yang real</p>
              <p>✅ <strong>Planning lebih baik:</strong> Tahu trend harga bahan naik/turun</p>
              <p>✅ <strong>Laporan lebih rapi:</strong> Nilai inventory yang tepat</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <BookOpen className="h-5 w-5" />
                Kapan Perlu Review Harga?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm space-y-2">
              <p>🔄 <strong>Setiap kali beli bahan:</strong> Harga berubah dari pembelian sebelumnya</p>
              <p>📈 <strong>Harga naik &gt;10%:</strong> Perlu update price list dan harga jual</p>
              <p>⚠️ <strong>Stock tinggal sedikit:</strong> Pastikan harga untuk pembelian berikutnya</p>
              <p>📊 <strong>Sebelum bikin HPP:</strong> Gunakan harga rata-rata terbaru</p>
            </CardContent>
          </Card>
        </div>

        {/* Weighted Average Cost Analysis Modal */}
        <Dialog open={showPricingAnalysis} onOpenChange={setShowPricingAnalysis}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Analisis Harga Rata-rata: {selectedIngredient?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedIngredient && (
              <div className="mt-4">
                {/* Quick education banner */}
                <Alert className="mb-6 border-gray-200 bg-gray-50">
                  <Lightbulb className="h-4 w-4 text-gray-600" />
                  <AlertDescription className="text-gray-700">
                    <strong>Cara Baca:</strong> Bandingkan semua metode di bawah. 
                    Untuk HPP yang akurat, pakai <strong>Moving Average</strong> (rekomendasi). 
                    Jika ada selisih &gt;5% dari harga list, pertimbangkan update harga jual.
                  </AlertDescription>
                </Alert>

                <WeightedAverageCostAnalysis
                  ingredient={selectedIngredient}
                  transactions={transactions.filter(t => t.ingredient_id === selectedIngredient.id)}
                  onUpdatePrice={handleUpdatePrice}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

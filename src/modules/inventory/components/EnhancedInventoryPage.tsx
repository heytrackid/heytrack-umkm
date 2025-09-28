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
  Factory
} from 'lucide-react'

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

  // Get stock alert level
  const getStockAlertLevel = (ingredient: any) => {
    const ratio = ingredient.current_stock / ingredient.min_stock
    if (ratio <= 1) return { level: 'critical', color: 'bg-red-500', text: 'Stock Kritis' }
    if (ratio <= 2) return { level: 'warning', color: 'bg-yellow-500', text: 'Stock Rendah' }
    return { level: 'safe', color: 'bg-green-500', text: 'Stock Aman' }
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Transaksi Baru
          </Button>
        </div>

        {/* Educational Banner */}
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            💡 <strong>Tips UMKM:</strong> Harga bahan baku bisa naik-turun. Dengan sistem harga rata-rata, HPP Anda lebih akurat dan profit lebih stabil!
          </AlertDescription>
        </Alert>

        {/* Search and Filter */}
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
                <BookOpen className="h-5 w-5 text-blue-500" />
              </UMKMTooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIngredients.map((ingredient, index) => {
                const stockAlert = getStockAlertLevel(ingredient)
                const ingredientTransactions = transactions.filter(t => t.ingredient_id === ingredient.id)
                const hasMultiplePurchases = ingredientTransactions.filter(t => t.type === 'PURCHASE').length > 1
                
                return (
                  <div key={ingredient.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      {/* Ingredient Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                          <Badge className={`${stockAlert.color} text-white text-xs`}>
                            {stockAlert.text}
                          </Badge>
                          {hasMultiplePurchases && (
                            <UMKMTooltip
                              title="Ada Beberapa Harga Pembelian"
                              content="Bahan ini dibeli beberapa kali dengan harga berbeda. Klik 'Analisis Harga' untuk lihat harga rata-rata yang tepat untuk HPP!"
                            >
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Calculator className="h-3 w-3 mr-1" />
                                Multi Harga
                              </Badge>
                            </UMKMTooltip>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <UMKMTooltip
                              title="Stock Saat Ini"
                              content="Jumlah bahan yang masih ada di gudang/tempat penyimpanan"
                            >
                              <p className="text-sm text-gray-600">Stock Saat Ini</p>
                            </UMKMTooltip>
                            <p className="font-semibold">{ingredient.current_stock} {ingredient.unit}</p>
                          </div>
                          <div>
                            <UMKMTooltip
                              title="Harga List Saat Ini"
                              content="Harga yang tercatat di sistem. Mungkin perlu diupdate jika sudah beli dengan harga berbeda."
                            >
                              <p className="text-sm text-gray-600">Harga List</p>
                            </UMKMTooltip>
                            <p className="font-semibold">{formatCurrency(ingredient.price_per_unit)}</p>
                          </div>
                          <div>
                            <UMKMTooltip
                              title="Nilai Stock"
                              content="Total nilai uang dari stock yang ada. Dihitung: Stock × Harga per unit"
                            >
                              <p className="text-sm text-gray-600">Nilai Stock</p>
                            </UMKMTooltip>
                            <p className="font-semibold">
                              {formatCurrency(ingredient.current_stock * ingredient.price_per_unit)}
                            </p>
                          </div>
                          <div>
                            <UMKMTooltip
                              title="Pembelian"
                              content="Berapa kali bahan ini sudah dibeli. Semakin banyak pembelian dengan harga berbeda, semakin perlu analisis harga rata-rata."
                            >
                              <p className="text-sm text-gray-600">Transaksi</p>
                            </UMKMTooltip>
                            <p className="font-semibold">
                              {ingredientTransactions.filter(t => t.type === 'PURCHASE').length} pembelian
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleShowPricingAnalysis(ingredient)}
                          className="whitespace-nowrap"
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Analisis Harga
                        </Button>
                        {hasMultiplePurchases && (
                          <Badge variant="secondary" className="text-center text-xs">
                            Butuh Review
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quick Preview for ingredients with multiple purchases */}
                    {hasMultiplePurchases && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Preview Harga Rata-rata</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <p className="text-gray-600">Harga Terendah</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(Math.min(...ingredientTransactions
                                .filter(t => t.type === 'PURCHASE')
                                .map(t => t.unit_price)))}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">Harga Tertinggi</p>
                            <p className="font-semibold text-red-600">
                              {formatCurrency(Math.max(...ingredientTransactions
                                .filter(t => t.type === 'PURCHASE') 
                                .map(t => t.unit_price)))}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">Selisih Harga</p>
                            <p className="font-semibold text-orange-600">
                              {formatCurrency(
                                Math.max(...ingredientTransactions.filter(t => t.type === 'PURCHASE').map(t => t.unit_price)) -
                                Math.min(...ingredientTransactions.filter(t => t.type === 'PURCHASE').map(t => t.unit_price))
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredIngredients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Tidak ada bahan baku yang ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Educational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Target className="h-5 w-5" />
                Manfaat Harga Rata-rata untuk UMKM
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 text-sm space-y-2">
              <p>✅ <strong>HPP lebih akurat:</strong> Tidak pakai harga lama yang bisa bikin rugi</p>
              <p>✅ <strong>Profit stabil:</strong> Harga jual berdasarkan cost yang real</p>
              <p>✅ <strong>Planning lebih baik:</strong> Tahu trend harga bahan naik/turun</p>
              <p>✅ <strong>Laporan lebih rapi:</strong> Nilai inventory yang tepat</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <BookOpen className="h-5 w-5" />
                Kapan Perlu Review Harga?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 text-sm space-y-2">
              <p>🔄 <strong>Setiap kali beli bahan:</strong> Harga berubah dari pembelian sebelumnya</p>
              <p>📈 <strong>Harga naik >10%:</strong> Perlu update price list dan harga jual</p>
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
                <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Cara Baca:</strong> Bandingkan semua metode di bawah. 
                    Untuk HPP yang akurat, pakai <strong>Moving Average</strong> (hijau). 
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

// Helper function untuk format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}
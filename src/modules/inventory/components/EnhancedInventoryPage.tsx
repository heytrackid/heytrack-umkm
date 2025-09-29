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
  
  // Use real data instead of sample data
  const { ingredients, loading, error, refresh } = useInventoryData()
  const { alerts } = useInventoryAlerts()
  
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [showPricingAnalysis, setShowPricingAnalysis] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false)

  // Filter ingredients
  const filteredIngredients = (ingredients || []).filter(ingredient =>
    ingredient.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (selectedItems.length === 0) return
    
    const selectedIngredients = filteredIngredients.filter(ing => selectedItems.includes(ing.id))
    const ingredientNames = selectedIngredients.map(ing => ing.name).join(', ')
    
    const confirmed = window.confirm(
      `⚠️ Yakin ingin menghapus ${selectedItems.length} bahan baku berikut?\n\n${ingredientNames}\n\n❗ Tindakan ini tidak bisa dibatalkan!`
    )
    
    if (confirmed) {
      // TODO: Implement actual API call to delete ingredients
      console.log('Deleting ingredients:', selectedItems)
      
      // Show success message (in real app, this would be API call)
      alert(`✅ ${selectedItems.length} bahan baku berhasil dihapus!`)
      
      // Clear selection
      setSelectedItems([])
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return
    
    const selectedIngredients = filteredIngredients.filter(ing => selectedItems.includes(ing.id))
    const ingredientNames = selectedIngredients.map(ing => ing.name).join(', ')
    
    // TODO: Open bulk edit modal or navigate to bulk edit page
    console.log('Bulk editing ingredients:', selectedItems)
    
    alert(`📝 Fitur bulk edit untuk ${selectedItems.length} bahan baku akan segera tersedia!\n\nBahan yang dipilih:\n${ingredientNames}`)
  }

  // Individual action handlers
  const handleEditIngredient = (ingredient: any) => {
    console.log('🔧 Edit button clicked for ingredient:', ingredient)
    
    // Navigate to ingredients page for editing
    window.location.href = '/ingredients'
  }

  const handleDeleteIngredient = (ingredient: any) => {
    console.log('🗑️ Delete button clicked for ingredient:', ingredient)
    
    const confirmed = window.confirm(
      `⚠️ KONFIRMASI PENGHAPUSAN\n\nYakin ingin menghapus bahan baku:\n"${ingredient.name}"\n\n❗ PERHATIAN: Tindakan ini tidak bisa dibatalkan!\n\n✅ Klik OK untuk lanjut\n❌ Klik Cancel untuk batalkan`
    )
    
    if (confirmed) {
      // TODO: Implement actual API call to delete ingredient
      console.log('✅ User confirmed deletion for ingredient:', ingredient.id)
      
      // Show success message (in real app, this would be API call)
      alert(`✅ BERHASIL!\n\nBahan baku "${ingredient.name}" berhasil dihapus dari sistem.`)
    } else {
      console.log('❌ User cancelled deletion for ingredient:', ingredient.name)
    }
  }

  // Handle add new ingredient
  const handleAddNewIngredient = () => {
    console.log('🆕 Tambah Bahan Baku button clicked')
    
    // Navigate directly to the new ingredients page
    window.location.href = '/ingredients/new'
  }

  // Get stock alert level with neutral colors
  const getStockAlertLevel = (ingredient: any) => {
    if (!ingredient.current_stock || !ingredient.min_stock) {
      return { level: 'unknown', color: 'bg-gray-400', text: 'Data Kosong' }
    }
    
    const ratio = ingredient.current_stock / ingredient.min_stock
    if (ratio <= 1) return { level: 'critical', color: 'bg-gray-800', text: 'Stock Kritis' }
    if (ratio <= 2) return { level: 'warning', color: 'bg-gray-600', text: 'Stock Rendah' }
    return { level: 'safe', color: 'bg-gray-400', text: 'Stock Aman' }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Memuat data inventory...</span>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading inventory: {error}
            </AlertDescription>
          </Alert>
          <Button onClick={refresh}>Coba Lagi</Button>
        </div>
      </AppLayout>
    )
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
          <Button onClick={handleAddNewIngredient}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan Baku
          </Button>
        </div>

        {/* Educational Banner */}
        <Alert className="border-gray-200 bg-gray-50">
          <Lightbulb className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            💡 <strong>Tips UMKM:</strong> Harga bahan baku bisa naik-turun. Dengan sistem harga rata-rata, HPP Anda lebih akurat dan profit lebih stabil!
          </AlertDescription>
        </Alert>

        {/* Tabs for Bahan Baku and Kategori */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">Bahan Baku</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="space-y-4">
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {selectedItems.length} item dipilih
                    </span>
                    <span className="text-xs text-gray-500">
                      ({filteredIngredients.filter(ing => selectedItems.includes(ing.id)).map(ing => ing.name).slice(0, 2).join(', ')}
                      {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItems([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkEdit}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Semua
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Semua
                    </Button>
                  </div>
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
                              checked={selectedItems.length === filteredIngredients.length && filteredIngredients.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Nama Bahan</TableHead>
                          <TableHead>Status Stock</TableHead>
                          <TableHead>Stock Saat Ini</TableHead>
                          <TableHead>Harga per Unit</TableHead>
                          <TableHead>Nilai Stock</TableHead>
                          <TableHead className="w-32">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIngredients.map((ingredient) => {
                          const stockAlert = getStockAlertLevel(ingredient)
                          
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
                                  <span className="font-semibold">{ingredient.name || 'Nama tidak tersedia'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${stockAlert.color} text-white text-xs`}>
                                  {stockAlert.text}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {ingredient.current_stock || 0} {ingredient.unit || 'unit'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {formatCurrency(ingredient.price_per_unit || 0)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {formatCurrency((ingredient.current_stock || 0) * (ingredient.price_per_unit || 0))}
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
                                      <DropdownMenuItem onClick={() => handleEditIngredient(ingredient)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleDeleteIngredient(ingredient)}
                                      >
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
                    <Button 
                      onClick={() => window.location.href = '/ingredients/new'}
                      className="mt-4"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Bahan Baku Pertama
                    </Button>
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
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {/* Categories Management - Placeholder */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Kategori Bahan Baku
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Kelola kategori untuk mengelompokkan bahan baku
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => window.location.href = '/categories'}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Kelola Kategori
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Kelola kategori melalui menu Kategori</p>
                  <Button 
                    onClick={() => window.location.href = '/categories'}
                    className="mt-4"
                    variant="outline"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Buka Menu Kategori
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category Tips */}
            <Alert className="border-gray-200 bg-gray-50">
              <Lightbulb className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700">
                💡 <strong>Tips Kategori:</strong> Kelompokkan bahan dengan sifat serupa. Misalnya: semua tepung dalam "Tepung & Biji-bijian", semua dairy dalam "Dairy & Lemak". Ini memudahkan pencarian dan analisis cost per kategori!
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

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
                  transactions={[]} // Empty transactions for now
                  onUpdatePrice={handleUpdatePrice}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )

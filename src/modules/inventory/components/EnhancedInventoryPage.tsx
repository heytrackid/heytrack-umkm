'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'
import { 
  StatsCardSkeleton,
  DashboardHeaderSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import { 
  InventoryTableSkeleton,
  SearchFormSkeleton
} from '@/components/ui/skeletons/table-skeletons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import AppLayout from '@/components/layout/app-layout'
import Link from 'next/link'

// Enhanced components
import { WeightedAverageCostAnalysis } from './WeightedAverageCostAnalysis'

// Extracted components
import { IngredientsTab } from './IngredientsTab'
import { CategoriesTab } from './CategoriesTab'

// Hooks
import { useInventoryData, useInventoryAlerts } from '../hooks/useInventoryData'
import { useResponsive } from '@/shared/hooks'

import {
  PullToRefresh,
  SwipeActions
} from '@/components/ui/mobile-gestures'

// Utils and constants
import { STOCK_TRANSACTION_TYPES } from '../constants'

import {
  Plus,
  Calculator,
  Lightbulb,
  AlertTriangle
} from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EnhancedInventoryPage({ initialIngredients = [] }: { initialIngredients?: any[] }) {
  const { isMobile, isTablet } = useResponsive()
  
  // Use real data instead of sample data (hydrate with initial data from server when available)
const { ingredients, loading, error, refresh } = useInventoryData(undefined, { initial: initialIngredients as any, refetchOnMount: false })
  const { alerts } = useInventoryAlerts()
  
  // Skeleton loading management
  const { loading: skeletonLoading, setLoading: setSkeletonLoading, isLoading: isSkeletonLoading } = useLoading({
    [LOADING_KEYS.FETCH_INVENTORY]: true
  })
  
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null)
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
      alert(`✅ BERHASIL!\n\nBahan baku"${ingredient.name}" berhasil dihapus dari sistem.`)
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

  // Simulate skeleton loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonLoading(LOADING_KEYS.FETCH_INVENTORY, false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  if (loading && !isSkeletonLoading(LOADING_KEYS.FETCH_INVENTORY)) {
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
            {isSkeletonLoading(LOADING_KEYS.FETCH_INVENTORY) ? (
              <div className="space-y-4">
                <SearchFormSkeleton />
                <InventoryTableSkeleton rows={8} />
              </div>
            ) : (
              <IngredientsTab
                filteredIngredients={filteredIngredients}
                selectedItems={selectedItems}
                searchTerm={searchTerm}
                typeFilter={typeFilter}
                onSearchChange={setSearchTerm}
                onTypeFilterChange={setTypeFilter}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onClearSelection={() => setSelectedItems([])}
                onBulkEdit={handleBulkEdit}
                onBulkDelete={handleBulkDelete}
                onEditIngredient={handleEditIngredient}
                onDeleteIngredient={handleDeleteIngredient}
                onShowPricingAnalysis={handleShowPricingAnalysis}
                getStockAlertLevel={getStockAlertLevel}
              />
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {isSkeletonLoading(LOADING_KEYS.FETCH_INVENTORY) ? (
              <div className="space-y-4">
                <SearchFormSkeleton />
                <InventoryTableSkeleton rows={5} />
              </div>
            ) : (
              <CategoriesTab />
            )}
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
}

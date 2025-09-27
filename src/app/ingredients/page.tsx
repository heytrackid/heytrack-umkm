'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Ingredient } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/use-mobile'
import {
  PullToRefresh,
  SwipeActions
} from '@/components/ui/mobile-gestures'
import { MobileTable } from '@/components/ui/mobile-table'
import {
  MobileForm,
  MobileInput,
  MobileTextarea,
  MobileNumberInput,
  MobileSelect
} from '@/components/ui/mobile-forms'
import { MiniChart } from '@/components/ui/mobile-charts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Truck,
  BarChart3,
  Eye,
  ShoppingCart,
  Clock
} from 'lucide-react'


const categories = ['Semua', 'Tepung', 'Dairy', 'Protein', 'Pemanis', 'Cokelat', 'Ragi', 'Bumbu']
const units = ['kg', 'g', 'l', 'ml', 'butir', 'bks', 'pcs']

// Enhanced ingredient type for UI display
interface IngredientWithStats extends Omit<Ingredient, 'current_stock' | 'min_stock' | 'price_per_unit'> {
  currentStock: number // Map from 'current_stock' field
  minStock: number // Map from 'min_stock' field
  pricePerUnit: number // Map from 'price_per_unit' field
  status: 'adequate' | 'low' | 'critical'
  usagePerWeek?: number
  totalValue: number
  supplierPhone?: string
  lastPurchase?: string
  expiryDate?: string
}

export default function IngredientsPage() {
  const { isMobile, isTablet } = useResponsive()
  
  const [ingredients, setIngredients] = useState<IngredientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [selectedStatus, setSelectedStatus] = useState('Semua')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientWithStats | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<IngredientWithStats | null>(null)

  // Fetch ingredients from API
  useEffect(() => {
    fetchIngredients()
  }, [])

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ingredients')
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients')
      }
      const data: Ingredient[] = await response.json()
      
      // Transform data to include calculated fields for UI
      const transformedData: IngredientWithStats[] = data.map(ingredient => ({
        ...ingredient,
        category: ingredient.category || 'Umum', // Use DB category if available
        currentStock: ingredient.current_stock,
        minStock: ingredient.min_stock,
        pricePerUnit: ingredient.price_per_unit,
        status: getStockStatus(ingredient.current_stock, ingredient.min_stock),
        totalValue: ingredient.current_stock * ingredient.price_per_unit,
        usagePerWeek: 0, // Default since we don't track this yet
        supplierPhone: '', // Default since we don't have this field yet
        lastPurchase: '', // Default since we don't have this field yet
        expiryDate: '' // Default since we don't have this field yet
      }))
      
      setIngredients(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredients')
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (currentStock: number, minStock: number): 'adequate' | 'low' | 'critical' => {
    if (currentStock <= minStock * 0.5) return 'critical'
    if (currentStock <= minStock) return 'low'
    return 'adequate'
  }

  // Filter ingredients
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesCategory = selectedCategory === 'Semua' || ingredient.category === selectedCategory
    const matchesStatus = selectedStatus === 'Semua' || ingredient.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'adequate': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'adequate': return 'Cukup'
      case 'low': return 'Rendah'
      case 'critical': return 'Kritis'
      default: return 'Unknown'
    }
  }

  const handleViewIngredient = (ingredient: any) => {
    setSelectedIngredient(ingredient)
    setIsViewDialogOpen(true)
  }
  
  const handleEditIngredient = (ingredient: IngredientWithStats) => {
    setEditingIngredient(ingredient)
    setIsEditDialogOpen(true)
  }
  
  const handleDeleteIngredient = async (ingredient: IngredientWithStats) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${ingredient.name}?`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/ingredients/${ingredient.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menghapus ingredient')
      }
      
      // Refresh data after delete
      fetchIngredients()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus ingredient')
    }
  }
  
  const handleFormSuccess = () => {
    fetchIngredients() // Refresh data after create/update
  }

  // Swipe actions for mobile
  const ingredientSwipeActions = [
    {
      id: 'view',
      label: 'Lihat',
      icon: <Eye className="h-4 w-4" />,
      color: 'blue' as const,
      onClick: (ingredient: IngredientWithStats) => handleViewIngredient(ingredient)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      color: 'green' as const,
      onClick: (ingredient: IngredientWithStats) => handleEditIngredient(ingredient)
    },
    {
      id: 'delete',
      label: 'Hapus',
      icon: <Trash2 className="h-4 w-4" />,
      color: 'red' as const,
      onClick: (ingredient: IngredientWithStats) => handleDeleteIngredient(ingredient)
    }
  ]

  // Calculate stats
  const stats = {
    totalIngredients: ingredients.length,
    lowStockItems: ingredients.filter(i => i.status === 'low' || i.status === 'critical').length,
    totalValue: ingredients.reduce((sum, i) => sum + i.totalValue, 0),
    avgUsage: ingredients.length > 0 
      ? ingredients.reduce((sum, i) => sum + (i.usagePerWeek || 0), 0) / ingredients.length
      : 0
  }

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className={`flex justify-between items-center ${
            isMobile ? 'flex-col gap-4' : ''
          }`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>Bahan Baku</h1>
              <p className="text-muted-foreground">Kelola stok dan supplier bahan baku</p>
            </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Bahan
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Bahan Baru</DialogTitle>
                </DialogHeader>
                <IngredientForm 
                  onClose={() => setIsAddDialogOpen(false)} 
                  onSuccess={handleFormSuccess}
                />
              </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Memuat data bahan baku...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Gagal memuat data</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchIngredients}>Coba Lagi</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content - only show when not loading and no error */}
        {!loading && !error && (
          <>
          {/* Stats Cards */}
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'md:grid-cols-4'
          }`}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bahan</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{stats.totalIngredients}</div>
              <p className="text-xs text-muted-foreground">jenis bahan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-orange-600 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">perlu restok</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Total Stok</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>Rp {stats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">investasi stok</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Pemakaian</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{stats.avgUsage.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">kg per minggu</p>
            </CardContent>
          </Card>
        </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className={`flex gap-4 ${
                isMobile ? 'flex-col' : 'md:flex-row'
              }`}>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari bahan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-8 ${
                        isMobile ? 'h-12 text-base' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className={`flex gap-2 ${
                  isMobile ? 'flex-col' : 'flex-wrap'
                }`}>
                  <select
                    className={`px-3 py-1.5 border border-input rounded-md bg-background text-sm ${
                      isMobile ? 'h-12 text-base' : ''
                    }`}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    className={`px-3 py-1.5 border border-input rounded-md bg-background text-sm ${
                      isMobile ? 'h-12 text-base' : ''
                    }`}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="adequate">Cukup</option>
                    <option value="low">Rendah</option>
                    <option value="critical">Kritis</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Table/Grid - Mobile Optimized */}
          <MobileTable
            data={filteredIngredients}
            searchable
            searchPlaceholder="Cari bahan baku..."
            onSearch={setSearchTerm}
            columns={[
              {
                key: 'name',
                label: 'Bahan',
                accessor: 'name',
                render: (value, row) => (
                  <div>
                    <p className="font-medium">{value}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {row.description || 'Tidak ada deskripsi'}
                    </p>
                    {isMobile && (
                      <div className="mt-1 flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {row.category}
                        </Badge>
                        <Badge className={getStatusColor(row.status) + ' text-xs'}>
                          {getStatusText(row.status)}
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              },
              ...(!isMobile ? [{
                key: 'category',
                label: 'Kategori',
                accessor: 'category' as keyof IngredientWithStats,
                render: (value: string) => (
                  <Badge variant="outline">{value}</Badge>
                )
              }] : []),
              {
                key: 'stock',
                label: 'Stok',
                accessor: (item: IngredientWithStats) => `${item.currentStock} ${item.unit}`,
                render: (value, row) => (
                  <div>
                    <p className="font-medium">{row.currentStock} {row.unit}</p>
                    <p className="text-sm text-muted-foreground">
                      Min: {row.minStock} {row.unit}
                    </p>
                    {!isMobile && (
                      <p className="text-sm text-muted-foreground">
                        {row.usagePerWeek} {row.unit}/minggu
                      </p>
                    )}
                  </div>
                )
              },
              {
                key: 'price',
                label: 'Harga',
                accessor: 'pricePerUnit',
                render: (value, row) => (
                  <div>
                    <p className="font-medium">Rp {value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: Rp {row.totalValue.toLocaleString()}
                    </p>
                  </div>
                )
              },
              ...(!isMobile ? [{
                key: 'status',
                label: 'Status',
                accessor: 'status' as keyof IngredientWithStats,
                render: (value: string) => (
                  <Badge className={getStatusColor(value)}>
                    {getStatusText(value)}
                  </Badge>
                )
              }] : []),
              ...(!isMobile ? [{
                key: 'supplier',
                label: 'Supplier',
                accessor: 'supplier' as keyof IngredientWithStats,
                render: (value: string, row: IngredientWithStats) => (
                  <div className="text-sm">
                    <p className="font-medium">{value}</p>
                    <p className="text-muted-foreground">{row.supplierPhone}</p>
                  </div>
                )
              }] : [])
            ]}
            actions={[
              {
                label: 'Lihat',
                icon: <Eye className="h-4 w-4" />,
                onClick: (row) => handleViewIngredient(row)
              },
              {
                label: 'Edit',
                icon: <Edit className="h-4 w-4" />,
                onClick: (row) => handleEditIngredient(row)
              },
              {
                label: 'Hapus',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: (row) => handleDeleteIngredient(row),
                variant: 'destructive'
              }
            ]}
            emptyMessage="Tidak ada bahan baku ditemukan. Coba ubah filter atau tambah bahan baru."
          />

          {/* Quick Actions - Low Stock Items */}
          {stats.lowStockItems > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-orange-600 ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                  Bahan yang Perlu Segera Dibeli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-3 ${
                  isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {ingredients
                    .filter(ingredient => ingredient.status === 'low' || ingredient.status === 'critical')
                    .map((ingredient) => (
                      <SwipeActions
                        key={ingredient.id}
                        actions={[
                          {
                            id: 'buy',
                            label: 'Beli',
                            icon: <ShoppingCart className="h-4 w-4" />,
                            color: 'green' as const,
                            onClick: () => console.log('Buy', ingredient.name)
                          }
                        ]}
                      >
                        <div className={`flex items-center justify-between p-3 border rounded-lg ${
                          isMobile ? 'bg-muted/50' : ''
                        }`}>
                          <div>
                            <p className="font-medium">{ingredient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Stok: {ingredient.currentStock} {ingredient.unit} / Min: {ingredient.minStock} {ingredient.unit}
                            </p>
                          </div>
                          {!isMobile && (
                            <Button size="sm">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Beli
                            </Button>
                          )}
                        </div>
                      </SwipeActions>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Edit Ingredient Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Bahan</DialogTitle>
            </DialogHeader>
            <IngredientForm 
              onClose={() => {
                setIsEditDialogOpen(false)
                setEditingIngredient(null)
              }}
              onSuccess={() => {
                handleFormSuccess()
                setEditingIngredient(null)
              }}
              editData={editingIngredient}
            />
          </DialogContent>
        </Dialog>

        {/* Ingredient Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedIngredient?.name}</DialogTitle>
            </DialogHeader>
            {selectedIngredient && <IngredientDetailView ingredient={selectedIngredient} />}
          </DialogContent>
        </Dialog>
        </>
        )}
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}

// Ingredient Form Component
function IngredientForm({ onClose, onSuccess, editData }: { 
  onClose: () => void
  onSuccess?: () => void
  editData?: IngredientWithStats | null 
}) {
  const { isMobile } = useResponsive()
  
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    category: editData?.category || '',
    unit: editData?.unit || 'kg',
    price_per_unit: editData?.pricePerUnit || 0,
    current_stock: editData?.currentStock || 0,
    min_stock: editData?.minStock || 0,
    supplier: editData?.supplier || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.unit || formData.price_per_unit <= 0) {
      setError('Nama, satuan, dan harga harus diisi')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const url = editData ? `/api/ingredients/${editData.id}` : '/api/ingredients'
      const method = editData ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menyimpan ingredient')
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <MobileForm onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className={`grid w-full grid-cols-3 ${
          isMobile ? 'h-12' : ''
        }`}>
          <TabsTrigger value="basic" className={isMobile ? 'text-sm' : ''}>
            Info Dasar
          </TabsTrigger>
          <TabsTrigger value="stock" className={isMobile ? 'text-sm' : ''}>
            Stok
          </TabsTrigger>
          <TabsTrigger value="supplier" className={isMobile ? 'text-sm' : ''}>
            Supplier
          </TabsTrigger>
        </TabsList>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <TabsContent value="basic" className="space-y-4">
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            <MobileInput
              label="Nama Bahan"
              placeholder="Contoh: Tepung Terigu Premium"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              required
            />
            <MobileSelect
              label="Kategori"
              placeholder="Pilih kategori"
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              options={categories.filter(c => c !== 'Semua').map(category => ({
                value: category,
                label: category
              }))}
            />
            <MobileSelect
              label="Satuan"
              value={formData.unit}
              onChange={(value) => handleInputChange('unit', value)}
              options={units.map(unit => ({ value: unit, label: unit }))}
              required
            />
            <MobileNumberInput
              label="Harga per Satuan"
              value={formData.price_per_unit}
              onChange={(value) => handleInputChange('price_per_unit', value)}
              min={0}
              step={100}
              formatCurrency
              required
            />
          </div>
          <MobileTextarea
            label="Deskripsi"
            placeholder="Deskripsi bahan..."
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            rows={isMobile ? 3 : 4}
          />
        </TabsContent>
        
        <TabsContent value="stock" className="space-y-4">
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            <MobileNumberInput
              label="Stok Saat Ini"
              placeholder="50"
              value={formData.current_stock}
              onChange={(value) => handleInputChange('current_stock', value)}
              min={0}
              step={0.1}
            />
            <MobileNumberInput
              label="Stok Minimum"
              placeholder="10"
              value={formData.min_stock}
              onChange={(value) => handleInputChange('min_stock', value)}
              min={0}
              step={0.1}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="supplier" className="space-y-4">
          <MobileInput
            label="Nama Supplier"
            placeholder="CV. Bahan Berkah"
            value={formData.supplier}
            onChange={(value) => handleInputChange('supplier', value)}
          />
        </TabsContent>
        
        <div className={`flex gap-2 pt-4 border-t ${
          isMobile ? 'flex-col' : 'justify-end'
        }`}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className={isMobile ? 'w-full' : ''}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={isMobile ? 'w-full' : ''}
          >
            {isSubmitting ? 'Menyimpan...' : editData ? 'Update Bahan' : 'Simpan Bahan'}
          </Button>
        </div>
      </Tabs>
    </MobileForm>
  )
}

// Ingredient Detail View Component  
function IngredientDetailView({ ingredient }: { ingredient: any }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="stock">Stok</TabsTrigger>
        <TabsTrigger value="supplier">Supplier</TabsTrigger>
        <TabsTrigger value="usage">Pemakaian</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Informasi Dasar</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <Badge variant="outline">{ingredient.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Satuan:</span>
                  <span>{ingredient.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga per Unit:</span>
                  <span>Rp {ingredient.pricePerUnit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(ingredient.status)}>
                    {getStatusText(ingredient.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Nilai Stok</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stok Saat Ini:</span>
                  <span>{ingredient.currentStock} {ingredient.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nilai Total:</span>
                  <span>Rp {ingredient.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pemakaian/Minggu:</span>
                  <span>{ingredient.usagePerWeek} {ingredient.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimasi Habis:</span>
                  <span>{Math.ceil(ingredient.currentStock / ingredient.usagePerWeek)} minggu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Deskripsi</h3>
          <p className="mt-2 text-sm text-muted-foreground">{ingredient.description}</p>
        </div>
      </TabsContent>
      
      <TabsContent value="stock" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stok Saat Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{ingredient.currentStock}</p>
              <p className="text-xs text-muted-foreground">{ingredient.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stok Minimum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{ingredient.minStock}</p>
              <p className="text-xs text-muted-foreground">{ingredient.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stok Maksimum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{ingredient.maxStock}</p>
              <p className="text-xs text-muted-foreground">{ingredient.unit}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progress ke minimum stock:</span>
            <span>{((ingredient.currentStock / ingredient.minStock) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${Math.min((ingredient.currentStock / ingredient.minStock) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Terakhir dibeli: {ingredient.lastPurchase}</p>
            <p className="text-muted-foreground">Kedaluwarsa: {ingredient.expiryDate}</p>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="supplier" className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Informasi Supplier</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama:</span>
              <span className="font-medium">{ingredient.supplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telepon:</span>
              <span>{ingredient.supplierPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terakhir Order:</span>
              <span>{ingredient.lastPurchase}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Order Ulang
            </Button>
            <Button size="sm" variant="outline">
              Edit Supplier
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="usage" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pemakaian Mingguan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{ingredient.usagePerWeek}</p>
              <p className="text-xs text-muted-foreground">{ingredient.unit}/minggu</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Estimasi Habis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Math.ceil(ingredient.currentStock / ingredient.usagePerWeek)}
              </p>
              <p className="text-xs text-muted-foreground">minggu lagi</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trend Pemakaian</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Grafik trend pemakaian akan ditampilkan di sini
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'adequate': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
    case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'adequate': return 'Cukup'
    case 'low': return 'Rendah'
    case 'critical': return 'Kritis'
    default: return 'Unknown'
  }
}
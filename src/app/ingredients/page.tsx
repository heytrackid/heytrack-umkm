'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Ingredient } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bahan Baku</h1>
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bahan</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIngredients}</div>
              <p className="text-xs text-muted-foreground">jenis bahan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">perlu restok</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Total Stok</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">investasi stok</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Pemakaian</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgUsage.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">kg per minggu</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari bahan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
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

        {/* Ingredients Table/Grid */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Bahan</th>
                    <th className="p-4 font-medium">Kategori</th>
                    <th className="p-4 font-medium">Stok Saat Ini</th>
                    <th className="p-4 font-medium">Min/Max</th>
                    <th className="p-4 font-medium">Harga/Unit</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Supplier</th>
                    <th className="p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ingredient) => (
                    <tr key={ingredient.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{ingredient.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {ingredient.description || 'Tidak ada deskripsi'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{ingredient.category}</Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{ingredient.currentStock} {ingredient.unit}</p>
                          <p className="text-sm text-muted-foreground">
                            {ingredient.usagePerWeek} {ingredient.unit}/minggu
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p>Min: {ingredient.minStock} {ingredient.unit}</p>
                          <p>Max: {ingredient.minStock * 3} {ingredient.unit}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">Rp {ingredient.pricePerUnit.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: Rp {ingredient.totalValue.toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(ingredient.status)}>
                          {getStatusText(ingredient.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="font-medium">{ingredient.supplier}</p>
                          <p className="text-muted-foreground">{ingredient.supplierPhone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewIngredient(ingredient)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditIngredient(ingredient)}
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteIngredient(ingredient)}
                            title="Hapus"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredIngredients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada bahan ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah kata kunci pencarian atau filter
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Bahan Pertama
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - Low Stock Items */}
        {stats.lowStockItems > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Bahan yang Perlu Segera Dibeli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {ingredients
                  .filter(ingredient => ingredient.status === 'low' || ingredient.status === 'critical')
                  .map((ingredient) => (
                    <div 
                      key={ingredient.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stok: {ingredient.currentStock} {ingredient.unit} / Min: {ingredient.minStock} {ingredient.unit}
                        </p>
                      </div>
                      <Button size="sm">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Beli
                      </Button>
                    </div>
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
    </AppLayout>
  )
}

// Ingredient Form Component
function IngredientForm({ onClose, onSuccess, editData }: { 
  onClose: () => void
  onSuccess?: () => void
  editData?: IngredientWithStats | null 
}) {
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
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Info Dasar</TabsTrigger>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
        </TabsList>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Bahan *</Label>
              <Input 
                id="name" 
                placeholder="Contoh: Tepung Terigu Premium"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Pilih kategori</option>
                {categories.filter(c => c !== 'Semua').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="unit">Satuan *</Label>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                required
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pricePerUnit">Harga per Satuan *</Label>
              <Input 
                id="pricePerUnit" 
                type="number" 
                placeholder="12000"
                value={formData.price_per_unit}
                onChange={(e) => handleInputChange('price_per_unit', parseFloat(e.target.value) || 0)}
                required
                min="0"
                step="100"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea 
              id="description" 
              placeholder="Deskripsi bahan..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="stock" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Stok Saat Ini</Label>
              <Input 
                id="currentStock" 
                type="number" 
                placeholder="50"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="minStock">Stok Minimum</Label>
              <Input 
                id="minStock" 
                type="number" 
                placeholder="10"
                value={formData.min_stock}
                onChange={(e) => handleInputChange('min_stock', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="supplier" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Nama Supplier</Label>
              <Input 
                id="supplier" 
                placeholder="CV. Bahan Berkah"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : editData ? 'Update Bahan' : 'Simpan Bahan'}
          </Button>
        </div>
      </Tabs>
    </form>
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
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useResponsive } from '@/shared/hooks'
import Link from 'next/link'
import { 
  ArrowLeft,
  Save,
  Package,
  Info
} from 'lucide-react'

const units = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gram', label: 'Gram (g)' },
  { value: 'liter', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'sachet', label: 'Sachet' }
]

const categories = [
  { value: 'flour', label: 'Tepung & Gandum' },
  { value: 'dairy', label: 'Susu & Olahan' },
  { value: 'sugar', label: 'Gula & Pemanis' },
  { value: 'fat', label: 'Lemak & Minyak' },
  { value: 'eggs', label: 'Telur & Protein' },
  { value: 'seasoning', label: 'Bumbu & Rempah' },
  { value: 'additives', label: 'Bahan Tambahan' },
  { value: 'packaging', label: 'Kemasan' },
  { value: 'other', label: 'Lainnya' }
]

export default function NewIngredientPage() {
  const router = useRouter()
  const { isMobile } = useResponsive()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    price_per_unit: '',
    minimum_stock: '',
    current_stock: '0',
    supplier: '',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Nama bahan baku wajib diisi'
    if (!formData.category) newErrors.category = 'Kategori wajib dipilih'
    if (!formData.unit) newErrors.unit = 'Satuan wajib dipilih'
    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
      newErrors.price_per_unit = 'Harga per unit harus lebih dari 0'
    }
    if (!formData.minimum_stock || parseFloat(formData.minimum_stock) < 0) {
      newErrors.minimum_stock = 'Minimum stock tidak boleh negatif'
    }
    if (parseFloat(formData.current_stock) < 0) {
      newErrors.current_stock = 'Stock awal tidak boleh negatif'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Implement actual API call to save ingredient
      const ingredientData = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        minimum_stock: parseFloat(formData.minimum_stock),
        current_stock: parseFloat(formData.current_stock),
        created_at: new Date().toISOString()
      }
      
      console.log('Saving new ingredient:', ingredientData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success message
      alert('✅ Bahan baku baru berhasil ditambahkan!')
      
      // Redirect back to inventory page
      router.push('/inventory')
    } catch (error) {
      console.error('Error saving ingredient:', error)
      alert('❌ Gagal menyimpan bahan baku. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(cat => cat.value === formData.category)
  const selectedUnit = units.find(unit => unit.value === formData.unit)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
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
              <BreadcrumbPage>Tambah Bahan Baku</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Header */}
        <div className={`flex gap-4 ${
          isMobile ? 'flex-col items-start' : 'justify-between items-center'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>
                Tambah Bahan Baku Baru
              </h1>
            </div>
            <p className="text-muted-foreground">
              Tambahkan master data bahan baku baru ke inventory
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            💡 <strong>Tips:</strong> Pastikan nama bahan baku unik dan jelas. Setelah ditambahkan, Anda bisa membuat transaksi pembelian untuk menambah stock awal.
          </AlertDescription>
        </Alert>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informasi Bahan Baku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Nama & Kategori */}
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Bahan Baku *</Label>
                  <Input
                    id="name"
                    placeholder="Tepung Terigu Premium, Gula Pasir, dll"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Unit & Harga */}
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="unit">Satuan *</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => handleInputChange('unit', value)}
                  >
                    <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-sm text-red-600">{errors.unit}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_unit">Harga Per Unit (Rp) *</Label>
                  <Input
                    id="price_per_unit"
                    type="number"
                    step="1"
                    placeholder="15000"
                    value={formData.price_per_unit}
                    onChange={(e) => handleInputChange('price_per_unit', e.target.value)}
                    required
                    className={errors.price_per_unit ? 'border-red-500' : ''}
                  />
                  {errors.price_per_unit && (
                    <p className="text-sm text-red-600">{errors.price_per_unit}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Harga referensi per {selectedUnit?.label.toLowerCase() || 'unit'}
                  </p>
                </div>
              </div>

              {/* Row 3: Stock Minimum & Stock Awal */}
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={formData.minimum_stock}
                    onChange={(e) => handleInputChange('minimum_stock', e.target.value)}
                    required
                    className={errors.minimum_stock ? 'border-red-500' : ''}
                  />
                  {errors.minimum_stock && (
                    <p className="text-sm text-red-600">{errors.minimum_stock}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Batas minimum untuk alert stock habis
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_stock">Stock Awal</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.current_stock}
                    onChange={(e) => handleInputChange('current_stock', e.target.value)}
                    className={errors.current_stock ? 'border-red-500' : ''}
                  />
                  {errors.current_stock && (
                    <p className="text-sm text-red-600">{errors.current_stock}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Isi 0 jika belum ada stock, nanti buat transaksi pembelian
                  </p>
                </div>
              </div>

              {/* Supplier (opsional) */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Utama (opsional)</Label>
                <Input
                  id="supplier"
                  placeholder="CV. Bahan Berkah, Toko Sari Roti, dll"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Supplier yang biasa digunakan untuk bahan ini
                </p>
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan tentang bahan baku ini..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Preview Card */}
              {formData.name && formData.category && formData.unit && formData.price_per_unit && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preview Bahan Baku</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="font-medium">{selectedCategory?.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Satuan:</span>
                      <span className="font-medium">{selectedUnit?.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga per unit:</span>
                      <span className="font-medium">
                        Rp {parseFloat(formData.price_per_unit).toLocaleString()}
                      </span>
                    </div>
                    {formData.minimum_stock && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Minimum stock:</span>
                        <span className="font-medium">
                          {formData.minimum_stock} {formData.unit}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stock awal:</span>
                      <span className="font-medium">
                        {formData.current_stock} {formData.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-3 pt-4 ${
                isMobile ? 'flex-col' : 'justify-end'
              }`}>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Bahan Baku'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
import { useSettings } from '@/contexts/settings-context'
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


export default function NewIngredientPage() {
  const router = useRouter()
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
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
    if (!formData.unit) newErrors.unit = 'Satuan wajib dipilih'
    if (!formData.price_per_unit || parseFloat <= 0) {
      newErrors.price_per_unit = 'Harga per unit harus lebih dari 0'
    }
    if (!formData.minimum_stock || parseFloat < 0) {
      newErrors.minimum_stock = 'Minimum stock tidak boleh negatif'
    }
    if (parseFloat < 0) {
      newErrors.current_stock = 'Stock awal tidak boleh negatif'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Implement actual API call to save ingredient
      const ingredientData = {
        ...formData,
        price_per_unit: parseFloat,
        minimum_stock: parseFloat,
        current_stock: parseFloat,
        created_at: new Date().toISOString()
      }
      
      console.log('✅ Saving new ingredient master data:', ingredientData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout)
      
      // Show success message
      alert(`✅ BERHASIL!

Bahan baku"${formData.name}" berhasil ditambahkan!

📝 Detail:
• Nama: ${formData.name}
• Satuan: ${formData.unit}
• Harga: ${formatCurrency(parseFloat)}
• Stock awal: ${formData.current_stock} ${formData.unit}

Anda akan kembali ke halaman inventory.`)
      
      // Redirect back to inventory page
      router.push('/inventory')
    } catch (error) {
      console.error('Error saving ingredient:', error)
      alert
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className={`font-bold text-foreground ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>
              Tambah Bahan Baku Baru
            </h1>
            <p className="text-muted-foreground text-sm">
              Tambahkan master data bahan baku baru ke sistem
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            💡 <strong>Tips:</strong> Ini untuk menambah jenis bahan baku baru (misal: Tepung Terigu Premium). 
            Untuk transaksi stok (beli/pakai), gunakan menu"Transaksi Inventory".
          </AlertDescription>
        </Alert>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Data Bahan Baku Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama Bahan Baku */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Bahan Baku *</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Tepung Terigu Premium, Gula Pasir Halus, Mentega Anchor..."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
                <p className="text-xs text-gray-500">
                  Nama harus jelas dan spesifik agar mudah dibedakan
                </p>
              </div>

              {/* Satuan */}
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
                <p className="text-xs text-gray-500">
                  Pilih satuan yang sesuai untuk mengukur bahan ini
                </p>
              </div>

              {/* Row: Harga & Min Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_unit">Harga Per {selectedUnit?.label || 'Unit'} (Rp) *</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_stock">Minimum Stock Alert *</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={formData.minimum_stock}
                    onChange={(e) => handleInputChange('minimum_stock', e.target.value)}
                    required
                    className={errors.minimum_stock ? 'border-red-500' : ''}
                  />
                  {errors.minimum_stock && (
                    <p className="text-sm text-red-600">{errors.minimum_stock}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Sistem akan alert jika stock di bawah angka ini
                  </p>
                </div>
              </div>

              {/* Stock Awal (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="current_stock">Stock Awal (Opsional)</Label>
                <Input
                  id="current_stock"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.current_stock}
                  onChange={(e) => handleInputChange('current_stock', e.target.value)}
                  className={errors.current_stock ? 'border-red-500' : ''}
                />
                {errors.current_stock && (
                  <p className="text-sm text-red-600">{errors.current_stock}</p>
                )}
                <p className="text-xs text-gray-500">
                  Biarkan 0 jika belum ada stock. Nanti bisa tambah via"Transaksi Inventory"
                </p>
              </div>

              {/* Supplier (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Utama (Opsional)</Label>
                <Input
                  id="supplier"
                  placeholder="Contoh: Toko Bahan Kue Berkah, CV. Tepung Jaya..."
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                />
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan khusus tentang bahan ini..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Preview */}
              {formData.name && formData.unit && formData.price_per_unit && (
                <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preview Bahan Baku</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Nama:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Satuan:</span>
                      <span className="font-medium">{selectedUnit?.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Harga:</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat)} / {formData.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Stock awal:</span>
                      <span className="font-medium">
                        {formData.current_stock} {formData.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1 md:flex-none"
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 md:flex-none"
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
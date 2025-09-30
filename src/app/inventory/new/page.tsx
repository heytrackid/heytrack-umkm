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
import { useIngredients } from '@/hooks/useDatabase'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  ArrowLeft,
  Save,
  Package,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Trash2,
  Factory
} from 'lucide-react'

const transactionTypes = [
  { value: 'PURCHASE', label: 'Pembelian', color: 'text-green-600', icon: ArrowUp, description: 'Tambah stok dari supplier' },
  { value: 'USAGE', label: 'Pemakaian', color: 'text-blue-600', icon: Factory, description: 'Gunakan untuk produksi' },
  { value: 'ADJUSTMENT', label: 'Penyesuaian', color: 'text-yellow-600', icon: RotateCcw, description: 'Koreksi stok' },
  { value: 'WASTE', label: 'Terbuang', color: 'text-red-600', icon: Trash2, description: 'Bahan rusak/kadaluarsa' }
]

export default function NewInventoryTransactionPage() {
  const router = useRouter()
  const { isMobile, isTablet } = useResponsive()
  const { data: ingredients, loading: ingredientsLoading } = useIngredients()
  
  // Form state
  const [formData, setFormData] = useState({
    ingredient_id: '',
    type: '',
    quantity: '',
    unit_price: '',
    date: new Date().toISOString().spli"Placeholder"[0],
    reference: '',
    supplier: '',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefaul""
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!response.ok) throw new Error('Failed')
      alert
      router.push('/inventory')
    } catch (error) {
      alert
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedIngredient = ingredients?.find(ing => ing.id === formData.ingredient_id)
  const selectedTransactionType = transactionTypes.find(type => type.value === formData.type)

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
              <BreadcrumbLink href="/inventory">Bahan Baku</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Transaksi Baru</BreadcrumbPage>
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
                Transaksi Inventory Baru
              </h1>
            </div>
            <p className="text-muted-foreground">
              Buat transaksi baru untuk mengelola stok bahan baku
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detail Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Bahan & Tipe */}
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="ingredient">Bahan Baku *</Label>
                  <Select 
                    value={formData.ingredient_id} 
                    onValueChange={(value) => handleInputChange('ingredient_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahan baku" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredientsLoading ? (
                        <SelectItem value="loading" disabled>Memuat data...</SelectItem>
                      ) : ingredients?.map(ingredient => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedIngredient && (
                    <p className="text-sm text-muted-foreground">
                      Stok saat ini: {selectedIngredient.current_stock} {selectedIngredient.unit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Transaksi *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe transaksi" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map(type => {
                        const Icon = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Quantity & Harga */}
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="50"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                  />
                  {selectedIngredient && (
                    <p className="text-sm text-muted-foreground">
                      Unit: {selectedIngredient.unit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_price">Harga Satuan (Rp)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="1"
                    placeholder="12000"
                    value={formData.unit_price}
                    onChange={(e) => handleInputChange('unit_price', e.target.value)}
                  />
                  {formData.quantity && formData.unit_price && (
                    <p className="text-sm text-muted-foreground">
                      Total: Rp {(parseFloa"" * parseFloa"").toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Tanggal & Referensi */}
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Referensi</Label>
                  <Input
                    id="reference"
                    placeholder="PO-2024-001, INV-001, dll"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                  />
                </div>
              </div>

              {/* Supplier (opsional) */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier (opsional)</Label>
                <Input
                  id="supplier"
                  placeholder="CV. Bahan Berkah, Toko Sari Roti, dll"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                />
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan untuk transaksi ini..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Preview Card */}
              {formData.ingredient_id && formData.type && formData.quantity && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preview Transaksi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bahan:</span>
                      <span className="font-medium">{selectedIngredient?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipe:</span>
                      <div className="flex items-center gap-1">
                        {selectedTransactionType?.icon && (
                          <selectedTransactionType.icon className="h-3 w-3" />
                        )}
                        <span className={`font-medium ${selectedTransactionType?.color}`}>
                          {selectedTransactionType?.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">
                        {formData.type === 'USAGE' || formData.type === 'WASTE' ? '-' : '+'}{formData.quantity} {selectedIngredient?.unit}
                      </span>
                    </div>
                    {formData.unit_price && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Nilai:</span>
                        <span className="font-medium">
                          Rp {(parseFloa"" * parseFloa"").toLocaleString()}
                        </span>
                      </div>
                    )}
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
                  disabled={isSubmitting || !formData.ingredient_id || !formData.type || !formData.quantity}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
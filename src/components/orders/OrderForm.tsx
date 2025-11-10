 
'use client'

import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'

import type { OrderWithRelations } from '@/app/orders/types/orders.types'
import { useOrderItemsController } from '@/components/orders/hooks/useOrderItemsController'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { validateOrderData } from '@/lib/validations/form-validations'


import { calculateOrderTotal, normalizePriority } from '@/components/orders/utils'

import type { Order, OrderFormData, OrderFormItem, Priority } from '@/components/orders/types'



interface OrderFormProps {
  order?: Order // For editing existing order
  onSave: (orderData: OrderFormData) => void
  onCancel: () => void
  loading?: boolean
}

const OrderForm = ({
  order,
  onSave,
  onCancel,
  loading = false
}: OrderFormProps) => {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useCurrency()
  const [formData, setFormData] = useState<OrderFormData>(() => {
    if (order) {
      return {
        customer_name: order['customer_name'] ?? '',
        customer_phone: order.customer_phone ?? '',
        customer_address: order.customer_address ?? '',
        delivery_date: order.delivery_date?.split('T')[0] ?? '',
        delivery_time: order.delivery_time ?? '10:00',
        priority: normalizePriority(order.priority),
        notes: order.notes ?? '',
        order_items: (order as OrderWithRelations).items?.map(item => ({
          recipe_id: item.recipe_id,
          product_name: item.product_name ?? null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_requests: item.special_requests ?? null
        })) ?? []
      }
    }
    return {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      delivery_date: '',
      delivery_time: '10:00',
      priority: 'normal',
      notes: '',
      order_items: []
    }
  })
  const [errors, setErrors] = useState<string[]>([])

  // Form data is initialized in useState above

  const createEmptyOrderItem = useCallback((): OrderFormItem => ({
    recipe_id: '',
    product_name: null,
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    special_requests: null
  }), [])

  const {
    recipes,
    addItem: addOrderItem,
    updateItem: updateOrderItem,
    removeItem: removeOrderItem,
    selectRecipe: handleRecipeSelect
  } = useOrderItemsController<OrderFormItem>({
    items: formData.order_items,
    onItemsChange: (nextItems) => setFormData(prev => ({ ...prev, order_items: nextItems })),
    createEmptyItem: createEmptyOrderItem,
    onRecipeSelected: (recipe, item) => {
      const unitPrice = recipe.selling_price ?? item.unit_price
      return {
        ...item,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity
      }
    }
  })

  const handleInputChange = <K extends keyof OrderFormData>(
    field: K,
    value: OrderFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors.length > 0) {
      setErrors([]) // Clear errors when user starts typing
    }
  }

  const handleSubmit = () => {
    const validationErrors = validateOrderData(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave(formData)
  }

  const totalAmount = calculateOrderTotal(formData.order_items)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {order ? 'Edit Pesanan' : 'Buat Pesanan Baru'}
          </h2>
          <p className="text-muted-foreground">
            {order ? 'Perbarui informasi dan detail pesanan' : 'Isi informasi pelanggan dan detail pesanan'}
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-red-800 mb-2">Kesalahan Validasi</h4>
            <ul className="list-disc list-inside text-sm text-red-700">
              {errors.map((error, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Pelanggan *</Label>
              <Input
                value={formData['customer_name']}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="space-y-2">
              <Label>Nomor Telepon *</Label>
              <Input
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                placeholder=""
              />
            </div>

            {/* Email field removed - not in database schema */}

            <div className="space-y-2">
              <Label>Alamat Pengiriman</Label>
              <Textarea
                value={formData.customer_address ?? ''}
                onChange={(e) => handleInputChange('customer_address', e.target.value)}
                placeholder=""
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Pengiriman *</Label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Waktu Pengiriman</Label>
                <Input
                  type="time"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tingkat Prioritas</Label>
              <Select
                value={formData.priority ?? 'normal'}
                onValueChange={(value: Priority) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catatan Pesanan</Label>
              <Textarea
                value={formData.notes ?? ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder=""
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Item Pesanan</CardTitle>
            <Button onClick={addOrderItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.order_items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada item ditambahkan</p>
              <p className="text-sm">Klik &#34;Tambah Item&#34; untuk mulai membuat pesanan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.order_items.map((item, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-5'}`}>
                    <div className="col-span-2">
                      <Label>Produk</Label>
                      <Select
                        value={item.recipe_id}
                        onValueChange={(value) => handleRecipeSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placeholder" disabled>
                            Pilih produk
                          </SelectItem>
                          {recipes.map((recipe) => (
                            <SelectItem key={recipe['id']} value={recipe['id']}>
                              {recipe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Jumlah</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>

                    <div>
                      <Label>Harga</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value.replace(',', '.')) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label>Catatan (Opsional)</Label>
                    <Input
                      value={item.special_requests ?? ''}
                      onChange={(e) => updateOrderItem(index, 'special_requests', e.target.value)}
                      placeholder=""
                    />
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Harga:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading || formData.order_items.length === 0}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Menyimpan...' : (order ? 'Perbarui Pesanan' : 'Buat Pesanan')}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
      </div>
    </div>
  )
}

export { OrderForm }
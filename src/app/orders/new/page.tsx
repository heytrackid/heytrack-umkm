'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import {
  Plus,
  ArrowLeft,
  Save,
  ShoppingCart,
  User,
  Calendar,
  CreditCard,
  Truck,
  Trash2,
  Calculator,
  Package,
  AlertCircle
} from 'lucide-react'

interface OrderItem {
  id?: string
  recipe_id: string
  recipe?: any
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  special_requests?: string
}

interface OrderFormData {
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_address: string
  order_date: string
  delivery_date: string
  delivery_time: string
  delivery_method: 'pickup' | 'delivery'
  delivery_address: string
  delivery_fee: number
  payment_method: 'cash' | 'transfer' | 'credit_card' | 'digital_wallet'
  priority: 'low' | 'normal' | 'high'
  discount_amount: number
  tax_rate: number
  notes: string
  special_instructions: string
}

export default function NewOrderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('customer')
  
  // Form data
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    delivery_time: '',
    delivery_method: 'pickup',
    delivery_address: '',
    delivery_fee: 0,
    payment_method: 'cash',
    priority: 'normal',
    discount_amount: 0,
    tax_rate: 11,
    notes: '',
    special_instructions: ''
  })

  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [availableRecipes, setAvailableRecipes] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  // Load initial data
  useEffect(() => {
    fetchRecipes()
    fetchCustomers()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      if (response.ok) {
        const data = await response.json()
        setAvailableRecipes(data.filter((recipe: any) => recipe.is_active))
      }
    } catch (err) {
      console.error('Error fetching recipes:', err)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.slice(0, 10)) // Limit for quick selection
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)
  const taxAmount = subtotal * (formData.tax_rate / 100)
  const totalAmount = subtotal - formData.discount_amount + taxAmount + formData.delivery_fee

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const addOrderItem = () => {
    if (availableRecipes.length === 0) {
      setError('Tidak ada resep tersedia. Tambahkan resep terlebih dahulu.')
      return
    }

    const firstRecipe = availableRecipes[0]
    const newItem: OrderItem = {
      recipe_id: firstRecipe.id,
      recipe: firstRecipe,
      product_name: firstRecipe.name,
      quantity: 1,
      unit_price: firstRecipe.selling_price || 0,
      total_price: firstRecipe.selling_price || 0,
      special_requests: ''
    }

    setOrderItems(prev => [...prev, newItem])
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    setOrderItems(prev => {
      const updated = [...prev]
      if (field === 'recipe_id') {
        const selectedRecipe = availableRecipes.find(recipe => recipe.id === value)
        if (selectedRecipe) {
          updated[index] = {
            ...updated[index],
            recipe_id: value,
            recipe: selectedRecipe,
            product_name: selectedRecipe.name,
            unit_price: selectedRecipe.selling_price || 0,
            total_price: (selectedRecipe.selling_price || 0) * updated[index].quantity
          }
        }
      } else if (field === 'quantity') {
        const qty = parseInt(value) || 0
        updated[index] = {
          ...updated[index],
          quantity: qty,
          total_price: updated[index].unit_price * qty
        }
      } else if (field === 'unit_price') {
        const price = parseFloat(value) || 0
        updated[index] = {
          ...updated[index],
          unit_price: price,
          total_price: price * updated[index].quantity
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const selectCustomer = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone || '',
      customer_email: customer.email || '',
      customer_address: customer.address || ''
    }))
  }

  const generateOrderNumber = () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const timeStr = Math.floor(Date.now() / 1000).toString().slice(-4)
    return `ORD-${dateStr}-${timeStr}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer_name || orderItems.length === 0) {
      setError('Nama pelanggan dan minimal 1 item pesanan harus diisi')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const orderNumber = generateOrderNumber()
      
      const orderData = {
        order_no: orderNumber,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        customer_address: formData.customer_address,
        status: 'PENDING',
        order_date: formData.order_date,
        delivery_date: formData.delivery_date,
        delivery_time: formData.delivery_time,
        delivery_method: formData.delivery_method,
        delivery_address: formData.delivery_method === 'delivery' ? formData.delivery_address : '',
        delivery_fee: formData.delivery_method === 'delivery' ? formData.delivery_fee : 0,
        total_amount: totalAmount,
        discount: formData.discount_amount,
        tax_amount: taxAmount,
        tax_rate: formData.tax_rate,
        paid_amount: 0,
        payment_status: 'UNPAID',
        payment_method: formData.payment_method,
        priority: formData.priority,
        notes: formData.notes,
        special_instructions: formData.special_instructions,
        order_items: orderItems.map(item => ({
          recipe_id: item.recipe_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_requests: item.special_requests
        }))
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menyimpan pesanan')
      }
      
      // Redirect to orders page with success message
      router.push('/orders?success=true')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/orders">Pesanan</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pesanan Baru</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-8 w-8" />
                Buat Pesanan Baru
              </h1>
              <p className="text-muted-foreground">
                Tambahkan pesanan baru dari pelanggan
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="customer" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Pelanggan</span>
                      </TabsTrigger>
                      <TabsTrigger value="items" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Items</span>
                        {orderItems.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {orderItems.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="delivery" className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="hidden sm:inline">Pengiriman</span>
                      </TabsTrigger>
                      <TabsTrigger value="payment" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Pembayaran</span>
                      </TabsTrigger>
                    </TabsList>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}

                    <TabsContent value="customer" className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Informasi Pelanggan</h3>
                        {customers.length > 0 && (
                          <Select onValueChange={(value) => {
                            const customer = customers.find(c => c.id === value)
                            if (customer) selectCustomer(customer)
                          }}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Pilih Customer" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customer_name">Nama Pelanggan *</Label>
                          <Input
                            id="customer_name"
                            value={formData.customer_name}
                            onChange={(e) => handleInputChange('customer_name', e.target.value)}
                            placeholder="Nama lengkap pelanggan"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer_phone">No. Telepon</Label>
                          <Input
                            id="customer_phone"
                            type="tel"
                            value={formData.customer_phone}
                            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                            placeholder="08123456789"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer_email">Email</Label>
                          <Input
                            id="customer_email"
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => handleInputChange('customer_email', e.target.value)}
                            placeholder="customer@email.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="order_date">Tanggal Pesan *</Label>
                          <Input
                            id="order_date"
                            type="date"
                            value={formData.order_date}
                            onChange={(e) => handleInputChange('order_date', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="customer_address">Alamat Pelanggan</Label>
                        <Textarea
                          id="customer_address"
                          value={formData.customer_address}
                          onChange={(e) => handleInputChange('customer_address', e.target.value)}
                          placeholder="Alamat lengkap pelanggan..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="priority">Prioritas</Label>
                          <Select 
                            value={formData.priority} 
                            onValueChange={(value) => handleInputChange('priority', value)}
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
                        <div>
                          <Label htmlFor="notes">Catatan</Label>
                          <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Catatan tambahan..."
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="items" className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Item Pesanan</h3>
                        <Button type="button" onClick={addOrderItem}>
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Item
                        </Button>
                      </div>

                      {orderItems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Belum ada item ditambahkan</p>
                          <p className="text-sm">Klik "Tambah Item" untuk memulai</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orderItems.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                                <div>
                                  <Label className="text-xs">Produk</Label>
                                  <Select
                                    value={item.recipe_id}
                                    onValueChange={(value) => updateOrderItem(index, 'recipe_id', value)}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableRecipes.map(recipe => (
                                        <SelectItem key={recipe.id} value={recipe.id}>
                                          {recipe.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-xs">Jumlah</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs">Harga Satuan</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={item.unit_price}
                                    onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs">Total</Label>
                                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium">
                                    Rp {item.total_price.toLocaleString()}
                                  </div>
                                </div>

                                <div className="flex items-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeOrderItem(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-3">
                                <Label className="text-xs">Permintaan Khusus</Label>
                                <Input
                                  value={item.special_requests || ''}
                                  onChange={(e) => updateOrderItem(index, 'special_requests', e.target.value)}
                                  placeholder="Permintaan khusus untuk item ini..."
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          ))}

                          <div className="border-t pt-4">
                            <div className="text-right text-lg font-semibold">
                              Subtotal: Rp {subtotal.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-6 space-y-4">
                      <h3 className="text-lg font-medium">Pengiriman & Jadwal</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="delivery_method">Metode Pengiriman</Label>
                          <Select 
                            value={formData.delivery_method} 
                            onValueChange={(value) => handleInputChange('delivery_method', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pickup">Ambil di Toko</SelectItem>
                              <SelectItem value="delivery">Diantar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.delivery_method === 'delivery' && (
                          <div>
                            <Label htmlFor="delivery_fee">Biaya Pengiriman</Label>
                            <Input
                              id="delivery_fee"
                              type="number"
                              min="0"
                              value={formData.delivery_fee}
                              onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
                              placeholder="15000"
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="delivery_date">Tanggal Pengiriman</Label>
                          <Input
                            id="delivery_date"
                            type="date"
                            value={formData.delivery_date}
                            onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="delivery_time">Waktu Pengiriman</Label>
                          <Input
                            id="delivery_time"
                            type="time"
                            value={formData.delivery_time}
                            onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                          />
                        </div>
                      </div>

                      {formData.delivery_method === 'delivery' && (
                        <div>
                          <Label htmlFor="delivery_address">Alamat Pengiriman</Label>
                          <Textarea
                            id="delivery_address"
                            value={formData.delivery_address}
                            onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                            placeholder="Alamat lengkap untuk pengiriman..."
                            rows={3}
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="special_instructions">Instruksi Khusus</Label>
                        <Textarea
                          id="special_instructions"
                          value={formData.special_instructions}
                          onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                          placeholder="Instruksi khusus untuk produksi atau pengiriman..."
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="payment" className="mt-6 space-y-4">
                      <h3 className="text-lg font-medium">Pembayaran</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="payment_method">Metode Pembayaran</Label>
                          <Select 
                            value={formData.payment_method} 
                            onValueChange={(value) => handleInputChange('payment_method', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Tunai</SelectItem>
                              <SelectItem value="transfer">Transfer Bank</SelectItem>
                              <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                              <SelectItem value="digital_wallet">E-Wallet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="discount_amount">Diskon (Rp)</Label>
                          <Input
                            id="discount_amount"
                            type="number"
                            min="0"
                            value={formData.discount_amount}
                            onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tax_rate">Pajak (%)</Label>
                          <Input
                            id="tax_rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.tax_rate}
                            onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Ringkasan Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>Rp {subtotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Diskon:</span>
                        <span>- Rp {formData.discount_amount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Pajak ({formData.tax_rate}%):</span>
                        <span>Rp {taxAmount.toLocaleString()}</span>
                      </div>
                      
                      {formData.delivery_method === 'delivery' && (
                        <div className="flex justify-between">
                          <span>Biaya Kirim:</span>
                          <span>Rp {formData.delivery_fee.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <hr className="my-2" />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>Rp {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span>{orderItems.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Qty Total:</span>
                          <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status Awal:</span>
                          <Badge variant="outline">PENDING</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting || orderItems.length === 0}
                      >
                        {isSubmitting ? (
                          <>Menyimpan...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Simpan Pesanan
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.back()}
                      >
                        Batal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
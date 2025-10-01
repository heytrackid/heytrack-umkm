'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Package, Users, Phone, MapPin, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { OrderFormProps, Order, OrderItem } from '../types'
import { ORDER_PRIORITIES, ORDER_CONFIG } from '../constants'
import { calculateOrderTotals, generateOrderNumber } from '../utils/helpers'
import { useCurrency } from '@/hooks/useCurrency'

export function OrderForm({ order, onSubmit, onCancel, loading = false, error }: OrderFormProps) {
  const { formatCurrency } = useCurrency()
  const [availableRecipes, setAvailableRecipes] = useState<any[]>([])
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [hppCalculations, setHppCalculations] = useState<Record<string, any>>({})

  const [formData, setFormData] = useState({
    customer_name: order?.customer_name || '',
    customer_phone: order?.customer_phone || '',
    customer_address: order?.customer_address || '',
    order_date: order?.order_date || new Date().toISOString().split('T')[0],
    delivery_date: order?.delivery_date || '',
    delivery_time: order?.delivery_date || '',
    delivery_fee: order?.delivery_fee || ORDER_CONFIG.DEFAULT_DELIVERY_FEE,
    discount: order?.discount_amount || 0,
    tax_amount: order?.tax_rate || ORDER_CONFIG.DEFAULT_TAX_RATE,
    payment_method: 'cash', // Default payment method
    paid_amount: order?.paid_amount || 0,
    priority: order?.priority || ORDER_CONFIG.DEFAULT_PRIORITY,
    notes: order?.notes || '',
    special_instructions: order?.special_requirements || ''
  })

  const [orderItems, setOrderItems] = useState<OrderItem[]>(order?.items || [])

  const { subtotal, taxAmount, totalAmount } = calculateOrderTotals(
    orderItems,
    formData.discount,
    formData.tax_amount,
    formData.delivery_fee
  )

  // Fetch data
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
        setAvailableCustomers(data)
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectCustomer = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone || '',
      customer_address: customer.address || ''
    }))
    setCustomerSearch('')
  }

  const addOrderItem = () => {
    if (availableRecipes.length === 0) {
      alert
      return
    }

    const firstRecipe = availableRecipes[0]
    const newItem: OrderItem = {
      id: `temp-${Date.now()}`,
      order_id: '',
      recipe_id: firstRecipe.id,
      recipe: firstRecipe,
      quantity: 1,
      unit_price: firstRecipe.selling_price || 0,
      total_price: firstRecipe.selling_price || 0,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setOrderItems(prev => [...prev, newItem])
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    setOrderItems(prev => {
      const updated = [...prev]
      if (field === 'recipe_id') {
        const selectedRecipe = availableRecipes.find(recipe => recipe.id === value)
        if (selectedRecipe) {
          updated[index] = {
            ...updated[index],
            recipe_id: value,
            recipe: selectedRecipe,
            unit_price: selectedRecipe.selling_price || updated[index].unit_price,
            total_price: (selectedRecipe.selling_price || updated[index].unit_price) * updated[index].quantity
          }
        }
      } else if (field === 'quantity') {
        const qty = parseInt || 0
        updated[index] = {
          ...updated[index],
          quantity: qty,
          total_price: updated[index].unit_price * qty
        }
      } else if (field === 'unit_price') {
        const price = parseFloat || 0
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault

    if (!formData.customer_name || orderItems.length === 0) {
      alert
      return
    }

    const orderData = {
      order_number: order?.order_number || generateOrderNumber(),
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      status: order?.status || 'pending',
      order_date: formData.order_date,
      delivery_date: formData.delivery_date,
      delivery_time: formData.delivery_time,
      delivery_fee: formData.delivery_fee,
      discount_amount: formData.discount,
      tax_rate: formData.tax_amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: formData.paid_amount,
      payment_method: formData.payment_method,
      priority: formData.priority,
      notes: formData.notes,
      special_instructions: formData.special_instructions,
      items: orderItems.map(item => ({
        recipe_id: item.recipe_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        notes: item.notes
      }))
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="customer" className="text-xs sm:text-sm">Informasi</TabsTrigger>
          <TabsTrigger value="items" className="text-xs sm:text-sm">Informasi ({orderItems.length})</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs sm:text-sm">Informasi</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm">Informasi</TabsTrigger>
        </TabsList>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <TabsContent value="customer" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <h3 className="text-lg font-medium">Informasi</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewCustomer(!showNewCustomer)}
              className="self-end sm:self-auto"
            >
              {showNewCustomer ? Informasi : Informasi}
            </Button>
          </div>

          {!showNewCustomer && (
            <div>
              <Label className="text-sm font-medium">Informasi</Label>
              <div className="relative">
                <Input
                  placeholder=""
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="mt-1"
                />
                {customerSearch && (
                  <div className="absolute z-10 w-full bg-background border rounded-md mt-1 max-h-40 overflow-y-auto">
                    {availableCustomers
                      .filter(customer =>
                        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        (customer.phone && customer.phone.includes(customerSearch))
                      )
                      .map(customer => (
                        <div
                          key={customer.id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium">Informasi *</Label>
              <Input
                id="customerName"
                placeholder=""
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="text-sm font-medium">Informasi</Label>
              <Input
                id="customerPhone"
                placeholder=""
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customerAddress" className="text-sm font-medium">Informasi</Label>
            <Textarea
              id="customerAddress"
              placeholder=""
              value={formData.customer_address}
              onChange={(e) => handleInputChange('customer_address', e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="orderDate" className="text-sm font-medium">Informasi *</Label>
              <Input
                id="orderDate"
                type="date"
                value={formData.order_date}
                onChange={(e) => handleInputChange('order_date', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-sm font-medium">Informasi</Label>
              <select
                className="w-full p-2 border border-input rounded-md bg-background mt-1"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                {Object.entries(ORDER_PRIORITIES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-lg font-medium">Informasi ({orderItems.length})</h3>
            <Button type="button" size="sm" onClick={addOrderItem} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Informasi
            </Button>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <p>Informasi</p>
              <p className="text-sm">Informasi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item, index: number) => (
                <div key={item.id || index} className="border rounded-lg overflow-hidden">
                  <div className="block sm:hidden">
                    <div className="p-3 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                          <select
                            className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                            value={item.recipe_id}
                            onChange={(e) => updateOrderItem(index, 'recipe_id', e.target.value)}
                          >
                            {availableRecipes.map(recipe => (
                              <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 dark:text-gray-400 hover:text-red-700 ml-2 mt-4"
                          onClick={() => removeOrderItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                          <Input
                            type="number"
                            className="text-sm mt-1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                          <Input
                            className="text-sm font-medium mt-1 bg-gray-50"
                            value={formatCurrency(item.total_price)}
                            readOnly
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                        <Input
                          type="number"
                          className={`text-sm mt-1`}
                          value={item.unit_price}
                          onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
                          min="0"
                          step="500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex sm:items-center gap-3 p-4">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                        <select
                          className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                          value={item.recipe_id}
                          onChange={(e) => updateOrderItem(index, 'recipe_id', e.target.value)}
                        >
                          {availableRecipes.map(recipe => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                        <Input
                          type="number"
                          className="text-sm mt-1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                        <Input
                          type="number"
                          className={`text-sm mt-1`}
                          value={item.unit_price}
                          onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
                          min="0"
                          step="500"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Informasi</Label>
                        <Input
                          className="text-sm font-medium mt-1 bg-gray-50"
                          value={formatCurrency(item.total_price)}
                          readOnly
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-gray-600 dark:text-gray-400 hover:text-red-700"
                      onClick={() => removeOrderItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Informasi:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="deliveryDate" className="text-sm font-medium">Informasi</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.delivery_date}
                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deliveryTime" className="text-sm font-medium">Informasi</Label>
              <Input
                id="deliveryTime"
                type="time"
                value={formData.delivery_time}
                onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="deliveryFee" className="text-sm font-medium">Informasi</Label>
              <Input
                id="deliveryFee"
                type="number"

                value={formData.delivery_fee}
                onChange={(e) => handleInputChange('delivery_fee', parseFloat || 0)}
                min="0"
                step="1000"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Informasi</Label>
            <Textarea
              id="notes"
              placeholder=""
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="specialInstructions" className="text-sm font-medium">Informasi</Label>
            <Textarea
              id="specialInstructions"
              placeholder=""
              value={formData.special_instructions}
              onChange={(e) => handleInputChange('special_instructions', e.target.value)}
              className="mt-1"
            />
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium">Informasi</Label>
              <select
                className="w-full p-2 border border-input rounded-md bg-background mt-1"
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
              >
                <option value="cash">Informasi</option>
                <option value="transfer">Informasi</option>
                <option value="creditCard">Informasi</option>
                <option value="digitalWallet">Informasi</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount" className="text-sm font-medium">Informasi</Label>
              <Input
                id="discount"
                type="number"

                value={formData.discount}
                onChange={(e) => handleInputChange('discount', parseFloat || 0)}
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tax" className="text-sm font-medium">Informasi (%)</Label>
              <Input
                id="tax"
                type="number"

                value={formData.tax_amount}
                onChange={(e) => handleInputChange('tax_amount', parseFloat || 0)}
                min="0"
                max="100"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="paidAmount" className="text-sm font-medium">Informasi</Label>
              <Input
                id="paidAmount"
                type="number"

                value={formData.paid_amount}
                onChange={(e) => handleInputChange('paid_amount', parseFloat || 0)}
                min="0"
                step="1000"
                className="mt-1"
              />
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Informasi</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Informasi:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Informasi:</span>
                <span>- {formatCurrency(formData.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Informasi ({formData.tax_amount}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Informasi:</span>
                <span>{formatCurrency(formData.delivery_fee)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-medium">
                <span>Informasi:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Informasi:</span>
                <span>{formatCurrency(formData.paid_amount)}</span>
              </div>
              {totalAmount > formData.paid_amount && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Informasi:</span>
                  <span>{formatCurrency(totalAmount - formData.paid_amount)}</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
            Informasi
          </Button>
          <Button type="submit" disabled={loading} className="order-1 sm:order-2">
            {loading ? Informasi : order ? Informasi : Informasi}
          </Button>
        </div>
      </Tabs>
    </form>
  )
}

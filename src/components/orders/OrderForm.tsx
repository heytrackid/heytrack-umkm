'use client'
import * as React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useResponsive } from '@/hooks/use-mobile'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import { Order, OrderFormData, Priority } from './types'
import { generateOrderNumber, calculateOrderTotal, validateOrderData } from './utils'
import { useCurrency } from '@/hooks/useCurrency'

interface OrderFormProps {
  order?: Order // For editing existing order
  onSave: (orderData: OrderFormData) => void
  onCancel: () => void
  loading?: boolean
}

interface Recipe {
  id: string
  name: string
  price?: number
}

export default function OrderForm({ 
  order, 
  onSave, 
  onCancel, 
  loading = false 
}: OrderFormProps) {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useCurrency()
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    delivery_date: '',
    delivery_time: '10:00',
    priority: 'normal' as Priority,
    notes: '',
    order_items: []
  })
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // Load form data for editing
  useEffect(() => {
    if (order) {
      setFormData({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone || '',
        customer_email: order.customer_email || '',
        customer_address: order.customer_address || '',
        delivery_date: order.delivery_date.split('T')[0], // Extract date part
        delivery_time: order.delivery_time || '10:00',
        priority: order.priority,
        notes: order.notes || '',
        order_items: order.order_items?.map(item => ({
          recipe_id: item.recipe_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })) || []
      })
    }
  }, [order])

  // Fetch recipes for order items
  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      if (response.ok) {
        const data = await response.json()
        setRecipes(data)
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error)
    }
  }

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors.length > 0) {
      setErrors([]) // Clear errors when user starts typing
    }
  }

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      order_items: [...prev.order_items, {
        recipe_id: 'placeholder',
        product_name: '',
        quantity: 1,
        price: 0,
        notes: ''
      }]
    }))
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      order_items: prev.order_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeOrderItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index)
    }))
  }

  const handleRecipeSelect = (index: number, recipeId: string) => {
    if (recipeId === 'placeholder') return // Ignore placeholder selection
    
    const recipe = recipes.find(r => r.id === recipeId)
    if (recipe) {
      updateOrderItem(index, 'recipe_id', recipeId)
      updateOrderItem(index, 'product_name', recipe.name)
      if (recipe.price) {
        updateOrderItem(index, 'price', recipe.price)
      }
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
            {order ? Informasi : Informasi}
          </h2>
          <p className="text-muted-foreground">
            {order ? Informasi : Informasi}
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-red-800 mb-2">Informasi</h4>
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
            <CardTitle>Informasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Informasi *</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <Label>Informasi *</Label>
              <Input
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <Label>Informasi</Label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <Label>Informasi</Label>
              <Textarea
                value={formData.customer_address}
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
            <CardTitle>Informasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Informasi *</Label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Informasi</Label>
                <Input
                  type="time"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Informasi</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: Priority) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Informasi</SelectItem>
                  <SelectItem value="normal">Informasi</SelectItem>
                  <SelectItem value="high">Informasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Informasi</Label>
              <Textarea
                value={formData.notes}
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
            <CardTitle>Informasi</CardTitle>
            <Button onClick={addOrderItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Informasi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.order_items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Informasi</p>
              <p className="text-sm">Informasi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.order_items.map((item, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-5'}`}>
                    <div className="col-span-2">
                      <Label>Informasi</Label>
                      <Select
                        value={item.recipe_id}
                        onValueChange={(value) => handleRecipeSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placeholder" disabled>
                            Informasi
                          </SelectItem>
                          {recipes.map((recipe) => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Informasi</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <Label>Informasi</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
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
                    <Label>Informasi</Label>
                    <Input
                      value={item.notes || ''}
                      onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                      placeholder=""
                    />
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Informasi:</span>
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
          {loading ? Informasi : (order ? Informasi : Informasi)}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Informasi
        </Button>
      </div>
    </div>
  )
}
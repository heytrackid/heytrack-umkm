'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Row } from '@/types/database'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isArrayOf, isRecipe, isCustomer } from '@/lib/type-guards'



type Recipe = Row<'recipes'>
type Customer = Row<'customers'>

export interface OrderItem {
  id?: string
  recipe_id: string
  recipe?: unknown
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  special_requests?: string
}

export interface OrderFormData {
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

export const useOrderLogic = () => {
  const router = useRouter()
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('customer')
  const [loading, setLoading] = useState(true) // Add loading state
  
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    order_date: new Date().toISOString().substring(0, 10),
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
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // Load initial data
  useEffect(() => {
    void fetchRecipes()
    void fetchCustomers()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes', {
        credentials: 'include', // Include cookies for authentication
      })
      if (response.ok) {
        const data = await response.json()
        // Validate with type guards
        if (isArrayOf(data, isRecipe)) {
          void setAvailableRecipes(data)
        } else if (data && typeof data === 'object' && Array.isArray(data?.recipes) && isArrayOf(data.recipes, isRecipe)) {
          void setAvailableRecipes(data.recipes)
        } else {
          apiLogger.warn({ data }, 'API returned unexpected format for recipes')
          void setAvailableRecipes([])
        }
      } else {
        const errorText = await response.text()
        apiLogger.error({ error: errorText }, 'Failed to fetch recipes')
        void setAvailableRecipes([])
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      apiLogger.error({ error: message }, 'Failed to fetch recipes:')
      void setAvailableRecipes([])
    } finally {
      setLoading(false) // Set loading to false after fetch
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        credentials: 'include', // Include cookies for authentication
      })
      if (response.ok) {
        const data = await response.json()
        // Validate with type guards
        if (isArrayOf(data, isCustomer)) {
          void setCustomers(data)
        } else if (data && typeof data === 'object' && Array.isArray(data?.customers) && isArrayOf(data.customers, isCustomer)) {
          void setCustomers(data.customers)
        } else {
          apiLogger.warn({ data }, 'API returned unexpected format for customers')
          void setCustomers([])
        }
      } else {
        const errorText = await response.text()
        apiLogger.error({ error: errorText }, 'Failed to fetch customers')
        void setCustomers([])
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      apiLogger.error({ error: message }, 'Failed to fetch customers:')
      void setCustomers([])
    }
  }

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)
  const taxAmount = subtotal * (formData.tax_rate / 100)
  const totalAmount = subtotal - formData.discount_amount + taxAmount + formData.delivery_fee

  // Form handlers
  const handleInputChange = (field: keyof OrderFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addOrderItem = () => {
    if (availableRecipes.length === 0) {
      void setError('Belum ada resep tersedia')
      return
    }
    
    const firstRecipe = availableRecipes[0]
    const fallbackPrice = firstRecipe.selling_price ?? 0
    const newItem: OrderItem = {
      recipe_id: firstRecipe.id,
      product_name: firstRecipe.name,
      quantity: 1,
      unit_price: fallbackPrice,
      total_price: fallbackPrice,
      special_requests: ''
    }
    
    void setOrderItems(prev => [...prev, newItem])
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: OrderItem[keyof OrderItem]) => {
    setOrderItems(prev => {
      const updated = [...prev]
      if (index < 0 || index >= updated.length || !updated[index]) {return updated}

      const currentItem = updated[index]

      if (field === 'recipe_id') {
        const selectedRecipe = availableRecipes.find(recipe => recipe.id === value)
        if (selectedRecipe) {
          updated[index] = {
            ...currentItem,
            recipe_id: value as string,
            product_name: selectedRecipe.name,
            unit_price: selectedRecipe.selling_price ?? currentItem.unit_price
          }
        }
      } else if (field === 'quantity') {
        const qty = Number.parseInt(String(value), 10)
        const safeQuantity = Number.isNaN(qty) ? 0 : qty
        updated[index] = {
          ...currentItem,
          quantity: safeQuantity,
          total_price: safeQuantity * currentItem.unit_price
        }
      } else if (field === 'unit_price') {
        const price = Number.parseFloat(String(value))
        const safePrice = Number.isNaN(price) ? 0 : price
        updated[index] = {
          ...currentItem,
          unit_price: safePrice,
          total_price: currentItem.quantity * safePrice
        }
      } else {
        updated[index] = { ...currentItem, [field]: value }
      }

      return updated
    })
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const reorderOrderItems = (fromIndex: number, toIndex: number) => {
    setOrderItems(prev => {
      const newItems = [...prev]
      const [movedItem] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, movedItem)
      return newItems
    })
  }

  const selectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone ?? '',
      customer_email: customer.email ?? '',
      customer_address: customer.address ?? ''
    }))
  }

  const generateOrderNo = () => {
    const today = new Date()
    const dateStr = today.toISOString().substring(0, 10).replace(/-/g, '')
    const timeStr = String(Math.floor(Date.now() / 1000)).slice(-4)
    return `ORD-${dateStr}-${timeStr}`
  }

  // Enhanced validation with detailed feedback
  const validateForm = () => {
    const errors: string[] = []

    // Customer validation
    if (!formData.customer_name.trim()) {
      errors.push('Nama pelanggan harus diisi')
    }
    if (!formData.customer_phone.trim()) {
      errors.push('Nomor telepon pelanggan harus diisi')
    }
    if (formData.delivery_method === 'delivery' && !formData.delivery_address.trim()) {
      errors.push('Alamat pengiriman harus diisi untuk metode delivery')
    }

    // Order items validation
    if (orderItems.length === 0) {
      errors.push('Minimal 1 item pesanan harus ditambahkan')
    }

    // Validate each order item
    orderItems.forEach((item, index) => {
      if (!item.recipe_id) {
        errors.push(`Item ${index + 1}: Pilih resep`)
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Jumlah harus lebih dari 0`)
      }
      if (item.unit_price <= 0) {
        errors.push(`Item ${index + 1}: Harga harus lebih dari 0`)
      }
    })

    // Date validation
    if (!formData.order_date) {
      errors.push('Tanggal pesanan harus diisi')
    }
    if (formData.delivery_method === 'delivery' && !formData.delivery_date) {
      errors.push('Tanggal pengiriman harus diisi')
    }

    return errors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      void setError(validationErrors.join('\n'))
      return
    }
    
    void setIsSubmitting(true)
    void setError('')
    
    try {
      const orderNo = generateOrderNo()
      
      const orderData = {
        order_no: orderNo,
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
        body: JSON.stringify(orderData),
        credentials: 'include', // Include cookies for authentication
      })
      
      if (!response.ok) {
        const responseClone = response.clone()
        let errorMessage = 'Gagal menyimpan pesanan'

        try {
          const errorData = await response.json()
          const apiMessage = typeof errorData?.error === 'string' ? errorData.error.trim() : ''
          if (apiMessage.length > 0) {
            errorMessage = apiMessage
          } else {
            const fallbackText = (await responseClone.text()).trim()
            if (fallbackText.length > 0) {
              errorMessage = fallbackText
            }
          }
        } catch {
          const fallbackText = (await responseClone.text()).trim()
          if (fallbackText.length > 0) {
            errorMessage = fallbackText
          }
        }

        throw new Error(errorMessage)
      }
      
      // Redirect to orders page with success message
      void router.push('/orders?success=true')
      
    } catch (err: unknown) {
      const error = err as Error
      const message = getErrorMessage(error)
      void setError(message)
    } finally {
      void setIsSubmitting(false)
    }
  }

  return {
    // State
    formData,
    orderItems,
    availableRecipes,
    customers,
    isSubmitting,
    error,
    activeTab,
    loading, // Add loading to return
    
    // Calculated values
    subtotal,
    taxAmount,
    totalAmount,
    
    // Handlers
    handleInputChange,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    reorderOrderItems,
    selectCustomer,
    handleSubmit,
    setActiveTab,
    setError,
    
    // Navigation
    router
  }
}

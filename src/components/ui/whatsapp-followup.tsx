'use client'

import { useState, useEffect } from 'react'
import type { Database } from '@/types/supabase-generated'
type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderStatus = Database['public']['Enums']['order_status']
type PaymentStatus = Database['public']['Enums']['payment_status']
type Recipe = Database['public']['Tables']['recipes']['Row']
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiLogger } from '@/lib/logger'
import {
  MessageCircle,
  Send,
  Copy,
  ExternalLink,
  Phone,
  Smartphone,
  User,
  Clock,
  Calendar,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

// Extended type for WhatsApp follow-up
interface OrderForWhatsApp extends Order {
  order_number: string
  due_date?: string
  items: Array<OrderItem & {
    recipe?: Pick<Recipe, 'name'>
  }>
  remaining_amount?: number
}

interface WhatsAppFollowUpProps {
  order: OrderForWhatsApp
  onSent?: (method: 'whatsapp' | 'business', message: string, phone: string) => void
}

interface WhatsAppTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  variables: string[]
  is_active: boolean
  is_default: boolean
}

const getTemplateIcon = (category: string) => {
  const icons = {
    'order_management': <CheckCircle2 className="h-4 w-4" />,
    'payment': <AlertCircle className="h-4 w-4" />,
    'delivery': <Clock className="h-4 w-4" />,
    'customer_service': <MessageCircle className="h-4 w-4" />,
    'promotion': <Package className="h-4 w-4" />,
    'general': <MessageCircle className="h-4 w-4" />
  }
  return icons[category as keyof typeof icons] || <MessageCircle className="h-4 w-4" />
}

export default function WhatsAppFollowUp({ order, onSent }: WhatsAppFollowUpProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [customMessage, setCustomMessage] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(order.customer_phone || '')
  const [whatsappType, setWhatsappType] = useState<'whatsapp' | 'business'>('whatsapp')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch templates on component mount
  useEffect(() => {
    void fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      void setLoading(true)
      const response = await fetch('/api/whatsapp-templates?active=true')
      if (response.ok) {
        const data = await response.json()
        void setTemplates(data)
        // Set default template if available
        const defaultTemplate = data.find((t: WhatsAppTemplate) => t.is_default)
        if (defaultTemplate && !selectedTemplateId) {
          void setSelectedTemplateId(defaultTemplate.id)
        } else if (data.length > 0 && !selectedTemplateId) {
          void setSelectedTemplateId(data[0].id)
        }
      }
    } catch (err) {
      apiLogger.error({ error: err }, 'Error fetching templates:')
    } finally {
      void setLoading(false)
    }
  }

  const getCurrentTemplate = () => templates.find(t => t.id === selectedTemplateId)

  const processTemplate = (templateContent: string, orderData: OrderForWhatsApp): string => {
    let processed = templateContent

    // Replace common variables
    const replacements = {
      'customer_name': orderData.customer_name,
      'order_number': orderData.order_number,
      'order_date': new Date(orderData.order_date).toLocaleDateString('id-ID'),
      'due_date': orderData.due_date ? new Date(orderData.due_date).toLocaleDateString('id-ID') : '',
      'total_amount': orderData.total_amount.toLocaleString('id-ID'),
      'remaining_amount': orderData.remaining_amount ? orderData.remaining_amount.toLocaleString('id-ID') : '0',
      'estimated_arrival': orderData.due_date ? new Date(orderData.due_date).toLocaleDateString('id-ID') : ''
    }

    // Replace simple variables
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      processed = processed.replace(regex, value.toString())
    })

    // Handle order_items array
    const itemsRegex = /\{\{#each order_items\}\}([\s\S]*?)\{\{\/each\}\}/g
    processed = processed.replace(itemsRegex, (match, itemTemplate) => orderData.items.map(item => itemTemplate
      .replace(/\{\{product_name\}\}/g, item.recipe?.name || item.product_name || 'Unknown Product')
      .replace(/\{\{quantity\}\}/g, item.quantity.toString())).join(''))

    // Handle conditional blocks
    const ifRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g
    processed = processed.replace(ifRegex, (match, condition, content) => {
      const value = replacements[condition as keyof typeof replacements]
      return value && value !== '' ? content : ''
    })

    return processed
  }

  const getCurrentMessage = () => {
    const template = getCurrentTemplate()
    if (!template) {
      return customMessage || `Halo ${order.customer_name}!\n\nTerkait pesanan ${order.order_number}...\n\n[Silakan pilih template atau tulis pesan custom]`
    }

    if (selectedTemplateId === 'custom') {
      return customMessage || `Halo ${order.customer_name}!\n\nTerkait pesanan ${order.order_number}...\n\n[Tulis pesan Anda di sini]`
    }

    return processTemplate(template.template_content, order)
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')

    // If starts with 08, replace with 628
    if (cleaned.startsWith('08')) {
      cleaned = `62${cleaned.substring(1)}`
    }
    // If starts with 8, add 62
    else if (cleaned.startsWith('8')) {
      cleaned = `62${cleaned}`
    }
    // If doesn't start with 62, add it
    else if (!cleaned.startsWith('62')) {
      cleaned = `62${cleaned}`
    }

    return cleaned
  }

  const handleSendWhatsApp = (type: 'whatsapp' | 'business') => {
    const message = getCurrentMessage()
    const formattedPhone = formatPhoneNumber(phoneNumber)
    const encodedMessage = encodeURIComponent(message);

    let url: string
    if (type === 'business') {
      // WhatsApp Business API - opens in web browser
      url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`
    } else {
      // Regular WhatsApp - tries to open app first, falls back to web
      url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
    }

    // Open in new tab
    window.open(url, '_blank')

    // Call callback if provided
    onSent?.(type, message, formattedPhone)

    // Close dialog
    void setIsDialogOpen(false)
  }

  const handleCopyMessage = () => {
    const message = getCurrentMessage()
    navigator.clipboard.writeText(text)
  }

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_production': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'delivered': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Follow-up - {order.order_number}
          </DialogTitle>
          <DialogDescription>
            Kirim pesan follow-up kepada pelanggan melalui WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left side - Order Info & Templates */}
          <div className="space-y-4">
            {/* Order Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informasi Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">No. Pesanan:</span>
                  <span className="font-mono">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge className={getStatusBadgeColor(order.status)}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-medium">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Items:</span>
                  <span>{order.items.length} produk</span>
                </div>
              </CardContent>
            </Card>

            {/* Phone Number Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Nomor Telepon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Format: 08xxx, +62xxx, atau 62xxx
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Pilih Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border-2 rounded-lg animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                            <div className="h-3 bg-gray-200 rounded w-32" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`p-4 text-left border-2 rounded-lg transition-all duration-200 ${selectedTemplateId === template.id
                            ? 'border-blue-500 bg-blue-50 text-blue-900 '
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${selectedTemplateId === template.id ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                              {getTemplateIcon(template.category)}
                            </div>
                            <div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                {template.name}
                                {template.is_default && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Default</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {template.description || `Template untuk ${template.category.replace('_', ' ')}`}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}

                      {/* Custom Template Option */}
                      <button
                        onClick={() => setSelectedTemplateId('custom')}
                        className={`p-4 text-left border-2 rounded-lg transition-all duration-200 ${selectedTemplateId === 'custom'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 '
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${selectedTemplateId === 'custom' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Pesan Custom</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Tulis pesan bebas sesuai kebutuhan
                            </div>
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Preview & Actions */}
          <div className="space-y-4">
            {/* Message Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Preview Pesan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplateId === 'custom' ? (
                  <div className="space-y-3">
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder={`Halo ${order.customer_name}!\n\nTerkait pesanan ${order.order_number}...\n\n[Tulis pesan Anda di sini]`}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Tulis pesan custom Anda di atas
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Preview WhatsApp</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm font-mono text-green-800 leading-relaxed">
                      {getCurrentMessage()}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Kirim Pesan</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={whatsappType} onValueChange={(value) => setWhatsappType(value as 'whatsapp' | 'business')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="whatsapp" className="text-sm">WhatsApp Regular</TabsTrigger>
                    <TabsTrigger value="business" className="text-sm">WhatsApp Business</TabsTrigger>
                  </TabsList>

                  <TabsContent value="whatsapp" className="mt-4 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">WhatsApp Regular</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Akan mencoba membuka aplikasi WhatsApp di perangkat, jika tidak tersedia akan buka di browser.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSendWhatsApp('whatsapp')}
                        disabled={!phoneNumber.trim()}
                        className="flex-1 h-11 text-sm"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Kirim via WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopyMessage}
                        size="lg"
                        className="h-11 px-4"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="business" className="mt-4 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">WhatsApp Business</span>
                      </div>
                      <p className="text-xs text-green-700">
                        Menggunakan WhatsApp Business API untuk komunikasi profesional dengan pelanggan.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSendWhatsApp('business')}
                        disabled={!phoneNumber.trim()}
                        className="flex-1 bg-green-600 hover:bg-green-700 h-11 text-sm"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Kirim via WA Business
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopyMessage}
                        size="lg"
                        className="h-11 px-4"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                  <p className="flex items-center gap-1 mb-1">
                    <ExternalLink className="h-3 w-3" />
                    Pesan akan dibuka di tab baru
                  </p>
                  <p>Pastikan nomor telepon sudah benar sebelum mengirim</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

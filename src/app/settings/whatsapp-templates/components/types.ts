// WhatsApp Templates Types
// Type definitions for WhatsApp template management

export interface WhatsAppTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  variables: string[]
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface TemplateFormData {
  name: string
  description: string
  category: string
  template_content: string
  variables: string[]
  is_active: boolean
  is_default: boolean
}

export interface TemplateCategory {
  value: string
  label: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { value: 'order_management', label: 'Manajemen Pesanan' },
  { value: 'payment', label: 'Pembayaran' },
  { value: 'delivery', label: 'Pengiriman' },
  { value: 'customer_service', label: 'Layanan Pelanggan' },
  { value: 'promotion', label: 'Promosi' },
  { value: 'general', label: 'Umum' }
]

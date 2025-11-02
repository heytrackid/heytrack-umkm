
// WhatsApp Templates Types
// Type definitions for WhatsApp template management

export interface WhatsAppTemplate {
  id: string
  name: string
  description: string | null
  category: string
  template_content: string
  variables: Record<string, string> | string[] | null // Support both object and array formats
  is_active: boolean | null
  is_default: boolean | null
  created_at: string | null
  updated_at: string | null
  user_id: string
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
  description: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { 
    value: 'order_confirmation', 
    label: 'Konfirmasi Pesanan',
    description: 'Template untuk konfirmasi pesanan baru'
  },
  { 
    value: 'order_reminder', 
    label: 'Pengingat Pesanan',
    description: 'Template pengingat sebelum pengiriman'
  },
  { 
    value: 'delivery_update', 
    label: 'Update Pengiriman',
    description: 'Template update status pengiriman'
  },
  { 
    value: 'payment_reminder', 
    label: 'Pengingat Pembayaran',
    description: 'Template pengingat pembayaran'
  },
  { 
    value: 'order_completed', 
    label: 'Pesanan Selesai',
    description: 'Template notifikasi pesanan selesai'
  },
  { 
    value: 'follow_up', 
    label: 'Follow Up',
    description: 'Template follow up setelah pengiriman'
  },
  { 
    value: 'custom', 
    label: 'Custom',
    description: 'Template custom untuk kebutuhan khusus'
  }
]

// Available template variables with descriptions
export interface TemplateVariable {
  name: string
  label: string
  description: string
  example: string
}

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
  {
    name: 'customer_name',
    label: 'Nama Pelanggan',
    description: 'Nama lengkap pelanggan',
    example: 'Budi Santoso'
  },
  {
    name: 'customer_phone',
    label: 'No. HP Pelanggan',
    description: 'Nomor telepon pelanggan',
    example: '081234567890'
  },
  {
    name: 'order_no',
    label: 'No. Pesanan',
    description: 'Nomor unik pesanan',
    example: 'ORD-2025-001'
  },
  {
    name: 'order_date',
    label: 'Tanggal Pesanan',
    description: 'Tanggal pesanan dibuat',
    example: '30 Oktober 2025'
  },
  {
    name: 'order_items',
    label: 'Daftar Item',
    description: 'Daftar produk yang dipesan (format list)',
    example: '• Nasi Goreng (2x)\n• Es Teh Manis (2x)'
  },
  {
    name: 'total_amount',
    label: 'Total Tagihan',
    description: 'Total harga pesanan (sudah format Rupiah)',
    example: 'Rp 150.000'
  },
  {
    name: 'delivery_date',
    label: 'Tanggal Pengiriman',
    description: 'Jadwal pengiriman pesanan',
    example: '31 Oktober 2025, 14:00'
  },
  {
    name: 'delivery_address',
    label: 'Alamat Pengiriman',
    description: 'Alamat tujuan pengiriman',
    example: 'Jl. Sudirman No. 123, Jakarta'
  },
  {
    name: 'delivery_status',
    label: 'Status Pengiriman',
    description: 'Status terkini pengiriman',
    example: 'Dalam perjalanan'
  },
  {
    name: 'estimated_time',
    label: 'Estimasi Waktu',
    description: 'Estimasi waktu tiba',
    example: '30 menit lagi'
  },
  {
    name: 'driver_name',
    label: 'Nama Driver',
    description: 'Nama pengantar pesanan',
    example: 'Ahmad'
  },
  {
    name: 'driver_phone',
    label: 'No. HP Driver',
    description: 'Nomor telepon driver',
    example: '081298765432'
  },
  {
    name: 'payment_method',
    label: 'Metode Pembayaran',
    description: 'Cara pembayaran yang dipilih',
    example: 'Transfer Bank'
  },
  {
    name: 'payment_deadline',
    label: 'Batas Pembayaran',
    description: 'Batas waktu pembayaran',
    example: '30 Oktober 2025, 23:59'
  },
  {
    name: 'payment_account',
    label: 'Rekening Pembayaran',
    description: 'Nomor rekening untuk transfer',
    example: 'BCA 1234567890 a.n. Toko ABC'
  },
  {
    name: 'notes',
    label: 'Catatan',
    description: 'Catatan tambahan dari pesanan',
    example: 'Pedas sedang, tanpa cabe rawit'
  },
  {
    name: 'business_name',
    label: 'Nama Bisnis',
    description: 'Nama toko/bisnis Anda',
    example: 'Warung Makan Sederhana'
  },
  {
    name: 'business_phone',
    label: 'No. HP Bisnis',
    description: 'Nomor kontak bisnis',
    example: '081234567890'
  }
]

// Default template examples
export const DEFAULT_TEMPLATES = [
  {
    name: 'Konfirmasi Pesanan Baru',
    category: 'order_confirmation',
    description: 'Template untuk konfirmasi pesanan yang baru masuk',
    template_content: `Halo {customer_name}! ✅

Pesanan Anda telah kami terima dan sedang diproses:

📋 No. Pesanan: {order_no}
📅 Tanggal: {order_date}

🛒 Detail Pesanan:
{order_items}

💰 Total: {total_amount}
🚚 Pengiriman: {delivery_date}
📍 Alamat: {delivery_address}

{notes}

Terima kasih sudah order! 🙏

{business_name}
📞 {business_phone}`,
    variables: ['customer_name', 'order_no', 'order_date', 'order_items', 'total_amount', 'delivery_date', 'delivery_address', 'notes', 'business_name', 'business_phone']
  },
  {
    name: 'Pengingat Pengiriman',
    category: 'order_reminder',
    description: 'Pengingat sebelum pesanan dikirim',
    template_content: `Halo {customer_name}! 🚚

Pesanan Anda akan segera dikirim:

📋 No. Pesanan: {order_no}

🛒 Item:
{order_items}

💰 Total: {total_amount}
🕐 Estimasi tiba: {estimated_time}
📍 Alamat: {delivery_address}

Mohon pastikan ada yang menerima ya! 🙏

{business_name}
📞 {business_phone}`,
    variables: ['customer_name', 'order_no', 'order_items', 'total_amount', 'estimated_time', 'delivery_address', 'business_name', 'business_phone']
  },
  {
    name: 'Update Status Pengiriman',
    category: 'delivery_update',
    description: 'Update status pengiriman real-time',
    template_content: `Halo {customer_name}! 📍

Update pesanan Anda:

📋 No. Pesanan: {order_no}
📦 Status: {delivery_status}
🕐 Estimasi: {estimated_time}

👤 Driver: {driver_name}
📞 Kontak Driver: {driver_phone}

Terima kasih! 🙏

{business_name}`,
    variables: ['customer_name', 'order_no', 'delivery_status', 'estimated_time', 'driver_name', 'driver_phone', 'business_name']
  },
  {
    name: 'Pengingat Pembayaran',
    category: 'payment_reminder',
    description: 'Reminder untuk pembayaran yang belum lunas',
    template_content: `Halo {customer_name}! 💳

Ini pengingat pembayaran untuk pesanan Anda:

📋 No. Pesanan: {order_no}

🛒 Item:
{order_items}

💰 Total Tagihan: {total_amount}
⏰ Batas Pembayaran: {payment_deadline}

💳 Transfer ke:
{payment_account}

Setelah transfer, mohon konfirmasi ya! 🙏

{business_name}
📞 {business_phone}`,
    variables: ['customer_name', 'order_no', 'order_items', 'total_amount', 'payment_deadline', 'payment_account', 'business_name', 'business_phone']
  },
  {
    name: 'Pesanan Selesai',
    category: 'order_completed',
    description: 'Notifikasi pesanan telah selesai diterima',
    template_content: `Halo {customer_name}! ✅

Pesanan Anda telah selesai:

📋 No. Pesanan: {order_no}
📅 Tanggal: {order_date}

🛒 Item:
{order_items}

💰 Total: {total_amount}

Terima kasih sudah order! 🙏
Ditunggu orderan selanjutnya ya! 😊

{business_name}
📞 {business_phone}`,
    variables: ['customer_name', 'order_no', 'order_date', 'order_items', 'total_amount', 'business_name', 'business_phone']
  },
  {
    name: 'Follow Up & Rating',
    category: 'follow_up',
    description: 'Follow up dan minta feedback pelanggan',
    template_content: `Halo {customer_name}! ⭐

Terima kasih sudah order di {business_name}!

Bagaimana pengalaman Anda dengan:
{order_items}

Apakah Anda puas dengan pelayanan kami?
Berikan rating dan ulasan ya! 🙏

Kami tunggu orderan selanjutnya! 😊

{business_name}
📞 {business_phone}`,
    variables: ['customer_name', 'order_items', 'business_name', 'business_phone']
  }
]

# WhatsApp Follow-up Integration

## Overview

WhatsApp Follow-up feature telah berhasil diintegrasikan ke dalam sistem manajemen pesanan bakery. Fitur ini memungkinkan pengguna untuk mengirim pesan follow-up kepada pelanggan melalui WhatsApp dengan template otomatis yang sesuai konteks bisnis.

## 🚀 Features

### ✨ Template Messages
- **Konfirmasi Pesanan**: Pesan otomatis saat pesanan diterima
- **Pesanan Siap**: Notifikasi ketika pesanan sudah siap diambil/dikirim
- **Pengingat Pembayaran**: Reminder untuk pembayaran yang belum lunas
- **Update Pengiriman**: Informasi status pengiriman
- **Custom Message**: Pesan bebas yang bisa disesuaikan

### 🔧 Technical Features
- Support WhatsApp Regular & WhatsApp Business API
- Auto-format nomor telepon Indonesia (08xxx → 628xxx)
- Real-time preview pesan
- Copy to clipboard functionality
- Lazy loading untuk performa optimal
- Mobile-responsive design
- Callback system untuk tracking dan analytics

## 📁 File Structure

```
src/
├── components/ui/
│   ├── whatsapp-followup.tsx          # Main component
│   └── whatsapp-followup.example.tsx  # Usage example
├── app/orders/
│   └── page.tsx                       # Legacy orders page integration
└── modules/orders/components/
    └── OrdersPage.tsx                 # Modular orders page integration
```

## 💻 Implementation Details

### Component Location
`src/components/ui/whatsapp-followup.tsx`

### Interface
```typescript
interface WhatsAppFollowUpProps {
  order: Order
  onSent?: (method: 'whatsapp' | 'business', message: string, phone: string) => void
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone?: string
  status: string
  order_date: string
  due_date?: string
  total_amount: number
  items: Array<{
    recipe?: { name: string }
    product_name?: string
    quantity: number
  }>
  payment_status?: string
  remaining_amount?: number
}
```

### Integration Points

#### 1. Legacy Orders Page (`src/app/orders/page.tsx`)
- Integrated dalam `OrderDetailView` component
- Muncul di bagian bawah detail pesanan dengan border separator
- Menggunakan React.lazy untuk loading optimization

#### 2. Modular Orders Page (`src/modules/orders/components/OrdersPage.tsx`)
- Integrated dalam order list items
- Muncul sebagai action button di setiap pesanan yang memiliki nomor telepon
- Juga tersedia di recent orders section

## 🎯 Usage Examples

### Basic Usage
```tsx
import WhatsAppFollowUp from '@/components/ui/whatsapp-followup'

<WhatsAppFollowUp 
  order={orderData}
  onSent={(method, message, phone) => {
    console.log(`Message sent via ${method} to ${phone}`)
    // Log to database, update analytics, etc.
  }}
/>
```

### With Error Handling
```tsx
const handleMessageSent = (method: 'whatsapp' | 'business', message: string, phone: string) => {
  try {
    // Log activity to database
    await fetch('/api/communications', {
      method: 'POST',
      body: JSON.stringify({
        order_id: order.id,
        method,
        phone,
        message_type: 'whatsapp_followup',
        sent_at: new Date().toISOString()
      })
    })
    
    // Show success notification
    toast.success(`Pesan berhasil dikirim via ${method}`)
  } catch (error) {
    toast.error('Gagal mencatat pengiriman pesan')
  }
}
```

## 🔗 WhatsApp URL Generation

### Regular WhatsApp
```
https://wa.me/{phone}?text={encodedMessage}
```

### WhatsApp Business API
```
https://api.whatsapp.com/send?phone={phone}&text={encodedMessage}
```

### Phone Number Formatting
- Input: `08123456789` → Output: `628123456789`
- Input: `+62123456789` → Output: `62123456789`
- Input: `62123456789` → Output: `62123456789` (no change)

## 🎨 Message Templates

### 1. Order Confirmation Template
```
Halo {customer_name}! 👋

Terima kasih telah mempercayai kami! Pesanan Anda sudah kami terima:

📋 *No. Pesanan:* {order_number}
📅 *Tanggal Pesan:* {order_date}
🚛 *Estimasi Selesai:* {due_date}
💰 *Total:* Rp {total_amount}

*Detail Pesanan:*
• {item_1} ({quantity}x)
• {item_2} ({quantity}x)

Pesanan Anda sedang dalam proses. Kami akan kabari lagi ketika sudah siap! 😊

Terima kasih! 🙏
```

### 2. Order Ready Template
```
Halo {customer_name}! 🎉

Kabar gembira! Pesanan Anda sudah siap:

📋 *No. Pesanan:* {order_number}
✅ *Status:* Siap untuk diambil/dikirim
💰 *Total:* Rp {total_amount}

*Pesanan Anda:*
• {item_list}

Silakan konfirmasi untuk pengambilan atau pengiriman ya! 😊

Terima kasih! 🙏
```

### 3. Payment Reminder Template
```
Halo {customer_name}! 😊

Ini pengingat ramah untuk pembayaran pesanan:

📋 *No. Pesanan:* {order_number}
💰 *Total:* Rp {total_amount}
💸 *Sisa Pembayaran:* Rp {remaining_amount}

Mohon untuk melakukan pembayaran agar pesanan bisa segera kami proses ya! 🙏

Terima kasih! 😊
```

## 📱 User Experience

### Desktop
- Modal dialog dengan layout 2 kolom
- Kiri: Order info, phone input, template selection
- Kanan: Message preview, send actions
- Full-width pada resolusi besar

### Mobile
- Stack layout (1 kolom)
- Touch-optimized buttons
- Responsive text sizing
- Swipe-friendly interactions

## 🔄 Future Enhancements

### Planned Features
1. **Message History**: Track komunikasi WhatsApp per customer
2. **Scheduled Messages**: Kirim pesan otomatis berdasarkan status/waktu
3. **Message Templates Management**: CRUD template custom
4. **Bulk WhatsApp**: Send message ke multiple customers sekaligus
5. **WhatsApp Business Integration**: Direct API integration tanpa redirect
6. **Message Analytics**: Track open rates, response rates
7. **Auto-Reply Setup**: Setup auto-reply untuk pesan masuk

### Technical Improvements
1. **Offline Support**: Cache messages untuk kirim nanti
2. **Message Queue**: Queue system untuk bulk messages
3. **Template Variables**: Dynamic template dengan custom variables
4. **Multi-language Support**: Template dalam bahasa lain
5. **Message Validation**: Validate message content & phone numbers

## 🧪 Testing

### Manual Testing Steps
1. Buka halaman orders (`/orders`)
2. Klik detail pesanan yang memiliki nomor telepon
3. Klik tombol "WhatsApp Follow-up"
4. Pilih template message
5. Edit nomor telepon jika perlu
6. Preview pesan di panel kanan
7. Pilih WhatsApp Regular atau Business
8. Klik "Kirim" - akan membuka tab baru
9. Verify redirect ke WhatsApp dengan pesan terisi

### Automated Testing
```bash
# Run component tests
pnpm test whatsapp-followup

# Run E2E tests
pnpm test:e2e --grep "WhatsApp"
```

## 📊 Analytics & Tracking

### Metrics to Track
- Total messages sent per day/week/month
- Most used template types
- Success rate (sent vs failed)
- Customer response rates
- Conversion from message to order completion

### Implementation
```typescript
const trackWhatsAppActivity = async (data: {
  order_id: string
  customer_phone: string
  template_used: string
  method: 'whatsapp' | 'business'
  sent_at: Date
}) => {
  await fetch('/api/analytics/whatsapp', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Phone Number Not Formatted Correctly**
   - Check `formatPhoneNumber()` function
   - Ensure Indonesian format (62xxx)

2. **WhatsApp Not Opening**
   - Check if WhatsApp installed on device
   - Verify URL encoding is correct
   - Test with different browsers

3. **Template Not Loading**
   - Check React.lazy implementation
   - Verify import paths
   - Check for JavaScript errors in console

4. **Message Too Long**
   - WhatsApp has character limits
   - Implement message truncation if needed

### Support
For issues or feature requests, create an issue in the project repository or contact the development team.

---

*Last updated: December 2024*
*Version: 1.0.0*
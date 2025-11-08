/**
 * WhatsApp Helper Functions
 * Client-side utilities for WhatsApp integration using wa.me
 */

/**
 * Generate WhatsApp link with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Clean phone number (remove non-digits)
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  
  // Add country code if not present (assume Indonesia +62)
  const phoneWithCountry = cleanPhone.startsWith('62') 
    ? cleanPhone 
    : `62${cleanPhone.replace(/^0/, '')}`

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsApp(phoneNumber: string, message: string): void {
  const link = generateWhatsAppLink(phoneNumber, message)
  window.open(link, '_blank')
}

/**
 * Generate order confirmation message
 */
export function generateOrderConfirmationMessage(order: {
  order_no: string
  customer_name: string
  items: Array<{ name: string; quantity: number; price: number }>
  total_amount: number
  delivery_date?: string
  notes?: string
}): string {
  const itemsList = order.items
    .map(item => `• ${item.name} (${item.quantity}x) - Rp ${item.price.toLocaleString('id-ID')}`)
    .join('\n')

  return `Halo ${order['customer_name']}! 👋

Terima kasih atas pesanan Anda!

📋 *Order #${order['order_no']}*

*Pesanan:*
${itemsList}

💰 *Total: Rp ${order.total_amount.toLocaleString('id-ID')}*
📅 *Pengiriman: ${order.delivery_date ?? 'Segera'}*

${order.notes ? `📝 Catatan: ${order.notes}\n\n` : ''}Kami akan segera memproses pesanan Anda. Terima kasih! 🙏

🍽️ HeyTrack`
}

/**
 * Generate delivery reminder message
 */
export function generateDeliveryReminderMessage(order: {
  order_no: string
  customer_name: string
  delivery_date: string
  delivery_address?: string
}): string {
  return `Halo ${order['customer_name']}! 👋

Pengingat pengiriman pesanan Anda:

📋 *Order #${order['order_no']}*
📅 *Tanggal Pengiriman: ${order.delivery_date}*
${order.delivery_address ? `📍 *Alamat: ${order.delivery_address}*\n\n` : ''}Pesanan Anda akan segera dikirim. Mohon pastikan ada yang menerima di lokasi. 🚚

Terima kasih! 🙏

🍽️ HeyTrack`
}

/**
 * Generate payment reminder message
 */
export function generatePaymentReminderMessage(order: {
  order_no: string
  customer_name: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
}): string {
  return `Halo ${order['customer_name']}! 👋

Pengingat pembayaran untuk pesanan Anda:

📋 *Order #${order['order_no']}*

💰 *Total: Rp ${order.total_amount.toLocaleString('id-ID')}*
✅ *Dibayar: Rp ${order.paid_amount.toLocaleString('id-ID')}*
⏳ *Sisa: Rp ${order.remaining_amount.toLocaleString('id-ID')}*

Mohon segera melunasi pembayaran. Terima kasih! 🙏

🍽️ HeyTrack`
}

/**
 * Generate follow-up message
 */
export function generateFollowUpMessage(order: {
  order_no: string
  customer_name: string
  items: Array<{ name: string }>
}): string {
  const itemsList = order.items.map(item => `• ${item.name}`).join('\n')

  return `Halo ${order['customer_name']}! 👋

Terima kasih sudah memesan dari kami! 🙏

📋 *Order #${order['order_no']}*

*Pesanan Anda:*
${itemsList}

Bagaimana rasanya? Kami harap Anda puas dengan pesanan kami! 😊

Jangan ragu untuk pesan lagi ya! 🍽️

🍽️ HeyTrack`
}

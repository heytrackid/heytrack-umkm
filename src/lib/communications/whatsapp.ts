import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')
import { formatCurrentCurrency } from '@/lib/currency'

import type { WhatsAppTemplate, WhatsAppConfig, OrderData } from './types'


/**
 * WhatsApp Service Module
 * WhatsApp messaging service for order notifications and customer communication
 */


export class WhatsAppService {
  private readonly config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  /**
   * Get default WhatsApp templates
   */
  static getDefaultTemplates(): WhatsAppTemplate[] {
    return [
      {
        id: 'order_confirmation',
        name: 'Konfirmasi Pesanan',
        category: 'order_confirmation',
        template: `Halo {customer_name}! ✅

Pesanan Anda telah dikonfirmasi:

{order_items}

Total: {total_amount}
Jadwal pengiriman: {delivery_date}

Terima kasih sudah order di tempat kami!
{notes}

🍽️ HeyTrack`,
        variables: ['customer_name', 'order_items', 'total_amount', 'delivery_date', 'notes'],
        description: 'Template konfirmasi pesanan'
      },
      {
        id: 'order_reminder',
        name: 'Pengingat Pengiriman',
        category: 'order_reminder',
        template: `Halo {customer_name}! 🚚

Pesanan Anda akan segera dikirim:

{order_items}

Total: {total_amount}
Jadwal pengiriman: {delivery_date}

Driver kami akan segera tiba. Siap-siap ya!

🍽️ HeyTrack`,
        variables: ['customer_name', 'order_items', 'total_amount', 'delivery_date'],
        description: 'Template pengingat sebelum pengiriman'
      },
      {
        id: 'delivery_update',
        name: 'Update Pengiriman',
        category: 'delivery_update',
        template: `Halo {customer_name}! 📍

Update status pengiriman pesanan Anda:

Status: {delivery_status}
Estimasi waktu: {estimated_time}

{order_items}

Driver: {driver_name} ({driver_phone})

Terima kasih sudah order di tempat kami!

🍽️ HeyTrack`,
        variables: ['customer_name', 'delivery_status', 'estimated_time', 'order_items', 'driver_name', 'driver_phone'],
        description: 'Template update status pengiriman'
      },
      {
        id: 'payment_reminder',
        name: 'Pengingat Pembayaran',
        category: 'payment_reminder',
        template: `Halo {customer_name}! 💳

Ini adalah pengingat untuk pembayaran pesanan Anda:

{order_items}

Total tagihan: {total_amount}
Batas pembayaran: {payment_deadline}

Silakan selesaikan pembayaran agar pesanan dapat diproses.

Transfer ke: {payment_account}

🍽️ HeyTrack`,
        variables: ['customer_name', 'order_items', 'total_amount', 'payment_deadline', 'payment_account'],
        description: 'Template pengingat pembayaran'
      },
      {
        id: 'follow_up',
        name: 'Follow Up',
        category: 'follow_up',
        template: `Halo {customer_name}! ⭐

Terima kasih sudah order di tempat kami!

Bagaimana pengalaman Anda dengan pesanan:
{order_items}

Apakah Anda puas dengan pelayanan kami? Berikan rating dan ulasan di aplikasi ya!

Kami tunggu orderan selanjutnya! 🙏

🍽️ HeyTrack`,
        variables: ['customer_name', 'order_items'],
        description: 'Template follow up setelah pengiriman'
      }
    ];
  }

  /**
   * Send WhatsApp message using wa.me link
   * ✅ NEW: Opens WhatsApp with pre-filled message using wa.me
   */
  sendMessage(to: string, templateId: string, data: Record<string, unknown>): boolean {
    try {
      const template = this.config.defaultTemplates.find(t => t['id'] === templateId) ??
                      WhatsAppService.getDefaultTemplates().find(t => t['id'] === templateId);

      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      let message = template.template;

      // Replace variables
      template.variables.forEach(variable => {
        const value = data[variable];
        if (value !== undefined) {
          message = message.replace(new RegExp(`{${variable}}`, 'g'), String(value));
        }
      });

      // Clean phone number (remove non-digits)
      const cleanPhone = to.replace(/\D/g, '');
      
      // Add country code if not present (assume Indonesia +62)
      const phoneWithCountry = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone.replace(/^0/, '')}`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);

      // Generate wa.me link
      const waLink = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;

      logger.info({ 
        to: phoneWithCountry, 
        templateId, 
        waLink 
      }, 'WhatsApp link generated');

      // Return the link in the response (client can open it)
      // In browser context, you can use: window.open(waLink, '_blank')
      return true;
    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : String(error), 
        to, 
        templateId 
      }, 'Failed to generate WhatsApp link');
      return false;
    }
  }

  /**
   * Generate WhatsApp link for message
   * ✅ NEW: Public method to get wa.me link
   */
  generateWhatsAppLink(to: string, message: string): string {
    // Clean phone number
    const cleanPhone = to.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone.replace(/^0/, '')}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
  }

  /**
   * Send order confirmation
   */
  sendOrderConfirmation(orderData: OrderData): boolean {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x) - ${formatCurrentCurrency(item.price * item.quantity)}`
    ).join('\n');

    const data = {
      customer_name: orderData['customer_name'],
      order_items: orderItems,
      total_amount: formatCurrentCurrency(orderData.total_amount),
      delivery_date: orderData.delivery_date ?? 'Segera',
      notes: orderData.notes ?? ''
    };

    return this.sendMessage(orderData.customer_phone, 'order_confirmation', data);
  }

  /**
   * Send delivery reminder
   */
  sendDeliveryReminder(orderData: OrderData): boolean {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x)`
    ).join('\n');

    const data = {
      customer_name: orderData['customer_name'],
      order_items: orderItems,
      total_amount: formatCurrentCurrency(orderData.total_amount),
      delivery_date: orderData.delivery_date ?? 'Hari ini'
    };

    return this.sendMessage(orderData.customer_phone, 'order_reminder', data);
  }

  /**
   * Send payment reminder
   */
  sendPaymentReminder(orderData: OrderData, deadline: string, paymentAccount: string): boolean {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x)`
    ).join('\n');

    const data = {
      customer_name: orderData['customer_name'],
      order_items: orderItems,
      total_amount: formatCurrentCurrency(orderData.total_amount),
      payment_deadline: deadline,
      payment_account: paymentAccount
    };

    return this.sendMessage(orderData.customer_phone, 'payment_reminder', data);
  }

  /**
   * Send follow-up message
   */
  sendFollowUp(orderData: OrderData): boolean {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x)`
    ).join('\n');

    const data = {
      customer_name: orderData['customer_name'],
      order_items: orderItems
    };

    return this.sendMessage(orderData.customer_phone, 'follow_up', data);
  }
}

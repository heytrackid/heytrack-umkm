/**
 * WhatsApp Service Module
 * WhatsApp messaging service for order notifications and customer communication
 */

import { automationLogger } from '@/lib/logger'
import { formatCurrentCurrency } from '@/lib/currency'
import type { WhatsAppTemplate, WhatsAppConfig, OrderData } from './types'

export class WhatsAppService {
  private config: WhatsAppConfig;

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
   * Send WhatsApp message
   */
  async sendMessage(to: string, templateId: string, data: Record<string, any>): Promise<boolean> {
    try {
      const template = this.config.defaultTemplates.find(t => t.id === templateId) ||
                      WhatsAppService.getDefaultTemplates().find(t => t.id === templateId);

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

      // For demo purposes - in real implementation, this would call WhatsApp API
      automationLogger.info({ to, templateId, message }, 'WhatsApp message sent (simulated)');

      return true;
    } catch (error) {
      automationLogger.error({ error: error instanceof Error ? error.message : String(error), to, templateId }, 'Failed to send WhatsApp message');
      return false;
    }
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(orderData: OrderData): Promise<boolean> {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x) - ${formatCurrentCurrency(item.price * item.quantity)}`
    ).join('\n');

    const data = {
      customer_name: orderData.customer_name,
      order_items: orderItems,
      total_amount: formatCurrentCurrency(orderData.total_amount),
      delivery_date: orderData.delivery_date || 'Segera',
      notes: orderData.notes || ''
    };

    return this.sendMessage(orderData.customer_phone, 'order_confirmation', data);
  }

  /**
   * Send delivery reminder
   */
  async sendDeliveryReminder(orderData: OrderData): Promise<boolean> {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x)`
    ).join('\n');

    const data = {
      customer_name: orderData.customer_name,
      order_items: orderItems,
      total_amount: formatCurrentCurrency(orderData.total_amount),
      delivery_date: orderData.delivery_date || 'Hari ini'
    };

    return this.sendMessage(orderData.customer_phone, 'order_reminder', data);
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(orderData: OrderData, deadline: string, paymentAccount: string): Promise<boolean> {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x)`
    ).join('\n');

    const data = {
      customer_name: orderData.customer_name,
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
  async sendFollowUp(orderData: OrderData): Promise<boolean> {
    const orderItems = orderData.items.map(item =>
      `• ${item.name} (${item.quantity}x)`
    ).join('\n');

    const data = {
      customer_name: orderData.customer_name,
      order_items: orderItems
    };

    return this.sendMessage(orderData.customer_phone, 'follow_up', data);
  }
}

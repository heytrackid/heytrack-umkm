import { formatCurrency } from '@/shared/utils/currency'

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'order_confirmation' | 'order_reminder' | 'delivery_update' | 'payment_reminder' | 'follow_up' | 'custom';
  template: string;
  variables: string[];
  description: string;
}

export interface WhatsAppConfig {
  businessNumber: string; // For WhatsApp Business
  useBusinessAPI: boolean;
  defaultTemplates: WhatsAppTemplate[];
}

export interface OrderData {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  delivery_date?: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  // Default templates untuk UMKM F&B
  static getDefaultTemplates(): WhatsAppTemplate[] {
    return [
      {
        id: 'order_confirmation',
        name: 'Konfirmasi Pesanan',
        category: 'order_confirmation',
        template: `Halo {customer_name}! 😊

Terima kasih atas pesanannya:

📋 *DETAIL PESANAN*
Order ID: {order_id}
{order_items}

💰 Total: *{total_amount}*
📅 Pengiriman: {delivery_date}

Pesanan sedang diproses dan akan siap sesuai jadwal.

Ada pertanyaan? Langsung chat aja ya! 🙏

*{business_name}*`,
        variables: ['customer_name', 'order_id', 'order_items', 'total_amount', 'delivery_date', 'business_name'],
        description: 'Template untuk konfirmasi pesanan baru'
      },
      {
        id: 'order_ready',
        name: 'Pesanan Siap',
        category: 'delivery_update',
        template: `Halo {customer_name}! 🎉

Kabar gembira! Pesanan Anda sudah *SIAP*:

📋 Order ID: {order_id}
🕐 Siap sejak: {ready_time}

Silakan diambil atau kami akan kirim sesuai jadwal pengiriman: {delivery_date}

Terima kasih sudah mempercayai kami! ❤️

*{business_name}*`,
        variables: ['customer_name', 'order_id', 'ready_time', 'delivery_date', 'business_name'],
        description: 'Template untuk memberitahu pesanan sudah siap'
      },
      {
        id: 'payment_reminder',
        name: 'Reminder Pembayaran',
        category: 'payment_reminder',
        template: `Halo {customer_name}! 😊

Friendly reminder untuk pesanan:

📋 Order ID: {order_id}
💰 Total: *{total_amount}*
⏰ Jatuh tempo: {due_date}

Mohon segera melakukan pembayaran ya. Transfer ke:
🏦 *{payment_details}*

Konfirmasi setelah transfer. Terima kasih! 🙏

*{business_name}*`,
        variables: ['customer_name', 'order_id', 'total_amount', 'due_date', 'payment_details', 'business_name'],
        description: 'Template untuk mengingatkan pembayaran'
      },
      {
        id: 'delivery_update',
        name: 'Update Pengiriman',
        category: 'delivery_update',
        template: `Halo {customer_name}! 🚚

Update pengiriman pesanan Anda:

📋 Order ID: {order_id}
📍 Status: *{delivery_status}*
🕐 Estimasi tiba: {estimated_arrival}

{additional_notes}

Track pesanan atau hubungi kami jika ada pertanyaan ya! 😊

*{business_name}*`,
        variables: ['customer_name', 'order_id', 'delivery_status', 'estimated_arrival', 'additional_notes', 'business_name'],
        description: 'Template untuk update status pengiriman'
      },
      {
        id: 'follow_up',
        name: 'Follow Up Pelanggan',
        category: 'follow_up',
        template: `Halo {customer_name}! 😊

Bagaimana dengan pesanan {order_id} kemarin? Semoga suka ya dengan {product_name}!

⭐ Boleh minta review honest-nya dong:
- Rasa gimana?
- Kualitas sesuai ekspektasi?
- Ada saran improvement?

Feedback Anda sangat membantu kami berkembang! 🙏

Next order ada diskon {discount}% loh! 😉

*{business_name}*`,
        variables: ['customer_name', 'order_id', 'product_name', 'discount', 'business_name'],
        description: 'Template untuk follow up dan review'
      },
      {
        id: 'promo_offer',
        name: 'Penawaran Promo',
        category: 'custom',
        template: `Halo {customer_name}! 🎉

*SPECIAL OFFER* khusus untuk Anda!

🔥 {promo_title}
💰 Diskon {discount_amount}
📅 Berlaku sampai: {valid_until}

{promo_description}

Jangan sampai terlewat ya! Order sekarang:
👇 {order_link}

*{business_name}*`,
        variables: ['customer_name', 'promo_title', 'discount_amount', 'valid_until', 'promo_description', 'order_link', 'business_name'],
        description: 'Template untuk penawaran promo khusus'
      }
    ];
  }

  // Generate WhatsApp URL
  generateWhatsAppURL(
    phoneNumber: string, 
    message: string, 
    useBusinessAPI: boolean = false
  ): string {
    // Clean phone number (remove non-digits, add country code if needed)
    const cleanedNumber = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponen"";

    if (useBusinessAPI && this.config.businessNumber) {
      // WhatsApp Business API link
      return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
    } else {
      // Regular WhatsApp link
      return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
    }
  }

  // Format Indonesian phone number
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  }

  // Generate message from template
  generateMessage(templateId: string, data: Record<string, any>): string {
    const template = WhatsAppService.getDefaultTemplates().find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let message = template.template;
    
    // Replace variables in template
    template.variables.forEach(variable => {
      const placeholder = `{${variable}}`;
      const value = data[variable] || `[${variable}]`;
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return message;
  }

  // Generate order items text
  formatOrderItems(items: OrderData['items']): string {
    return items.map(item => 
      `• ${item.name} (${item.quantity}x) - ${formatCurrency(item.price)}`
    ).join('\n');
  }

  // Format currency (using dynamic currency system)
  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  // Format date to Indonesian format
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Quick message generators for common scenarios
  generateOrderConfirmation(orderData: OrderData, businessName: string): {
    message: string;
    whatsappURL: string;
    businessURL: string;
  } {
    const templateData = {
      customer_name: orderData.customer_name,
      order_id: orderData.id,
      order_items: this.formatOrderItems(orderData.items),
      total_amount: formatCurrency(orderData.total_amount),
      delivery_date: orderData.delivery_date ? this.formatDate(orderData.delivery_date) : 'As agreed',
      business_name: businessName
    };

    const message = this.generateMessage('order_confirmation', templateData);
    
    return {
      message,
      whatsappURL: this.generateWhatsAppURL(orderData.customer_phone, message, false),
      businessURL: this.generateWhatsAppURL(orderData.customer_phone, message, true)
    };
  }

  generatePaymentReminder(orderData: OrderData, businessName: string, paymentDetails: string): {
    message: string;
    whatsappURL: string;
    businessURL: string;
  } {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // Tomorrow

    const templateData = {
      customer_name: orderData.customer_name,
      order_id: orderData.id,
      total_amount: formatCurrency(orderData.total_amount),
      due_date: this.formatDate(dueDate),
      payment_details: paymentDetails,
      business_name: businessName
    };

    const message = this.generateMessage('payment_reminder', templateData);
    
    return {
      message,
      whatsappURL: this.generateWhatsAppURL(orderData.customer_phone, message, false),
      businessURL: this.generateWhatsAppURL(orderData.customer_phone, message, true)
    };
  }

  generateFollowUp(orderData: OrderData, businessName: string, discount: number = 10): {
    message: string;
    whatsappURL: string;
    businessURL: string;
  } {
    const mainProduct = orderData.items[0]?.name || 'order';
    
    const templateData = {
      customer_name: orderData.customer_name,
      order_id: orderData.id,
      product_name: mainProduct,
      discount: discount.toString(),
      business_name: businessName
    };

    const message = this.generateMessage('follow_up', templateData);
    
    return {
      message,
      whatsappURL: this.generateWhatsAppURL(orderData.customer_phone, message, false),
      businessURL: this.generateWhatsAppURL(orderData.customer_phone, message, true)
    };
  }

  // Custom template generator
  generateCustomMessage(templateId: string, data: Record<string, any>, phoneNumber: string): {
    message: string;
    whatsappURL: string;
    businessURL: string;
  } {
    const message = this.generateMessage(templateId, data);
    
    return {
      message,
      whatsappURL: this.generateWhatsAppURL(phoneNumber, message, false),
      businessURL: this.generateWhatsAppURL(phoneNumber, message, true)
    };
  }

  // Get all available templates
  getTemplates(): WhatsAppTemplate[] {
    return WhatsAppService.getDefaultTemplates();
  }

  // Validate phone number
  isValidPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}

// Create default service instance
export const whatsappService = new WhatsAppService({
  businessNumber: '',
  useBusinessAPI: false,
  defaultTemplates: WhatsAppService.getDefaultTemplates()
});

export default whatsappService;
import { EmailService } from './email'
import { SmartNotificationSystem } from './notifications'
import { WhatsAppService } from './whatsapp'

import type { CommunicationConfig, OrderData, SmartNotification } from './types'


/**
 * Communications Manager Module
 * Unified manager for all communication services
 */


export class CommunicationsManager {
  private static instance: CommunicationsManager;
  private readonly whatsapp?: WhatsAppService;
  private readonly notifications: SmartNotificationSystem;
  private readonly email?: EmailService;

  private constructor(config: CommunicationConfig = {}) {
    if (config.whatsapp) {
      this.whatsapp = new WhatsAppService(config.whatsapp);
    }

    this.notifications = SmartNotificationSystem.getInstance(config.notifications);

    if (config.email) {
      this.email = new EmailService(config.email);
    }
  }

  static getInstance(config?: CommunicationConfig): CommunicationsManager {
    if (!CommunicationsManager.instance) {
      CommunicationsManager.instance = new CommunicationsManager(config);
    }
    return CommunicationsManager.instance;
  }

  // Service accessors
  get whatsappService(): WhatsAppService | undefined {
    return this.whatsapp;
  }

  get notificationSystem(): SmartNotificationSystem {
    return this.notifications;
  }

  get emailService(): EmailService | undefined {
    return this.email;
  }

  /**
   * Send order notification via appropriate channel
   */
  sendOrderNotification(orderData: OrderData, type: 'confirmation' | 'followup' | 'payment' | 'reminder'): void {
    // Send WhatsApp message
    if (this.whatsapp) {
      switch (type) {
        case 'confirmation':
          this.whatsapp.sendOrderConfirmation(orderData);
          break;
        case 'reminder':
          this.whatsapp.sendDeliveryReminder(orderData);
          break;
        case 'followup':
          this.whatsapp.sendFollowUp(orderData);
          break;
        default:
          // Unknown notification type
          break;
      }
    }

    // Create in-app notification
    const notificationData = {
      category: 'orders' as const,
      priority: 'medium' as const,
      title: `Pesanan ${orderData['id']}`,
      message: `Status pesanan: ${orderData['status']}`,
      data: JSON.parse(JSON.stringify(orderData)) as Record<string, unknown>,
      status: 'sent' as const
    };

    this.notifications.addNotification(notificationData);
  }

  /**
   * Send business alert
   */
  sendBusinessAlert(category: SmartNotification['category'], title: string, message: string, priority: SmartNotification['priority'] = 'medium'): void {
    this.notifications.addNotification({
      category,
      priority,
      title,
      message,
      status: 'sent'
    });
  }
}

// @ts-nocheck
/**
 * Communications Manager Module
 * Unified manager for all communication services
 */

import { WhatsAppService } from './whatsapp'
import { SmartNotificationSystem } from './notifications'
import { EmailService } from './email'
import type { CommunicationConfig, OrderData, SmartNotification } from './types'

export class CommunicationsManager {
  private static instance: CommunicationsManager;
  private whatsapp?: WhatsAppService;
  private notifications: SmartNotificationSystem;
  private email?: EmailService;

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
  async sendOrderNotification(orderData: OrderData, type: 'confirmation' | 'reminder' | 'payment' | 'followup'): Promise<void> {
    // Send WhatsApp message
    if (this.whatsapp) {
      switch (type) {
        case 'confirmation':
          await this.whatsapp.sendOrderConfirmation(orderData);
          break;
        case 'reminder':
          await this.whatsapp.sendDeliveryReminder(orderData);
          break;
        case 'followup':
          await this.whatsapp.sendFollowUp(orderData);
          break;
      }
    }

    // Create in-app notification
    const notificationData = {
      category: 'orders' as const,
      priority: 'medium' as const,
      title: `Pesanan ${orderData.id}`,
      message: `Status pesanan: ${orderData.status}`,
      data: orderData,
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

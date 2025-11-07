import { CommunicationsManager } from './manager'
import { SmartNotificationSystem } from './notifications'
import { WhatsAppService } from './whatsapp'

import type { SmartNotification } from './types'


/**
 * Communications Module - Main Entry Point
 * Unified communication services for WhatsApp, notifications, and email
 */

// Export all types
export * from './types'

// Export all services
export { WhatsAppService } from './whatsapp'
export { SmartNotificationSystem } from './notifications'
export { EmailService } from './email'
export { CommunicationsManager } from './manager'

// Re-export convenience functions for backward compatibility

/**
 * Send WhatsApp message (convenience function)
 */
export function sendWhatsAppMessage(to: string, templateId: string, data: Record<string, unknown>): boolean {
  // This would need proper configuration in a real app
  const config = {
    businessNumber: '',
    useBusinessAPI: false,
    defaultTemplates: WhatsAppService.getDefaultTemplates()
  };

  const service = new WhatsAppService(config);
  return service.sendMessage(to, templateId, data);
}

/**
 * Create and send notification (convenience function)
 */
export function sendNotification(notification: Omit<SmartNotification, 'id' | 'isRead' | 'timestamp' | 'type'>): void {
  const system = SmartNotificationSystem.getInstance();
  system.addNotification(notification);
}

// Export singleton instances
export const communicationsManager = CommunicationsManager.getInstance();
export const notificationSystem = SmartNotificationSystem.getInstance();

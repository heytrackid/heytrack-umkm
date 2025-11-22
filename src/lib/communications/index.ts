import { CommunicationsManager } from '@/lib/communications/manager'
import { SmartNotificationSystem } from '@/lib/communications/notifications'
import { WhatsAppService } from '@/lib/communications/whatsapp'

import type { SmartNotification } from '@/lib/communications/types'


/**
 * Communications Module - Main Entry Point
 * Unified communication services for WhatsApp, notifications, and email
 */

// Export all types
export type * from './types'

// Export all services
export { EmailService } from './email'
export { CommunicationsManager } from './manager'
export { SmartNotificationSystem } from './notifications'
export { WhatsAppService } from './whatsapp'

// Re-export convenience functions for backward compatibility

/**
 * Send WhatsApp message (convenience function)
 */
export const sendWhatsAppMessage = (to: string, templateId: string, data: Record<string, unknown>): boolean => {
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
export const sendNotification = (notification: Omit<SmartNotification, 'id' | 'isRead' | 'timestamp'>): void => {
  const system = SmartNotificationSystem.getInstance();
  system.addNotification(notification);
}

// Export singleton instances
export const communicationsManager = CommunicationsManager.getInstance();
export const notificationSystem = SmartNotificationSystem.getInstance();

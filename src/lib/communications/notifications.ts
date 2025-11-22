import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')
import type { SmartNotification, NotificationRule, NotificationConfig } from '@/lib/communications/types'


/**
 * Smart Notification System Module
 * Intelligent notification system with rules and real-time updates
 */


export class SmartNotificationSystem {
  private static instance: SmartNotificationSystem
  private notifications: SmartNotification[] = []
  private readonly rules: NotificationRule[] = []
  private subscribers: Array<(notifications: SmartNotification[]) => void> = []
  private readonly config: NotificationConfig

  private constructor(config: NotificationConfig = {
    maxNotifications: 100,
    defaultExpiryHours: 24,
    enableSmartRules: true
  }) {
    this.config = config;
  }

  static getInstance(config?: NotificationConfig): SmartNotificationSystem {
    if (!SmartNotificationSystem.instance) {
      SmartNotificationSystem.instance = new SmartNotificationSystem(config);
    }
    return SmartNotificationSystem.instance;
  }

  /**
   * Add notification
   */
  addNotification(notification: Omit<SmartNotification, 'id' | 'isRead' | 'timestamp' | 'type'>): void {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: SmartNotification = {
      id,
      type: 'info', // Default to info for notifications
      timestamp: new Date().toISOString(),
      isRead: false,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      category: notification.category,
      ...(notification.expiresAt && { expiresAt: notification.expiresAt }),
      ...(notification.data && { data: notification.data }),
      ...(notification.actionUrl && { actionUrl: notification.actionUrl }),
      ...(notification.actionLabel && { actionLabel: notification.actionLabel }),
      ...(notification.status && { status: notification.status }),
    }

    this.notifications.push(fullNotification)

    // Notify subscribers
    this.notifySubscribers();

    logger.info({ notificationId: id, category: notification.category }, 'Notification added');
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n['id'] === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifySubscribers();
    }
  }

  /**
   * Remove notification
   */
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n['id'] !== notificationId);
    this.notifySubscribers();
  }

  /**
   * Get all notifications
   */
  getNotifications(filter?: {
    category?: SmartNotification['category']
    priority?: SmartNotification['priority']
    unreadOnly?: boolean
  }): SmartNotification[] {
    let filtered = [...this.notifications];

    if (filter?.category) {
      filtered = filtered.filter(n => n.category === filter.category);
    }

    if (filter?.priority) {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    if (filter?.unreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    return filtered;
  }

  /**
   * Add notification rule
   */
  addRule(rule: NotificationRule): void {
    this.rules.push(rule);
    logger.info({ ruleId: rule['id'], category: rule.category }, 'Notification rule added');
  }

  /**
   * Evaluate rules against data
   */
  evaluateRules(data: Record<string, unknown>, category: SmartNotification['category']): void {
    if (!this.config.enableSmartRules) {return;}

    for (const rule of this.rules) {
      if (!rule.enabled || rule.category !== category) {continue;}

      let shouldTrigger = true;

      for (const condition of rule.conditions) {
        const value = data[condition.metric];
        if (value === undefined) {
          shouldTrigger = false;
          break;
        }

        const passes = this.evaluateCondition(value, condition);
        if (!passes) {
          shouldTrigger = false;
          break;
        }
      }

      if (shouldTrigger) {
        const notification: any = {
          category: rule.category,
          priority: rule.notification.priority,
          title: rule.notification.title,
          message: rule.notification.message,
          data,
          status: 'sent'
        }
        if (rule.notification.actionUrl) notification.actionUrl = rule.notification.actionUrl
        if (rule.notification.actionLabel) notification.actionLabel = rule.notification.actionLabel
        this.addNotification(notification);
      }
    }
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(value: unknown, condition: NotificationRule['conditions'][0]): boolean {
    if (value === null || value === undefined) {
      return false
    }

    if (condition.operator === 'contains') {
      return String(value).toLowerCase().includes(String(condition.value ?? '').toLowerCase())
    }

    const numericValue = typeof value === 'number' ? value : Number(value)
    const numericTarget = typeof condition.value === 'number' ? condition.value : Number(condition.value)

    if (!Number.isFinite(numericValue) || !Number.isFinite(numericTarget)) {
      if (condition.operator === 'eq') {
        return String(value) === String(condition.value)
      }
      return false
    }

    switch (condition.operator) {
      case 'gt':
        return numericValue > numericTarget
      case 'lt':
        return numericValue < numericTarget
      case 'eq':
        return numericValue === numericTarget
      case 'gte':
        return numericValue >= numericTarget
      case 'lte':
        return numericValue <= numericTarget
      default:
        return false
    }
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(callback: (notifications: SmartNotification[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback([...this.notifications]);
      } catch (error) {
        logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error notifying subscriber');
      }
    });
  }

  /**
   * Clean up expired notifications
   */
  cleanup(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(notification => {
      if (!notification.expiresAt) {return true;}
      return new Date(notification.expiresAt) > now;
    });
    this.notifySubscribers();
  }
}

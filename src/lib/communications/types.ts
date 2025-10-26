/**
 * Communications Module Types
 * Centralized type definitions for all communication services
 */

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface CommunicationConfig {
  whatsapp?: WhatsAppConfig
  notifications?: NotificationConfig
  email?: EmailConfig
}

export interface BaseMessage {
  id: string
  type: 'whatsapp' | 'notification' | 'email'
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
}

// ============================================================================
// WHATSAPP TYPES
// ============================================================================

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

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface SmartNotification extends Omit<BaseMessage, 'type'> {
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'inventory' | 'orders' | 'financial' | 'production' | 'customer' | 'system'
  title: string
  message: string
  data?: any
  actionUrl?: string
  actionLabel?: string
  isRead: boolean
  expiresAt?: string
}

export interface NotificationRule {
  id: string
  name: string
  category: SmartNotification['category']
  enabled: boolean
  conditions: {
    metric: string
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains'
    value: unknown
    timeWindow?: number // minutes
  }[]
  notification: {
    priority: SmartNotification['priority']
    title: string
    message: string
    actionUrl?: string
    actionLabel?: string
  }
}

export interface NotificationConfig {
  maxNotifications: number
  defaultExpiryHours: number
  enableSmartRules: boolean
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailConfig {
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  fromEmail: string
  fromName: string
}

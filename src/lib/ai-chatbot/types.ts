/**
 * AI Chatbot Types
 * Shared interfaces and types for chatbot functionality
 */

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'action';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
  data?: any;
  contextId?: string;
}

export interface ChatAction {
  id: string;
  type: 'add_order' | 'check_stock' | 'view_report' | 'analysis' | 'recommendation';
  label: string;
  data: any;
  executed?: boolean;
  result?: any;
}

export interface ChatContext {
  id: string;
  userId: string;
  conversation: ChatMessage[];
  businessContext: {
    businessType: 'bakery' | 'restaurant' | 'cafe' | 'catering' | 'general_fnb';
    currentPeriod: string;
    lastAnalysis?: Date;
  };
  activeActions: ChatAction[];
  memory: Record<string, any>;
}

// AI Intent Detection
export type ChatIntent = 
  | 'greeting' 
  | 'add_order' 
  | 'check_stock' 
  | 'view_orders' 
  | 'financial_report' 
  | 'profit_analysis' 
  | 'business_advice' 
  | 'inventory_alert'
  | 'recipe_suggestion'
  | 'customer_analysis'
  | 'cost_optimization'
  | 'sales_forecast';

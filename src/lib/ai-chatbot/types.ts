/**
 * AI Chatbot Types
 * Shared types for chatbot modules
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

export interface IntentResult {
  intent: ChatIntent;
  confidence: number;
  entities: Record<string, any>;
  suggestedActions: string[];
}

export interface InventoryAnalysisResult {
  summary: string;
  alerts: string[];
  recommendations: string[];
  criticalItems: any[];
  aiAnalysis?: string;
}

export interface FinancialAnalysisResult {
  summary: string;
  metrics: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  };
  trends: string[];
  recommendations: string[];
  aiInsights?: string;
}

export interface BusinessAdviceResult {
  advice: string;
  keyPoints: string[];
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
}

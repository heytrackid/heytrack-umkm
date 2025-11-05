

// Chat System Types

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  context_snapshot: BusinessContext;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: MessageMetadata;
  created_at: string;
}

export interface MessageMetadata {
  model?: string;
  tokens?: number;
  response_time_ms?: number;
  cached?: boolean;
  fallback_used?: boolean;
  error?: string;
}

export interface ChatContextCache {
  id: string;
  user_id: string;
  context_type: ContextType;
  data: unknown;
  expires_at: string;
  created_at: string;
}

export type ContextType =
  | 'user_profile'
  | 'recipes'
  | 'ingredients'
  | 'orders'
  | 'hpp'
  | 'financial';

export interface BusinessContext {
  user?: UserProfile;
  recipes?: RecipeSummary[];
  ingredients?: IngredientSummary[];
  orders?: OrderSummary[];
  hpp?: HppSummary;
  financial?: FinancialSummary;
  businessInsights?: BusinessInsight[];
  quickStats?: QuickStat[];
  currentPage?: string;
  timestamp?: string;
}

export interface BusinessInsight {
  id: string;
  title: string;
  summary: string;
  category: 'inventory' | 'sales' | 'finance' | 'production' | 'other';
  confidence: number; // 0-1
  impact?: 'low' | 'medium' | 'high';
  actionItems?: string[];
  sources?: string[];
}

export interface QuickStat {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  delta?: number; // percentage delta
  context?: string;
}

export interface UserProfile {
  id: string;
  business_name?: string;
  preferences?: Record<string, unknown>;
}

export interface RecipeSummary {
  id: string;
  name: string;
  hpp: number;
  usage_count?: number;
}

export interface IngredientSummary {
  id: string;
  name: string;
  stock: number;
  unit: string;
  low_stock: boolean;
  last_purchase_price?: number;
}

export interface OrderSummary {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface HppSummary {
  average_hpp: number;
  trend: 'up' | 'down' | 'stable';
  alerts_count: number;
  last_updated: string;
}

export interface FinancialSummary {
  total_revenue: number;
  total_costs: number;
  profit: number;
  period: string;
}

export interface ChatSuggestion {
  id: string;
  text: string;
  category: 'page' | 'state' | 'common' | 'contextual';
  priority: number;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: Partial<BusinessContext>;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  suggestions?: ChatSuggestion[];
  metadata?: MessageMetadata;
}

export interface SessionListItem {
  id: string;
  title: string;
  last_message?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
  tags?: string[];
}

// API Response Types
export interface CreateSessionResponse {
  session: ChatSession;
}

export interface ListSessionsResponse {
  sessions: SessionListItem[];
  total: number;
}

export interface GetContextResponse {
  context: BusinessContext;
  cached: boolean;
  expires_at: string;
}

export interface GetSuggestionsResponse {
  suggestions: ChatSuggestion[];
}

// Error Types
export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export class SessionNotFoundError extends ChatError {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND', 404);
  }
}

export class RateLimitError extends ChatError {
  constructor() {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class AIServiceError extends ChatError {
  constructor(message: string) {
    super(message, 'AI_SERVICE_ERROR', 503);
  }
}

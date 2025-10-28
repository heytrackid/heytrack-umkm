# AI Chatbot Improvements - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ContextAwareChatbot (Enhanced)                             │
│  ├─ useContextAwareChat (Session + Context)                 │
│  ├─ useChatSuggestions (Dynamic prompts)                    │
│  └─ ChatFallback (Error handling)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  /api/ai/chat-enhanced (Streaming + Context)                │
│  /api/ai/sessions (CRUD)                                     │
│  /api/ai/context (Business data loader)                     │
│  /api/ai/suggestions (Dynamic prompts)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ChatSessionService (Persistence)                           │
│  BusinessContextService (Data aggregation)                  │
│  SuggestionEngine (Prompt generation)                       │
│  AIService (OpenAI/Anthropic with fallback)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  Supabase Tables:                                           │
│  ├─ chat_sessions (id, user_id, title, created_at)         │
│  ├─ chat_messages (id, session_id, role, content, ...)     │
│  └─ chat_context_cache (user_id, context_type, data, ...)  │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### chat_sessions
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  context_snapshot JSONB, -- Business context at session start
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
```

### chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- Token count, model used, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

### chat_context_cache
```sql
CREATE TABLE chat_context_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  context_type TEXT NOT NULL, -- 'recipes', 'ingredients', 'orders', etc.
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_context_cache_user_id ON chat_context_cache(user_id);
CREATE INDEX idx_chat_context_cache_expires_at ON chat_context_cache(expires_at);
```

## Business Context Loading

### Context Types
1. **User Profile**: Business name, preferences, settings
2. **Recipes**: Top 10 recipes by usage, recent recipes
3. **Ingredients**: Low stock items, recent purchases
4. **Orders**: Recent orders, pending orders
5. **HPP**: Latest HPP data, alerts
6. **Financial**: Current month summary

### Context Loading Strategy
```typescript
interface BusinessContext {
  user: UserProfile;
  recipes: RecipeSummary[];
  ingredients: IngredientSummary[];
  orders: OrderSummary[];
  hpp: HppSummary;
  financial: FinancialSummary;
  currentPage?: string; // For page-specific context
}

// Load priority: currentPage > recent activity > general stats
// Cache: 5 minutes TTL
// Fallback: Use stale cache if fresh load fails
```

## Dynamic Suggestions Engine

### Suggestion Categories
1. **Page-Specific**: Based on current route
2. **State-Specific**: Based on business state (low stock, high HPP, etc.)
3. **Common**: Frequently asked questions
4. **Contextual**: Based on recent activity

### Example Suggestions by Page
```typescript
const suggestionsByPage = {
  '/recipes': [
    'Resep mana yang paling menguntungkan?',
    'Bagaimana cara menurunkan HPP resep ini?',
    'Buat resep baru dengan bahan yang ada'
  ],
  '/ingredients': [
    'Bahan apa yang perlu direstock?',
    'Analisis tren harga bahan baku',
    'Supplier mana yang paling ekonomis?'
  ],
  '/orders': [
    'Pesanan mana yang paling urgent?',
    'Hitung estimasi waktu produksi',
    'Analisis profit pesanan bulan ini'
  ],
  '/hpp': [
    'Mengapa HPP naik minggu ini?',
    'Produk mana yang HPP-nya paling tinggi?',
    'Rekomendasi untuk menurunkan HPP'
  ]
};
```

## Fallback Strategy

### Levels of Degradation
1. **Primary**: OpenAI/Anthropic API
2. **Secondary**: Cached responses for common queries
3. **Tertiary**: Rule-based responses
4. **Final**: Helpful error message with manual links

### Error Handling
```typescript
class AIFallbackService {
  async getResponse(query: string, context: BusinessContext) {
    try {
      // Try primary AI service
      return await this.aiService.chat(query, context);
    } catch (error) {
      logger.warn('Primary AI failed, trying cache', { error });
      
      // Try cached response
      const cached = await this.getCachedResponse(query);
      if (cached) return cached;
      
      // Try rule-based response
      const ruleBased = this.getRuleBasedResponse(query, context);
      if (ruleBased) return ruleBased;
      
      // Return helpful error
      return this.getHelpfulError(query);
    }
  }
}
```

## Session Management

### Session Lifecycle
1. **Create**: Auto-create on first message
2. **Update**: Update title based on first message
3. **List**: Show recent sessions in sidebar
4. **Resume**: Load messages when session selected
5. **Delete**: Soft delete with cascade to messages

### Session Limits
- Max 50 sessions per user
- Auto-delete sessions older than 90 days
- Max 100 messages per session
- Truncate old messages if limit exceeded

## Performance Optimizations

### Caching Strategy
```typescript
// Business context cache
const CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Response cache for common queries
const RESPONSE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Session list cache
const SESSION_LIST_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
```

### Lazy Loading
- Lazy load chat component
- Lazy load session history
- Stream AI responses
- Paginate message history

### Debouncing
- Debounce suggestion updates: 500ms
- Debounce context refresh: 1000ms
- Throttle typing indicators: 300ms

## Security Considerations

### RLS Policies
- All chat tables enforce user_id isolation
- No cross-user data access
- Soft deletes for audit trail

### Data Privacy
- No PII in context snapshots
- Sanitize business data before sending to AI
- Option to disable context sharing

### Rate Limiting
- Max 50 messages per hour per user
- Max 10 sessions created per day
- Exponential backoff on errors

## UI/UX Design

### Chat Interface
- Floating button (bottom-right)
- Expandable panel (400px width)
- Message history with infinite scroll
- Typing indicators
- Error states with retry

### Session Management
- Session list in sidebar
- Quick actions (rename, delete)
- Search sessions
- Export conversation

### Suggestions
- Chip-based UI below input
- Rotate suggestions every 10s
- Click to populate input
- Dismiss individual suggestions

## Monitoring & Logging

### Metrics to Track
- AI response time (p50, p95, p99)
- Cache hit rate
- Fallback trigger rate
- Session creation rate
- Message volume per session

### Logging
- All AI requests/responses
- Context loading performance
- Cache operations
- Error rates by type

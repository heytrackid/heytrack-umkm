# 🤖 AI Chatbot Audit - HeyTrack

**Tanggal:** 25 Oktober 2025  
**Status:** ⚠️ NEEDS IMPROVEMENT

---

## 📊 Current Status

### ✅ What's Already Working:

1. **NLP Processor** (`src/lib/nlp-processor.ts`)
   - ✅ OpenRouter API integration
   - ✅ Intent detection structure
   - ✅ Entity extraction framework
   - ✅ Sentiment analysis structure

2. **AI Chatbot Service** (`src/lib/ai-chatbot-service.ts`)
   - ✅ Database integration (Supabase)
   - ✅ User-specific data filtering (RLS)
   - ✅ Inventory insights
   - ✅ Recipe suggestions
   - ✅ Financial analysis
   - ✅ Order insights

3. **UI Component** (`src/app/ai-chatbot/page.tsx`)
   - ✅ Chat interface
   - ✅ Message history
   - ✅ Suggestions
   - ✅ Loading states

---

## ⚠️ What's Missing:

### 1. Context Loss Issue ❌

**Problem:**
```typescript
// Current: No conversation history passed to AI
const response = await AIResponseGenerator.generateResponse(query, businessData)
// ❌ AI doesn't know previous messages!
```

**Impact:**
- User asks: "Berapa stok tepung?"
- AI answers: "50 kg"
- User asks: "Berapa harganya?" 
- AI confused: "Harga apa?" ❌ (should know it's about tepung!)

---

### 2. No Conversation Memory ❌

**Problem:**
```typescript
// Current: Messages only stored in React state
const [messages, setMessages] = useState<Message[]>([...])
// ❌ Lost on page refresh!
// ❌ Not persisted to database!
```

**Impact:**
- User refreshes page → conversation lost
- Can't review past conversations
- No learning from user patterns

---

### 3. Limited Context Awareness ❌

**Problem:**
```typescript
// Current: Only passes current query
const response = await processAIQuery(textToSend)
// ❌ No previous context!
// ❌ No user preferences!
// ❌ No conversation flow!
```

**Impact:**
- Can't handle follow-up questions
- Can't maintain conversation flow
- Can't personalize responses

---

### 4. No Database Context Integration ❌

**Problem:**
```typescript
// Current: Fetches data but doesn't maintain context
const businessData = {
  inventory: await getInventoryInsights(query, userId),
  recipes: await getRecipeSuggestions(query, userId),
  // ...
}
// ❌ Fetches everything every time!
// ❌ No caching!
// ❌ No smart context selection!
```

**Impact:**
- Slow responses (fetches all data)
- Expensive API calls
- Poor user experience

---

## 🎯 Required Improvements

### 1. Add Conversation History to Database

**Create Table:**
```sql
CREATE TABLE conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB, -- Store relevant context
  metadata JSONB, -- Store intent, entities, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_history_user_session 
ON conversation_history(user_id, session_id, created_at);

-- Enable RLS
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
ON conversation_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversations"
ON conversation_history FOR INSERT
WITH CHECK (user_id = auth.uid());
```

---

### 2. Implement Context-Aware AI Service

**Enhanced Service:**
```typescript
// src/lib/ai-chatbot-enhanced.ts

interface ConversationContext {
  sessionId: string
  userId: string
  recentMessages: Message[]
  currentTopic?: string
  entities: Map<string, any>
  userPreferences?: Record<string, any>
}

export class ContextAwareAI {
  private context: ConversationContext
  
  constructor(userId: string, sessionId: string) {
    this.context = {
      sessionId,
      userId,
      recentMessages: [],
      entities: new Map()
    }
  }
  
  async loadConversationHistory(limit: number = 10) {
    // Load recent messages from database
    const { data } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('user_id', this.context.userId)
      .eq('session_id', this.context.sessionId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    this.context.recentMessages = data || []
  }
  
  async processQuery(query: string): Promise<AIResponse> {
    // 1. Load conversation history
    await this.loadConversationHistory()
    
    // 2. Extract entities from current query
    const entities = await this.extractEntities(query)
    
    // 3. Merge with context entities
    this.updateContextEntities(entities)
    
    // 4. Determine what data is needed based on context
    const requiredData = await this.determineRequiredData(query)
    
    // 5. Fetch only relevant data
    const businessData = await this.fetchRelevantData(requiredData)
    
    // 6. Build context-aware prompt
    const prompt = this.buildContextAwarePrompt(query, businessData)
    
    // 7. Call AI with full context
    const response = await this.callAIWithContext(prompt)
    
    // 8. Save to conversation history
    await this.saveToHistory(query, response)
    
    return response
  }
  
  private buildContextAwarePrompt(query: string, data: any): string {
    const conversationHistory = this.context.recentMessages
      .slice(0, 5) // Last 5 messages
      .reverse()
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
    
    const contextEntities = Array.from(this.context.entities.entries())
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n')
    
    return `
# Conversation Context
${conversationHistory}

# Current Entities in Context
${contextEntities}

# Current Business Data
${JSON.stringify(data, null, 2)}

# Current User Query
${query}

# Instructions
- Use conversation history to understand context
- Reference previous entities when relevant
- Provide specific, actionable answers
- Maintain conversation flow
- Be concise and helpful
`
  }
  
  private async determineRequiredData(query: string): Promise<string[]> {
    // Smart detection of what data is needed
    const lowerQuery = query.toLowerCase()
    const required: string[] = []
    
    // Check if query is about inventory
    if (lowerQuery.match(/stok|bahan|inventory|ingredient/)) {
      required.push('inventory')
    }
    
    // Check if query is about recipes
    if (lowerQuery.match(/resep|recipe|produk|product/)) {
      required.push('recipes')
    }
    
    // Check if query is about finances
    if (lowerQuery.match(/profit|untung|rugi|keuangan|financial|hpp/)) {
      required.push('financial')
    }
    
    // Check if query is about orders
    if (lowerQuery.match(/pesanan|order|customer|pelanggan/)) {
      required.push('orders')
    }
    
    // Check context for implicit references
    if (this.context.currentTopic && required.length === 0) {
      required.push(this.context.currentTopic)
    }
    
    return required
  }
  
  private async fetchRelevantData(required: string[]): Promise<any> {
    const data: any = {}
    
    // Only fetch what's needed!
    if (required.includes('inventory')) {
      data.inventory = await getInventoryInsights('', this.context.userId)
    }
    
    if (required.includes('recipes')) {
      data.recipes = await getRecipeSuggestions('', this.context.userId)
    }
    
    if (required.includes('financial')) {
      data.financial = await getFinancialAnalysis('', this.context.userId)
    }
    
    if (required.includes('orders')) {
      data.orders = await getOrderInsights('', this.context.userId)
    }
    
    return data
  }
  
  private async saveToHistory(query: string, response: AIResponse) {
    await supabase.from('conversation_history').insert([
      {
        user_id: this.context.userId,
        session_id: this.context.sessionId,
        role: 'user',
        content: query,
        context: {
          entities: Array.from(this.context.entities.entries()),
          topic: this.context.currentTopic
        }
      },
      {
        user_id: this.context.userId,
        session_id: this.context.sessionId,
        role: 'assistant',
        content: response.message,
        metadata: {
          suggestions: response.suggestions,
          data: response.data
        }
      }
    ])
  }
}
```

---

### 3. Enhanced NLP with Context

**Improved NLP Processor:**
```typescript
// src/lib/nlp-context-processor.ts

export class ContextualNLPProcessor {
  static async analyzeWithContext(
    query: string,
    conversationHistory: Message[],
    entities: Map<string, any>
  ): Promise<NLPAnalysis> {
    // 1. Resolve pronouns and references
    const resolvedQuery = this.resolveReferences(query, conversationHistory, entities)
    
    // 2. Extract intent with context
    const intent = await this.extractIntent(resolvedQuery, conversationHistory)
    
    // 3. Extract entities
    const newEntities = await this.extractEntities(resolvedQuery)
    
    // 4. Merge with context entities
    const mergedEntities = this.mergeEntities(entities, newEntities)
    
    return {
      originalQuery: query,
      resolvedQuery,
      intent,
      entities: mergedEntities,
      confidence: this.calculateConfidence(intent, mergedEntities)
    }
  }
  
  private static resolveReferences(
    query: string,
    history: Message[],
    entities: Map<string, any>
  ): string {
    let resolved = query
    
    // Resolve "itu", "nya", "tersebut"
    if (query.match(/\b(itu|nya|tersebut)\b/i)) {
      const lastEntity = this.getLastMentionedEntity(history)
      if (lastEntity) {
        resolved = resolved.replace(/\b(itu|nya|tersebut)\b/gi, lastEntity)
      }
    }
    
    // Resolve "berapa harganya" -> "berapa harga [last_product]"
    if (query.match(/berapa harga(nya)?/i) && !query.match(/\w+\s+harga/)) {
      const lastProduct = entities.get('last_product')
      if (lastProduct) {
        resolved = `berapa harga ${lastProduct}`
      }
    }
    
    return resolved
  }
  
  private static getLastMentionedEntity(history: Message[]): string | null {
    // Look through recent messages for entities
    for (let i = history.length - 1; i >= 0; i--) {
      const message = history[i]
      // Extract product/ingredient names
      const match = message.content.match(/\b(tepung|gula|telur|roti|kue)\b/i)
      if (match) {
        return match[1]
      }
    }
    return null
  }
}
```

---

## 🚀 Implementation Plan

### Phase 1: Database Setup (30 min)
1. Create conversation_history table
2. Add RLS policies
3. Create indexes

### Phase 2: Context Service (1 hour)
1. Implement ContextAwareAI class
2. Add conversation history loading
3. Add entity tracking
4. Add smart data fetching

### Phase 3: Enhanced NLP (1 hour)
1. Implement reference resolution
2. Add context-aware intent detection
3. Add entity merging

### Phase 4: UI Integration (30 min)
1. Add session management
2. Integrate ContextAwareAI
3. Add conversation persistence
4. Add "Continue conversation" feature

---

## 📊 Expected Improvements

### Before:
```
User: "Berapa stok tepung?"
AI: "Stok tepung: 50 kg"

User: "Berapa harganya?"
AI: "Harga apa yang Anda maksud?" ❌
```

### After:
```
User: "Berapa stok tepung?"
AI: "Stok tepung: 50 kg"

User: "Berapa harganya?"
AI: "Harga tepung saat ini: Rp 15.500/kg" ✅
(AI remembers we're talking about tepung!)
```

---

## ✅ Benefits

1. **Context Awareness** ✅
   - Remembers conversation
   - Understands follow-up questions
   - Maintains topic flow

2. **No Context Loss** ✅
   - Persisted to database
   - Survives page refresh
   - Can review history

3. **Better Performance** ✅
   - Only fetches needed data
   - Caching opportunities
   - Faster responses

4. **Smarter AI** ✅
   - Understands references
   - Resolves pronouns
   - Contextual responses

5. **Better UX** ✅
   - Natural conversations
   - Less repetition
   - More helpful

---

## 🎯 Recommendation

**IMPLEMENT IMPROVEMENTS!**

Current chatbot works but has significant limitations. With these improvements:
- ✅ Natural conversation flow
- ✅ No context loss
- ✅ Better user experience
- ✅ Smarter responses
- ✅ Database integration

**Estimated Time:** 3-4 hours  
**Impact:** HIGH  
**Priority:** MEDIUM (works now, but can be much better)

---

**Audit Completed:** 25 Oktober 2025  
**Status:** ⚠️ FUNCTIONAL BUT NEEDS IMPROVEMENT  
**Recommendation:** IMPLEMENT CONTEXT AWARENESS

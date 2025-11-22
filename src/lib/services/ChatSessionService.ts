import type { Json } from '@/types/database'
import type {
  BusinessContext,
  ChatMessage,
  ChatSession,
  MessageMetadata,
  SessionListItem,
} from '@/types/features/chat'
import type { TypedSupabaseClient } from '@/types/type-utilities'

import { logger } from '@/lib/logger'

class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`)
    this.name = 'SessionNotFoundError'
  }
}

// Chat Session Service - Manages chat session persistence

interface CachedConversationContext {
  messages: ChatMessage[]
  summary: string
  topics: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  timestamp: number
  messageCount: number
}

export class ChatSessionService {
  private static readonly contextCache = new Map<string, CachedConversationContext>()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  /**
   * Create a new chat session
   */
  static async createSession(
    supabase: TypedSupabaseClient,
    userId: string,
    title?: string,
    contextSnapshot?: Record<string, unknown>
  ): Promise<ChatSession> {

    const serializedSnapshot = contextSnapshot ? JSON.parse(JSON.stringify(contextSnapshot)) as Json : null

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        ...(title && { title }),
        context_snapshot: serializedSnapshot,
      })
      .select()
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to create chat session');
      throw new Error('Failed to create chat session');
    }

    logger.info({ sessionId: data.id, userId }, 'Chat session created');

    return {
      ...data,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
      context_snapshot: (data.context_snapshot as BusinessContext | null) ?? {},
    }
  }

  /**
   * Get a session by ID
   */
  static async getSession(
    supabase: TypedSupabaseClient,
    sessionId: string,
    userId: string
  ): Promise<ChatSession> {

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, user_id, title, context_snapshot, created_at, updated_at, deleted_at')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new SessionNotFoundError(sessionId);
    }

    return {
      ...data,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
      context_snapshot: (data.context_snapshot as BusinessContext | null) ?? {},
    }
  }

  /**
   * List user's sessions
   */
  static async listSessions(
    supabase: TypedSupabaseClient,
    userId: string,
    limit = 50
  ): Promise<SessionListItem[]> {

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error({ error, userId }, 'Failed to list sessions');
      throw new Error('Failed to list sessions');
    }

    // Get message counts and last messages
    const sessionIds = sessions.map((s) => s['id']);
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('session_id, content, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    const sessionMap = new Map<string, SessionListItem>();
    sessions.forEach((session) => {
      sessionMap.set(session['id'], {
        ...session,
        created_at: session.created_at ?? new Date().toISOString(),
        updated_at: session.updated_at ?? new Date().toISOString(),
        message_count: 0,
      });
    });

    messages?.forEach((msg) => {
      const session = sessionMap.get(msg.session_id);
      if (session) {
        session.message_count++;
        session.last_message ??= msg.content.substring(0, 100);
      }
    });

    return Array.from(sessionMap.values());
  }

  /**
   * Get chatbot analytics for a user
   */
  static async getChatAnalytics(
    supabase: TypedSupabaseClient,
    userId: string,
    days = 30
  ): Promise<{
    totalSessions: number
    totalMessages: number
    avgSessionLength: number
    topTopics: Array<{ topic: string; count: number }>
    responseTimes: { avg: number; min: number; max: number }
    userSatisfaction: number // 1-5 scale based on sentiment
  }> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get sessions in date range
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        avgSessionLength: 0,
        topTopics: [],
        responseTimes: { avg: 0, min: 0, max: 0 },
        userSatisfaction: 3
      }
    }

    const sessionIds = sessions.map(s => s.id)

    // Get messages for analytics
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('content, metadata, created_at, role')
      .in('session_id', sessionIds)
      .gte('created_at', startDate.toISOString())

    const totalMessages = messages?.length ?? 0
    const avgSessionLength = totalMessages / sessions.length

    // Analyze topics
    const topics = this.extractTopics(messages?.map(m => ({ content: m.content } as ChatMessage)) ?? [])
    const topicCount = new Map<string, number>()
    topics.forEach(topic => {
      topicCount.set(topic, (topicCount.get(topic) ?? 0) + 1)
    })
    const topTopics = Array.from(topicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }))

    // Analyze response times
    const responseTimes = messages
      ?.filter(m => m.metadata && typeof m.metadata === 'object' && 'response_time_ms' in m.metadata)
      .map(m => (m.metadata as MessageMetadata).response_time_ms)
      .filter(time => typeof time === 'number') ?? []

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0

    // Calculate user satisfaction based on conversation patterns
    const mappedMessages = (messages ?? []).map(m => {
      const msg: { role: string; content?: string } = {
        role: m.role || 'unknown',
      }
      if (m.content) msg.content = m.content
      return msg
    })
    const userSatisfaction = this.calculateUserSatisfaction(mappedMessages)

    return {
      totalSessions: sessions.length,
      totalMessages,
      avgSessionLength,
      topTopics,
      responseTimes: {
        avg: Math.round(avgResponseTime),
        min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0
      },
      userSatisfaction
    }
  }

  /**
   * Calculate user satisfaction score (1-5)
   */
  static calculateUserSatisfaction(messages: Array<{ role: string; content?: string }>): number {
    if (messages.length === 0) return 3

    let score = 3 // Neutral baseline

    // Analyze conversation patterns
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')

    // Response rate (higher is better)
    const responseRate = assistantMessages.length / Math.max(userMessages.length, 1)
    if (responseRate > 0.8) score += 0.5
    else if (responseRate < 0.5) score -= 0.5

    // Conversation length (longer conversations might indicate satisfaction)
    if (messages.length > 10) score += 0.3

    // Error patterns (fewer errors = higher satisfaction)
    const errorMessages = messages.filter(m =>
      m.content?.toLowerCase().includes('error') ||
      m.content?.toLowerCase().includes('maaf') ||
      m.content?.toLowerCase().includes('gagal')
    )
    score -= (errorMessages.length * 0.2)

    return Math.max(1, Math.min(5, score))
  }

  /**
   * Update session title
   */
  static async updateSessionTitle(
    supabase: TypedSupabaseClient,
    sessionId: string,
    userId: string,
    title: string
  ): Promise<void> {

    const { error } = await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, sessionId }, 'Failed to update session title');
      throw new Error('Failed to update session title');
    }

    logger.info({ sessionId, title }, 'Session title updated');
  }

  /**
   * Soft delete a session
   */
  static async deleteSession(
    supabase: TypedSupabaseClient,
    sessionId: string,
    userId: string
  ): Promise<void> {

    const { error } = await supabase
      .from('chat_sessions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, sessionId }, 'Failed to delete session');
      throw new Error('Failed to delete session');
    }

    logger.info({ sessionId, userId }, 'Session deleted');
  }

  /**
   * Add a message to a session
   */
  static async addMessage(
    supabase: TypedSupabaseClient,
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: MessageMetadata
  ): Promise<ChatMessage> {

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        metadata: JSON.parse(JSON.stringify(metadata)) as Json,
      })
      .select()
      .single();

    if (error) {
      logger.error({ error, sessionId }, 'Failed to add message');
      throw new Error('Failed to add message');
    }

    // Update session's updated_at timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    // Invalidate context cache since conversation has changed
    this.invalidateContextCache(sessionId);

    return {
      ...data,
      metadata: (data.metadata as MessageMetadata | null) ?? {},
    } as ChatMessage
  }

  /**
   * Get conversation context for AI processing
   * Returns recent messages with context awareness
   */
  static async getConversationContext(
    supabase: TypedSupabaseClient,
    sessionId: string,
    userId: string,
    maxMessages = 20
  ): Promise<{
    messages: ChatMessage[]
    summary: string
    topics: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
  }> {
    const cacheKey = `${sessionId}:${maxMessages}`
    const cached = this.contextCache.get(cacheKey)
    const now = Date.now()

    // Check if cache is valid
    if (cached && (now - cached.timestamp) < this.CACHE_TTL && cached.messageCount === maxMessages) {
      return {
        messages: cached.messages,
        summary: cached.summary,
        topics: cached.topics,
        sentiment: cached.sentiment
      }
    }

    const messages = await this.getMessages(supabase, sessionId, userId, maxMessages)

    // Generate conversation summary
    const summary = this.generateConversationSummary(messages)

    // Extract topics and sentiment
    const topics = this.extractTopics(messages)
    const sentiment = this.analyzeConversationSentiment(messages)

    // Cache the result
    const context: CachedConversationContext = {
      messages,
      summary,
      topics,
      sentiment,
      timestamp: now,
      messageCount: maxMessages
    }
    this.contextCache.set(cacheKey, context)

    // Clean up old cache entries periodically
    if (this.contextCache.size > 50) {
      this.cleanupContextCache()
    }

    return {
      messages,
      summary,
      topics,
      sentiment
    }
  }

  /**
   * Generate conversation summary for context
   */
  private static generateConversationSummary(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'Percakapan baru dimulai'

    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')

    const topics = this.extractTopics(messages)
    const mainTopics = topics.slice(0, 3).join(', ')

    return `Percakapan tentang: ${mainTopics}. ${userMessages.length} pertanyaan user, ${assistantMessages.length} respons AI.`
  }

  /**
   * Extract main topics from conversation
   */
  static extractTopics(messages: ChatMessage[]): string[] {
    const topics = new Set<string>()
    const content = messages.map(m => m.content).join(' ').toLowerCase()

    const topicKeywords = {
      inventory: ['stok', 'bahan', 'inventory', 'persediaan'],
      hpp: ['hpp', 'biaya', 'cost', 'harga pokok'],
      profit: ['profit', 'untung', 'laba', 'pendapatan'],
      recipes: ['resep', 'recipe', 'produk', 'menu'],
      orders: ['pesanan', 'order', 'customer', 'pelanggan'],
      pricing: ['harga', 'pricing', 'tarif', 'biaya'],
      marketing: ['marketing', 'promo', 'iklan', 'penjualan']
    }

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.add(topic)
      }
    })

    return Array.from(topics)
  }

  /**
   * Analyze overall conversation sentiment
   */
  private static analyzeConversationSentiment(messages: ChatMessage[]): 'positive' | 'neutral' | 'negative' {
    const sentiments: number[] = messages.map(m => {
      const content = m.content.toLowerCase()
      if (content.includes('bagus') || content.includes('baik') || content.includes('mantap')) return 1
      if (content.includes('buruk') || content.includes('jelek') || content.includes('masalah')) return -1
      return 0
    })

    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length

    if (avgSentiment > 0.2) return 'positive'
    if (avgSentiment < -0.2) return 'negative'
    return 'neutral'
  }

  /**
   * Get messages for a session
   */
  static async getMessages(
    supabase: TypedSupabaseClient,
    sessionId: string,
    userId: string,
    limit: number = 1000
  ): Promise<ChatMessage[]> {

    // Verify session belongs to user
    await this.getSession(supabase, sessionId, userId);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, session_id, role, content, metadata, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error({ error, sessionId }, 'Failed to get messages');
      throw new Error('Failed to get messages');
    }

    return (data || []).map(message => ({
      ...message,
      metadata: (message['metadata'] as MessageMetadata | null) ?? {},
    })) as ChatMessage[]
  }

  /**
   * Generate session title from first message
   */
  static generateTitle(firstMessage: string): string {
    const maxLength = 50;
    const cleaned = firstMessage.trim().replace(/\s+/g, ' ');

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    return `${cleaned.substring(0, maxLength - 3)}...`;
  }

  /**
   * Clean up expired context cache entries
   */
  private static cleanupContextCache(): void {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, cached] of this.contextCache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        toDelete.push(key)
      }
    }

    toDelete.forEach(key => this.contextCache.delete(key))

    // If still too large, remove oldest entries (LRU-style)
    if (this.contextCache.size > 50) {
      const entries = Array.from(this.contextCache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      const toRemove = entries.slice(0, this.contextCache.size - 40)
      toRemove.forEach(([key]) => this.contextCache.delete(key))
    }
  }

  /**
   * Invalidate context cache for a session
   */
  static invalidateContextCache(sessionId: string): void {
    const keysToDelete = Array.from(this.contextCache.keys()).filter(key =>
      key.startsWith(`${sessionId}:`)
    )
    keysToDelete.forEach(key => this.contextCache.delete(key))
  }
}

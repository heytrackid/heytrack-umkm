// Chat Session Service - Manages chat session persistence

import { createClient } from '@/utils/supabase/server';
import type {
  ChatSession,
  ChatMessage,
  SessionListItem,
  BusinessContext,
} from '@/types/features/chat';
import { SessionNotFoundError } from '@/types/features/chat';
import { logger } from '@/lib/logger';

export class ChatSessionService {
  /**
   * Create a new chat session
   */
  static async createSession(
    userId: string,
    title = 'New Conversation',
    contextSnapshot: BusinessContext = {}
  ): Promise<ChatSession> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title,
        context_snapshot: contextSnapshot,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create chat session', { error, userId });
      throw new Error('Failed to create chat session');
    }

    logger.info('Chat session created', { sessionId: data.id, userId });
    return data;
  }

  /**
   * Get a session by ID
   */
  static async getSession(
    sessionId: string,
    userId: string
  ): Promise<ChatSession> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new SessionNotFoundError(sessionId);
    }

    return data;
  }

  /**
   * List user's sessions
   */
  static async listSessions(
    userId: string,
    limit = 20
  ): Promise<SessionListItem[]> {
    const supabase = await createClient();

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to list sessions', { error, userId });
      throw new Error('Failed to list sessions');
    }

    // Get message counts and last messages
    const sessionIds = sessions.map((s) => s.id);
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('session_id, content, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    const sessionMap = new Map<string, SessionListItem>();
    sessions.forEach((session) => {
      sessionMap.set(session.id, {
        ...session,
        message_count: 0,
        last_message: undefined,
      });
    });

    messages?.forEach((msg) => {
      const session = sessionMap.get(msg.session_id);
      if (session) {
        session.message_count++;
        if (!session.last_message) {
          session.last_message = msg.content.substring(0, 100);
        }
      }
    });

    return Array.from(sessionMap.values());
  }

  /**
   * Update session title
   */
  static async updateSessionTitle(
    sessionId: string,
    userId: string,
    title: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to update session title', { error, sessionId });
      throw new Error('Failed to update session title');
    }

    logger.info('Session title updated', { sessionId, title });
  }

  /**
   * Soft delete a session
   */
  static async deleteSession(
    sessionId: string,
    userId: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('chat_sessions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to delete session', { error, sessionId });
      throw new Error('Failed to delete session');
    }

    logger.info('Session deleted', { sessionId, userId });
  }

  /**
   * Add a message to a session
   */
  static async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<ChatMessage> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to add message', { error, sessionId });
      throw new Error('Failed to add message');
    }

    // Update session's updated_at timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return data;
  }

  /**
   * Get messages for a session
   */
  static async getMessages(
    sessionId: string,
    userId: string,
    limit = 100
  ): Promise<ChatMessage[]> {
    const supabase = await createClient();

    // Verify session belongs to user
    await this.getSession(sessionId, userId);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error('Failed to get messages', { error, sessionId });
      throw new Error('Failed to get messages');
    }

    return data || [];
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
    
    return `${cleaned.substring(0, maxLength - 3)  }...`;
  }
}

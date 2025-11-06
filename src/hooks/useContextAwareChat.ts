'use client'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook');
import { getErrorMessage } from '@/lib/type-guards';
import type { ChatMessage, ChatSuggestion, SessionListItem } from '@/types/features/chat';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * React Hook for Context-Aware AI Chat with Session Persistence
 */


interface UseContextAwareChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  sessions: SessionListItem[];
  suggestions: ChatSuggestion[];
  sendMessage: (message: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

export function useContextAwareChat(): UseContextAwareChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const pathname = usePathname();

  // Load sessions on mount
  useEffect(() => {
    void loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load suggestions when page changes
  useEffect(() => {
    void loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/sessions', {
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      setSessions(data.sessions ?? []);
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to load sessions');
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/ai/suggestions?page=${encodeURIComponent(pathname)}`,
        {
          credentials: 'include', // Include cookies for authentication
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions ?? []);
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to load suggestions');
    }
  }, [pathname]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {return;}

      setIsLoading(true);
      setError(null);

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: sessionId ?? '',
        role: 'user',
        content: message,
        metadata: {},
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch('/api/ai/chat-enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            session_id: sessionId,
            currentPage: pathname,
          }),
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message ?? 'Failed to send message');
        }

        const data = await response.json();

        // Update session ID if new
        if (data.session_id && data.session_id !== sessionId) {
          setSessionId(data.session_id);
        }

        // Add AI response
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          session_id: data.session_id,
          role: 'assistant',
          content: data.message,
          metadata: data.metadata ?? {},
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Update suggestions
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }

        // Reload sessions to update list (without triggering re-render loop)
        try {
          const sessionsResponse = await fetch('/api/ai/sessions', {
            credentials: 'include', // Include cookies for authentication
          });
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            setSessions(sessionsData.sessions ?? []);
          }
        } catch (error: unknown) {
          const message = getErrorMessage(error)
          logger.error({ error: message }, 'Failed to reload sessions');
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error) || 'Terjadi kesalahan';
        setError(errorMessage);
        logger.error({ error: errorMessage }, 'Failed to send message');

        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, pathname]
  );

  const loadSession = useCallback(async (newSessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/sessions/${newSessionId}`, {
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to load session');
      }

      const data = await response.json();
      setSessionId(newSessionId);
      setMessages(data.messages ?? []);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error) || 'Failed to load session';
      setError(errorMessage);
      logger.error({ error: errorMessage }, 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setError(null);
    return Promise.resolve();
  }, []);

  const deleteSession = useCallback(
    async (sessionIdToDelete: string) => {
      try {
        const response = await fetch(`/api/ai/sessions/${sessionIdToDelete}`, {
          method: 'DELETE',
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error('Failed to delete session');
        }

        // If deleted session is current, create new session
        if (sessionIdToDelete === sessionId) {
          setSessionId(null);
          setMessages([]);
          setError(null);
        }

        // Reload sessions inline to avoid dependency loop
        try {
          const sessionsResponse = await fetch('/api/ai/sessions', {
            credentials: 'include', // Include cookies for authentication
          });
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            setSessions(sessionsData.sessions ?? []);
          }
        } catch (error: unknown) {
          const message = getErrorMessage(error)
          logger.error({ error: message }, 'Failed to reload sessions');
        }
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        logger.error({ error: message }, 'Failed to delete session');
        throw error;
      }
    },
    [sessionId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    suggestions,
    sendMessage,
    loadSession,
    createNewSession,
    deleteSession,
    clearError,
  };
}

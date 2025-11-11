export const runtime = 'nodejs'

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'

const AnalyticsQuerySchema = z.object({
  days: z.number().min(1).max(365).default(30)
}).strict()

async function authenticateAdmin(supabase: SupabaseClient): Promise<{ userId: string }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
  }

  // Check if user is admin (you might want to implement proper admin checking)
  // For now, we'll assume the user is authenticated and can access analytics
  return { userId: user.id }
}

async function getChatbotAnalytics(days: number): Promise<{
  totalSessions: number
  totalMessages: number
  avgSessionLength: number
  topTopics: Array<{ topic: string; count: number }>
  responseTimes: { avg: number; min: number; max: number }
  userSatisfaction: number
  fallbackUsage: number
  popularSuggestions: Array<{ suggestion: string; usage: number }>
}> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get all sessions in date range
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id, created_at')
    .gte('created_at', startDate.toISOString())

  const totalSessions = sessions?.length ?? 0
  const sessionIds = sessions?.map(s => s.id) ?? []

  // Get all messages in date range
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id, session_id, content, metadata, created_at, role')
    .in('session_id', sessionIds)
    .gte('created_at', startDate.toISOString())

  const totalMessages = messages?.length ?? 0
  const avgSessionLength = totalSessions > 0 ? totalMessages / totalSessions : 0

  // Analyze topics
  const chatMessages = messages?.map(m => ({
    id: m.id || '',
    session_id: m.session_id || '',
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
    metadata: (m.metadata as Record<string, unknown>) || {},
    created_at: m.created_at
  })) ?? []
  const topics = ChatSessionService.extractTopics(chatMessages)
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
    .map(m => (m.metadata as Record<string, unknown>)['response_time_ms'])
    .filter((time): time is number => typeof time === 'number') ?? []

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0

  // Calculate user satisfaction
  const mappedMessages = (messages ?? []).map(m => ({
    role: m.role || 'unknown',
    content: m.content || undefined
  }))
  const userSatisfaction = ChatSessionService.calculateUserSatisfaction(mappedMessages)

  // Calculate fallback usage
  const fallbackMessages = messages?.filter(m =>
    m.metadata && typeof m.metadata === 'object' && 'fallback_used' in m.metadata && (m.metadata as Record<string, unknown>)['fallback_used']
  ) ?? []
  const fallbackUsage = totalMessages > 0 ? (fallbackMessages.length / totalMessages) * 100 : 0

  // Analyze popular suggestions (this would require additional tracking)
  // For now, return empty array
  const popularSuggestions: Array<{ suggestion: string; usage: number }> = []

  return {
    totalSessions,
    totalMessages,
    avgSessionLength,
    topTopics,
    responseTimes: {
      avg: Math.round(avgResponseTime),
      min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0
    },
    userSatisfaction,
    fallbackUsage: Math.round(fallbackUsage),
    popularSuggestions
  }
}

async function adminChatbotAnalyticsGET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    await authenticateAdmin(supabase)

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    const validatedDays = AnalyticsQuerySchema.parse({ days }).days

    const analytics = await getChatbotAnalytics(validatedDays)

    apiLogger.info({ days: validatedDays }, 'Chatbot analytics retrieved')

    return NextResponse.json(analytics)
  } catch (error) {
    apiLogger.error({ error }, 'Error retrieving chatbot analytics')
    return handleAPIError(error, 'GET /api/admin/chatbot-analytics')
  }
}

export const GET = withSecurity(adminChatbotAnalyticsGET, SecurityPresets.enhanced())
/**
 * Enhanced AI Chat API with Context Awareness
 */

import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ContextAwareAI } from '@/lib/ai-chatbot-enhanced'
import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { query, sessionId } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Initialize context-aware AI
    const ai = new ContextAwareAI(user.id, sessionId)
    await ai.initializeSession()

    // Process query with full context
    const response = await ai.processQuery(query)

    return NextResponse.json({
      success: true,
      data: response,
      sessionId: ai['context'].sessionId,
    })

  } catch (error) {
    apiLogger.error({ error }, 'Error in enhanced chat API')
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get conversation sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ai = new ContextAwareAI(user.id)
    const sessions = await ai.getConversationSessions()

    return NextResponse.json({
      success: true,
      data: sessions,
    })

  } catch (error) {
    apiLogger.error({ error }, 'Error getting conversation sessions')
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

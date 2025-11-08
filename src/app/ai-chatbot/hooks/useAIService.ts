import { apiLogger } from '@/lib/logger'
import { useSupabase } from '@/providers/SupabaseProvider'



export function useAIService(): { processAIQuery: (query: string) => Promise<{ message: string; suggestions: string[]; data?: { businessContext: unknown } }> } {
  const { supabase } = useSupabase()


  const processAIQuery = async (query: string): Promise<{ message: string; suggestions: string[]; data?: { businessContext: unknown } }> => {
    // Get current user ID for database filtering
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    if (!userId) {
      apiLogger.warn('AI Chatbot accessed without authentication')
      return {
        message: '❌ **Error:** Anda perlu login untuk menggunakan AI Chatbot',
        suggestions: ['Login terlebih dahulu', 'Refresh halaman']
      }
    }

    try {
      const response = await fetch('/api/ai/chat-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          currentPage: window.location.pathname,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()

      return {
        message: data.message,
        suggestions: data.suggestions || [],
        data: data.metadata ? { businessContext: data.metadata } : undefined,
      }
    } catch (error) {
      apiLogger.error({ error, query }, 'AI Chatbot API call failed')
      return {
        message: 'Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi.',
        suggestions: ['Coba lagi', 'Refresh halaman']
      }
    }
  }

  return { processAIQuery }
}

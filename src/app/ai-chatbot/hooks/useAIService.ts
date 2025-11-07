import { apiLogger } from '@/lib/logger'
import { useSupabase } from '@/providers/SupabaseProvider'



export function useAIService(): { processAIQuery: (query: string) => Promise<{ message: string; suggestions: string[]; data?: { businessContext: unknown } }> } {
  const { supabase } = useSupabase()


  const processAIQuery = async (_query: string): Promise<{ message: string; suggestions: string[]; data?: { businessContext: unknown } }> => {
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

    return {
      message: 'Test response',
      suggestions: []
    }
  }

  return { processAIQuery }
}

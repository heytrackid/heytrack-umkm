import { apiLogger } from '@/lib/logger'
import { useAuth } from '@/hooks/useAuth'

export function useAIService(sessionId?: string | null): {
  processAIQuery: (query: string) => Promise<{
    message: string
    suggestions: string[]
    data?: Record<string, unknown>
  }>
} {
  const { user, isAuthenticated } = useAuth()

  const processAIQuery = async (
    query: string
  ): Promise<{
    message: string
    suggestions: string[]
    data?: Record<string, unknown>
  }> => {
    // Get current user ID from useAuth hook
    const userId = user?.id

    if (!isAuthenticated || !userId) {
      apiLogger.warn('AI Chatbot accessed without authentication')
      return {
        message: '❌ **Error:** Anda perlu login untuk menggunakan AI Chatbot',
        suggestions: ['Login terlebih dahulu', 'Refresh halaman'],
      }
    }

    const startTime = Date.now()

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          currentPage: window.location.pathname,
          session_id: sessionId,
        }),
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `API request failed: ${response.status}`
        apiLogger.error(
          {
            status: response.status,
            error: errorMessage,
            errors: errorData.errors,
            fullResponse: errorData
          },
          'AI Chat API Error'
        )
        throw new Error(errorMessage)
      }

      const data = await response.json()

      return {
        message: data.message,
        suggestions: (data.suggestions || []).map((s: string | { text: string }) =>
          typeof s === 'string' ? s : s.text
        ),
        data: {
          businessContext: data.metadata,
          responseTimeMs: responseTime,
          sessionId: data.session_id,
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      apiLogger.error({ error, query, responseTime }, 'AI Chatbot API call failed')

      // Provide context-aware error messages
      let errorMessage = 'Maaf, saya mengalami kesulitan memproses permintaan Anda.'
      let suggestions = ['Coba lagi', 'Refresh halaman']

      if (error instanceof Error) {
        if (
          error.message.includes('rate limit') ||
          error.message.includes('429') ||
          error.message.includes('batas')
        ) {
          errorMessage =
            '🤖 Saya sedang sibuk menjawab banyak pertanyaan. Silakan tunggu sebentar ya!'
          suggestions = ['Tunggu 1 menit', 'Coba pertanyaan yang berbeda']
        } else if (
          error.message.includes('network') ||
          error.message.includes('fetch')
        ) {
          errorMessage =
            '📡 Sepertinya ada masalah koneksi. Periksa internet Anda dan coba lagi.'
          suggestions = ['Periksa koneksi internet', 'Coba lagi dalam beberapa saat']
        } else if (error.message.includes('timeout')) {
          errorMessage =
            '⏰ Respons saya terlalu lama. Mari coba dengan pertanyaan yang lebih spesifik.'
          suggestions = ['Buat pertanyaan lebih singkat', 'Tanyakan hal spesifik']
        }
      }

      return {
        message: `${errorMessage}\n\n💡 **Alternatif**: Anda juga bisa cek langsung di menu yang relevan atau hubungi support jika urgent.`,
        suggestions,
        data: { responseTimeMs: responseTime },
      }
    }
  }

  return { processAIQuery }
}

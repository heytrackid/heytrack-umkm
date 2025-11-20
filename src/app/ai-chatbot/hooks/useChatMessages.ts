import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { SUGGESTIONS, type Message } from '@/app/ai-chatbot/types/index'
import { createLogger } from '@/lib/logger'
import type { MessageMetadata, SessionListItem } from '@/types/features/chat'

interface OrderRow { id: string; status: string; total_amount: number; created_at: string }
interface InventoryRow { id: string; current_stock: number; min_stock: number }
interface BusinessStats { totalOrders: number; pendingOrders: number; totalRevenue: number; criticalItems: number }

interface UseChatMessagesResult {
  messages: Message[]
  isLoading: boolean
  scrollAreaRef: RefObject<HTMLDivElement>
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  currentSessionId: string | null
}

export function useChatMessages(): UseChatMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const logger = createLogger('useChatMessages')

  const fetchBusinessStats = useCallback(async (): Promise<BusinessStats> => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        return { totalOrders: 0, pendingOrders: 0, totalRevenue: 0, criticalItems: 0 }
      }

      const data = await response.json() as {
        stats?: {
          total_orders?: number
          pending_orders?: number
          total_revenue?: number
          critical_items?: number
        }
      }

      const stats = data.stats || {}
      return {
        totalOrders: stats.total_orders || 0,
        pendingOrders: stats.pending_orders || 0,
        totalRevenue: stats.total_revenue || 0,
        criticalItems: stats.critical_items || 0
      }
    } catch (error) {
      logger.error({ error }, 'Failed to fetch business stats')
      return { totalOrders: 0, pendingOrders: 0, totalRevenue: 0, criticalItems: 0 }
    }
  }, [logger])

  const initializeSession = useCallback(async (): Promise<void> => {
    try {
      // Fetch sessions from API
      const response = await fetch('/api/ai/sessions?limit=1')
      if (!response.ok) {
        logger.error({ status: response.status }, 'Failed to fetch sessions')
        return
      }

      const data = await response.json() as { data?: SessionListItem[] }
      const sessions = data.data || []

      if (sessions.length > 0 && sessions[0]) {
        setCurrentSessionId(sessions[0].id)
        setHasShownWelcome(true)
      }
    } catch (error) {
      logger.error({ error }, 'Failed to initialize session')
    }
  }, [logger])

  const saveMessageToSession = useCallback(async (message: Message): Promise<void> => {
    if (!currentSessionId) return

    try {
      // Only store user and assistant messages, not system messages
      if (message.role !== 'user' && message.role !== 'assistant') return

      // Server will handle saving via the API route (called from ChatbotInterface)
      // This is left as a no-op for compatibility
    } catch (error) {
      logger.error({ error }, 'Failed to save message to session')
      // Continue without saving - don't break the chat experience
    }
  }, [currentSessionId, logger])

  const createWelcomeMessage = useCallback((stats: BusinessStats): Message => {
    const { totalOrders, pendingOrders, totalRevenue, criticalItems } = stats

    const revenueFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(totalRevenue)

    let healthEmoji = '🟢'
    let healthStatus = 'Excellent'
    let statusMessage = 'Bisnis kamu lagi on track banget! 💪'
    if (criticalItems > 5 || pendingOrders > 10) {
      healthEmoji = '🔴'
      healthStatus = 'Perlu Perhatian'
      statusMessage = 'Ada beberapa hal yang perlu dicek ya... 🤔'
    } else if (criticalItems > 2 || pendingOrders > 5) {
      healthEmoji = '🟡'
      healthStatus = 'Good'
      statusMessage = 'Overall baik, tapi ada yang bisa dioptimalkan! 📈'
    }

    let alertMessage = `\n\n${statusMessage} Mau nanya apa hari ini? Bisa tentang resep, stok, harga, atau strategi jualan apa aja! 🚀`
    if (criticalItems > 0) {
      alertMessage = `\n\n🚨 **Penting:** Ada ${criticalItems} bahan yang stoknya lagi kritis! Yuk cek dulu biar gak kehabisan saat butuh. 📦`
    } else if (pendingOrders > 0) {
      alertMessage = `\n\n⏰ Ada ${pendingOrders} pesanan yang masih pending nih. Mau aku bantu proses atau cek statusnya? 📋`
    }

    let suggestions: string[]
    if (criticalItems > 0) {
      suggestions = ['Berapa stok bahan baku yang tersedia?', 'Bahan apa yang perlu direstock?', 'Status pesanan terbaru']
    } else if (pendingOrders > 0) {
      suggestions = ['Status pesanan terbaru', 'Bahan apa yang perlu direstock?', 'Gimana kondisi bisnis aku?']
    } else {
      suggestions = ['Gimana kondisi bisnis aku?', 'Rekomendasi resep hari ini', 'Analisis profit bulan ini']
    }

    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `👋 **Halo lagi!** Senang ketemu kamu! 😊\n\nSaya AI assistant HeyTrack yang super excited buat bantu bisnis kuliner kamu makin sukses! \n\n📊 **Update bisnis hari ini:**\nStatus kamu: ${healthEmoji} ${healthStatus}\nTotal pesanan bulan ini: ${totalOrders} pesanan\nRevenue bulan ini: ${revenueFormatted}\nPending orders: ${pendingOrders}${criticalItems > 0 ? `\n⚠️ Stok kritis: ${criticalItems} bahan` : ''}${alertMessage}`,
      timestamp: new Date(),
      suggestions
    }

    return welcomeMessage
  }, [])

  // Initialize session and show welcome message on mount
  useEffect(() => {
    if (hasShownWelcome) return

    const initializeChat = async (): Promise<void> => {
      try {
        // Initialize session first
        await initializeSession()

        // Only show welcome if no existing messages
        if (messages.length === 0) {
          const stats = await fetchBusinessStats()
          const welcomeMessage = createWelcomeMessage(stats)
          setMessages([welcomeMessage])
        }

        setHasShownWelcome(true)
      } catch (error) {
        logger.error({ error }, 'Failed to initialize chat')
        // Show fallback welcome
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: '👋 **Halo!** Selamat datang di HeyTrack! 😊\n\nSaya AI assistant yang siap bantu bisnis kuliner kamu makin sukses. Mau nanya apa hari ini? Bisa tentang resep, stok, harga, atau strategi jualan! 🚀',
          timestamp: new Date(),
          suggestions: SUGGESTIONS.slice(0, 3).map(s => s.text)
        }])
        setHasShownWelcome(true)
      }
    }

    void initializeChat()
  }, [hasShownWelcome, createWelcomeMessage, fetchBusinessStats, initializeSession, messages.length, logger])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const addMessage = (message: Message): void => {
    setMessages(prev => [...prev, message])
    // Save to session asynchronously
    void saveMessageToSession(message)
  }

  const setLoading = (loading: boolean): void => {
    setIsLoading(loading)
  }

  return {
    messages,
    isLoading,
    scrollAreaRef,
    addMessage,
    setLoading,
    currentSessionId
  }
}

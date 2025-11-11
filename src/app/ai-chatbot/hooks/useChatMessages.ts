import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { SUGGESTIONS, type Message } from '@/app/ai-chatbot/types/index'
import { useSupabase } from '@/providers/SupabaseProvider'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { createLogger } from '@/lib/logger'

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
  const { supabase } = useSupabase()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const fetchBusinessStats = useCallback(async (userId: string): Promise<BusinessStats> => {
    const [ordersResult, inventoryResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, total_amount')
        .eq('user_id', userId)
        .limit(10),
      supabase
        .from('ingredients')
        .select('id, current_stock, min_stock')
        .eq('user_id', userId)
        .limit(50)
    ])

    const orders = (ordersResult.data ?? []) as OrderRow[]
    const inventory = (inventoryResult.data ?? []) as InventoryRow[]

    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    const criticalItems = inventory.filter(i =>
      typeof i.current_stock === 'number' &&
      typeof i.min_stock === 'number' &&
      i.current_stock < i.min_stock
    ).length

    return { totalOrders, pendingOrders, totalRevenue, criticalItems }
  }, [supabase])

  const initializeSession = useCallback(async (userId: string): Promise<void> => {
    try {
      // Try to get the most recent session for this user
      const sessions = await ChatSessionService.listSessions(supabase, userId, 1)
      if (sessions.length > 0 && sessions[0]) {
        const recentSession = sessions[0]
        setCurrentSessionId(recentSession.id)

        // Load existing messages from the session
        const existingMessages = await ChatSessionService.getMessages(supabase, recentSession.id, userId)
        if (existingMessages.length > 0) {
          const formattedMessages: Message[] = existingMessages.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(msg.created_at),
            suggestions: msg.role === 'assistant' ? [] : undefined, // Could be enhanced to store suggestions in metadata
            data: msg.metadata as Record<string, unknown>
          }))
          setMessages(formattedMessages)
          setHasShownWelcome(true) // Skip welcome message if there are existing messages
          return
        }
      }

      // Create new session if no recent session or no messages
      const newSession = await ChatSessionService.createSession(supabase, userId, 'AI Chat Conversation')
      setCurrentSessionId(newSession.id)
    } catch (error) {
      const logger = createLogger('useChatMessages')
      logger.error({ error: error as unknown }, 'Failed to initialize chat session')
       // Continue without session persistence for now
     }
   }, [supabase])

  const saveMessageToSession = useCallback(async (message: Message): Promise<void> => {
    if (!currentSessionId) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await ChatSessionService.addMessage(
        supabase,
        currentSessionId,
        message.role,
        message.content,
        {
          ...(message.data || {}),
          timestamp: message.timestamp.toISOString()
        }
      )
    } catch (error) {
      const logger = createLogger('useChatMessages')
      logger.error({ error: error as unknown }, 'Failed to save message to session')
      // Continue without saving - don't break the chat experience
    }
  }, [currentSessionId, supabase])

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
    if (hasShownWelcome) { return }

    const initializeChat = async (): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Fallback generic welcome
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: '👋 **Halo!** Selamat datang di HeyTrack! 😊\n\nSaya AI assistant yang siap bantu bisnis kuliner kamu makin sukses. Mau nanya apa hari ini? Bisa tentang resep, stok, harga, atau strategi jualan! 🚀',
          timestamp: new Date(),
          suggestions: SUGGESTIONS.slice(0, 3).map(s => s.text)
        }])
        setHasShownWelcome(true)
        return
      }

      // Initialize session first
      await initializeSession(user.id)

      // Only show welcome if no existing messages
      if (messages.length === 0) {
        const stats = await fetchBusinessStats(user.id)
        const welcomeMessage = createWelcomeMessage(stats)
        setMessages([welcomeMessage])
      }

      setHasShownWelcome(true)
    }

    void initializeChat()
  }, [hasShownWelcome, supabase, createWelcomeMessage, fetchBusinessStats, initializeSession, messages.length])

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

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { SUGGESTIONS, type Message } from '@/app/ai-chatbot/types'
import { useSupabase } from '@/providers/SupabaseProvider'

interface OrderRow { id: string; status: string; total_amount: number; created_at: string }
interface InventoryRow { id: string; current_stock: number; min_stock: number }
interface BusinessStats { totalOrders: number; pendingOrders: number; totalRevenue: number; criticalItems: number }

interface UseChatMessagesResult {
  messages: Message[]
  isLoading: boolean
  scrollAreaRef: RefObject<HTMLDivElement>
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
}

export function useChatMessages(): UseChatMessagesResult {
  const { supabase } = useSupabase()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
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

  const createWelcomeMessage = useCallback((stats: BusinessStats): Message => {
    const { totalOrders, pendingOrders, totalRevenue, criticalItems } = stats

    const revenueFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(totalRevenue)

    let healthEmoji = '🟢'
    let healthStatus = 'Excellent'
    if (criticalItems > 5 || pendingOrders > 10) {
      healthEmoji = '🔴'
      healthStatus = 'Perlu Perhatian'
    } else if (criticalItems > 2 || pendingOrders > 5) {
      healthEmoji = '🟡'
      healthStatus = 'Good'
    }

    let alertMessage = '\n✅ **All Good!** Bisnis berjalan lancar. Ada yang ingin ditanyakan?'
    if (criticalItems > 0) {
      alertMessage = '\n🚨 **Alert:** Ada bahan yang stoknya kritis! Klik suggestion di bawah untuk detail.'
    } else if (pendingOrders > 0) {
      alertMessage = '\n⏰ **Reminder:** Ada pesanan pending yang perlu diproses!'
    }

    let suggestions: string[]
    if (criticalItems > 0) {
      suggestions = ['Berapa stok bahan baku yang tersedia?', 'Status pesanan terbaru', 'Analisis profit bulan ini']
    } else if (pendingOrders > 0) {
      suggestions = ['Status pesanan terbaru', 'Berapa stok bahan baku?', 'Gimana kondisi bisnis aku?']
    } else {
      suggestions = ['Gimana kondisi bisnis aku?', 'Analisis profit bulan ini', 'Rekomendasi resep hari ini']
    }

    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `👋 **Selamat datang kembali!**\n\nSaya Asisten AI HeyTrack yang siap membantu bisnis UMKM kuliner Anda.\n\n📊 **Quick Business Overview:**\n• Status: ${healthEmoji} ${healthStatus}\n• Total Pesanan: ${totalOrders} pesanan\n• Pending Orders: ${pendingOrders}\n• Total Revenue: ${revenueFormatted}\n${criticalItems > 0 ? `• ⚠️ Stok Kritis: ${criticalItems} bahan\n` : ''}${alertMessage}`,
      timestamp: new Date(),
      suggestions
    }

    return welcomeMessage
  }, [])

  // Mark component as mounted to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])







  // Show personalized welcome message on mount
   
  useEffect(() => {
    if (!isMounted || hasShownWelcome) { return }

    const showWelcomeMessage = async (): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Fallback generic welcome
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: '👋 **Selamat datang!**\n\nSaya Asisten AI HeyTrack untuk membantu mengelola bisnis UMKM kuliner Anda.\n\nApa yang bisa saya bantu hari ini?',
          timestamp: new Date(),
          suggestions: SUGGESTIONS.slice(0, 3).map(s => s.text)
        }])
        setHasShownWelcome(true)
        return
      }

      const stats = await fetchBusinessStats(user.id)
      const welcomeMessage = createWelcomeMessage(stats)

      setMessages([welcomeMessage])
      setHasShownWelcome(true)
    }

    void showWelcomeMessage()
  }, [isMounted, hasShownWelcome, supabase, createWelcomeMessage, fetchBusinessStats])

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
  }

  const setLoading = (loading: boolean): void => {
    setIsLoading(loading)
  }

  return {
    messages,
    isLoading,
    scrollAreaRef,
    addMessage,
    setLoading
  }
}

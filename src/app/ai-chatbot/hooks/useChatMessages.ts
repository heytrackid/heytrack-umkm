import { useRef, useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type Message, SUGGESTIONS } from '@/app/ai-chatbot/types'

const supabase = createClient()

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Mark component as mounted to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show personalized welcome message on mount
  useEffect(() => {
    if (!isMounted || hasShownWelcome) { return }
    
    const showWelcomeMessage = async () => {
      
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

      // Fetch quick business stats
      const [ordersResult, inventoryResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, total_amount')
          .eq('user_id', user.id)
          .limit(10),
        supabase
          .from('ingredients')
          .select('id, current_stock, minimum_stock')
          .eq('user_id', user.id)
          .limit(50)
      ])

      interface OrderRow { id: string; status: string; total_amount: number; created_at: string }
      interface InventoryRow { id: string; current_stock: number; minimum_stock: number }
      
      const orders = (ordersResult.data ?? []) as OrderRow[]
      const inventory = (inventoryResult.data ?? []) as InventoryRow[]
      
      const totalOrders = orders.length
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length
      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
      
      const criticalItems = inventory.filter(i => 
        typeof i.current_stock === 'number' && 
        typeof i.minimum_stock === 'number' && 
        i.current_stock < i.minimum_stock
      ).length

      const revenueFormatted = new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        maximumFractionDigits: 0 
      }).format(totalRevenue)

      // Calculate quick health status
      let healthEmoji = '🟢'
      let healthStatus = 'Excellent'
      if (criticalItems > 5 || pendingOrders > 10) {
        healthEmoji = '🔴'
        healthStatus = 'Perlu Perhatian'
      } else if (criticalItems > 2 || pendingOrders > 5) {
        healthEmoji = '🟡'
        healthStatus = 'Good'
      }

      // Determine alert message
      let alertMessage = '\n✅ **All Good!** Bisnis berjalan lancar. Ada yang ingin ditanyakan?'
      if (criticalItems > 0) {
        alertMessage = '\n🚨 **Alert:** Ada bahan yang stoknya kritis! Klik suggestion di bawah untuk detail.'
      } else if (pendingOrders > 0) {
        alertMessage = '\n⏰ **Reminder:** Ada pesanan pending yang perlu diproses!'
      }

      // Determine suggestions
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

      setMessages([welcomeMessage])
      setHasShownWelcome(true)
    }

    void showWelcomeMessage()
  }, [isMounted, hasShownWelcome])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const addMessage = (message: Message) => {
    void setMessages(prev => [...prev, message])
  }

  const setLoading = (loading: boolean) => {
    void setIsLoading(loading)
  }

  return {
    messages,
    isLoading,
    scrollAreaRef,
    addMessage,
    setLoading
  }
}

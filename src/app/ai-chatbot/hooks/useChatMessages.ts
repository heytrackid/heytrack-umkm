import { useRef, useState, useEffect } from 'react'
import { type Message, SUGGESTIONS } from '@/app/ai-chatbot/types'

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Saya adalah asisten AI HeyTrack untuk membantu mengelola bisnis UMKM Anda. Apa yang bisa saya bantu hari ini?',
      timestamp: new Date(),
      suggestions: SUGGESTIONS.slice(0, 3).map(s => s.text)
    }
  ])

  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { 
  MessageSquare, 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Package, 
  DollarSign,
  Coffee,
  Lightbulb
} from 'lucide-react'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  suggestions?: string[]
}

// AI Response Generator
const generateAIResponse = (userMessage: string): ChatMessage => {
  const lowerMessage = userMessage.toLowerCase()
  
  let content = ''
  let suggestions: string[] = []
  
  if (lowerMessage.includes('penjualan') || lowerMessage.includes('sales')) {
    content = `Berdasarkan data penjualan Anda:\n\n✅ Penjualan bulan ini: Rp 45.8 juta (+12% dari bulan lalu)\n📈 Produk terlaris: Croissant (230 unit), Roti Tawar (180 unit)\n💰 Revenue tertinggi: Cake Custom (Rp 12.5 juta)\n\nRekomendasi:\n• Tingkatkan stok Croissant untuk pagi hari\n• Promosikan Cake Custom lebih agresif\n• Perhatikan margin profit di Roti Tawar`
    suggestions = [
      'Detail penjualan per produk',
      'Bandingkan dengan bulan lalu',
      'Tips meningkatkan penjualan'
    ]
  } else if (lowerMessage.includes('inventory') || lowerMessage.includes('stok')) {
    content = `Status Inventory Anda saat ini:\n\n⚠️ Stok menipis:\n• Tepung Terigu: 15kg (min: 20kg)\n• Butter: 5kg (min: 10kg)\n• Telur: 3 tray (min: 5 tray)\n\n✅ Stok aman:\n• Gula: 45kg\n• Susu: 25 liter\n• Cokelat: 8kg\n\nRekomendasi:\n• Segera restock tepung dan butter\n• Pertimbangkan bulk order untuk diskon`
    suggestions = [
      'List supplier terbaik',
      'Hitung kebutuhan mingguan',
      'Optimasi inventory cost'
    ]
  } else if (lowerMessage.includes('profit') || lowerMessage.includes('margin')) {
    content = `Analisa Profit & Margin:\n\n💰 Gross Profit: Rp 18.2 juta (39.7%)\n📊 Margin terbaik: Cake Custom (58%)\n📉 Margin terendah: Roti Tawar (22%)\n\nTips meningkatkan profit:\n1. Fokus promosi produk high-margin\n2. Review pricing Roti Tawar\n3. Bundle produk low & high margin\n4. Reduce waste dengan demand forecasting`
    suggestions = [
      'Detail HPP per produk',
      'Strategi pricing optimal',
      'Cara reduce waste'
    ]
  } else if (lowerMessage.includes('marketing') || lowerMessage.includes('promosi')) {
    content = `Strategi Marketing untuk Bakery:\n\n🎯 Target segment:\n• Profesional muda (25-35 tahun)\n• Keluarga dengan anak\n• Coffee shop partners\n\n💡 Campaign ideas:\n• Promo "Weekday Breakfast Bundle"\n• Member card dengan poin\n• Instagram giveaway\n• Kerjasama dengan kantor untuk catering\n\n📱 Platform prioritas:\n• Instagram (visual appeal)\n• WhatsApp Business (order & promo)\n• Google My Business (local SEO)`
    suggestions = [
      'Buat promo bundle',
      'Tips konten Instagram',
      'Strategi customer retention'
    ]
  } else if (lowerMessage.includes('customer') || lowerMessage.includes('pelanggan')) {
    content = `Insight Customer Anda:\n\n👥 Total pelanggan: 487 orang\n⭐ Pelanggan setia: 89 orang (18%)\n💸 Average order value: Rp 94,000\n🔄 Repeat rate: 34%\n\nPelanggan top 5:\n1. Ibu Siti - Rp 2.4 juta (26 transaksi)\n2. PT Maju Jaya - Rp 1.8 juta (8 order)\n3. Bapak Andi - Rp 1.2 juta (15 transaksi)\n\nRekomendasi:\n• Program loyalty untuk repeat customers\n• Special offer untuk customer baru\n• Survey feedback untuk improvement`
    suggestions = [
      'Buat program loyalty',
      'Analisa customer behavior',
      'Tips customer service'
    ]
  } else {
    content = `Terima kasih atas pertanyaan Anda! Saya adalah AI Assistant yang bisa membantu Anda dengan:\n\n📊 Analisa bisnis & laporan\n💰 Strategi pricing & profit\n📦 Manajemen inventory\n👥 Customer insights\n📈 Marketing & growth strategy\n💡 Rekomendasi operasional\n\nSilakan tanyakan hal spesifik tentang bisnis bakery Anda!`
    suggestions = [
      'Analisa penjualan hari ini',
      'Status inventory',
      'Tips marketing',
      'Customer insights'
    ]
  }
  
  return {
    id: Date.now().toString(),
    content,
    sender: 'ai',
    timestamp: new Date(),
    suggestions
  }
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Halo! 👋 Saya AI Assistant untuk bisnis bakery Anda.\n\nSaya bisa membantu dengan:\n• Analisa penjualan & profit\n• Optimasi inventory\n• Strategi marketing\n• Customer insights\n• Rekomendasi bisnis\n\nAda yang ingin ditanyakan?',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Bagaimana performa penjualan bulan ini?',
        'Cek status inventory',
        'Tips meningkatkan profit',
        'Strategi marketing untuk bakery'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response with delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(content)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/ai">AI Assistant</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chat</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              Chat Assistant
              <Badge variant="default" className="text-xs">AI</Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Tanya AI tentang bisnis bakery Anda
            </p>
          </div>
        </div>

        {/* Chat Container - Full Height with Scroll */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Assistant
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Scrollable Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                style={{ maxHeight: 'calc(100vh - 400px)' }}
              >
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex flex-col max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm whitespace-pre-line">
                          {message.content}
                        </div>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500 px-2">
                        {message.timestamp.toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      
                      {/* Quick Reply Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2 w-full">
                          <p className="text-xs text-gray-500 font-medium px-2 flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            Pertanyaan lanjutan:
                          </p>
                          <div className="flex flex-col gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="justify-start text-left h-auto py-2 px-3 text-xs bg-white hover:bg-gray-50 border-gray-200"
                                onClick={() => sendMessage(suggestion)}
                                disabled={isTyping}
                              >
                                💬 {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Fixed Input Area at Bottom */}
              <div className="border-t p-4 bg-white flex-shrink-0">
                <div className="flex gap-2 mb-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pertanyaan Anda di sini..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={() => sendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    size="default"
                    className="px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => sendMessage('Analisa penjualan hari ini')}
                    disabled={isTyping}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Sales
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => sendMessage('Status inventory')}
                    disabled={isTyping}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Inventory
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => sendMessage('Tips profit')}
                    disabled={isTyping}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Profit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => sendMessage('Strategi marketing')}
                    disabled={isTyping}
                  >
                    <Coffee className="h-3 w-3 mr-1" />
                    Marketing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card className="max-w-5xl mx-auto w-full border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-900">
                  💡 Tips Menggunakan Chat Assistant
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Tanya hal spesifik: "Bagaimana penjualan croissant minggu ini?"</p>
                  <p>• Minta analisa: "Analisa profitabilitas semua produk"</p>
                  <p>• Cari saran: "Tips meningkatkan customer retention"</p>
                  <p>• Gunakan quick buttons untuk pertanyaan cepat</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

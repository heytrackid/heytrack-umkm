'use client'

import { Bot, DollarSign, Maximize2, MessageCircle, Minimize2, Package, Send, Trash2, TrendingUp, User, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ChatAction, ChatContext } from '@/lib/ai-chatbot/types';
import { createClientLogger } from '@/lib/client-logger';

import { useChatHistory } from '@/hooks/useChatHistory';


const logger = createClientLogger('ChatbotInterface')




// Extended message type for UI with additional properties
interface ExtendedChatMessage {
  id: string
  role: 'assistant' | 'system' | 'user'
  content: string
  timestamp: Date
  actions?: { type: string; label: string }[]
  data?: Record<string, unknown>
}
interface ChatbotInterfaceProps {
  userId: string;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const ChatbotInterface = ({
  userId,
  className = '',
  isMinimized = false,
  onToggleMinimize
}: ChatbotInterfaceProps): JSX.Element => {
  // State for confirmation dialog
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Use chat history hook for database persistence
  const { 
    messages, 
    setMessages, 
    saveMessage, 
    clearHistory, 
    isLoading: isHistoryLoading
  } = useChatHistory(userId);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with greeting (only if no history and history is loaded)
  useEffect(() => {
    if (!isHistoryLoading && messages.length === 0) {
      // Add initial greeting without calling API
      const greetingMessage: ExtendedChatMessage = {
        id: `greeting_${Date.now()}`,
        role: 'assistant' as const,
        content: `👋 **Hai! Saya HeyTrack AI Assistant**

Saya di sini untuk membantu bisnis kuliner UMKM kamu berkembang! 🚀

**Yang bisa saya bantu:**

📊 **Analisis Bisnis**
• Profitabilitas produk & margin keuntungan
• HPP (Harga Pokok Produksi) real-time
• Trend penjualan & performa produk

💰 **Strategi Keuangan**
• Rekomendasi harga jual optimal
• Analisis cash flow & biaya operasional
• Proyeksi profit & break-even point

📦 **Manajemen Operasional**
• Monitoring stok & restock alerts
• Optimasi inventory & waste reduction
• Perencanaan produksi

📈 **Growth Strategy**
• Insight customer behavior
• Rekomendasi menu & bundling
• Marketing & promosi yang efektif

---

💡 **Tips:** Tanya dengan bahasa sehari-hari, saya paham kok! Misalnya:
• "Resep mana yang paling untung?"
• "Gimana cara ningkatin penjualan?"
• "Stok bahan apa yang mau habis?"

Yuk, mulai ngobrol! Mau tanya apa hari ini? 😊`,
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
      void saveMessage(greetingMessage);
    }
  }, [isHistoryLoading, messages.length, saveMessage, setMessages]);

  // Handle sending messages via API
  const handleSendMessage = async (message?: string): Promise<void> => {
    const messageToSend = message ?? inputValue.trim();
    if (!messageToSend || isLoading) { return; }

    setIsLoading(true);
    setInputValue('');

    try {
      // Add user message to UI and database
      if (!message) { // Only add user message if it's not an auto-greeting
        const userMessage: ExtendedChatMessage = {
          id: `user_${Date.now()}`,
          role: 'user' as const,
          content: messageToSend,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        void saveMessage(userMessage);
      }

      // Call AI chat API with enhanced NLP
      const response = await fetch('/api/ai/chat-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          session_id: context?.sessionId,
          currentPage: 'chatbot'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response['status']}`);
      }

      const result = await response.json() as { message?: string; suggestions?: Array<{ text: string; action: string }>; session_id?: string; error?: string };

      if (result.message) {
        // Create assistant message with NLP response
        const assistantMessage: ExtendedChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant' as const,
          content: result.message,
          timestamp: new Date(),
          ...(result.suggestions && {
            actions: result.suggestions.map((s) => ({
              type: s.action as ChatAction['type'],
              label: s.text
            }))
          })
        };

        setMessages(prev => [...prev, assistantMessage]);
        void saveMessage(assistantMessage);

        // Update session context with updated messages
        if (result.session_id) {
          setContext({
            userId,
            sessionId: result.session_id,
            conversationHistory: [...messages, assistantMessage]
              .filter(m => m.role !== 'system')
              .map(({ role, content, timestamp }) => ({
                role: role as 'assistant' | 'user',
                content,
                timestamp
              })),
          });
        }
      } else {
        throw new Error(result.error ?? 'Unknown API error');
      }

    } catch (error) {
      logger.error({ error }, 'Error sending message:');
      const errorMessage: ExtendedChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant' as const,
        content: 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle action button clicks via API
  const handleActionClick = async (action: ChatAction): Promise<void> => {
    if (!context) { return; }

    try {
      setIsLoading(true);

      const response = await fetch('/api/ai/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionId: action['type'],
          contextId: context.sessionId,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Action API error: ${response['status']}`);
      }

      const apiResult = await response.json() as { success: boolean; result?: { message?: string; aiRecommendations?: string; businessInsights?: unknown }; error?: string };

      if (apiResult.success) {
        const { result } = apiResult;

        // Create system message with enhanced content
        let content = result?.message ?? `Aksi"${action.label}" berhasil dijalankan.`;

        // Add AI recommendations if available
        if (result?.aiRecommendations) {
          content += `\n\n🤖 **AI Recommendations:**\n${result.aiRecommendations}`;
        }

        const systemMessage: ExtendedChatMessage = {
          id: `system_${Date.now()}`,
          role: 'system',
          content,
          timestamp: new Date(),
          data: {
            ...result,
            actionType: action['type'],
            aiEnhanced: Boolean(result?.aiRecommendations ?? result?.businessInsights),
            metadata: {
              actionType: action['type'],
              aiEnhanced: Boolean(result?.aiRecommendations ?? result?.businessInsights)
            }
          }
        };

        setMessages(prev => [...prev, systemMessage]);
        void saveMessage(systemMessage);
      } else {
        throw new Error(apiResult.error ?? 'Unknown action error');
      }

    } catch (error) {
      logger.error({ error }, 'Error executing action:');
      const errorMessage: ExtendedChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant' as const,
        content: 'Gagal menjalankan aksi AI. Silakan coba lagi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  // Get icon for action type
  const getActionIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'add_order': return <Package className="h-4 w-4" />;
      case 'check_stock': return <Package className="h-4 w-4" />;
      case 'view_report': return <TrendingUp className="h-4 w-4" />;
      case 'analysis': return <TrendingUp className="h-4 w-4" />;
      case 'recommendation': return <Users className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Message bubble component
   
  const MessageBubble = ({ message }: { message: ExtendedChatMessage }): JSX.Element => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    const getAvatarBgColor = () => {
      if (isUser) {return 'bg-muted0'}
      if (isSystem) {return 'bg-muted0'}
      return 'bg-muted0'
    }

    return (
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getAvatarBgColor()}`}>
          {(() => {
            if (isUser) {return <User className="h-4 w-4 text-white" />}
            if (isSystem) {return <MessageCircle className="h-4 w-4 text-white" />}
            return <Bot className="h-4 w-4 text-white" />
          })()}
        </div>

        {/* Message content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0 overflow-hidden`}>
          <div className={`px-4 py-3 rounded-2xl w-full break-words overflow-hidden  ${
            isUser
              ? 'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
                : 'bg-gradient-to-br from-muted to-muted/80 text-foreground border border-border/20'
            }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere word-break-break-word prose prose-sm max-w-none">
              {message.content}
            </div>

            {/* Action buttons */}
            {message.actions && message.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.actions.map((action, index: number) => (
                  <Button
                    key={`${action.type}-${index}`}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleActionClick(action as ChatAction)}
                    disabled={isLoading}
                    className="text-xs h-8"
                  >
                    {getActionIcon(action.type)}
                    <span className="ml-1">{action.label}</span>
                  </Button>
                ))}
              </div>
            )}

          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(message['timestamp']).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    );
  };

  // Quick action buttons with smart suggestions
   
  const QuickActions = (): JSX.Element => (
    <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
      <p className="text-xs font-medium text-muted-foreground mb-2">💡 Coba tanyakan:</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage('Resep apa yang paling menguntungkan?')}
          disabled={isLoading}
          className="text-xs h-8 bg-background hover:bg-muted"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Analisis Profit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage('Gimana cara ningkatin penjualan?')}
          disabled={isLoading}
          className="text-xs h-8 bg-background hover:bg-muted"
        >
          <Users className="h-3 w-3 mr-1" />
          Strategi Marketing
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage('Stok bahan apa yang harus direstock?')}
          disabled={isLoading}
          className="text-xs h-8 bg-background hover:bg-muted"
        >
          <Package className="h-3 w-3 mr-1" />
          Cek Stok
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage('Harga jual yang pas untuk produk baru berapa?')}
          disabled={isLoading}
          className="text-xs h-8 bg-background hover:bg-muted"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Pricing Strategy
        </Button>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <Card className={`fixed bottom-4 right-4 w-80  border-2 ${className}`}>
        <CardHeader className="p-4 bg-muted0 text-white rounded-t-lg flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Asisten UMKM AI</h3>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </div>
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-white hover:bg-primary h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Klik untuk memulai percakapan dengan asisten AI Anda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-96 h-[700px] border-2 flex flex-col ${className}`}>
      {/* Header */}
      <CardHeader className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-lg flex flex-row items-center justify-between flex-shrink-0 ">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="h-6 w-6 animate-pulse" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base">HeyTrack AI Assistant</h3>
            <p className="text-xs text-blue-100">Siap membantu bisnis kuliner Anda</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {showClearConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Hapus Riwayat Chat?</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Yakin ingin menghapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowClearConfirm(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        await clearHistory()
                        setShowClearConfirm(false)
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages area - Scrollable content */}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ maxHeight: 'calc(100% - 200px)' }}>
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message['id']} message={message} />
            ))}

            {/* Loading indicator with AI thinking animation */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                   <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3 rounded-2xl border border-border/20 ">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted0 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted0 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted0 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">AI sedang berpikir...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick actions */}
        {messages.length > 1 && <QuickActions />}

        {/* Input area */}
        <div className="p-4 border-t bg-background flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ketik pesan atau gunakan aksi cepat di atas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}




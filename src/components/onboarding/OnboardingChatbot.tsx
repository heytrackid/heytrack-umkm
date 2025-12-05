'use client'

import {
    ArrowRight,
    BarChart3,
    Building2,
    Calculator,
    CheckCircle2,
    ChefHat,
    ChevronDown,
    ChevronUp,
    Circle,
    Factory,
    MessageCircle,
    Package,
    Receipt,
    ShoppingCart,
    Sparkles,
    Truck,
    Users,
    Wallet,
    X,
} from '@/components/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useOnboardingChecklist, type ChecklistItem } from '@/hooks/useOnboardingChecklist'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Package,
  ChefHat,
  Users,
  ShoppingCart,
  Receipt,
  Calculator,
  MessageCircle,
  Factory,
  Wallet,
  BarChart3,
  Truck,
}

const PHASE_LABELS: Record<number, string> = {
  1: '🏗️ Setup Dasar',
  2: '⚙️ Operasional',
  3: '🚀 Advanced',
}

// Chat messages for different states
const CHAT_MESSAGES = {
  welcome: [
    'Hai! 👋 Selamat datang di HeyTrack!',
    'Saya akan bantu kamu setup bisnis kuliner dalam beberapa langkah mudah.',
  ],
  firstTask: 'Yuk mulai dari langkah pertama:',
  progress25: '🎯 Bagus! Kamu sudah mulai dengan baik.',
  progress50: '💪 Setengah jalan! Terus semangat!',
  progress75: '🔥 Hampir selesai! Tinggal sedikit lagi.',
  completed: '🎉 Selamat! Setup sudah lengkap!',
  encouragement: [
    'Kamu bisa skip dulu kalau belum siap.',
    'Langkah ini penting untuk tracking yang akurat.',
    'Ini akan membantu menghitung profit dengan tepat.',
  ],
}

interface OnboardingChatbotProps {
  className?: string
}

export function OnboardingChatbot({ className }: OnboardingChatbotProps) {
  const {
    items,
    getItemStatus,
    completedCount,
    totalCount,
    progressPercent,
    isDismissed,
    isLoading,
    markAsSkipped,
    dismissChecklist,
    isUpdating,
  } = useOnboardingChecklist()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showWelcome] = useState(true)
  const [currentPhase, setCurrentPhase] = useState(1)

  // Auto-open for new users (progress < 25%)
  useEffect(() => {
    if (!isLoading && progressPercent < 25 && !isDismissed) {
      const hasSeenWelcome = localStorage.getItem('heytrack_seen_welcome')
      if (!hasSeenWelcome) {
        // Use setTimeout to avoid cascading renders
        const timer = setTimeout(() => {
          setIsOpen(true)
          localStorage.setItem('heytrack_seen_welcome', 'true')
        }, 500)
        return () => clearTimeout(timer)
      }
    }
    return undefined
  }, [isLoading, progressPercent, isDismissed])

  // Don't render if dismissed or completed
  if (isDismissed || progressPercent === 100 || isLoading) {
    return null
  }

  // Get next pending item
  const nextPendingItem = items.find((item) => getItemStatus(item.id) === 'pending')

  // Group items by phase
  const itemsByPhase = items.reduce<Record<number, ChecklistItem[]>>((acc, item) => {
    const phase = item.phase
    if (!acc[phase]) {
      acc[phase] = []
    }
    acc[phase]!.push(item)
    return acc
  }, {})

  // Get progress message
  const getProgressMessage = () => {
    if (progressPercent >= 75) return CHAT_MESSAGES.progress75
    if (progressPercent >= 50) return CHAT_MESSAGES.progress50
    if (progressPercent >= 25) return CHAT_MESSAGES.progress25
    return null
  }

  // Mobile: Always show FAB icon only (when not open)
  // Desktop: Show card preview or minimized button
  if (!isOpen) {
    return (
      <>
        {/* Mobile FAB - always visible when closed */}
        <div className={cn(
          'fixed z-50 sm:hidden',
          'bottom-[calc(56px+env(safe-area-inset-bottom)+16px)] right-4',
          className
        )}>
          <Button
            size="lg"
            onClick={() => setIsOpen(true)}
            className="rounded-full shadow-lg hover:shadow-xl transition-all h-14 w-14 p-0 relative bg-gradient-to-br from-primary to-primary/80"
          >
            <Sparkles className="h-6 w-6" />
            {completedCount < totalCount && (
              <span className="absolute -top-1 -right-1 h-6 w-6 bg-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
                {totalCount - completedCount}
              </span>
            )}
          </Button>
        </div>

        {/* Desktop: Card preview or minimized button */}
        <div className={cn(
          'fixed z-50 hidden sm:block',
          'bottom-6 right-6',
          className
        )}>
          {isMinimized ? (
            <Button
              size="lg"
              onClick={() => setIsMinimized(false)}
              className="rounded-full shadow-lg hover:shadow-xl transition-all h-14 w-14 p-0 relative bg-gradient-to-br from-primary to-primary/80"
            >
              <MessageCircle className="h-6 w-6" />
              {completedCount < totalCount && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center animate-bounce">
                  {totalCount - completedCount}
                </span>
              )}
            </Button>
          ) : (
            <Card 
              className="w-72 shadow-2xl border-primary/20 cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setIsOpen(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 flex-shrink-0">
                    <AvatarFallback className="bg-transparent text-white">
                      <Sparkles className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Setup Assistant</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {progressPercent}% selesai • {totalCount - completedCount} task
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMinimized(true)
                    }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={progressPercent} className="h-1.5 mt-3" />
              </CardContent>
            </Card>
          )}
        </div>
      </>
    )
  }

  // Open state - chatbot interface (floating card style like AI chatbot)
  return (
    <div className={cn(
      'fixed z-50',
      // Mobile: floating card at bottom right
      'bottom-20 right-4 w-[calc(100%-2rem)] max-w-sm',
      // Desktop: floating card at bottom right
      'sm:bottom-6 sm:right-6 sm:w-96',
      className
    )}>
      <Card className="shadow-2xl border-primary/20 flex flex-col max-h-[60vh] sm:max-h-[500px] overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-primary to-primary/80">
              <AvatarFallback className="bg-transparent text-white">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-xs sm:text-sm">Setup Assistant</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {progressPercent}% selesai
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => setIsOpen(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={dismissChecklist}
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-muted/30">
          {/* Welcome Messages */}
          {showWelcome && progressPercent < 25 && (
            <div className="space-y-2">
              {CHAT_MESSAGES.welcome.map((msg, i) => (
                <ChatBubble key={i} message={msg} isBot />
              ))}
            </div>
          )}

          {/* Progress Message */}
          {getProgressMessage() && (
            <ChatBubble message={getProgressMessage()!} isBot />
          )}

          {/* Progress Bar */}
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedCount}/{totalCount}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Next Task */}
          {nextPendingItem && (
            <>
              <ChatBubble message={CHAT_MESSAGES.firstTask} isBot />
              <TaskCard 
                item={nextPendingItem} 
                onSkip={() => markAsSkipped(nextPendingItem.id)}
                isUpdating={isUpdating}
              />
            </>
          )}

          {/* Phase Accordion */}
          <div className="space-y-2 mt-4">
            <p className="text-xs font-medium text-muted-foreground px-1">
              Semua Checklist
            </p>
            {[1, 2, 3].map((phase) => {
              const phaseItems = itemsByPhase[phase] ?? []
              const phaseCompleted = phaseItems.filter(
                (i) => getItemStatus(i.id) === 'completed'
              ).length
              const isExpanded = currentPhase === phase

              return (
                <div key={phase} className="bg-background rounded-lg border overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => setCurrentPhase(isExpanded ? 0 : phase)}
                  >
                    <span className="text-sm font-medium">{PHASE_LABELS[phase]}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {phaseCompleted}/{phaseItems.length}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1">
                      {phaseItems.map((item) => {
                        const status = getItemStatus(item.id)
                        const IconComponent = ICON_MAP[item.icon] ?? Circle

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group',
                              status === 'completed' && 'opacity-60'
                            )}
                          >
                            {status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={cn(
                              'text-xs flex-1',
                              status === 'completed' && 'line-through'
                            )}>
                              {item.title}
                            </span>
                            {status === 'pending' && (
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 sm:p-3 border-t bg-background safe-bottom">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[10px] sm:text-xs text-muted-foreground"
            onClick={dismissChecklist}
            disabled={isUpdating}
          >
            Sembunyikan panduan ini
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Chat bubble component
function ChatBubble({ message, isBot }: { message: string; isBot?: boolean }) {
  return (
    <div className={cn('flex', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
          isBot
            ? 'bg-background border rounded-bl-md'
            : 'bg-primary text-primary-foreground rounded-br-md'
        )}
      >
        {message}
      </div>
    </div>
  )
}

// Task card component
function TaskCard({ 
  item, 
  onSkip, 
  isUpdating 
}: { 
  item: ChecklistItem
  onSkip: () => void
  isUpdating: boolean 
}) {
  const IconComponent = ICON_MAP[item.icon] ?? Circle

  return (
    <div className="bg-background rounded-xl border-2 border-primary/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{item.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.description}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link href={item.href} className="flex-1">
          <Button size="sm" className="w-full">
            Mulai
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={onSkip}
          disabled={isUpdating}
        >
          Skip
        </Button>
      </div>
    </div>
  )
}

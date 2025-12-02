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
    SkipForward,
    Sparkles,
    Truck,
    Users,
    Wallet,
    X,
} from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

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
  1: 'Setup Dasar',
  2: 'Operasional',
  3: 'Advanced',
}

/**
 * Floating checklist widget - pojok kanan bawah
 * Bisa di-minimize/maximize
 */
export function OnboardingChecklistFloating() {
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

  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Don't show if dismissed or completed
  if (isDismissed || progressPercent === 100 || isLoading) {
    return null
  }

  // Group items by phase
  const itemsByPhase = items.reduce<Record<number, typeof items>>((acc, item) => {
    const phase = item.phase
    if (!acc[phase]) {
      acc[phase] = []
    }
    acc[phase]!.push(item)
    return acc
  }, {})

  // Get next pending item
  const nextPendingItem = items.find((item) => getItemStatus(item.id) === 'pending')

  // Minimized state - just a floating button
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsMinimized(false)}
          className="rounded-full shadow-lg hover:shadow-xl transition-all h-14 w-14 p-0 relative"
        >
          <Sparkles className="h-6 w-6" />
          {completedCount < totalCount && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
              {totalCount - completedCount}
            </span>
          )}
        </Button>
      </div>
    )
  }

  // Collapsed state - compact card
  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80">
        <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-primary/10 to-background">
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsExpanded(true)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <CardTitle className="text-base">Setup Progress</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMinimized(true)
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    dismissChecklist()
                  }}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedCount} dari {totalCount}
                </span>
                <span className="font-medium text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardHeader>

          {/* Next task preview */}
          {nextPendingItem && (
            <CardContent className="pt-0 pb-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{nextPendingItem.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {nextPendingItem.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Link href={nextPendingItem.href} className="flex-1">
                      <Button size="sm" className="w-full h-8 text-xs">
                        Mulai
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => markAsSkipped(nextPendingItem.id)}
                      disabled={isUpdating}
                    >
                      <SkipForward className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => setIsExpanded(true)}
              >
                Lihat semua task
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    )
  }

  // Expanded state - full checklist
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] overflow-hidden">
      <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-primary/10 to-background flex flex-col max-h-[600px]">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Setup Progress</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={dismissChecklist}
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} dari {totalCount}
              </span>
              <span className="font-medium text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-0 overflow-y-auto flex-1">
          <div className="space-y-3">
            {[1, 2, 3].map((phase) => {
              const phaseItems = itemsByPhase[phase] ?? []
              const phaseCompleted = phaseItems.filter(
                (i) => getItemStatus(i.id) === 'completed'
              ).length

              return (
                <div key={phase} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">
                      Phase {phase}: {PHASE_LABELS[phase]}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {phaseCompleted}/{phaseItems.length}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {phaseItems.map((item) => {
                      const status = getItemStatus(item.id)
                      const IconComponent = ICON_MAP[item.icon] ?? Circle

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md group hover:bg-muted/50 transition-colors',
                            status === 'completed' && 'opacity-60'
                          )}
                        >
                          {status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : status === 'skipped' ? (
                            <SkipForward className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                              <span
                                className={cn(
                                  'text-xs font-medium',
                                  status === 'completed' && 'line-through'
                                )}
                              >
                                {item.title}
                              </span>
                            </div>
                          </div>

                          {status === 'pending' && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={item.href}>
                                <Button size="sm" className="h-6 px-2 text-xs">
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Celebration */}
          {progressPercent >= 75 && progressPercent < 100 && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-xs text-green-700 dark:text-green-400">
                🎉 Hampir selesai! Tinggal {totalCount - completedCount} lagi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

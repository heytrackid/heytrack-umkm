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
    RotateCcw,
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
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

const PHASE_COLORS: Record<number, string> = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-purple-500',
}

export function OnboardingChecklist() {
  const {
    items,
    getItemStatus,
    completedCount,
    totalCount,
    progressPercent,
    isDismissed,
    isLoading,
    error,
    markAsSkipped,
    dismissChecklist,
    resetChecklist,
    isUpdating,
  } = useOnboardingChecklist()

  const [expandedPhase, setExpandedPhase] = useState<number | null>(1)

  // Show error state
  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Gagal memuat checklist. Silakan refresh halaman.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <OnboardingChecklistSkeleton />
  }

  // Don't show if dismissed or all completed
  if (isDismissed || progressPercent === 100) {
    return null
  }

  // Group items by phase
  const itemsByPhase = items.reduce<Record<number, typeof items>>(
    (acc, item) => {
      const phase = item.phase
      if (!acc[phase]) {
        acc[phase] = []
      }
      acc[phase]!.push(item)
      return acc
    },
    {}
  )

  // Calculate phase progress
  const getPhaseProgress = (phase: number) => {
    const phaseItems = itemsByPhase[phase] ?? []
    const completed = phaseItems.filter((i) => getItemStatus(i.id) === 'completed').length
    return { completed, total: phaseItems.length }
  }

  return (
    <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-transparent shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Setup Progress</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={resetChecklist}
              disabled={isUpdating}
              title="Reset progress"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={dismissChecklist}
              disabled={isUpdating}
              title="Sembunyikan checklist"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} dari {totalCount} selesai
            </span>
            <span className="font-medium text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {[1, 2, 3].map((phase) => {
          const phaseProgress = getPhaseProgress(phase)
          const isExpanded = expandedPhase === phase
          const isPhaseComplete = phaseProgress.completed === phaseProgress.total
          const prevPhaseComplete =
            phase === 1 || getPhaseProgress(phase - 1).completed === getPhaseProgress(phase - 1).total

          return (
            <Collapsible
              key={phase}
              open={isExpanded}
              onOpenChange={() => setExpandedPhase(isExpanded ? null : phase)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                    'hover:bg-muted/50',
                    isExpanded && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        isPhaseComplete ? 'bg-green-500' : PHASE_COLORS[phase]
                      )}
                    />
                    <span className="font-medium">
                      Phase {phase}: {PHASE_LABELS[phase]}
                    </span>
                    {!prevPhaseComplete && phase > 1 && (
                      <Badge variant="outline" className="text-xs">
                        Locked
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {phaseProgress.completed}/{phaseProgress.total}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="pl-5 pr-2 pb-2 space-y-1">
                  {(itemsByPhase[phase] ?? []).map((item) => {
                    const status = getItemStatus(item.id)
                    const IconComponent = ICON_MAP[item.icon] ?? Circle

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-md group',
                          status === 'completed' && 'opacity-60'
                        )}
                      >
                        {/* Status icon */}
                        {status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : status === 'skipped' ? (
                          <SkipForward className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}

                        {/* Item content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <span
                              className={cn(
                                'text-sm font-medium',
                                status === 'completed' && 'line-through'
                              )}
                            >
                              {item.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>

                        {/* Actions */}
                        {status === 'pending' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsSkipped(item.id)
                              }}
                              disabled={isUpdating}
                              title="Skip"
                            >
                              <SkipForward className="h-3 w-3" />
                            </Button>
                            <Link href={item.href}>
                              <Button size="sm" className="h-7 px-2 text-xs">
                                Mulai
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}

        {/* Completion celebration */}
        {progressPercent >= 75 && progressPercent < 100 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <p className="text-sm text-green-700 dark:text-green-400">
              🎉 Hampir selesai! Tinggal {totalCount - completedCount} langkah lagi.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function OnboardingChecklistSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-2 mt-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

// Compact version for sidebar
export function OnboardingChecklistCompact() {
  const { completedCount, totalCount, progressPercent, isDismissed, isLoading } =
    useOnboardingChecklist()

  if (isDismissed || progressPercent === 100 || isLoading) {
    return null
  }

  return (
    <Link href="/" className="block">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
        <div className="relative">
          <Sparkles className="h-5 w-5 text-primary" />
          {completedCount < totalCount && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Setup Progress</p>
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="h-1 flex-1" />
            <span className="text-xs text-muted-foreground">{progressPercent}%</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

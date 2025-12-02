'use client'

import { Plus, type LucideIcon } from '@/components/icons'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: 'default' | 'ghost' | 'outline'
  icon?: LucideIcon
}

interface EmptyStateTip {
  icon: string
  text: string
}

interface EnhancedEmptyStateProps {
  icon?: LucideIcon
  emoji?: string
  title: string
  description: string
  actions?: EmptyStateAction[]
  tips?: EmptyStateTip[]
  className?: string
  compact?: boolean
  illustration?: 'default' | 'search' | 'data' | 'welcome'
}

// Animated illustration components
const DefaultIllustration = () => (
  <svg className="w-32 h-32 animate-float" viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="50" className="fill-muted/50" />
    <circle cx="60" cy="60" r="35" className="fill-muted" />
    <rect x="45" y="40" width="30" height="40" rx="4" className="fill-primary/20" />
    <rect x="50" y="48" width="20" height="3" rx="1" className="fill-primary/40" />
    <rect x="50" y="55" width="15" height="3" rx="1" className="fill-primary/40" />
    <rect x="50" y="62" width="18" height="3" rx="1" className="fill-primary/40" />
    <circle cx="85" cy="35" r="12" className="fill-emerald-500/20 animate-pulse-soft" />
    <path d="M81 35L84 38L89 32" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SearchIllustration = () => (
  <svg className="w-32 h-32 animate-float" viewBox="0 0 120 120" fill="none">
    <circle cx="50" cy="50" r="30" className="stroke-muted-foreground/30" strokeWidth="4" />
    <line x1="72" y1="72" x2="95" y2="95" className="stroke-muted-foreground/30" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="50" r="15" className="fill-muted/50 animate-pulse-soft" />
    <path d="M45 50C45 47.2386 47.2386 45 50 45" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const DataIllustration = () => (
  <svg className="w-32 h-32 animate-float" viewBox="0 0 120 120" fill="none">
    <rect x="20" y="70" width="20" height="30" rx="3" className="fill-primary/20" />
    <rect x="50" y="50" width="20" height="50" rx="3" className="fill-primary/30" />
    <rect x="80" y="30" width="20" height="70" rx="3" className="fill-primary/40" />
    <circle cx="30" cy="60" r="5" className="fill-emerald-500/50 animate-pulse-soft" />
    <circle cx="60" cy="40" r="5" className="fill-emerald-500/50 animate-pulse-soft stagger-1" />
    <circle cx="90" cy="20" r="5" className="fill-emerald-500/50 animate-pulse-soft stagger-2" />
    <path d="M30 60L60 40L90 20" className="stroke-emerald-500/30" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
  </svg>
)

const WelcomeIllustration = () => (
  <svg className="w-32 h-32 animate-float" viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="45" className="fill-primary/5" />
    <circle cx="60" cy="60" r="30" className="fill-primary/10" />
    <path d="M45 55C45 55 50 65 60 65C70 65 75 55 75 55" className="stroke-primary/50" strokeWidth="3" strokeLinecap="round" />
    <circle cx="48" cy="48" r="4" className="fill-primary/50" />
    <circle cx="72" cy="48" r="4" className="fill-primary/50" />
    <circle cx="90" cy="30" r="8" className="fill-amber-400/30 animate-pulse-soft" />
    <path d="M87 30L90 27L93 30L90 33Z" className="fill-amber-400" />
    <circle cx="25" cy="45" r="6" className="fill-emerald-400/30 animate-pulse-soft stagger-2" />
  </svg>
)

const illustrations = {
  default: DefaultIllustration,
  search: SearchIllustration,
  data: DataIllustration,
  welcome: WelcomeIllustration,
}

export const EnhancedEmptyState = ({
  icon: Icon,
  emoji,
  title,
  description,
  actions = [],
  tips = [],
  className,
  compact = false,
  illustration = 'default',
}: EnhancedEmptyStateProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const Illustration = illustrations[illustration]

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className={cn(
      'border-dashed border-2 overflow-hidden transition-all duration-500',
      !isVisible && 'opacity-0 translate-y-4',
      isVisible && 'opacity-100 translate-y-0',
      className
    )}>
      <CardContent className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-12 px-6'
      )}>
        {/* Illustration or Icon/Emoji */}
        <div className={cn(
          'mb-6 transition-all duration-500',
          isVisible && 'animate-scale-in'
        )}>
          {Icon ? (
            <div className={cn(
              'rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center',
              compact ? 'w-16 h-16' : 'w-20 h-20'
            )}>
              <Icon className={cn(
                'text-muted-foreground',
                compact ? 'w-8 h-8' : 'w-10 h-10'
              )} />
            </div>
          ) : emoji ? (
            <div className={cn(
              'rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center',
              compact ? 'w-16 h-16' : 'w-20 h-20'
            )}>
              <span className={compact ? 'text-3xl' : 'text-4xl'}>{emoji}</span>
            </div>
          ) : (
            <Illustration />
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-semibold text-foreground mb-2 transition-all duration-500 delay-100',
          compact ? 'text-lg' : 'text-xl',
          isVisible && 'animate-slide-up'
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className={cn(
          'text-muted-foreground mb-6 max-w-md transition-all duration-500 delay-150',
          compact ? 'text-sm' : 'text-base',
          isVisible && 'animate-slide-up'
        )}>
          {description}
        </p>

        {/* Actions */}
        {actions.length > 0 && (
          <div className={cn(
            'flex flex-wrap gap-3 justify-center mb-6 transition-all duration-500 delay-200',
            isVisible && 'animate-slide-up'
          )}>
            {actions.map((action, index) => {
              const ActionIcon = action.icon || (index === 0 ? Plus : undefined)
              const button = (
                <Button
                  key={index}
                  variant={action.variant ?? (index === 0 ? 'default' : 'outline')}
                  onClick={action.onClick}
                  size={compact ? 'sm' : 'default'}
                  className={cn(
                    'transition-all duration-300',
                    index === 0 && 'shadow-md hover:shadow-lg'
                  )}
                >
                  {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              )

              return action.href ? (
                <Link key={index} href={action.href}>
                  {button}
                </Link>
              ) : button
            })}
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && !compact && (
          <div className={cn(
            'w-full max-w-md space-y-2 pt-6 border-t transition-all duration-500 delay-300',
            isVisible && 'animate-slide-up'
          )}>
            <p className="text-xs font-medium text-muted-foreground mb-3">💡 Tips</p>
            {tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 text-left text-sm text-muted-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-base flex-shrink-0">{tip.icon}</span>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EnhancedEmptyState

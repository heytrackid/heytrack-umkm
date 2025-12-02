'use client'

import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface EnhancedStatCardProps {
  title: string
  value: string | number
  subtitle?: string | undefined
  trend?: number | undefined
  trendLabel?: string | undefined
  icon: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  sparklineData?: number[] | undefined
  loading?: boolean
  className?: string | undefined
  delay?: number
}

const variantConfig = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    sparklineColor: 'stroke-primary',
  },
  success: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    sparklineColor: 'stroke-emerald-500',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    sparklineColor: 'stroke-amber-500',
  },
  danger: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    sparklineColor: 'stroke-rose-500',
  },
  info: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    sparklineColor: 'stroke-blue-500',
  },
}

// Mini sparkline component
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 32
  const width = 80
  const padding = 2

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding
    const y = height - ((value - min) / range) * (height - padding * 2) - padding
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        className={cn(color, 'transition-all duration-500')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function EnhancedStatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  variant = 'default',
  sparklineData,
  loading = false,
  className,
  delay = 0,
}: EnhancedStatCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayValue, setDisplayValue] = useState<string | number>('')
  const cardRef = useRef<HTMLDivElement>(null)
  const config = variantConfig[variant]

  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  // Animate number counting
  useEffect(() => {
    if (!isVisible || loading) {
      return undefined
    }

    if (typeof value === 'number') {
      const duration = 1000
      const steps = 30
      const stepDuration = duration / steps
      let currentStep = 0

      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.round(value * easeOut))

        if (currentStep >= steps) {
          clearInterval(timer)
          setDisplayValue(value)
        }
      }, stepDuration)

      return () => clearInterval(timer)
    }
    
    setDisplayValue(value)
    return undefined
  }, [isVisible, value, loading])

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return ArrowUpRight
    if (trendValue < 0) return ArrowDownRight
    return Minus
  }

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
    if (trendValue < 0) return 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
    return 'text-muted-foreground bg-muted'
  }

  const TrendIcon = trend !== undefined ? getTrendIcon(trend) : null

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded animate-shimmer-gradient" />
              <div className="h-8 w-32 rounded animate-shimmer-gradient" />
              <div className="h-3 w-20 rounded animate-shimmer-gradient" />
            </div>
            <div className="h-12 w-12 rounded-xl animate-shimmer-gradient" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        'group relative overflow-hidden shadow-sm card-hover-lift',
        !isVisible && 'opacity-0',
        isVisible && 'animate-scale-in',
        className
      )}
    >
      
      <CardContent className="p-5 sm:p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            
            <div className="space-y-1.5">
              <p className={cn(
                'text-2xl sm:text-3xl font-bold tracking-tight truncate',
                isVisible && 'animate-count-up'
              )}>
                {displayValue}
              </p>
              
              <div className="flex flex-wrap items-center gap-2">
                {subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                )}
                
                {trend !== undefined && trend !== 0 && TrendIcon && (
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all',
                    getTrendColor(trend)
                  )}>
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(trend).toFixed(1)}%
                    {trendLabel && <span className="opacity-70">{trendLabel}</span>}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={cn(
              'flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
              config.iconBg
            )}>
              <Icon className={cn('h-6 w-6', config.iconColor)} />
            </div>
            
            {sparklineData && sparklineData.length > 1 && (
              <Sparkline data={sparklineData} color={config.sparklineColor} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnhancedStatCard

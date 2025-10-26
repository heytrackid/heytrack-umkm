/**
 * Mobile Tooltip Component
 * Optimized tooltip for mobile chart interactions
 */

import * as React from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { TooltipEntry } from './types'

// Mobile-optimized tooltip component
interface MobileTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  formatter?: (value: number | string, name: string, props: TooltipEntry) => [React.ReactNode, string]
  labelFormatter?: (value: string | number) => React.ReactNode
}

export function MobileTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter
}: MobileTooltipProps) {
  const { isMobile } = useResponsive()

  if (active && payload && payload.length) {
    return (
      <div className={cn(
       "bg-background/95 backdrop-blur-sm border rounded-lg  p-3",
        isMobile ?"min-w-[200px] text-sm" :"min-w-[160px] text-xs"
      )}>
        {label && (
          <div className="font-medium text-foreground mb-2 border-b pb-2">
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        )}
        <div className="space-y-1">
          {payload.map((entry: TooltipEntry, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-medium text-foreground">
                {formatter ?
                  formatter(entry.value, entry.name, entry)[0] :
                  entry.value
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

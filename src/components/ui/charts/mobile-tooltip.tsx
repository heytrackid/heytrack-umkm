import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

import type { TooltipEntry } from './types'
import type { ReactNode } from 'react'

/**
 * Mobile Tooltip Component
 * Optimized tooltip for mobile chart interactions
 */


// Mobile-optimized tooltip component
interface MobileTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: number | string
  formatter?: (value: number | string, name: string, props: TooltipEntry) => [ReactNode, string]
  labelFormatter?: (value: number | string) => ReactNode
}

export const MobileTooltip = ({
  active,
  payload,
  label,
  formatter,
  labelFormatter
}: MobileTooltipProps) => {
  const { isMobile } = useResponsive()

  if (active && payload?.length) {
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

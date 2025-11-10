'use client'

import { type LucideIcon, Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import type { ReactNode } from 'react'



interface StatCardWithTooltipProps {
  title: string
  value: number | string
  icon?: LucideIcon
  iconColor?: string
  tooltip?: string
  tooltipDetails?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  action?: ReactNode
}

export const StatCardWithTooltip = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  tooltip,
  tooltipDetails,
  trend,
  action
}: StatCardWithTooltipProps) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltip}</p>
                  {tooltipDetails && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {tooltipDetails}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-gray-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% dari kemarin
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  )

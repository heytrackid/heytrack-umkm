"use client"

import { forwardRef, type ComponentProps, type ComponentType, type HTMLAttributes } from 'react'
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Chart container component
const ChartContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, { label?: string; icon?: ComponentType; color?: string }>
    children: ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ className, config, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  ))
ChartContainer.displayName ="Chart"

// Chart tooltip
const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof RechartsPrimitive.Tooltip> &
    HTMLAttributes<HTMLDivElement> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?:"line" |"dot" |"dashed"
    }
>(
  ({ 
    className, 
    hideLabel = false, 
    hideIndicator = false, 
    indicator ="dot",
    // Filter out recharts-specific props that shouldn't be passed to DOM
    active,
    payload,
    label,
    allowEscapeViewBox,
    animationDuration,
    animationEasing,
    axisId,
    contentStyle,
    filterNull,
    isAnimationActive,
    itemSorter,
    itemStyle,
    labelStyle,
    reverseDirection,
    useTranslate3d,
    wrapperStyle,
    accessibilityLayer,
    ...validDOMProps 
  }, ref) => (
      <div
        ref={ref}
        className={cn(
         "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs",
          className
        )}
        {...validDOMProps}
      />
    )
)
ChartTooltipContent.displayName ="ChartTooltipContent"

// Chart legend
const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & {
    payload?: Array<{ value: string; type?: string; color?: string }>
  }
>(({ className, payload, ...props }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4 text-sm", className)}
      {...props}
    >
      {payload.map((item, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: item.color,
            }}
          />
          {item.value}
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName ="ChartLegendContent"

// Main Chart component (alias for ChartContainer)
const Chart = ChartContainer

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Chart,
}

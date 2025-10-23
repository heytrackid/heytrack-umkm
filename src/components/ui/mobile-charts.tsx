'use client'
import * as React from 'react'

import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import {
    Download,
    Maximize2,
    Minimize2,
    Minus,
    Share2,
    TrendingDown,
    TrendingUp
} from 'lucide-react'
import { memo, useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { Badge } from './badge'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

// Color schemes for mobile-friendly visualization
const CHART_COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
  rainbow: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
}

// Mobile-optimized tooltip component
interface MobileTooltipProps {
  active?: boolean
  payload?: any[]
  label?: any
  formatter?: (value: any, name: string, props: any) => [React.ReactNode, string]
  labelFormatter?: (value: any) => React.ReactNode
}

function MobileTooltip({ 
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
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">
                  {entry.name}
                </span>
              </div>
              <span className="font-medium text-foreground">
                {formatter 
                  ? formatter(entry.value, entry.name || '', entry)[0]
                  : entry.value
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

// Base mobile chart component
interface BaseMobileChartProps {
  title?: string
  description?: string
  data: any[]
  className?: string
  height?: number
  showFullscreen?: boolean
  showDownload?: boolean
  showShare?: boolean
  actions?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
}

function BaseMobileChart({
  title,
  description,
  children,
  className,
  height,
  showFullscreen = true,
  showDownload = false,
  showShare = false,
  actions,
  trend
}: BaseMobileChartProps & { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { isMobile, screenSize } = useResponsive()

  const chartHeight = useMemo(() => {
    if (isFullscreen) return 400
    if (height) return height
    return isMobile ? 250 : 300
  }, [isFullscreen, height, isMobile])

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'secondary'
    
    switch (trend.direction) {
      case 'up':
        return 'default'
      case 'down':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className={cn(
     "transition-all duration-200",
      isFullscreen &&"fixed inset-4 z-50 overflow-auto",
      className
    )}>
      <CardHeader className={cn(
       "flex flex-row items-start justify-between space-y-0 pb-2",
        isMobile ?"p-4" :"p-6"
      )}>
        <div className="space-y-1 flex-1">
          {title && (
            <CardTitle className={cn(
             "flex items-center gap-2",
              isMobile ?"text-base" :"text-lg"
            )}>
              {title}
              {trend && (
                <Badge 
                  variant={getTrendColor()}
                  className="flex items-center gap-1 text-xs"
                >
                  {getTrendIcon()}
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                  {trend.label && <span className="ml-1">({trend.label})</span>}
                </Badge>
              )}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              isMobile ?"text-sm" :"text-sm"
            )}>
              {description}
            </CardDescription>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {actions}
          
          {(showFullscreen || showDownload || showShare) && (
            <div className="flex items-center gap-1">
              {showShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle share */}}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              {showDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle download */}}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {showFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="h-8 w-8 p-0"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        isMobile ?"p-4 pt-0" :"p-6 pt-0"
      )}>
        <div style={{ height: chartHeight }}>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile Line Chart
interface MobileLineChartProps extends BaseMobileChartProps {
  xKey: string
  lines: Array<{
    key: string
    name: string
    color?: string
    strokeWidth?: number
  }>
  showGrid?: boolean
  showLegend?: boolean
  curved?: boolean
}

/**
 * MobileLineChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
export const MobileLineChart = memo(function MobileLineChart({
  data,
  xKey,
  lines,
  showGrid = true,
  showLegend = true,
  curved = true,
  ...baseProps
}: MobileLineChartProps) {
  const { isMobile } = useResponsive()

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ 
            top: 5, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? 10 : 20, 
            bottom: 5 
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-muted" 
            />
          )}
          <XAxis 
            dataKey={xKey}
            className="text-xs"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            className="text-xs"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 40 : 60}
          />
          <Tooltip content={<MobileTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
            />
          )}
          {lines.map((line, _index) => (
            <Line
              key={line.key}
              type={curved ?"monotone" :"linear"}
              dataKey={line.key}
              stroke={line.color || CHART_COLORS.primary[_index % CHART_COLORS.primary.length]}
              strokeWidth={line.strokeWidth || (isMobile ? 2 : 3)}
              dot={{ fill: line.color || CHART_COLORS.primary[_index], strokeWidth: 0, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0 }}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </BaseMobileChart>
  )
}, (prevProps: MobileLineChartProps, nextProps: MobileLineChartProps) => {
  return prevProps.data === nextProps.data && prevProps.lines === nextProps.lines
})

// Mobile Area Chart
interface MobileAreaChartProps extends BaseMobileChartProps {
  xKey: string
  areas: Array<{
    key: string
    name: string
    color?: string
  }>
  showGrid?: boolean
  stacked?: boolean
}

/**
 * MobileAreaChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
export const MobileAreaChart = memo(function MobileAreaChart({
  data,
  xKey,
  areas,
  showGrid = true,
  stacked = false,
  ...baseProps
}: MobileAreaChartProps) {
  const { isMobile } = useResponsive()

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data}
          margin={{ 
            top: 10, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? 10 : 20, 
            bottom: 0 
          }}
          stackOffset={stacked ? 'expand' : undefined}
        >
          <defs>
            {areas.map((area, _index) => (
              <linearGradient 
                key={area.key}
                id={`gradient-${area.key}`} 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="1"
              >
                <stop 
                  offset="5%" 
                  stopColor={area.color || CHART_COLORS.primary[_index]} 
                  stopOpacity={0.8}
                />
                <stop 
                  offset="95%" 
                  stopColor={area.color || CHART_COLORS.primary[_index]} 
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          )}
          <XAxis 
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 40 : 60}
          />
          <Tooltip content={<MobileTooltip />} />
          {areas.map((area, _index) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              stackId={stacked ?"1" : undefined}
              stroke={area.color || CHART_COLORS.primary[_index]}
              fill={`url(#gradient-${area.key})`}
              strokeWidth={isMobile ? 2 : 3}
              name={area.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </BaseMobileChart>
  )
}, (prevProps: MobileAreaChartProps, nextProps: MobileAreaChartProps) => {
  return prevProps.data === nextProps.data && prevProps.areas === nextProps.areas
})

// Mobile Bar Chart
interface MobileBarChartProps extends BaseMobileChartProps {
  xKey: string
  bars: Array<{
    key: string
    name: string
    color?: string
  }>
  showGrid?: boolean
  horizontal?: boolean
}

/**
 * MobileBarChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
export const MobileBarChart = memo(function MobileBarChart({
  data,
  xKey,
  bars,
  showGrid = true,
  horizontal = false,
  ...baseProps
}: MobileBarChartProps) {
  const { isMobile } = useResponsive()

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          layout={horizontal ?"horizontal" :"vertical"}
          margin={{ 
            top: 5, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? 10 : 20, 
            bottom: 5 
          }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          )}
          <XAxis 
            dataKey={horizontal ? undefined : xKey}
            type={horizontal ?"number" :"category"}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            dataKey={horizontal ? xKey : undefined}
            type={horizontal ?"category" :"number"}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={horizontal ? (isMobile ? 60 : 80) : (isMobile ? 40 : 60)}
          />
          <Tooltip content={<MobileTooltip />} />
          {bars.map((bar, _index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color || CHART_COLORS.primary[_index % CHART_COLORS.primary.length]}
              radius={isMobile ? 4 : 6}
              name={bar.name}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </BaseMobileChart>
  )
}, (prevProps: MobileBarChartProps, nextProps: MobileBarChartProps) => {
  return prevProps.data === nextProps.data && prevProps.bars === nextProps.bars
})

// Mobile Pie Chart
interface MobilePieChartProps extends BaseMobileChartProps {
  valueKey: string
  nameKey: string
  colors?: string[]
  showLabels?: boolean
  innerRadius?: number
}

/**
 * MobilePieChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
export const MobilePieChart = memo(function MobilePieChart({
  data,
  valueKey,
  nameKey,
  colors = CHART_COLORS.rainbow,
  showLabels = true,
  innerRadius = 0,
  ...baseProps
}: MobilePieChartProps) {
  const { isMobile } = useResponsive()

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (!showLabels || percent < 0.05) return null // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={isMobile ? 10 : 12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={isMobile ? 80 : 100}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={valueKey}
          >
            {data.map((entry, _index) => (
              <Cell 
                key={`cell-${_index}`} 
                fill={colors[_index % colors.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<MobileTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </BaseMobileChart>
  )
}, (prevProps: MobilePieChartProps, nextProps: MobilePieChartProps) => {
  return prevProps.data === nextProps.data && prevProps.valueKey === nextProps.valueKey
})

// Mini chart component for dashboard cards
interface MiniChartProps {
  data: any[]
  type: 'line' | 'area' | 'bar'
  dataKey: string
  color?: string
  className?: string
  height?: number
}

/**
 * MiniChart - Optimized with React.memo
 * Prevents unnecessary re-renders for dashboard mini charts
 */
export const MiniChart = memo(function MiniChart({
  data,
  type,
  dataKey,
  color = CHART_COLORS.primary[0],
  className,
  height = 60
}: MiniChartProps) {
  const ChartComponent = type === 'line' ? LineChart : type === 'area' ? AreaChart : BarChart

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          {type === 'line' && (
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={false}
            />
          )}
          {type === 'area' && (
            <>
              <defs>
                <linearGradient id="miniAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color}
                strokeWidth={2}
                fill="url(#miniAreaGradient)"
                dot={false}
              />
            </>
          )}
          {type === 'bar' && (
            <Bar dataKey={dataKey} fill={color} radius={2} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}, (prevProps: MiniChartProps, nextProps: MiniChartProps) => {
  return prevProps.data === nextProps.data && prevProps.type === nextProps.type
})
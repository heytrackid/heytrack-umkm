"use client"

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Fallback colors if CSS variables not available
const FALLBACK_COLORS = [
  "#3b82f6", // Blue 500
  "#10b981", // Emerald 500
  "#f59e0b", // Amber 500
  "#ef4444", // Red 500
  "#8b5cf6", // Violet 500
  "#06b6d4", // Cyan 500
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = Record<string, any>

// Simple chart config type for our components - compatible with ChartConfig
type SimpleChartConfig = ChartConfig

interface BaseChartProps {
  data: ChartData[]
  className?: string | undefined
  height?: number | string
}

// ============================================
// AREA CHART
// ============================================
interface AreaChartProps extends BaseChartProps {
  title?: string
  description?: string
  dataKey: string | string[]
  xAxisKey: string
  config?: SimpleChartConfig
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  gradient?: boolean
}

export function AreaChartComponent({
  data,
  title,
  description,
  dataKey,
  xAxisKey,
  config,
  className,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  gradient = true,
}: AreaChartProps) {
  const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey]
  
  const chartConfig = config ?? dataKeys.reduce((acc, key, index) => {
    acc[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] as string ?? "#3b82f6",
    }
    return acc
  }, {} as ChartConfig)

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        {(title || description) && (
          <CardHeader className="pb-2">
            {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
            {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="p-2 sm:p-6">
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            <div className="text-center">
              <p className="text-sm">Belum ada data untuk ditampilkan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
          {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-2 sm:p-6">
        <ChartContainer config={chartConfig} className="w-full !aspect-auto" style={{ height }}>
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            {gradient && dataKeys.map((key, index) => (
              <defs key={`gradient-${key}`}>
                <linearGradient id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig[key]?.color || FALLBACK_COLORS[index]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartConfig[key]?.color || FALLBACK_COLORS[index]} stopOpacity={0.05} />
                </linearGradient>
              </defs>
            ))}
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => {
                if (typeof value === 'string' && value.length > 10) {
                  return value.slice(0, 10)
                }
                return value
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                return value
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                {...(stacked && { stackId: "stack" })}
                stroke={chartConfig[key]?.color || FALLBACK_COLORS[index]}
                fill={gradient ? `url(#fill-${key})` : chartConfig[key]?.color || FALLBACK_COLORS[index]}
                fillOpacity={gradient ? 1 : 0.3}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ============================================
// BAR CHART
// ============================================
interface BarChartProps extends BaseChartProps {
  title?: string
  description?: string
  dataKey: string | string[]
  xAxisKey: string
  config?: SimpleChartConfig
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  horizontal?: boolean
}

export function BarChartComponent({
  data,
  title,
  description,
  dataKey,
  xAxisKey,
  config,
  className,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  horizontal = false,
}: BarChartProps) {
  const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey]
  
  const chartConfig = config ?? dataKeys.reduce((acc, key, index) => {
    acc[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] as string,
    }
    return acc
  }, {} as ChartConfig)

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        {(title || description) && (
          <CardHeader className="pb-2">
            {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
            {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="p-2 sm:p-6">
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            <div className="text-center">
              <p className="text-sm">Belum ada data untuk ditampilkan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
          {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-2 sm:p-6">
        <ChartContainer config={chartConfig} className="w-full !aspect-auto" style={{ height }}>
          <BarChart 
            data={data} 
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={!horizontal} horizontal={horizontal} />}
            {horizontal ? (
              <>
                <YAxis
                  dataKey={xAxisKey}
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  width={80}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                    return value
                  }}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                    return value
                  }}
                />
              </>
            )}
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && dataKeys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                {...(stacked && { stackId: "stack" })}
                fill={chartConfig[key]?.color || FALLBACK_COLORS[index]}
                radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ============================================
// LINE CHART
// ============================================
interface LineChartProps extends BaseChartProps {
  title?: string
  description?: string
  dataKey: string | string[]
  xAxisKey: string
  config?: SimpleChartConfig
  showGrid?: boolean
  showLegend?: boolean
  showDots?: boolean
}

export function LineChartComponent({
  data,
  title,
  description,
  dataKey,
  xAxisKey,
  config,
  className,
  height = 300,
  showGrid = true,
  showLegend = true,
  showDots = true,
}: LineChartProps) {
  const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey]
  
  const chartConfig = config ?? dataKeys.reduce((acc, key, index) => {
    acc[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] as string,
    }
    return acc
  }, {} as ChartConfig)

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
          {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-2 sm:p-6">
        <ChartContainer config={chartConfig} className="w-full !aspect-auto" style={{ height }}>
          <LineChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                return value
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && dataKeys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig[key]?.color || FALLBACK_COLORS[index]}
                strokeWidth={2}
                dot={showDots}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ============================================
// PIE / DONUT CHART
// ============================================
interface PieChartProps extends BaseChartProps {
  title?: string
  description?: string
  dataKey: string
  nameKey: string
  config?: SimpleChartConfig
  showLegend?: boolean
  donut?: boolean
  showLabel?: boolean
}

export function PieChartComponent({
  data,
  title,
  description,
  dataKey,
  nameKey,
  config,
  className,
  height = 300,
  showLegend = true,
  donut = false,
  showLabel = false,
}: PieChartProps) {
  const chartConfig = config ?? data.reduce((acc, item, index) => {
    const name = String(item[nameKey])
    acc[name] = {
      label: name,
      color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] as string,
    }
    return acc
  }, {} as ChartConfig)

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        {(title || description) && (
          <CardHeader className="pb-2">
            {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
            {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="p-2 sm:p-6">
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            <div className="text-center">
              <p className="text-sm">Belum ada data untuk ditampilkan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
          {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-2 sm:p-6">
        <ChartContainer config={chartConfig} className="w-full mx-auto !aspect-square max-h-[250px] sm:max-h-[300px]" style={{ height }}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey={nameKey} />} />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={donut ? "50%" : 0}
              outerRadius="80%"
              paddingAngle={2}
              {...(showLabel && { 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label: ({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`,
                labelLine: true 
              })}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartConfig[String(entry[nameKey])]?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} 
                />
              ))}
            </Pie>
            {showLegend && <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ============================================
// MINI CHART (for cards/widgets)
// ============================================
interface MiniChartProps {
  data: { value: number }[]
  color?: string
  height?: number
  type?: "area" | "line" | "bar"
  className?: string
}

export function MiniChart({
  data,
  color = FALLBACK_COLORS[0],
  height = 40,
  type = "area",
  className,
}: MiniChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={color} fill="url(#miniGradient)" strokeWidth={2} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

// Export types
export type { ChartConfig, SimpleChartConfig }

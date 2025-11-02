

// Chart and visualization types

/**
 * Generic chart data point
 */
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
  metadata?: Record<string, unknown>
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: string
  value: number
  label?: string
}

/**
 * Multi-series chart data
 */
export interface MultiSeriesChartData {
  labels: string[]
  datasets: ChartDataset[]
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  [key: string]: ChartSeriesConfig
}

/**
 * Individual series configuration
 */
export interface ChartSeriesConfig {
  label: string
  color?: string
  icon?: string
  format?: 'number' | 'currency' | 'percentage'
  visible?: boolean
}

/**
 * Chart options for customization
 */
export interface ChartOptions {
  responsive?: boolean
  maintainAspectRatio?: boolean
  aspectRatio?: number
  title?: ChartTitle
  legend?: ChartLegend
  tooltip?: ChartTooltip
  scales?: ChartScales
  plugins?: Record<string, unknown>
}

/**
 * Chart title configuration
 */
export interface ChartTitle {
  display?: boolean
  text?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  font?: ChartFont
  color?: string
}

/**
 * Chart legend configuration
 */
export interface ChartLegend {
  display?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  labels?: {
    color?: string
    font?: ChartFont
    padding?: number
    usePointStyle?: boolean
  }
}

/**
 * Chart tooltip configuration
 */
export interface ChartTooltip {
  enabled?: boolean
  mode?: 'point' | 'nearest' | 'index' | 'dataset'
  intersect?: boolean
  backgroundColor?: string
  titleColor?: string
  bodyColor?: string
  borderColor?: string
  borderWidth?: number
  padding?: number
  displayColors?: boolean
  callbacks?: Record<string, (context: unknown) => string>
}

/**
 * Chart scales configuration
 */
export interface ChartScales {
  x?: ChartScale
  y?: ChartScale
}

/**
 * Individual scale configuration
 */
export interface ChartScale {
  type?: 'linear' | 'logarithmic' | 'category' | 'time'
  display?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
  title?: {
    display?: boolean
    text?: string
    color?: string
    font?: ChartFont
  }
  ticks?: {
    color?: string
    font?: ChartFont
    callback?: (value: unknown) => string
  }
  grid?: {
    display?: boolean
    color?: string
    lineWidth?: number
  }
  min?: number
  max?: number
  suggestedMin?: number
  suggestedMax?: number
}

/**
 * Chart font configuration
 */
export interface ChartFont {
  family?: string
  size?: number
  style?: 'normal' | 'italic' | 'oblique'
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number
  lineHeight?: number | string
}

/**
 * Pie/Doughnut chart data
 */
export interface PieChartData {
  labels: string[]
  values: number[]
  colors?: string[]
  metadata?: Array<Record<string, unknown>>
}

/**
 * Bar chart data
 */
export interface BarChartData {
  categories: string[]
  series: BarChartSeries[]
}

/**
 * Bar chart series
 */
export interface BarChartSeries {
  name: string
  data: number[]
  color?: string
}

/**
 * Line chart data
 */
export interface LineChartData {
  labels: string[]
  series: LineChartSeries[]
}

/**
 * Line chart series
 */
export interface LineChartSeries {
  name: string
  data: number[]
  color?: string
  smooth?: boolean
  dashed?: boolean
}

/**
 * Heatmap data
 */
export interface HeatmapData {
  xLabels: string[]
  yLabels: string[]
  values: number[][]
  colorScale?: {
    min: string
    max: string
  }
}

/**
 * Scatter plot data point
 */
export interface ScatterDataPoint {
  x: number
  y: number
  label?: string
  size?: number
  color?: string
}

/**
 * Chart type
 */
export type ChartType = 
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polarArea'
  | 'scatter'
  | 'bubble'
  | 'heatmap'

/**
 * Chart props for React components
 */
export interface ChartProps<T = ChartDataPoint[]> {
  data: T
  config?: ChartConfig
  options?: ChartOptions
  type?: ChartType
  height?: number | string
  width?: number | string
  className?: string
  loading?: boolean
  error?: string
  onDataPointClick?: (dataPoint: unknown) => void
}

/**
 * Chart data transformer function
 */
export type ChartDataTransformer<TInput, TOutput> = (
  data: TInput[]
) => TOutput

/**
 * Chart filter options
 */
export interface ChartFilterOptions {
  dateRange?: {
    start: string
    end: string
  }
  categories?: string[]
  minValue?: number
  maxValue?: number
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

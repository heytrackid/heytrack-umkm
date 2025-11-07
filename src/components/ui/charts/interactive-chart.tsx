'use client'

import { Calendar, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import type { DateRange } from 'react-day-picker'

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string[] | string
    borderWidth?: number
    fill?: boolean
    tension?: number
  }>
}

interface InteractiveChartProps {
  type: 'bar' | 'line' | 'pie'
  data: ChartData
  className?: string
  title?: string
  onDateRangeChange?: (range: DateRange) => void
  showDateRange?: boolean
  initialDateRange?: DateRange
  zoomEnabled?: boolean
}

export const InteractiveChart = ({
  type,
  data,
  className,
  title,
  onDateRangeChange,
  showDateRange = false,
  initialDateRange,
  zoomEnabled = true,
}: InteractiveChartProps) => {
  const [currentDateRange, setCurrentDateRange] = useState<DateRange | undefined>(initialDateRange)
  const [isZoomed, setIsZoomed] = useState(false)

  // Update date range if provided
  useEffect(() => {
    if (initialDateRange) {
      setCurrentDateRange(initialDateRange)
    }
  }, [initialDateRange])

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setCurrentDateRange(range)
    if (range) {
      onDateRangeChange?.(range)
    }
  }

  // Reset zoom
  const resetZoom = () => {
    setIsZoomed(false)
  }

  // Zoom in
  const zoomIn = () => {
    setIsZoomed(true)
  }

  // Zoom out
  const zoomOut = () => {
    setIsZoomed(false)
  }

  return (
    <div className={cn('bg-background rounded-xl border p-4 relative', className)}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Picker */}
          {showDateRange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {currentDateRange 
                    ? `${currentDateRange.from?.toLocaleDateString()} - ${currentDateRange.to?.toLocaleDateString()}`
                    : 'Pilih Tanggal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <DateRangePicker
                  value={currentDateRange}
                  onChange={handleDateRangeChange}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Zoom Controls */}
          {zoomEnabled && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={type === 'pie'}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={type === 'pie'}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                disabled={!isZoomed || type === 'pie'}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground">
        Chart visualization for {type} - {data.labels.length} data points
      </div>

      {/* Chart Info */}
      {zoomEnabled && type !== 'pie' && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Gunakan scroll untuk zoom, drag untuk pan
        </div>
      )}
    </div>
  )
}

// Export helper functions
export const createChartData = (
  labels: string[],
  datasets: Array<{ label: string; data: number[]; color?: string }>
): ChartData => ({
  labels,
  datasets: datasets.map((ds, index) => ({
    label: ds.label,
    data: ds['data'],
    borderColor: ds.color ?? `hsl(${index * 137.5}, 50%, 50%)`,
    backgroundColor: ds.color ? `${ds.color}80` : `hsla(${index * 137.5}, 50%, 50%, 0.6)`,
    borderWidth: 2,
    fill: false,
    tension: 0.4
  }))
})
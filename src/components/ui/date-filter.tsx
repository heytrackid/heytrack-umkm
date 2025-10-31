'use client'

import { Calendar, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateFilterProps {
  startDate?: string
  endDate?: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onQuickFilter?: (days: number) => void
  className?: string
}

export const DateFilter = ({ 
  startDate = '', 
  endDate = '', 
  onStartDateChange, 
  onEndDateChange, 
  onQuickFilter,
  className 
}: DateFilterProps) => {
  
  const quickFilters = [
    { label: 'Hari ini', days: 0 },
    { label: '7 hari', days: 7 },
    { label: '30 hari', days: 30 },
    { label: '90 hari', days: 90 }
  ]

  const handleQuickFilter = (days: number) => {
    const today = new Date()
    const start = new Date()
    
    if (days === 0) {
      // Today only
      const todayStr = today.toISOString().split('T')[0]
      onStartDateChange(todayStr)
      onEndDateChange(todayStr)
    } else {
      // Last X days
      start.setDate(today.getDate() - days)
      onStartDateChange(start.toISOString().split('T')[0])
      onEndDateChange(today.toISOString().split('T')[0])
    }
    
    onQuickFilter?.(days)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-1">
        {quickFilters.map((filter) => (
          <Button
            key={filter.days}
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter(filter.days)}
            className="text-xs"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Custom</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Filter Tanggal
              </h4>
              <p className="text-sm text-muted-foreground">
                Pilih rentang tanggal untuk filter data
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs">Dari Tanggal</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs">Sampai Tanggal</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onStartDateChange('')
                  onEndDateChange('')
                }}
              >
                Clear
              </Button>
              <div className="text-xs text-muted-foreground">
                {startDate && endDate && (
                  `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)} hari`
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateFilter

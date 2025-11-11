'use client'

import { addDays, format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Calendar as CalendarLucideIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
  showPresets?: boolean
  minDate?: Date
  maxDate?: Date
}

interface DateRangePreset {
  label: string
  getValue: () => DateRange
}

const DATE_PRESETS: DateRangePreset[] = [
  {
    label: 'Hari Ini',
    getValue: () => ({
      from: new Date(),
      to: new Date()
    })
  },
  {
    label: '7 Hari Terakhir',
    getValue: () => ({
      from: addDays(new Date(), -6),
      to: new Date()
    })
  },
  {
    label: '30 Hari Terakhir',
    getValue: () => ({
      from: addDays(new Date(), -29),
      to: new Date()
    })
  },
  {
    label: '90 Hari Terakhir',
    getValue: () => ({
      from: addDays(new Date(), -89),
      to: new Date()
    })
  },
  {
    label: 'Bulan Ini',
    getValue: () => {
      const now = new Date()
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    }
  },
  {
    label: 'Bulan Lalu',
    getValue: () => {
      const now = new Date()
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0)
      }
    }
  }
]

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = 'Pilih rentang tanggal',
  disabled = false,
  align = 'start',
  showPresets = true,
  minDate,
  maxDate
}: DateRangePickerProps) {
  const formatDateRange = (dateRange: DateRange | undefined): string => {
    if (!dateRange?.from) {
      return placeholder
    }

    if (!dateRange.to) {
      return format(dateRange.from, 'dd MMM yyyy', { locale: idLocale })
    }

    return `${format(dateRange.from, 'dd MMM yyyy', { locale: idLocale })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: idLocale })}`
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarLucideIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-[95vw]" align={align} side="bottom">
          <div className="flex flex-col sm:flex-row">
            {showPresets && (
              <div className="flex flex-row sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-border p-3 overflow-x-auto sm:overflow-x-visible">
                <div className="text-xs font-semibold text-muted-foreground mb-0 sm:mb-2 mr-2 sm:mr-0 whitespace-nowrap flex-shrink-0">
                  Preset:
                </div>
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm whitespace-nowrap flex-shrink-0"
                    onClick={() => onDateChange?.(preset.getValue())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}
            <div className="p-3 overflow-x-auto">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={1}
                disabled={(day) => {
                  if (minDate && day < minDate) return true
                  if (maxDate && day > maxDate) return true
                  return false
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

'use client'

import { addDays, format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
  numberOfMonths?: number
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Pilih rentang tanggal',
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value)

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onChange?.(range)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd MMM yyyy', { locale: localeId })} -{' '}
                  {format(date.to, 'dd MMM yyyy', { locale: localeId })}
                </>
              ) : (
                format(date.from, 'dd MMM yyyy', { locale: localeId })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            locale={localeId}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Preset date ranges
export const dateRangePresets = {
  today: {
    label: 'Hari Ini',
    getValue: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  yesterday: {
    label: 'Kemarin',
    getValue: () => ({
      from: addDays(new Date(), -1),
      to: addDays(new Date(), -1),
    }),
  },
  last7Days: {
    label: '7 Hari Terakhir',
    getValue: () => ({
      from: addDays(new Date(), -7),
      to: new Date(),
    }),
  },
  last30Days: {
    label: '30 Hari Terakhir',
    getValue: () => ({
      from: addDays(new Date(), -30),
      to: new Date(),
    }),
  },
  last90Days: {
    label: '90 Hari Terakhir',
    getValue: () => ({
      from: addDays(new Date(), -90),
      to: new Date(),
    }),
  },
  thisMonth: {
    label: 'Bulan Ini',
    getValue: () => {
      const now = new Date()
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }
    },
  },
  lastMonth: {
    label: 'Bulan Lalu',
    getValue: () => {
      const now = new Date()
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0),
      }
    },
  },
  thisYear: {
    label: 'Tahun Ini',
    getValue: () => {
      const now = new Date()
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31),
      }
    },
  },
}

// Date range picker with presets
interface DateRangePickerWithPresetsProps extends DateRangePickerProps {
  presets?: Array<keyof typeof dateRangePresets>
}

export function DateRangePickerWithPresets({
  value,
  onChange,
  className,
  placeholder,
  numberOfMonths = 2,
  presets = ['last7Days', 'last30Days', 'last90Days', 'thisMonth'],
}: DateRangePickerWithPresetsProps) {
  const [date, setDate] = useState<DateRange | undefined>(value)

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onChange?.(range)
  }

  const handlePresetClick = (preset: keyof typeof dateRangePresets) => {
    const range = dateRangePresets[preset].getValue()
    handleSelect(range)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd MMM yyyy', { locale: localeId })} -{' '}
                  {format(date.to, 'dd MMM yyyy', { locale: localeId })}
                </>
              ) : (
                format(date.from, 'dd MMM yyyy', { locale: localeId })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets */}
            <div className="border-r border-border p-3 space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Preset
              </div>
              {presets.map((presetKey) => {
                const preset = dateRangePresets[presetKey]
                return (
                  <Button
                    key={presetKey}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handlePresetClick(presetKey)}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
            {/* Calendar */}
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={numberOfMonths}
                locale={localeId}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

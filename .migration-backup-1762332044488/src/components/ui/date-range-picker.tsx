'use client'

import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

const presets = [
  {
    label: 'Hari Ini',
    getValue: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    label: '7 Hari Terakhir',
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: '30 Hari Terakhir',
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: 'Bulan Ini',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Tahun Ini',
    getValue: () => ({
      from: startOfYear(new Date()),
      to: new Date(),
    }),
  },
]

export const DateRangePicker = ({
  value,
  onChange,
  className,
}: DateRangePickerProps) => {
  const [date, setDate] = useState<DateRange | undefined>(value)
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  useEffect(() => {
    setDate(value)
  }, [value])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    setSelectedPreset('')
    onChange?.(newDate)
  }

  const handlePresetChange = (presetLabel: string) => {
    const preset = presets.find((p) => p.label === presetLabel)
    if (preset) {
      const newDate = preset.getValue()
      setDate(newDate)
      setSelectedPreset(presetLabel)
      onChange?.(newDate)
    }
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {!date?.from && <span>Pilih periode</span>}
            {date?.from && !date.to && format(date.from, 'dd MMM yyyy', { locale: idLocale })}
            {date?.from && date.to && (
              <>
                {format(date.from, 'dd MMM yyyy', { locale: idLocale })} -{' '}
                {format(date.to, 'dd MMM yyyy', { locale: idLocale })}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            locale={idLocale}
          />
        </PopoverContent>
      </Popover>

      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Preset" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.label} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

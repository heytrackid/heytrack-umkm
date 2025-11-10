'use client'

import { addDays, format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateRangeValue {
  from: Date | undefined
  to: Date | undefined
}

interface PresetOption {
  key: string
  label: string
  getRange: () => DateRangeValue
}

const presets: PresetOption[] = [
  {
    key: '7d',
    label: '7 Hari',
    getRange: () => ({ from: addDays(new Date(), -6), to: new Date() })
  },
  {
    key: '30d',
    label: '30 Hari',
    getRange: () => ({ from: addDays(new Date(), -29), to: new Date() })
  },
  {
    key: 'this-month',
    label: 'Bulan Ini',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: start, to: now }
    }
  },
  {
    key: 'last-month',
    label: 'Bulan Lalu',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: start, to: end }
    }
  }
]

export interface DateRangePickerProps {
  value?: DateRangeValue
  onChange?: (range: DateRangeValue) => void
  align?: 'start' | 'center' | 'end'
  className?: string
  placeholder?: string
}

export function DateRangePicker({ value, onChange, align = 'start', className, placeholder = 'Pilih rentang tanggal' }: DateRangePickerProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState<DateRangeValue>(value ?? { from: undefined, to: undefined })

  const display = useMemo(() => {
    if (internal.from && internal.to) {
      return `${format(internal.from, 'd MMM', { locale: id })} - ${format(internal.to, 'd MMM yyyy', { locale: id })}`
    }
    if (internal.from) {
      return format(internal.from, 'd MMM yyyy', { locale: id })
    }
    return placeholder
  }, [internal.from, internal.to, placeholder])

  const applyPreset = (getRange: () => DateRangeValue): void => {
    const range = getRange()
    setInternal(range)
    onChange?.(range)
    setOpen(false)
  }

  const handleSelect = (range: DateRangeValue | undefined): void => {
    const next = range ?? { from: undefined, to: undefined }
    setInternal(next)
    if (next.from && next.to) {
      onChange?.(next)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal min-w-[240px]', !internal.from && 'text-muted-foreground', className)}
          aria-label="Pilih rentang tanggal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {display}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex flex-col sm:flex-row">
          <div className="p-3 border-b sm:border-b-0 sm:border-r min-w-[200px]">
            <div className="text-xs font-medium mb-2 text-muted-foreground">Preset</div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(preset => (
                <Button key={preset.key} variant="ghost" size="sm" className="justify-start" onClick={() => applyPreset(preset.getRange)}>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={internal as any}
            onSelect={(range) => handleSelect(range as DateRangeValue)}
            showOutsideDays
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

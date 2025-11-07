'use client'

import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  isBefore,
  isAfter,
  parse,
  isValid
} from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'


import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

import type { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  pageKey?: string // untuk localStorage per halaman
  maxPastMonths?: number // default 12 bulan
  timezone?: string // default 'Asia/Jakarta'
}

// Internal range type that allows partial ranges
interface PartialDateRange {
  from?: Date
  to?: Date
}

// Enhanced presets with icons and better organization
const PRESETS = [
  { id: 'today', label: 'Hari Ini', icon: '📅', getValue: () => ({ from: new Date(), to: new Date() }) },
  { id: 'yesterday', label: 'Kemarin', icon: '📅', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { id: 'last7days', label: '7 Hari Terakhir', icon: '📊', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { id: 'last30days', label: '30 Hari Terakhir', icon: '📊', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { id: 'thisWeek', label: 'Minggu Ini', icon: '📅', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
  { id: 'thisMonth', label: 'Bulan Ini', icon: '📅', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { id: 'lastMonth', label: 'Bulan Lalu', icon: '📅', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { id: 'custom', label: 'Custom Range', icon: '⚙️', getValue: () => undefined }
]

// Default range: 7 hari terakhir
const DEFAULT_RANGE = PRESETS.find(p => p['id'] === 'last7days')?.getValue()

// LocalStorage utilities
const getStorageKey = (pageKey?: string) => `date-range-${pageKey ?? 'default'}`

const saveToStorage = (range: DateRange | undefined, preset: string | null, pageKey?: string) => {
  if (typeof window === 'undefined') {return}
  try {
    localStorage.setItem(getStorageKey(pageKey), JSON.stringify({
      range,
      preset,
      timestamp: Date.now()
    }))
  } catch {
    // Silently fail if localStorage is not available
  }
}

const loadFromStorage = (pageKey?: string): { range: DateRange | undefined; preset: string | null } | null => {
  if (typeof window === 'undefined') {return null}
  try {
    const stored = localStorage.getItem(getStorageKey(pageKey))
    return stored ? JSON.parse(stored) : null
  } catch {
    // Silently fail if localStorage is not available
    return null
  }
}

export const DateRangePicker = ({
  value,
  onChange,
  className,
  pageKey,
  maxPastMonths = 12,
  timezone: _timezone = 'Asia/Jakarta'
}: DateRangePickerProps) => {
  const { isMobile } = useResponsive()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [range, setRange] = useState<PartialDateRange>(() => {
    if (value) {
      return { from: value.from, to: value.to }
    }
    if (DEFAULT_RANGE) {
      return { from: DEFAULT_RANGE.from, to: DEFAULT_RANGE.to }
    }
    return {}
  })
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [startDateStr, setStartDateStr] = useState('')
  const [endDateStr, setEndDateStr] = useState('')
  const [errors, setErrors] = useState<{ start?: string; end?: string }>({})
  const [lastUsedPreset, setLastUsedPreset] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage(pageKey)
    if (stored?.range) {
      setRange({ from: stored.range.from, to: stored.range.to })
      setSelectedPreset(stored.preset)
      setLastUsedPreset(stored.preset)
    }
  }, [pageKey])

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setRange({ from: value.from, to: value.to })
    } else if (DEFAULT_RANGE) {
      setRange({ from: DEFAULT_RANGE.from, to: DEFAULT_RANGE.to })
    } else {
      setRange({})
    }
  }, [value])

  // Update input strings when range changes
  useEffect(() => {
    if (range?.from) {
      setStartDateStr(format(range.from, 'dd MMM yyyy', { locale: idLocale }))
    } else {
      setStartDateStr('')
    }

    if (range?.to) {
      setEndDateStr(format(range.to, 'dd MMM yyyy', { locale: idLocale }))
    } else {
      setEndDateStr('')
    }
  }, [range])

  // Validate date range
  const validateRange = useCallback((from: Date | undefined, to: Date | undefined) => {
    const newErrors: { start?: string; end?: string } = {}

    if (from && to && isAfter(from, to)) {
      newErrors.end = 'Tanggal selesai harus setelah tanggal mulai'
    }

    if (from && maxPastMonths) {
      const maxPastDate = subMonths(new Date(), maxPastMonths)
      if (isBefore(from, maxPastDate)) {
        newErrors.start = `Maksimal ${maxPastMonths} bulan ke belakang`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [maxPastMonths])

  // Handle preset selection
  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p['id'] === presetId)
    if (!preset) {return}

    if (presetId === 'custom') {
      setSelectedPreset('custom')
      setRange({})
      setStartDateStr('')
      setEndDateStr('')
      setErrors({})
      return
    }

    const newRange = preset.getValue()
    if (newRange) {
      setRange({ from: newRange.from, to: newRange.to })
      setSelectedPreset(presetId)
      setLastUsedPreset(presetId)
      setErrors({})
    }
  }, [])

  // Handle calendar date selection
  const handleCalendarSelect = useCallback((newRange: DateRange | undefined) => {
    setRange(newRange ? { from: newRange.from, to: newRange.to } : {})
    setSelectedPreset(newRange ? 'custom' : null)
    validateRange(newRange?.from, newRange?.to)
  }, [validateRange])

  // Handle manual input changes
  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setStartDateStr(value)

    if (!value.trim()) {
      setRange(prev => ({ ...prev, from: undefined }))
      setErrors(prev => ({ ...prev, start: undefined }))
      return
    }

    try {
      const parsed = parse(value, 'dd MMM yyyy', new Date(), { locale: idLocale })
      if (isValid(parsed)) {
        setRange(prev => ({ ...prev, from: parsed }))
        setSelectedPreset('custom')
        validateRange(parsed, range.to)
      } else {
        setErrors(prev => ({ ...prev, start: 'Format tanggal tidak valid' }))
      }
    } catch {
      setErrors(prev => ({ ...prev, start: 'Format tanggal tidak valid' }))
    }
  }, [range, validateRange])

  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setEndDateStr(value)

    if (!value.trim()) {
      setRange(prev => ({ ...prev, to: undefined }))
      setErrors(prev => ({ ...prev, end: undefined }))
      return
    }

    try {
      const parsed = parse(value, 'dd MMM yyyy', new Date(), { locale: idLocale })
      if (isValid(parsed)) {
        setRange(prev => ({ ...prev, to: parsed }))
        setSelectedPreset('custom')
        validateRange(range.from, parsed)
      } else {
        setErrors(prev => ({ ...prev, end: 'Format tanggal tidak valid' }))
      }
    } catch {
      setErrors(prev => ({ ...prev, end: 'Format tanggal tidak valid' }))
    }
  }, [range, validateRange])

  // Handle apply button
  const handleApply = useCallback(async () => {
    if (!range?.from || !range?.to || Object.keys(errors).length > 0) {return}

    setIsLoading(true)
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 300))

    const completeRange: DateRange = { from: range.from, to: range.to }

    // Save to localStorage
    saveToStorage(completeRange, selectedPreset, pageKey)

    onChange?.(completeRange)
    setIsOpen(false)
    setIsLoading(false)
  }, [range, errors, selectedPreset, pageKey, onChange])

  // Handle reset
  const handleReset = useCallback(() => {
    const defaultRange = DEFAULT_RANGE
    if (defaultRange) {
      setRange({ from: defaultRange.from, to: defaultRange.to })
    } else {
      setRange({})
    }
    setSelectedPreset('last7days')
    setLastUsedPreset('last7days')
    setStartDateStr('')
    setEndDateStr('')
    setErrors({})
  }, [])

  // Format range for display
  const formatRangeDisplay = useCallback(() => {
    if (!range?.from) {return 'Pilih periode'}

    if (range.from && !range.to) {
      return `${format(range.from, 'dd MMM yyyy', { locale: idLocale })} - Pilih selesai`
    }

    if (range.from && range.to) {
      // Check if same month
      const fromMonth = format(range.from, 'MMM yyyy', { locale: idLocale })
      const toMonth = format(range.to, 'MMM yyyy', { locale: idLocale })

      if (fromMonth === toMonth) {
        return `${format(range.from, 'dd', { locale: idLocale })}-${format(range.to, 'dd', { locale: idLocale })} ${fromMonth}`
      } 
        return `${format(range.from, 'dd MMM', { locale: idLocale })}-${format(range.to, 'dd MMM yyyy', { locale: idLocale })}`
      
    }

    return 'Pilih periode'
  }, [range])

  // Convert PartialDateRange to DateRange for Calendar component
  const calendarRange: DateRange | undefined = useMemo(() => {
    if (range.from && range.to) {
      return { from: range.from, to: range.to }
    }
    return undefined
  }, [range])

  // Reorder presets to show "Terakhir dipakai" first
  const orderedPresets = useMemo(() => {
    if (!lastUsedPreset) {return PRESETS}

    const lastUsed = PRESETS.find((p: typeof PRESETS[0]) => p['id'] === lastUsedPreset)
    if (!lastUsed) {return PRESETS}

    const others = PRESETS.filter((p: typeof PRESETS[0]) => p['id'] !== lastUsedPreset)
    return [
      { ...lastUsed, label: `Terakhir dipakai: ${lastUsed.label}` },
      ...others
    ]
  }, [lastUsedPreset])

  // Keyboard navigation
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !calendarRef.current) {return}

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle calendar navigation
      if (e.target instanceof HTMLElement && calendarRef.current?.contains(e.target)) {
        return // Let calendar handle its own navigation
      }

      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          break
        case 'Enter':
          if (range?.from && range?.to && Object.keys(errors).length === 0) {
            void handleApply()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, range, errors, handleApply])

  const triggerButton = (
    <Button
      id="date-range-picker"
      variant="outline"
      className={cn(
        'w-full justify-start text-left font-normal',
        !range?.from && 'text-muted-foreground'
      )}
      aria-label="Pilih rentang tanggal"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      <span className="truncate">{formatRangeDisplay()}</span>
      <Badge variant="outline" className="ml-auto text-xs">
        UTC+7
      </Badge>
    </Button>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {triggerButton}
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[90dvh] max-h-[90dvh] overflow-hidden"
          aria-label="Pilih rentang tanggal"
        >
          <SheetHeader className="pb-2">
            <SheetTitle>Pilih Rentang Tanggal</SheetTitle>
          </SheetHeader>

          {/* Preset Chips - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 px-1" role="tablist">
            {orderedPresets.map(({ id, icon, label }) => (
              <Button
                key={id}
                variant={selectedPreset === id ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetSelect(id)}
                className="flex-shrink-0"
                role="tab"
                aria-selected={selectedPreset === id}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="flex-1 overflow-y-auto" ref={calendarRef}>
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={calendarRange}
              onSelect={handleCalendarSelect}
              locale={idLocale}
              disabled={(date) => maxPastMonths ? isBefore(date, subMonths(new Date(), maxPastMonths)) : false}
              className="w-full"
              aria-label="Kalender pemilihan rentang tanggal"
            />
          </div>

          {/* Input Controls */}
          <div className="space-y-2 py-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  placeholder="Mulai"
                  value={startDateStr}
                  onChange={handleStartDateChange}
                  className={cn("text-center", errors.start && "border-red-500")}
                  aria-invalid={Boolean(errors.start)}
                  aria-describedby={errors.start ? "start-error" : undefined}
                />
                {errors.start && (
                  <p id="start-error" className="text-xs text-red-600 mt-1" role="alert">
                    {errors.start}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Selesai"
                  value={endDateStr}
                  onChange={handleEndDateChange}
                  className={cn("text-center", errors.end && "border-red-500")}
                  aria-invalid={Boolean(errors.end)}
                  aria-describedby={errors.end ? "end-error" : undefined}
                />
                {errors.end && (
                  <p id="end-error" className="text-xs text-red-600 mt-1" role="alert">
                    {errors.end}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="flex-row gap-2">
            <Button variant="ghost" onClick={handleReset} disabled={isLoading}>
              Reset
            </Button>
            <Button
              onClick={handleApply}
              disabled={!range?.from || !range?.to || Object.keys(errors).length > 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menerapkan...
                </>
              ) : (
                'Terapkan'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop Layout
  return (
    <div className={cn('w-full', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Preset Sidebar */}
            <div className="w-48 border-r p-4">
              <h4 className="font-medium text-sm mb-3">Preset Cepat</h4>
              <div className="space-y-2">
                {orderedPresets.map(({ id, icon, label }) => (
                  <Button
                    key={id}
                    variant={selectedPreset === id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handlePresetSelect(id)}
                    aria-pressed={selectedPreset === id}
                  >
                    <span className="mr-2">{icon}</span>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calendar Area */}
            <div className="p-4" ref={calendarRef}>
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={calendarRange}
                onSelect={handleCalendarSelect}
                locale={idLocale}
                disabled={(date) => maxPastMonths ? isBefore(date, subMonths(new Date(), maxPastMonths)) : false}
                aria-label="Kalender pemilihan rentang tanggal"
              />

              {/* Input Controls */}
              <div className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Mulai"
                    value={startDateStr}
                    onChange={handleStartDateChange}
                    className={cn("text-center", errors.start && "border-red-500")}
                    aria-invalid={Boolean(errors.start)}
                    aria-describedby={errors.start ? "start-error" : undefined}
                  />
                  {errors.start && (
                    <p id="start-error" className="text-xs text-red-600 mt-1" role="alert">
                      {errors.start}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Selesai"
                    value={endDateStr}
                    onChange={handleEndDateChange}
                    className={cn("text-center", errors.end && "border-red-500")}
                    aria-invalid={Boolean(errors.end)}
                    aria-describedby={errors.end ? "end-error" : undefined}
                  />
                  {errors.end && (
                    <p id="end-error" className="text-xs text-red-600 mt-1" role="alert">
                      {errors.end}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={!range?.from || !range?.to || Object.keys(errors).length > 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menerapkan...
                    </>
                  ) : (
                    'Terapkan'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

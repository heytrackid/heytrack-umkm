import { addDays } from 'date-fns'
import { useCallback, useState } from 'react'
import { type DateRange } from 'react-day-picker'

export interface DateRangeFilterOptions {
  defaultDays?: number
  minDate?: Date
  maxDate?: Date
  onRangeChange?: (range: DateRange | undefined) => void
}

export interface DateRangeFilterReturn {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  resetToDefault: () => void
  isValidRange: boolean
  getDaysDifference: () => number | null
}

/**
 * Custom hook for managing date range filter state
 * 
 * @example
 * ```tsx
 * const { dateRange, setDateRange, resetToDefault } = useDateRangeFilter({
 *   defaultDays: 30,
 *   maxDate: new Date()
 * })
 * 
 * return (
 *   <DateRangePicker
 *     date={dateRange}
 *     onDateChange={setDateRange}
 *   />
 * )
 * ```
 */
export function useDateRangeFilter(options: DateRangeFilterOptions = {}): DateRangeFilterReturn {
  const {
    defaultDays = 30,
    minDate,
    maxDate,
    onRangeChange
  } = options

  const getDefaultRange = useCallback((): DateRange => ({
    from: addDays(new Date(), -defaultDays + 1),
    to: new Date()
  }), [defaultDays])

  const [dateRange, setDateRangeState] = useState<DateRange | undefined>(getDefaultRange)

  const setDateRange = useCallback((range: DateRange | undefined) => {
    setDateRangeState(range)
    onRangeChange?.(range)
  }, [onRangeChange])

  const resetToDefault = useCallback(() => {
    const defaultRange = getDefaultRange()
    setDateRange(defaultRange)
  }, [getDefaultRange, setDateRange])

  const isValidRange = Boolean(
    dateRange?.from &&
    dateRange?.to &&
    dateRange.from <= dateRange.to &&
    (!minDate || dateRange.from >= minDate) &&
    (!maxDate || dateRange.to <= maxDate)
  )

  const getDaysDifference = useCallback((): number | null => {
    if (!dateRange?.from || !dateRange?.to) return null
    return Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
  }, [dateRange])

  return {
    dateRange,
    setDateRange,
    resetToDefault,
    isValidRange,
    getDaysDifference
  }
}

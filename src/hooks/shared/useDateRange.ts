import { addDays } from 'date-fns'
import { useMemo } from 'react'

export interface DateRangeValue {
  from: Date
  to: Date
}

export function useDateRange(): {
  range: DateRangeValue
  fromParam: string | null
  toParam: string | null
} {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const fromParam = params?.get('from') ?? null
  const toParam = params?.get('to') ?? null

  const range = useMemo<DateRangeValue>(() => {
    const now = new Date()
    const fallbackFrom = addDays(now, -29)
    const fallbackTo = now

    const from = fromParam ? new Date(fromParam) : fallbackFrom
    const to = toParam ? new Date(toParam) : fallbackTo

    return { from, to }
  }, [fromParam, toParam])

  return { range, fromParam, toParam }
}

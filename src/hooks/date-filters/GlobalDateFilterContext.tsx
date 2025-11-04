'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { DateRange } from 'react-day-picker'

// Global Date Filter Context - untuk fitur utama yang saling terhubung
interface GlobalDateFilterContextValue {
  globalDateRange: DateRange | undefined
  setGlobalDateRange: (dateRange: DateRange | undefined) => void
  clearGlobalDateRange: () => void
  hasGlobalDateFilter: boolean
}

const GlobalDateFilterContext = createContext<GlobalDateFilterContextValue | undefined>(undefined)

interface GlobalDateFilterProviderProps {
  children: ReactNode
  defaultDateRange?: DateRange
}

export const GlobalDateFilterProvider = ({ 
  children, 
  defaultDateRange 
}: GlobalDateFilterProviderProps) => {
  const [globalDateRange, setGlobalDateRange] = useState<DateRange | undefined>(defaultDateRange)

  const clearGlobalDateRange = () => {
    setGlobalDateRange(undefined)
  }

  const hasGlobalDateFilter = Boolean(globalDateRange?.from)

  const value: GlobalDateFilterContextValue = {
    globalDateRange,
    setGlobalDateRange,
    clearGlobalDateRange,
    hasGlobalDateFilter
  }

  return (
    <GlobalDateFilterContext.Provider value={value}>
      {children}
    </GlobalDateFilterContext.Provider>
  )
}

// Hook untuk menggunakan global date filter
export const useGlobalDateFilter = () => {
  const context = useContext(GlobalDateFilterContext)
  if (context === undefined) {
    throw new Error('useGlobalDateFilter must be used within a GlobalDateFilterProvider')
  }
  return context
}

// Utility function untuk filter data berdasarkan global date range
export const filterByGlobalDateRange = <T extends { created_at?: string | null }>(
  data: T[],
  globalDateRange: DateRange | undefined
): T[] => {
  if (!globalDateRange?.from) {
    return data
  }

  return data.filter(item => {
    if (!item.created_at) {
      return true
    }

    const itemDate = new Date(item.created_at)
    const fromDate = new Date(globalDateRange.from as Date)
    const toDate = globalDateRange.to ? new Date(globalDateRange.to) : new Date()

    // Set time to start and end of day
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    return itemDate >= fromDate && itemDate <= toDate
  })
}

// Constants untuk preset global date ranges
export const GLOBAL_DATE_PRESETS = {
  today: {
    label: 'Hari Ini',
    getValue: () => ({
      from: new Date(),
      to: new Date()
    })
  },
  yesterday: {
    label: 'Kemarin',
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        from: yesterday,
        to: yesterday
      }
    }
  },
  last7Days: {
    label: '7 Hari Terakhir',
    getValue: () => {
      const today = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      return {
        from: weekAgo,
        to: today
      }
    }
  },
  last30Days: {
    label: '30 Hari Terakhir',
    getValue: () => {
      const today = new Date()
      const monthAgo = new Date()
      monthAgo.setDate(today.getDate() - 30)
      return {
        from: monthAgo,
        to: today
      }
    }
  },
  thisMonth: {
    label: 'Bulan Ini',
    getValue: () => {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        from: startOfMonth,
        to: today
      }
    }
  },
  lastMonth: {
    label: 'Bulan Lalu',
    getValue: () => {
      const today = new Date()
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        from: startOfLastMonth,
        to: endOfLastMonth
      }
    }
  }
} as const

export type GlobalDatePresetKey = keyof typeof GLOBAL_DATE_PRESETS

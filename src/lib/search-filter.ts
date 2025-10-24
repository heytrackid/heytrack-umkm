/**
 * Search & Filter Utilities
 * Reusable filter components and URL persistence
 */

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export interface FilterConfig {
  key: string
  type: 'text' | 'select' | 'date' | 'range'
  label: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  defaultValue?: string | number
}

export interface FilterState {
  [key: string]: string | number | undefined
}

/**
 * Parse filters from URL query params
 */
export function parseFiltersFromUrl(searchParams: URLSearchParams): FilterState {
  const filters: FilterState = {}

  searchParams.forEach((value, key) => {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      filters[filterKey] = value
    }
  })

  return filters
}

/**
 * Build URL search params from filters
 */
export function buildFilterParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(`filter_${key}`, String(value))
    }
  })

  return params
}

/**
 * useFilters - Hook for managing filters with URL persistence
 */
export function useFilters(defaultFilters: FilterState = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = React.useState<FilterState>(() => {
    const urlFilters = parseFiltersFromUrl(searchParams)
    return { ...defaultFilters, ...urlFilters }
  })

  /**
   * Update single filter
   */
  const setFilter = React.useCallback(
    (key: string, value: string | number | undefined) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value }
        updateUrl(updated)
        return updated
      })
    },
    []
  )

  /**
   * Update multiple filters
   */
  const setFiltersMultiple = React.useCallback((newFilters: FilterState) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters }
      updateUrl(updated)
      return updated
    })
  }, [])

  /**
   * Clear specific filter
   */
  const clearFilter = React.useCallback((key: string) => {
    setFilter(key, undefined)
  }, [setFilter])

  /**
   * Clear all filters
   */
  const clearAllFilters = React.useCallback(() => {
    setFilters(defaultFilters)
    updateUrl(defaultFilters)
  }, [defaultFilters])

  /**
   * Update URL with filter params
   */
  const updateUrl = (updatedFilters: FilterState) => {
    const params = buildFilterParams(updatedFilters)
    const url = params.toString() ? `?${params.toString()}` : ''
    router.replace(url)
  }

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  return {
    filters,
    setFilter,
    setFiltersMultiple,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  }
}

/**
 * useSearch - Hook for search with debouncing
 */
export function useSearch(defaultValue = '', debounceMs = 300) {
  const [searchValue, setSearchValue] = React.useState(defaultValue)
  const [debouncedValue, setDebouncedValue] = React.useState(defaultValue)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue, debounceMs])

  return {
    searchValue,
    setSearchValue,
    debouncedValue,
  }
}

/**
 * Simple text search across array
 */
export function filterBySearch<T extends Record<string, unknown>>(
  items: T[],
  searchTerm: string,
  searchableFields: (keyof T)[]
): T[] {
  if (!searchTerm) return items

  const lowerSearchTerm = searchTerm.toLowerCase()

  return items.filter((item) =>
    searchableFields.some((field) => {
      const value = item[field]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(lowerSearchTerm)
    })
  )
}

/**
 * Filter array by multiple conditions
 */
export function filterByConditions<T extends Record<string, unknown>>(
  items: T[],
  conditions: Partial<Record<keyof T, unknown>>
): T[] {
  return items.filter((item) =>
    Object.entries(conditions).every(([key, value]) => {
      if (value === undefined || value === '') return true
      return item[key as keyof T] === value
    })
  )
}

/**
 * Range filter for numbers/dates
 */
export function filterByRange<T extends Record<string, unknown>>(
  items: T[],
  field: keyof T,
  min?: number | Date,
  max?: number | Date
): T[] {
  return items.filter((item) => {
    const value = item[field]
    if (value === null || value === undefined) return false

    const numValue = typeof value === 'number' ? value : new Date(value).getTime()
    const numMin = typeof min === 'number' ? min : min?.getTime()
    const numMax = typeof max === 'number' ? max : max?.getTime()

    if (numMin !== undefined && numValue < numMin) return false
    if (numMax !== undefined && numValue > numMax) return false

    return true
  })
}

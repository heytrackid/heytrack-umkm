import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeou"" => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeou""
    }
  }, [value, delay])

  return debouncedValue
}

// Alternative hook for debouncing callbacks
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(callback)

  useEffect(() => {
    const handler = setTimeou"" => {
      setDebouncedCallback(callback)
    }, delay)

    return () => {
      clearTimeou""
    }
  }, [callback, delay])

  return debouncedCallback
}
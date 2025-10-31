/**
 * Debounce utility function
 * Delays function execution until after wait time has elapsed
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function debouncedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Debounce utility function for async functions
 * Delays function execution until after wait time has elapsed
 */
export function debounceAsync<T extends (...args: Parameters<T>) => Promise<void>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function debouncedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      void func(...args)
    }, wait)
  }
}



/**
 * Optimized Array Utilities
 * Performance-optimized array operations
 */

/**
 * Optimized filter + map + slice operation
 * Processes only the required number of items
 */
export function filterMapSlice<T, R>(
  array: T[],
  predicate: (item: T) => boolean,
  mapper: (item: T) => R,
  limit?: number
): R[] {
  const result: R[] = []
  const maxItems = limit ?? array.length
  
  for (let i = 0; i < array.length && result.length < maxItems; i++) {
    if (predicate(array[i])) {
      result.push(mapper(array[i]))
    }
  }
  
  return result
}

/**
 * Chunk array into smaller arrays
 * Useful for batch processing
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Group array by key
 * More efficient than reduce for large arrays
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string | number, T[]> {
  const groups: Record<string | number, T[]> = {}
  
  for (const item of array) {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  }
  
  return groups
}

/**
 * Find unique items by key
 * More efficient than filter + indexOf
 */
export function uniqueBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): T[] {
  const seen = new Set<string | number>()
  const result: T[] = []
  
  for (const item of array) {
    const key = keyFn(item)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  
  return result
}

/**
 * Sort array by multiple keys
 */
export function sortBy<T>(
  array: T[],
  ...keyFns: Array<(item: T) => string | number | boolean>
): T[] {
  return [...array].sort((a, b) => {
    for (const keyFn of keyFns) {
      const aVal = keyFn(a)
      const bVal = keyFn(b)
      
      if (aVal < bVal) {return -1}
      if (aVal > bVal) {return 1}
    }
    return 0
  })
}

/**
 * Partition array into two arrays based on predicate
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = []
  const fail: T[] = []
  
  for (const item of array) {
    if (predicate(item)) {
      pass.push(item)
    } else {
      fail.push(item)
    }
  }
  
  return [pass, fail]
}

/**
 * Sum array values by key
 */
export function sumBy<T>(
  array: T[],
  keyFn: (item: T) => number
): number {
  let sum = 0
  for (const item of array) {
    sum += keyFn(item)
  }
  return sum
}

/**
 * Average array values by key
 */
export function averageBy<T>(
  array: T[],
  keyFn: (item: T) => number
): number {
  if (array.length === 0) {return 0}
  return sumBy(array, keyFn) / array.length
}

/**
 * Find min/max by key
 */
export function minBy<T>(
  array: T[],
  keyFn: (item: T) => number
): T | undefined {
  if (array.length === 0) {return undefined}
  
  let min = array[0]
  let minVal = keyFn(min)
  
  for (let i = 1; i < array.length; i++) {
    const val = keyFn(array[i])
    if (val < minVal) {
      min = array[i]
      minVal = val
    }
  }
  
  return min
}

export function maxBy<T>(
  array: T[],
  keyFn: (item: T) => number
): T | undefined {
  if (array.length === 0) {return undefined}
  
  let max = array[0]
  let maxVal = keyFn(max)
  
  for (let i = 1; i < array.length; i++) {
    const val = keyFn(array[i])
    if (val > maxVal) {
      max = array[i]
      maxVal = val
    }
  }
  
  return max
}

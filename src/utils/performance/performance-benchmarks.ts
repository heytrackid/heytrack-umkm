import { apiLogger } from '@/lib/logger'

import { performanceMonitor } from './performance-monitoring'

/**
 * Performance Benchmarking and Measurement Tools
 * Provides tools for measuring and tracking application performance
 */

interface BenchmarkResult {
  name: string
  duration: number
  timestamp: number
  memoryBefore?: { used: number; total: number; limit: number }
  memoryAfter?: { used: number; total: number; limit: number }
}

interface PerformanceBenchmarkConfig {
  iterations?: number // Number of times to run the benchmark
  warmupRuns?: number // Number of warmup runs before actual benchmarking
  timeout?: number // Timeout for each benchmark run
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = []
  private readonly config: PerformanceBenchmarkConfig

  constructor(config: PerformanceBenchmarkConfig = {}) {
    this.config = {
      iterations: 5,
      warmupRuns: 2,
      timeout: 10000, // 10 seconds
      ...config
    }
  }

  /**
   * Run a performance benchmark
   */
  async runBenchmark(
    name: string,
    benchmarkFn: () => Promise<void> | void
  ): Promise<BenchmarkResult> {
    // Warmup runs
    for (let i = 0; i < (this.config.warmupRuns ?? 2); i++) {
      // eslint-disable-next-line no-await-in-loop
      await this.executeBenchmark(benchmarkFn)
    }

    // Actual benchmark runs
    const durations: number[] = []
    let memoryBefore, memoryAfter

    for (let i = 0; i < (this.config.iterations ?? 5); i++) {
      // Capture memory before
      memoryBefore = this.getMemoryInfo()

      const startTime = performance.now()
      // eslint-disable-next-line no-await-in-loop
      await this.executeBenchmark(benchmarkFn)
      const endTime = performance.now()
      
      const duration = endTime - startTime
      durations.push(duration)

      // Capture memory after
      memoryAfter = this.getMemoryInfo()
    }

    // Calculate average duration
    const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length
    
    const result: BenchmarkResult = {
      name,
      duration: avgDuration,
      timestamp: Date.now(),
      memoryBefore,
      memoryAfter
    }

    this.results.push(result)
    
    // Log results
    apiLogger.info({
      benchmark: name,
      avgDuration: avgDuration.toFixed(2),
      iterations: this.config.iterations,
      memoryChange: memoryAfter && memoryBefore 
        ? memoryAfter.used - memoryBefore.used
        : undefined
    }, 'Benchmark completed')

    return result
  }

  /**
   * Execute a single benchmark run with timeout
   */
  private executeBenchmark(benchmarkFn: () => Promise<void> | void): Promise<void> {
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Benchmark timeout')), this.config.timeout)
    })

    const benchmarkPromise = Promise.resolve(benchmarkFn())

    return Promise.race([benchmarkPromise, timeoutPromise])
  }

  /**
   * Get memory info if available
   */
  private getMemoryInfo(): { used: number; total: number; limit: number } | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const perfWithMemory = performance as Performance & {
        memory: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      const {memory} = perfWithMemory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        }
      }
    }
    return undefined
  }

  /**
   * Compare benchmark results
   */
  compareResults(baseline: BenchmarkResult, current: BenchmarkResult): {
    name: string
    baselineDuration: number
    currentDuration: number
    change: number
    changePercent: number
    regression: boolean
  } {
    const change = current.duration - baseline.duration
    const changePercent = ((change / baseline.duration) * 100)
    const regression = changePercent > 5 // Consider regression if performance degrades by more than 5%

    return {
      name: current.name,
      baselineDuration: baseline.duration,
      currentDuration: current.duration,
      change,
      changePercent,
      regression
    }
  }

  /**
   * Get all benchmark results
   */
  getResults(): BenchmarkResult[] {
    return [...this.results]
  }

  /**
   * Clear all benchmark results
   */
  clearResults(): void {
    this.results = []
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No benchmark results available.'
    }

    let report = 'Performance Benchmark Report\n'
    report += `${'='.repeat(50)  }\n`
    
    this.results.forEach(result => {
      report += `Benchmark: ${result.name}\n`
      report += `Duration: ${result.duration.toFixed(2)}ms\n`
      report += `Date: ${new Date(result['timestamp']).toISOString()}\n`
      
      if (result.memoryBefore && result.memoryAfter) {
        report += `Memory Change: ${(result.memoryAfter.used - result.memoryBefore.used) / 1024 / 1024} MB\n`
      }
      
      report += '\n'
    })

    return report
  }
}

// Singleton benchmark instance
export const performanceBenchmark = new PerformanceBenchmark()

/**
 * Predefined benchmarks for common operations
 */
export class PredefinedBenchmarks {
  /**
   * Benchmark React component rendering
   */
  static benchmarkComponentRender(
    componentName: string,
    renderFn: () => void,
    iterations = 10
  ): Promise<BenchmarkResult> {
    return performanceBenchmark.runBenchmark(
      `component:${componentName}`,
      () => {
        for (let i = 0; i < iterations; i++) {
          renderFn()
        }
      }
    )
  }

  /**
   * Benchmark API call performance
   */
  static benchmarkApiCall(
    endpoint: string,
    apiFn: () => Promise<void>
  ): Promise<BenchmarkResult> {
    return performanceBenchmark.runBenchmark(
      `api:${endpoint}`,
      apiFn
    )
  }

  /**
   * Benchmark database query performance
   */
  static benchmarkDatabaseQuery(
    queryName: string,
    queryFn: () => Promise<void>
  ): Promise<BenchmarkResult> {
    return performanceBenchmark.runBenchmark(
      `db:${queryName}`,
      queryFn
    )
  }

  /**
   * Benchmark cache operations
   */
  static benchmarkCacheOperation(
    operation: string,
    cacheFn: () => void
  ): Promise<BenchmarkResult> {
    return performanceBenchmark.runBenchmark(
      `cache:${operation}`,
      cacheFn
    )
  }

  /**
   * Benchmark data processing operations
   */
  static benchmarkDataProcessing(
    operationName: string,
    processFn: () => void
  ): Promise<BenchmarkResult> {
    return performanceBenchmark.runBenchmark(
      `processing:${operationName}`,
      processFn
    )
  }
}

/**
 * Performance measurement utilities
 */
export class PerformanceMeasurement {
  /**
   * Measure function execution time
   */
  static async measureFunction<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await Promise.resolve(fn())
    const duration = performance.now() - start

    apiLogger.debug({
      operation: name,
      duration: duration.toFixed(2)
    }, 'Function execution measured')

    return { result, duration }
  }

  /**
   * Measure memory usage of an operation
   */
  static async measureMemoryUsage<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<{ result: T; memoryUsed: number | null }> {
    const memoryBefore = typeof performance !== 'undefined' && 'memory' in performance
      ? (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
      : null

    const result = await Promise.resolve(fn())

    const memoryAfter = typeof performance !== 'undefined' && 'memory' in performance
      ? (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
      : null

    const memoryUsed = memoryAfter && memoryBefore
      ? memoryAfter - memoryBefore
      : null

    if (memoryUsed !== null) {
      apiLogger.debug({
        operation: name,
        memoryChange: memoryUsed / 1024 / 1024 // Convert to MB
      }, 'Memory usage measured')
    }

    return { result, memoryUsed }
  }

  /**
   * Measure batch operations
   */
  static async measureBatchOperation<T>(
    name: string,
    operations: Array<() => Promise<T> | T>,
    concurrent = false
  ): Promise<{ results: T[]; durations: number[]; totalTime: number }> {
    const start = performance.now()
    const durations: number[] = []
    const results: T[] = []

    if (concurrent) {
      // Run operations concurrently
      const promises = operations.map(async (op, index) => {
        const opStart = performance.now()
        const result = await Promise.resolve(op())
        const opDuration = performance.now() - opStart
        durations[index] = opDuration
        return result
      })
      
      results.push(...await Promise.all(promises))
    } else {
      // Run operations sequentially
      for (const [, op] of operations.entries()) {
        const opStart = performance.now()
        // eslint-disable-next-line no-await-in-loop
        const result = await Promise.resolve(op())
        const opDuration = performance.now() - opStart
        results.push(result)
        durations.push(opDuration)
      }
    }

    const totalTime = performance.now() - start

    apiLogger.debug({
      operation: name,
      count: operations.length,
      totalTime: totalTime.toFixed(2),
      avgTime: (totalTime / operations.length).toFixed(2)
    }, 'Batch operation measured')

    return { results, durations, totalTime }
  }
}

/**
 * Performance reporting utilities
 */
export class PerformanceReporter {
  /**
   * Generate a performance report with key metrics
   */
  static generatePerformanceReport(): Record<string, unknown> {
    const metrics = performanceMonitor.getStats()
    
    return {
      timestamp: new Date().toISOString(),
      metrics,
      benchmarks: performanceBenchmark.getResults(),
      memory: typeof performance !== 'undefined' && 'memory' in performance
        ? (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
        : null,
      navigation: typeof performance !== 'undefined' 
        ? performance.getEntriesByType('navigation') 
        : [],
      resources: typeof performance !== 'undefined' 
        ? performance.getEntriesByType('resource') 
        : [],
      paints: typeof performance !== 'undefined' 
        ? performance.getEntriesByType('paint') 
        : [],
      longTasks: typeof performance !== 'undefined' 
        ? performance.getEntriesByType('longtask') 
        : []
    }
  }

  /**
   * Log performance report
   */
  static logPerformanceReport(): void {
    const report = this.generatePerformanceReport()
    
    apiLogger.info({
      ...report,
      memory: report['memory'] ? {
        used: `${((report['memory'] as { usedJSHeapSize: number })['usedJSHeapSize'] / 1024 / 1024).toFixed(2)} MB`,
        total: `${((report['memory'] as { totalJSHeapSize: number })['totalJSHeapSize'] / 1024 / 1024).toFixed(2)} MB`,
        limit: `${((report['memory'] as { jsHeapSizeLimit: number })['jsHeapSizeLimit'] / 1024 / 1024).toFixed(2)} MB`
      } : null
    }, 'Performance Report')
  }

  /**
   * Export performance data for analysis
   */
  static exportPerformanceData(): string {
    const report = this.generatePerformanceReport()
    return JSON.stringify(report, null, 2)
  }
}

// Export convenience functions
export const measurePerformance = PerformanceMeasurement.measureFunction
export const benchmark = PredefinedBenchmarks
export const reportPerformance = PerformanceReporter.logPerformanceReport
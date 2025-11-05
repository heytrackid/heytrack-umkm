'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'
import { performanceLogger } from '@/lib/client-logger'





/**
 * Web Vitals tracking
 */
export function useWebVitals(onMetric?: (metric: Metric) => void) {
    useEffect(() => {
        const handleMetric = (metric: Metric) => {
            performanceLogger.info({
                name: metric.name,
                value: metric.value,
                rating: metric.rating
            }, `Web Vitals: ${metric.name}`)

            // Send to analytics
            onMetric?.(metric)

            // Send to API endpoint for tracking
            if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
                const body = JSON.stringify({
                    name: metric.name,
                    value: metric.value,
                    rating: metric.rating,
                    delta: metric.delta,
                    id: metric.id,
                    navigationType: metric.navigationType
                })

                navigator.sendBeacon('/api/analytics/web-vitals', body)
            }
        }

        // Track all Core Web Vitals
        onCLS(handleMetric)
        onFCP(handleMetric)
        onINP(handleMetric)
        onLCP(handleMetric)
        onTTFB(handleMetric)
    }, [onMetric])
}

/**
 * Performance observer for custom metrics
 */
export function usePerformanceObserver(
    entryTypes: string[],
    callback: (entries: PerformanceEntry[]) => void
) {
    useEffect(() => {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
            return
        }

        const observer = new PerformanceObserver((list) => {
            callback(list.getEntries())
        })

        try {
            observer.observe({ entryTypes })
        } catch (e) {
            performanceLogger.error({ error: e }, 'PerformanceObserver error')
        }

        return () => observer.disconnect()
    }, [entryTypes, callback])
}

/**
 * Track long tasks (> 50ms)
 */
export function useLongTaskTracking() {
    usePerformanceObserver(['longtask'], (entries) => {
        entries.forEach((entry) => {
            if (entry.duration > 50) {
                performanceLogger.warn({
                    duration: entry.duration,
                    startTime: entry.startTime,
                    name: entry.name
                }, `Long task detected: ${entry.duration}ms`)

                // Send to analytics
                if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
                    navigator.sendBeacon('/api/analytics/long-tasks', JSON.stringify({
                        duration: entry.duration,
                        startTime: entry.startTime,
                        name: entry.name
                    }))
                }
            }
        })
    })
}

/**
 * Track resource loading performance
 */
export function useResourceTiming() {
    usePerformanceObserver(['resource'], (entries) => {
        const resourceEntries = entries.filter((entry): entry is PerformanceResourceTiming => entry.entryType === 'resource')
        const slowResources = resourceEntries.filter((entry) => entry.duration > 1000)

        if (slowResources.length > 0) {
            performanceLogger.warn({ count: slowResources.length, resources: slowResources }, 'Slow resources detected')
        }
    })
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
    if (typeof window === 'undefined' || !window.performance) {
        return null
    }

    const navigation = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')

    return {
        // Navigation timing
        dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
        tcp: navigation?.connectEnd - navigation?.connectStart,
        ttfb: navigation?.responseStart - navigation?.requestStart,
        download: navigation?.responseEnd - navigation?.responseStart,
        domInteractive: navigation?.domInteractive,
        domComplete: navigation?.domComplete,
        loadComplete: navigation?.loadEventEnd,

        // Paint timing
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        lcp: paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime,

        // Memory (if available)
        memory: ('memory' in performance && (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory) ?
            (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
            : null
    }
}

/**
 * Component to track page performance
 */
export const PerformanceMonitor = () => {
    useWebVitals()
    useLongTaskTracking()
    useResourceTiming()

    return null
}

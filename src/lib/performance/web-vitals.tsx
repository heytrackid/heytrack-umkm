'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onFID, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Web Vitals tracking
 */
export function useWebVitals(onMetric?: (metric: Metric) => void) {
    useEffect(() => {
        const handleMetric = (metric: Metric) => {
            // Log to console in development (check hostname instead of process.env)
            const isDev = typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

            if (isDev) {
                console.log(`[Web Vitals] ${metric.name}:`, metric.value)
            }

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
        onFID(handleMetric)
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
            console.error('PerformanceObserver error:', e)
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
                console.warn(`Long task detected: ${entry.duration}ms`)

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
        const slowResources = entries.filter((entry: any) =>
            entry.duration > 1000 // Resources taking > 1s
        )

        if (slowResources.length > 0) {
            console.warn('Slow resources detected:', slowResources)
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
        memory: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null
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

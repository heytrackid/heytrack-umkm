"use client"

import React, { useEffect } from 'react'
import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals'

import { apiLogger } from '@/lib/logger'
function sendToAnalytics(metric: any) {
  try {
    // For now, log to console. Later, POST to /api/errors or analytics endpoint
    if (process.env.NODE_ENV !== 'production') {
      apiLogger.debug('[WebVitals]', metric.name, Math.round(metric.value))
    }
    // Example POST (disabled):
    // fetch('/api/web-vitals', { method: 'POST', body: JSON.stringify(metric) })
  } catch {}
}

export default function WebVitalsReporter() {
  // Attach once on mount
  useEffect(() => {
    onLCP(sendToAnalytics)
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }, [])
  return null
}

import { useState, useEffect } from 'react';

export interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  domContentLoaded: number | null;
  loadComplete: number | null;
  memoryUsage: {
    used: number | null;
    total: number | null;
  };
}

export const usePerformanceMonitoring = () => {
  const [isSupported, setIsSupported] = useState(true);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);
  const [performanceRating, setPerformanceRating] = useState<string>('unknown');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
    memoryUsage: {
      used: null,
      total: null
    }
  });

  useEffect(() => {
    // Check if performance API is supported
    if (typeof window === 'undefined' || !('performance' in window)) {
      setIsSupported(false);
      return;
    }

    // Initial metrics setup
    const initialMetrics: PerformanceMetrics = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      domContentLoaded: null,
      loadComplete: null,
      memoryUsage: {
        used: null,
        total: null
      }
    };

    // Try to get memory info if available
    if ('memory' in performance) {
      const perfMemory = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
      if (perfMemory.memory) {
        initialMetrics.memoryUsage = {
          used: perfMemory.memory.usedJSHeapSize,
          total: perfMemory.memory.totalJSHeapSize
        };
      }
    }

    setMetrics(initialMetrics);

    // Calculate performance score based on available metrics
    const calculateScore = () => {
      // This is a simplified calculation for demonstration
      // In a real implementation, use more sophisticated scoring methods
      const score = Math.min(100, Math.max(0, 100 - (
        (initialMetrics.lcp ?? 0) / 40 +
        (initialMetrics.fid ?? 0) / 3 +
        (initialMetrics.cls ?? 0) * 100
      )));
      
      setPerformanceScore(score);
      
      let rating: string;
      if (score >= 90) {
        rating = 'excellent';
      } else if (score >= 70) {
        rating = 'good';
      } else if (score >= 50) {
        rating = 'needs-improvement';
      } else {
        rating = 'poor';
      }
      
      setPerformanceRating(rating);
    };

    calculateScore();

    // Listen for performance metrics if available
    if ('getEntriesByType' in performance) {
      // Process existing entries
      const processEntries = () => {
        const navigationEntries = performance.getEntriesByType('navigation');
        const paintEntries = performance.getEntriesByType('paint');
        const measureEntries = performance.getEntriesByType('measure');
        
        // Process navigation entries for metrics
        navigationEntries.forEach((entry: PerformanceEntry) => {
          if (entry.name === 'navigationStart') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              ttfb: navEntry.responseStart - navEntry.requestStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
              loadComplete: navEntry.loadEventEnd - navEntry.startTime,
            }));
          }
        });

        // Process paint entries
        paintEntries.forEach((entry: PerformanceEntry) => {
          if (entry.name === 'first-paint') {
            setMetrics(prev => ({
              ...prev,
              fcp: entry.startTime
            }));
          }
        });

        // Process measure entries if any
        measureEntries.forEach((_entry: PerformanceEntry) => {
          // Process custom measures as needed
        });
      };

      // Process immediately
      processEntries();

      // Set up observer for future entries if PerformanceObserver is available
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: PerformanceEntry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              setMetrics(prev => ({
                ...prev,
                ttfb: navEntry.responseStart - navEntry.requestStart,
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
                loadComplete: navEntry.loadEventEnd - navEntry.startTime,
              }));
            } else if (entry.name === 'first-paint') {
              setMetrics(prev => ({
                ...prev,
                fcp: entry.startTime
              }));
            }
          });
        });

        observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });

        return () => {
          observer.disconnect();
        };
      }
    }

    return undefined;
  }, []);

  const exportMetrics = () => ({
    metrics,
    performanceScore,
    performanceRating,
    timestamp: Date.now()
  });

  return { 
    metrics, 
    isSupported, 
    performanceScore, 
    performanceRating, 
    exportMetrics 
  };
};
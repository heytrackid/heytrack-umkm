import { useState, useEffect } from 'react';

export const usePerformance = () => {
  const [isPerformanceReady, setIsPerformanceReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      setIsPerformanceReady(true);
    }
  }, []);

  return { isPerformanceReady };
};

export const useRenderPerformance = (componentName: string) => {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [componentName, renderCount]);

  return { renderCount };
};
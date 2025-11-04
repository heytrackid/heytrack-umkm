import { useState, useEffect, useLayoutEffect, useRef } from 'react';

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
  const renderCountRef = useRef(0);

  // Increment render count on each render using a layout effect to avoid causing additional renders
  useLayoutEffect(() => {
    renderCountRef.current += 1;
  });

  return { renderCount: renderCountRef.current };
};
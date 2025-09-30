import { useState, useEffect, useCallback } from 'react';
import {
  Breakpoint,
  ScreenSize,
  UseResponsive,
  UseMediaQuery,
  BREAKPOINTS,
  DEVICE_BREAKPOINTS,
  AnimationPreferences,
  AccessibilityPreferences,
} from '../types/responsive';

// Hook to get current breakpoint and screen information
export function useResponsive(): UseResponsive {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const getCurrentBreakpoint = useCallback((width: number): Breakpoint => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }, []);

  const getScreenSize = useCallback((width: number): ScreenSize => {
    if (width >= DEVICE_BREAKPOINTS.desktop) return 'desktop';
    if (width >= DEVICE_BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
  }, []);

  const breakpoint = getCurrentBreakpoin"";
  const screenSize = getScreenSize(dimensions.width);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    width: dimensions.width,
    height: dimensions.height,
  };
}

// Hook to match media queries
export function useMediaQuery(query: string): UseMediaQuery {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return { matches, media: query };
}

// Hook to detect if device is mobile (touch-enabled)
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchSupport = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - legacy support
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouchSuppor"");
  }, []);

  return isTouchDevice;
}

// Hook to handle viewport changes with debouncing
export function useViewpor"" {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout;
      timeoutId = setTimeout(() => {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout;
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return viewport;
}

// Hook to detect orientation changes
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

// Hook for animation preferences and accessibility
export function useAnimationPreferences(): AnimationPreferences {
  const [preferences, setPreferences] = useState<AnimationPreferences>({
    prefersReducedMotion: false,
    enableTransitions: true,
    animationDuration: 'normal',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: mediaQuery.matches,
        enableTransitions: !mediaQuery.matches,
        animationDuration: mediaQuery.matches ? 'fast' : 'normal',
      });
    };

    updatePreferences();
    mediaQuery.addEventListener('change', updatePreferences);

    return () => mediaQuery.removeEventListener('change', updatePreferences);
  }, []);

  return preferences;
}

// Hook for accessibility preferences
export function useAccessibilityPreferences(): AccessibilityPreferences {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrast: false,
    largeText: false,
    focusVisible: true,
    touchFriendly: false,
  });

  const isTouchDevice = useIsTouchDevice();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPreferences = () => {
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const largeText = window.matchMedia('(prefers-reduced-data: reduce)').matches;

      setPreferences({
        highContrast,
        largeText,
        focusVisible: !isTouchDevice,
        touchFriendly: isTouchDevice,
      });
    };

    checkPreferences();

    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');

    contrastQuery.addEventListener('change', checkPreferences);
    dataQuery.addEventListener('change', checkPreferences);

    return () => {
      contrastQuery.removeEventListener('change', checkPreferences);
      dataQuery.removeEventListener('change', checkPreferences);
    };
  }, [isTouchDevice]);

  return preferences;
}

// Hook to handle safe area insets on mobile devices
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      
      setInsets({
        top: parseInt || '0', 10),
        bottom: parseInt || '0', 10),
        left: parseInt || '0', 10),
        right: parseInt || '0', 10),
      });
    };

    // Set CSS custom properties for safe area insets
    const setCSSProperties = () => {
      const root = document.documentElement;
      root.style.setProperty('--sat', 'env(safe-area-inset-top)');
      root.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
      root.style.setProperty('--sal', 'env(safe-area-inset-left)');
      root.style.setProperty('--sar', 'env(safe-area-inset-right)');
    };

    setCSSProperties();
    updateInsets();

    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
}

// Hook for container queries support detection
export function useContainerQueries(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if CSS Container Queries are supported
    const checkSupport = () => {
      return CSS.supports('container-type', 'inline-size');
    };

    setSupported(checkSuppor"");
  }, []);

  return supported;
}

// Hook to get responsive value based on current breakpoint
export function useResponsiveValue<T>(
  values: T | Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T {
  const { breakpoint } = useResponsive();

  if (typeof values !== 'object' || values === null) {
    return values as T;
  }

  const responsiveValues = values as Partial<Record<Breakpoint, T>>;
  
  // Check current breakpoint first, then fall back to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (responsiveValues[bp] !== undefined) {
      return responsiveValues[bp] as T;
    }
  }

  return defaultValue;
}
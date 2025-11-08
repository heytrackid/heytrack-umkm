// Responsive design types and utilities for mobile-first development
'use client'

import { useEffect, useState } from 'react'

export type Breakpoint = '2xl' | 'lg' | 'md' | 'sm' | 'xl' | 'xs';

export type ResponsiveValue<T> = Partial<Record<Breakpoint, T>> | T;

// Breakpoint pixel values (matching Tailwind CSS defaults)
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Media query strings
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,

  // Max-width media queries
  'max-xs': `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  'max-sm': `(max-width: ${BREAKPOINTS.md - 1}px)`,
  'max-md': `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  'max-lg': `(max-width: ${BREAKPOINTS.xl - 1}px)`,
  'max-xl': `(max-width: ${BREAKPOINTS['2xl'] - 1}px)`,
} as const;

// Device-specific breakpoints
export const DEVICE_BREAKPOINTS = {
  mobile: BREAKPOINTS.xs,
  tablet: BREAKPOINTS.md,
  desktop: BREAKPOINTS.lg,
} as const;

// Screen size categories
export type ScreenSize = 'desktop' | 'mobile' | 'tablet';

// Column priorities for responsive tables
export type ColumnPriority = 'high' | 'low' | 'medium';

// Hook return types
export interface UseResponsive {
  breakpoint: Breakpoint;
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export interface UseMediaQuery {
  matches: boolean;
  media: string;
}

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  current: ScreenSize;
  width: number;
  isMobileOrTablet: boolean;
}


// Utility functions for responsive design

/**
 * Check if the given width matches a mobile screen
 */
export function isMobile(width: number): boolean {
  return width < DEVICE_BREAKPOINTS.tablet;
}

/**
 * Check if the given width matches a tablet screen
 */
export function isTablet(width: number): boolean {
  return width >= DEVICE_BREAKPOINTS.tablet && width < DEVICE_BREAKPOINTS.desktop;
}

/**
 * Check if the given width matches a desktop screen
 */
export function isDesktop(width: number): boolean {
  return width >= DEVICE_BREAKPOINTS.desktop;
}

/**
 * Get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) {return '2xl';}
  if (width >= BREAKPOINTS.xl) {return 'xl';}
  if (width >= BREAKPOINTS.lg) {return 'lg';}
  if (width >= BREAKPOINTS.md) {return 'md';}
  if (width >= BREAKPOINTS.sm) {return 'sm';}
  return 'xs';
}

/**
 * Get the current screen size category
 */
export function getScreenSize(width: number): ScreenSize {
  if (width >= DEVICE_BREAKPOINTS.desktop) {return 'desktop';}
  if (width >= DEVICE_BREAKPOINTS.tablet) {return 'tablet';}
  return 'mobile';
}

/**
 * Check if a media query matches
 */
export function matchesMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') {return false;}
  return window.matchMedia(query).matches;
}

/**
 * Get a responsive value based on current breakpoint
 */
export function getResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: Breakpoint,
  defaultValue: T
): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const responsiveValues = value as Partial<Record<Breakpoint, T>>;
  
  // Check current breakpoint first, then fall back to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (bp && responsiveValues[bp] !== undefined) {
      return responsiveValues[bp] as T;
    }
  }

  return defaultValue;
}

/**
 * Convert pixel values to rem units
 */
export function pxToRem(px: number, baseFontSize = 16): string {
  return `${px / baseFontSize}rem`;
}

/**
 * Convert rem values to pixel units
 */
export function remToPx(rem: number, baseFontSize = 16): number {
  return rem * baseFontSize;
}

/**
 * Calculate responsive font size based on viewport width
 */
export function getResponsiveFontSize(
  minSize: number,
  maxSize: number,
  minViewport = 320,
  maxViewport = 1200
): string {
  const slope = (maxSize - minSize) / (maxViewport - minViewport);
  const yIntercept = minSize - slope * minViewport;
  
  return `clamp(${pxToRem(minSize)}, ${pxToRem(yIntercept)} + ${slope * 100}vw, ${pxToRem(maxSize)})`;
}

/**
 * Generate media query strings
 */
export function generateMediaQuery(breakpoint: Breakpoint, maxWidth = false): string {
  const width = BREAKPOINTS[breakpoint];
  return maxWidth
    ? `(max-width: ${width - 1}px)`
    : `(min-width: ${width}px)`;
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {return false;}
  
  return (
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  );
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {return false;}
  return matchesMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') {return false;}
  return matchesMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') {return false;}
  return matchesMediaQuery('(prefers-contrast: high)');
}

/**
 * Get safe area insets for mobile devices
 */
export function getSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
  };
}

/**
 * Debounce function for resize handlers
 */
export function debounce<T extends (..._args: unknown[]) => void>(
  func: T,
  wait: number
): (..._args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(..._args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(..._args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle<T extends (..._args: unknown[]) => void>(
  func: T,
  limit: number
): (..._args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(this: unknown, ..._args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, _args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Calculate optimal number of columns for a given container width
 */
export function calculateOptimalColumns(
  containerWidth: number,
  minItemWidth: number,
  gap = 16
): number {
  if (containerWidth <= minItemWidth) {return 1;}
  
  const availableWidth = containerWidth - gap;
  const itemsWithGap = minItemWidth + gap;
  const maxColumns = Math.floor(availableWidth / itemsWithGap);
  
  return Math.max(1, maxColumns);
}

/**
 * Filter table columns based on screen size and priority
 */
export function filterColumnsByPriority<T extends { priority: ColumnPriority; hideOnMobile?: boolean }>(
  columns: T[],
  screenSize: ScreenSize
): T[] {
  if (screenSize === 'desktop') {
    return columns;
  }
  
  if (screenSize === 'tablet') {
    return columns.filter(col => col.priority === 'high' || col.priority === 'medium');
  }
  
  // Mobile
  return columns.filter(col => {
    if (col.hideOnMobile) {return false;}
    return col.priority === 'high';
  });
}

/**
 * Get responsive grid columns configuration
 */
export function getResponsiveGridColumns(
  screenSize: ScreenSize,
  maxColumns = 4
): number {
  switch (screenSize) {
    case 'desktop':
      return Math.min(maxColumns, 4);
    case 'tablet':
      return Math.min(maxColumns, 2);
    case 'mobile':
    default:
      return 1;
  }
}

/**
 * Calculate responsive spacing based on screen size
 */
export function getResponsiveSpacing(screenSize: ScreenSize): {
  padding: string;
  margin: string;
  gap: string;
} {
  switch (screenSize) {
    case 'desktop':
      return { padding: '2rem', margin: '2rem', gap: '2rem' };
    case 'tablet':
      return { padding: '1.5rem', margin: '1.5rem', gap: '1.5rem' };
    case 'mobile':
    default:
      return { padding: '1rem', margin: '1rem', gap: '1rem' };
  }
}

/**
 * Generate responsive class names based on screen size
 */
export function getResponsiveClasses(
  screenSize: ScreenSize,
  classMap: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }
): string {
  const classes: string[] = [];
  
  if (classMap.mobile) {classes.push(classMap.mobile);}
  if (screenSize !== 'mobile' && classMap.tablet) {classes.push(`sm:${classMap.tablet}`);}
  if (screenSize === 'desktop' && classMap.desktop) {classes.push(`lg:${classMap.desktop}`);}
  
  return classes.join(' ');
}

/**
 * Check if an element is in viewport
 */
export function isInViewport(element: HTMLElement, offset = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= windowHeight + offset &&
    rect.right <= windowWidth + offset
  );
}

/**
 * Scroll to element with smooth behavior and offset
 */
export function scrollToElement(
  element: HTMLElement | string,
  options: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    offset?: number;
  } = {}
): void {
  const targetElement = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;
    
  if (!targetElement) {return;}
  
  const { behavior = 'smooth', block = 'start', inline = 'nearest', offset = 0 } = options;
  
  if (offset && offset !== 0) {
    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior,
    });
  } else {
    targetElement.scrollIntoView({ behavior, block, inline });
  }
}

/**
 * Format breakpoint name for CSS classes
 */
export function formatBreakpointClass(breakpoint: Breakpoint, className: string): string {
  return breakpoint === 'xs' ? className : `${breakpoint}:${className}`;
}

/**
 * Create responsive CSS custom properties
 */
export function createResponsiveCSSProperties(
  element: HTMLElement,
  properties: Record<string, ResponsiveValue<string>>,
  currentBreakpoint: Breakpoint
): void {
  Object.entries(properties).forEach(([key, value]) => {
    const resolvedValue = getResponsiveValue(value, currentBreakpoint, '');
    if (resolvedValue) {
      element.style.setProperty(`--${key}`, resolvedValue);
    }
  });
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') {return 1;}
  return window.devicePixelRatio || 1;
}

/**
 * Check if device is high DPI/Retina
 */
export function isHighDPI(): boolean {
  return getDevicePixelRatio() > 1;
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// React hooks for responsive design

// Removed unused constants: MOBILE_BREAKPOINT, TABLET_BREAKPOINT

/**
 * Unified responsive hook untuk deteksi breakpoint
 * @returns Object dengan isMobile, isTablet, isDesktop flags dan current screen size
 * @example
 * const { isMobile, isTablet, isDesktop, current } = useResponsive()
 */
export function useResponsive(): ResponsiveState {
  const [breakpoint, setBreakpoint] = useState<ScreenSize>('desktop')
  const [width, setWidth] = useState<number>(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)

    const updateBreakpoint = () => {
      const w = window.innerWidth

      if (w < BREAKPOINTS.md) {
        setBreakpoint('mobile')
      } else if (w < BREAKPOINTS.lg) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }

      setWidth(w)
    }

    updateBreakpoint()

    const debounce = (fn: () => void) => {
      let timeout: NodeJS.Timeout
      return () => {
        clearTimeout(timeout)
        timeout = setTimeout(fn, 150)
      }
    }

    const debouncedUpdate = debounce(updateBreakpoint)
    window.addEventListener('resize', debouncedUpdate)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [])

  if (!mounted) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      current: 'desktop',
      width: 0,
      isMobileOrTablet: false,
    }
  }

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    current: breakpoint,
    width,
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  }
}

/**
 * Generic media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {return}

    const media = window.matchMedia(query)
    setTimeout(() => setMatches(media.matches), 0)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Get current screen size in pixels
 */
export function useScreenSize(): { width: number; height: number } {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {return}

    const updateSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return screenSize
}

/**
 * Check if current screen size is mobile
 */
export function useMobile(): { isMobile: boolean } {
  const { width } = useScreenSize()
  return { isMobile: isMobile(width) }
}

/**
 * Check if current screen size is mobile (alias for useMobile)
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobile()
  return isMobile
}

/**
 * Detect device orientation
 */
export function useOrientation(): 'landscape' | 'portrait' | undefined {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') {return}

    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

/**
 * Detect if device supports touch
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTouch(() => (
          typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            ('msMaxTouchPoints' in navigator && (navigator as Navigator & { msMaxTouchPoints: number }).msMaxTouchPoints > 0))
        ))
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])

  return isTouch
}
import type {
  Breakpoint,
  ScreenSize,
  ResponsiveValue,
  ColumnPriority
} from '@/types/responsive';

import { BREAKPOINTS, DEVICE_BREAKPOINTS } from '@/types/responsive';


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


import type { ReactNode } from 'react'


// Responsive design types and utilities for mobile-first development

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

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
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

// Column priorities for responsive tables
export type ColumnPriority = 'high' | 'medium' | 'low';

// Responsive column configuration
export interface ResponsiveColumn<T = unknown> {
  key: string;
  label: string;
  priority: ColumnPriority;
  hideOnMobile?: boolean;
  minWidth?: string;
  render?: <TItem = T>(value: unknown, item: TItem) => ReactNode;
}

// Form field responsive configuration
export interface ResponsiveFormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  colSpan?: ResponsiveValue<number>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: <T = unknown>(value: T) => string | undefined;
  };
}

// Grid responsive configuration
export interface ResponsiveGridConfig {
  columns: ResponsiveValue<number>;
  gap: ResponsiveValue<string>;
  padding?: ResponsiveValue<string>;
  maxWidth?: string;
}

// Modal/Dialog responsive configuration
export interface ResponsiveModalConfig {
  fullScreenOnMobile?: boolean;
  maxWidth?: ResponsiveValue<string>;
  padding?: ResponsiveValue<string>;
  position?: ResponsiveValue<'center' | 'top' | 'bottom'>;
}

// Navigation responsive configuration
export interface ResponsiveNavConfig {
  layout: ResponsiveValue<'horizontal' | 'vertical' | 'tabs' | 'drawer'>;
  showLabels?: ResponsiveValue<boolean>;
  position?: ResponsiveValue<'top' | 'bottom' | 'left' | 'right'>;
}

// Typography responsive configuration
export interface ResponsiveTypography {
  fontSize: ResponsiveValue<string>;
  lineHeight?: ResponsiveValue<string>;
  fontWeight?: ResponsiveValue<number | string>;
  letterSpacing?: ResponsiveValue<string>;
}

// Spacing responsive configuration
export interface ResponsiveSpacing {
  margin?: ResponsiveValue<string>;
  padding?: ResponsiveValue<string>;
  gap?: ResponsiveValue<string>;
}

// Component size variants
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Touch target configuration
export interface TouchTarget {
  minHeight: string;
  minWidth: string;
  padding?: string;
}

// Safe area insets for mobile devices
export interface SafeAreaInsets {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

// Responsive utility functions type
export interface ResponsiveUtilities {
  isMobile: (width: number) => boolean;
  isTablet: (width: number) => boolean;
  isDesktop: (width: number) => boolean;
  getCurrentBreakpoint: (width: number) => Breakpoint;
  getScreenSize: (width: number) => ScreenSize;
  matchesMediaQuery: (query: string) => boolean;
}

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

// Animation preferences
export interface AnimationPreferences {
  prefersReducedMotion: boolean;
  enableTransitions: boolean;
  animationDuration: 'fast' | 'normal' | 'slow';
}

// Accessibility preferences
export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  touchFriendly: boolean;
}

// Theme responsive configuration
export interface ResponsiveTheme {
  breakpoints: typeof BREAKPOINTS;
  spacing: Record<string, ResponsiveValue<string>>;
  typography: Record<string, ResponsiveTypography>;
  components: {
    button: {
      sizes: Record<ComponentSize, ResponsiveSpacing & ResponsiveTypography>;
    };
    input: {
      sizes: Record<ComponentSize, ResponsiveSpacing & ResponsiveTypography>;
    };
    card: {
      padding: ResponsiveValue<string>;
      borderRadius: ResponsiveValue<string>;
    };
  };
}

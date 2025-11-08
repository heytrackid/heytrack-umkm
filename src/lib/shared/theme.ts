import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'


// Theme and color management utilities


// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color palette definitions
type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

type ColorScale = Record<ColorShade, string>

interface Colors {
  primary: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  gray: ColorScale
  brand: {
    primary: string
    secondary: string
    accent: string
  }
}

const paletteColorKeys = ['primary', 'success', 'warning', 'error', 'gray'] as const
type PaletteColorKey = typeof paletteColorKeys[number]

export const colors: Colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Gray colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Brand colors
  brand: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
  },
} as const

// Status color mappings
export const statusColors = {
  // Order statuses
  pending: colors.warning,
  confirmed: colors.primary,
  in_progress: colors.warning,
  ready: colors.success,
  delivered: colors.success,
  cancelled: colors.error,

  // Payment statuses
  unpaid: colors.error,
  paid: colors.success,
  partial: colors.warning,

  // Stock statuses
  in_stock: colors.success,
  low_stock: colors.warning,
  out_of_stock: colors.error,

  // Generic statuses
  active: colors.success,
  inactive: colors.gray,
  draft: colors.gray,
} as const

// Theme utilities
export const themeUtils = {
  // Get color by path
  getColor: (path: string, shade: ColorShade = 500) => {
    const [colorName] = path.split('.')
    if (colorName && isPaletteColor(colorName)) {
      const colorGroup = colors[colorName]
      return colorGroup[shade] ?? colorGroup[500]
    }
    return colors.gray[shade] ?? colors.gray[500]
  },

  // Get status color
  getStatusColor: (status: string, shade: ColorShade = 500) => {
    const statusColor = statusColors[status as keyof typeof statusColors]
    if (!statusColor) {return colors.gray[shade] ?? colors.gray[500]}
    return statusColor[shade] || statusColor[500] || colors.gray[500]
  },

  // Generate color variants
  generateVariants: (baseColor: string): ColorScale => ({
    50: baseColor,
    100: baseColor,
    200: baseColor,
    300: baseColor,
    400: baseColor,
    500: baseColor,
    600: baseColor,
    700: baseColor,
    800: baseColor,
    900: baseColor,
    950: baseColor,
  })
  ,
}

function isPaletteColor(colorName: string): colorName is PaletteColorKey {
  return (paletteColorKeys as readonly string[]).includes(colorName)
}

// Spacing utilities
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
} as const

// Font size utilities
export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
} as const

// Shadow utilities
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// Border radius utilities
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// Z-index utilities
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
} as const

// Animation utilities
export const animations = {
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
  fadeIn: 'fadeIn 0.3s ease-in',
  fadeOut: 'fadeOut 0.3s ease-out',
  slideIn: 'slideIn 0.3s ease-out',
  slideOut: 'slideOut 0.3s ease-in',
} as const

// CSS custom properties for dynamic theming
export const cssVariables = {
  // Colors
  primary: 'hsl(var(--primary))',
  'primary-foreground': 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  'secondary-foreground': 'hsl(var(--secondary-foreground))',
  accent: 'hsl(var(--accent))',
  'accent-foreground': 'hsl(var(--accent-foreground))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  muted: 'hsl(var(--muted))',
  'muted-foreground': 'hsl(var(--muted-foreground))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',

  // Spacing
  spacing: 'var(--spacing)',

  // Typography
  'font-family': 'var(--font-family)',
  'font-size': 'var(--font-size)',
  'line-height': 'var(--line-height)',

  // Layout
  radius: 'var(--radius)',
} as const

// Theme-aware utility functions
export const themeAware = {
  // Get theme-aware color
  color: (lightColor: string, darkColor?: string) => {
    if (!darkColor) {return lightColor}
    return `hsl(var(--${lightColor.replace('hsl(var(--', '').replace('))', '')}))`
  },

  // Get theme-aware shadow
  shadow: (shadowName: keyof typeof shadows) => shadows[shadowName],

  // Get theme-aware spacing
  space: (spaceName: keyof typeof spacing) => spacing[spaceName],

  // Get theme-aware font size
  fontSize: (sizeName: keyof typeof fontSizes) => fontSizes[sizeName],

  // Get theme-aware border radius
  radius: (radiusName: keyof typeof borderRadius) => borderRadius[radiusName],
}

// Color manipulation utilities
export const colorUtils = {
  // Lighten color by percentage
  lighten: (color: string, _percent: number): string => 
    // Simple implementation - in real app, use a proper color library
     color
  ,

  // Darken color by percentage
  darken: (color: string, _percent: number): string => 
    // Simple implementation - in real app, use a proper color library
     color
  ,

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {return null}
    const [, rHex, gHex, bHex] = result
    return {
      r: parseInt(rHex ?? '00', 16),
      g: parseInt(gHex ?? '00', 16),
      b: parseInt(bHex ?? '00', 16)
    }
  },

  // Convert RGB to hex
  rgbToHex: (r: number, g: number, b: number): string => `#${  ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`,

  // Get contrast color (black or white) for background
  getContrastColor: (hexColor: string): string => {
    const rgb = colorUtils.hexToRgb(hexColor)
    if (!rgb) {return '#000000'}

    // Calculate luminance
    const { r, g, b } = rgb
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#000000' : '#ffffff'
  },
}

// Responsive breakpoint utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const

// Export all theme utilities
export {
  colors as defaultColors,
  spacing as defaultSpacing,
  fontSizes as defaultFontSizes,
  shadows as defaultShadows,
  borderRadius as defaultBorderRadius,
  zIndex as defaultZIndex,
  animations as defaultAnimations,
  cssVariables as defaultCssVariables,
}

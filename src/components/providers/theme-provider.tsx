'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ReactNode } from 'react'



interface ThemeProviderProps {
  children: ReactNode
  attribute?: 'class' | 'data-theme'
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => <NextThemesProvider {...props}>{children}</NextThemesProvider>
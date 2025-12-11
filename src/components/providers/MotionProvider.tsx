'use client'

import { LazyMotion, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'

interface MotionProviderProps {
  children: ReactNode
}

export const MotionProvider = ({ children }: MotionProviderProps) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
)

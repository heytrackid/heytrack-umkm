'use client'

import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'



interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export const FormField = ({ label, error, required, children }: FormFieldProps) => (
    <div className="space-y-2">
      <Label className={error ? 'text-gray-600 dark:text-gray-400' : ''}>
        {label}
        {required && <span className="text-gray-600 dark:text-gray-400 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>}
    </div>
  )
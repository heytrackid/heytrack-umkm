'use client'

import { Label } from '@/components/ui/label'

import type { ReactNode } from 'react'



interface FormFieldProps {
  label: string
  error?: string | undefined
  required?: boolean
  children: ReactNode
}

export const FormField = ({ label, error, required, children }: FormFieldProps) => (
    <div className="space-y-2">
      <Label className={error ? 'text-muted-foreground' : ''}>
        {label}
        {required && <span className="text-muted-foreground ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-muted-foreground">{error}</p>}
    </div>
  )
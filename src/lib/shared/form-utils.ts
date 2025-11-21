import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { type UseFormProps, type UseFormReturn, type FieldValues, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useToast } from '@/lib/toast'


/* eslint-disable */
/**
 * Shared Form Utilities
 * Common patterns and utilities for forms across the application
 */


// Generic form hook with consistent patterns
export function useFormWithValidation(
  schema: z.ZodTypeAny,
  options: UseFormProps<FieldValues> = {}
): UseFormReturn<FieldValues> {
  return useForm<FieldValues>({
    // @ts-expect-error - zodResolver has strict typing but we need flexibility for dynamic schemas
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options
  })
}

// Generic form submission handler with toast notifications
export function createFormSubmitHandler<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSubmit: (data: T) => Promise<void>,
  successMessage: string,
  errorMessage: string,
  resetOnSuccess = true,
  successTitle = 'Berhasil',
  errorTitle = 'Error'
) {
  const { toast } = useToast()

  return async (data: T) => {
    try {
      await onSubmit(data)
      toast({
        title: successTitle,
        description: successMessage
      })
      if (resetOnSuccess) {
        form.reset()
      }
    } catch (error: unknown) {
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }
}

// Form state utilities
export function useFormState<T extends FieldValues>(form: UseFormReturn<T>) {
  return {
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    hasErrors: Object.keys(form.formState.errors).length > 0,
    canSubmit: form.formState.isValid && !form.formState.isSubmitting
  }
}

// Common form field patterns
export interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  help?: string
  className?: string
}

export function getFormFieldClasses(error?: string, className?: string) {
  return `space-y-2 ${className ?? ''} ${error ? 'text-destructive' : ''}`
}

// Form validation helpers
export function createRequiredString(min = 1, max?: number) {
  let schema = z.string().min(min, `Minimal ${min} karakter`)
  if (max) {schema = schema.max(max, `Maksimal ${max} karakter`)}
  return schema
}

export function createOptionalString(max?: number) {
  const baseSchema = z.string().optional()
  return max ? z.string().max(max, `Maksimal ${max} karakter`).optional() : baseSchema
}

export function createEmailField() {
  return z.string().email('Format email tidak valid')
}

export function createPhoneField() {
  return z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Format nomor telepon tidak valid')
}

export function createPositiveNumber() {
  return z.number().min(0, 'Harus lebih besar dari 0')
}

export function createCurrencyField() {
  return z.number().min(0, 'Harga harus positif').max(100000000, 'Harga terlalu besar')
}

// Common select options
export const COMMON_UNITS = [
  { value: 'kg', label: 'Kilogram' },
  { value: 'gram', label: 'Gram' },
  { value: 'liter', label: 'Liter' },
  { value: 'ml', label: 'Mililiter' },
  { value: 'pcs', label: 'Pieces' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'bottle', label: 'Botol' }
] as const

export const CUSTOMER_TYPES = [
  { value: 'REGULAR', label: 'Regular' },
  { value: 'VIP', label: 'VIP' },
  { value: 'WHOLESALE', label: 'Wholesale' }
] as const

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'digital_wallet', label: 'E-Wallet' },
  { value: 'card', label: 'Kartu' }
] as const

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'in_progress', label: 'Sedang Diproses' },
  { value: 'ready', label: 'Siap Diambil' },
  { value: 'delivered', label: 'Sudah Dikirim' },
  { value: 'cancelled', label: 'Dibatalkan' }
] as const

// Form layout utilities
export const FORM_GRID_LAYOUTS = {
  single: 'grid-cols-1',
  double: 'grid-cols-1 md:grid-cols-2',
  triple: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  quadruple: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
} as const

export function getResponsiveGrid(cols: keyof typeof FORM_GRID_LAYOUTS) {
  return FORM_GRID_LAYOUTS[cols]
}

// Form submission state management
export interface FormSubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  error?: string
}

export function useFormSubmission() {
  const [state, setState] = useState<FormSubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    isError: false
  })

  const submit = async <T,>(
    submitFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => {
    void setState({ isSubmitting: true, isSuccess: false, isError: false, error: undefined })

    try {
      const result = await submitFn()
      void setState({ isSubmitting: false, isSuccess: true, isError: false, error: undefined })
      onSuccess?.(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
      void setState({ isSubmitting: false, isSuccess: false, isError: true, error: errorMessage })
      onError?.(error as Error)
    }
  }

  const reset = () => {
    void setState({ isSubmitting: false, isSuccess: false, isError: false, error: undefined })
  }

  return { ...state, submit, reset }
}

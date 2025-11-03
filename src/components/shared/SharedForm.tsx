
'use client'

import { useForm, type Path, type PathValue, type DefaultValues, type Resolver, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/crud-form'
import { Loader2 } from 'lucide-react'
import { uiLogger } from '@/lib/logger'

interface FormSection {
  title: string
  description?: string
  fields: FormFieldConfig[]
}

interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date'
  required?: boolean
  placeholder?: string
  hint?: string
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  step?: number
  rows?: number
  validation?: z.ZodTypeAny
}

interface SharedFormProps<T extends FieldValues> {
  // Form configuration
  sections: FormSection[]
  schema: z.ZodTypeAny

  // Form state
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void> | void

  // UI configuration
  title?: string
  description?: string
  submitText?: string
  cancelText?: string
  loading?: boolean

  // Actions
  onCancel?: () => void

  // Styling
  className?: string
  compact?: boolean
}

/**
 * Shared Form Component
 *
 * A comprehensive, reusable form component with:
 * - Section-based layout
 * - Multiple field types
 * - Validation with Zod
 * - Loading states
 * - Responsive design
 * - Type-safe form handling
 */
export const SharedForm = <T extends FieldValues>({
  sections,
  schema,
  defaultValues,
  onSubmit,
  title,
  description,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  onCancel,
  className = "",
  compact = false
}: SharedFormProps<T>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = zodResolver(schema as any) as Resolver<T>

  const form = useForm<T>({
    resolver,
    defaultValues: defaultValues as DefaultValues<T> | undefined,
  })

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data)
    } catch (err) {
      uiLogger.error({ err }, 'Form submission error:')
    }
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader className={compact ? 'p-4' : ''}>
          <CardTitle className={compact ? 'text-lg' : ''}>{title}</CardTitle>
          {description && (
            <p className={`text-sm text-muted-foreground ${compact ? 'text-xs' : ''}`}>
              {description}
            </p>
          )}
        </CardHeader>
      )}

      <CardContent className={compact ? 'p-4' : ''}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {section.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => {
                  const fieldPath = field.name as Path<T>
                  const error = form.formState.errors[fieldPath]?.message
                  const errorMessage = typeof error === 'string' ? error : undefined

                  return (
                    <div
                      key={fieldIndex}
                      className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                    >
                      <FormField
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        value={form.watch(fieldPath) as unknown}
                        onChange={(_, value) => form.setValue(fieldPath, value as PathValue<T, Path<T>>)}
                        error={errorMessage}
                        required={field.required}
                        placeholder={field.placeholder}
                        hint={field.hint}
                        options={field.options}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        rows={field.rows}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitText}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                {cancelText}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Hook for creating shared forms with validation
 */
export function useSharedForm<T extends FieldValues>(
  schema: z.ZodTypeAny,
  defaultValues?: Partial<T>
) {
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T> | undefined,
  })

  return {
    form,
    handleSubmit: form.handleSubmit,
    reset: form.reset,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
  }
}

/**
 * Shared Modal Form Component
 */
interface SharedModalFormProps<T extends Record<string, unknown>> extends SharedFormProps<T> {
  isOpen: boolean
  onClose: () => void
  modalTitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const SharedModalForm = <T extends Record<string, unknown>>({
  isOpen,
  onClose,
  modalTitle,
  size = 'md',
  ...formProps
}: SharedModalFormProps<T>) => {
  if (!isOpen) { return null }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto ${size === 'sm' ? 'max-w-md' :
          size === 'md' ? 'max-w-lg' :
            size === 'lg' ? 'max-w-2xl' :
              'max-w-4xl'
          }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{modalTitle ?? formProps.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <SharedForm {...formProps} />
        </div>
      </div>
    </div>
  )
}

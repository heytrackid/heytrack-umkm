 
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from '@/components/icons'
import { useForm, type DefaultValues, type FieldValues, type Path, type PathValue, type Resolver, type UseFormProps } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/crud-form'
import { uiLogger } from '@/lib/logger'

import type { z } from 'zod'

interface FormSection {
  title: string
  description?: string
  fields: FormFieldConfig[]
}

interface FormFieldConfig {
  name: string
  label: string
  type: 'date' | 'email' | 'number' | 'select' | 'text' | 'textarea'
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
  schema: z.ZodSchema<FieldValues>

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
  // zodResolver requires specific schema types, but we need generic support
  // @ts-ignore - zodResolver type issues with generic schemas
   const resolver = zodResolver(schema) as Resolver<T>

  const form = useForm<T>({
    resolver,
    defaultValues: defaultValues as DefaultValues<T>,
  })

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data)
     } catch (error) {
       uiLogger.error({ error }, 'Form submission error:')
     }
  }

  const onFormSubmit = form.handleSubmit(handleSubmit)

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
        <form onSubmit={onFormSubmit} className="space-y-6">
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

                  // Extract watch value to avoid React Hook Form linting warnings
                  // eslint-disable-next-line react-hooks/incompatible-library
                  const watchedValue = form.watch(fieldPath)

                  return (
                    <div
                      key={fieldIndex}
                      className={field['type'] === 'textarea' ? 'md:col-span-2' : ''}
                    >
        <FormField
          label={field.label}
          name={field.name}
          type={field.type}
          value={watchedValue}
          onChange={(_, value) => form.setValue(fieldPath, value as PathValue<T, Path<T>>)}
          placeholder={field.placeholder || ''}
          required={field.required || false}
          options={field.options || []}
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
  schema: z.ZodSchema<FieldValues>,
  defaultValues?: Partial<T>
) {
  const options: UseFormProps<T> = {
    // @ts-ignore - zodResolver type issues with generic schemas
    resolver: zodResolver(schema) as Resolver<T>,
    ...(defaultValues && { defaultValues: defaultValues as DefaultValues<T> }),
  }
  const form = useForm<T>(options)

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
  size?: 'lg' | 'md' | 'sm' | 'xl'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
      <div
        className={`bg-background rounded-lg  w-full max-h-[90vh] overflow-y-auto ${size === 'sm' ? 'max-w-md' :
          size === 'md' ? 'max-w-lg' :
            size === 'lg' ? 'w-[calc(100%-2rem)] max-w-2xl' :
              'w-[calc(100%-2rem)] max-w-4xl'
          }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{modalTitle ?? formProps.title}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
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

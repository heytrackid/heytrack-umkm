'use client'

import type { LucideIcon } from '@/components/icons'
import { Loader2, Save, X } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export type FormFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'switch' | 'password'

export interface FormField {
  name: string
  label: string
  type: FormFieldType
  icon?: LucideIcon
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }> // for select
  min?: number
  max?: number
  step?: number | string
  rows?: number // for textarea
  description?: string // helper text for switch
  disabled?: boolean
  className?: string
}

export interface FormSection {
  title: string
  description?: string
  fields: FormField[]
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EntityFormProps<T extends Record<string, any>> {
  title: string
  description?: string
  icon?: LucideIcon
  sections: FormSection[]
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  schema: z.ZodType<T>
  className?: string
  isEditMode?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EntityForm<T extends Record<string, any>>({
  title,
  description,
  icon: TitleIcon,
  sections,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel,
  cancelLabel = 'Batal',
  schema,
  className,
  isEditMode = false
}: EntityFormProps<T>): JSX.Element {
  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any
  })

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = form

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data as T)
  })

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name]
    const Icon = field.icon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/incompatible-library
    const fieldValue = watch(field.name as any)

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className={cn('space-y-2', field.className)}>
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={fieldValue ?? ''}
              onValueChange={(value: string) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setValue(field.name as any, value as any)
              }}
              disabled={field.disabled ?? false}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={field.placeholder ?? `Pilih ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        )

      case 'switch':
        return (
          <div key={field.name} className={cn('space-y-2', field.className)}>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor={field.name} className="text-base">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
              </div>
              <Switch
                id={field.name}
                checked={fieldValue ?? false}
                onCheckedChange={(checked: boolean) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setValue(field.name as any, checked as any)
                }}
                disabled={field.disabled ?? false}
              />
            </div>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className={cn('space-y-2', field.className)}>
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.name}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...register(field.name as any)}
              placeholder={field.placeholder}
              rows={field.rows ?? 3}
              disabled={field.disabled ?? false}
              className={fieldError ? 'border-destructive' : ''}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        )

      default:
        return (
          <div key={field.name} className={cn('space-y-2', field.className)}>
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...register(field.name as any)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              disabled={field.disabled ?? false}
              className={fieldError ? 'border-destructive' : ''}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        )
    }
  }

  const finalSubmitLabel = submitLabel ?? (isEditMode ? 'Perbarui' : 'Simpan')

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {TitleIcon && <TitleIcon className="h-5 w-5" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={cn('space-y-4', section.className)}>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{section.title}</h3>
                {section.description && (
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {section.fields.map((field) => renderField(field))}
              </div>
            </div>
          ))}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {finalSubmitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

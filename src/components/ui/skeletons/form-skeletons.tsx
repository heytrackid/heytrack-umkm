import { cn } from "@/lib/utils"
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonButton,
  SkeletonForm
} from "@/components/ui/skeleton"

interface SkeletonProps {
  className?: string
}

// Skeleton untuk Form Field
export function FormFieldSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <SkeletonText className="h-4 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

// Skeleton untuk Textarea Field
export function TextareaFieldSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <SkeletonText className="h-4 w-32" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

// Skeleton untuk Select Field
export function SelectFieldSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <SkeletonText className="h-4 w-28" />
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

// Skeleton untuk Recipe Form
export function RecipeFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <SkeletonText className="h-6 w-48" />
        <SkeletonText className="h-4 w-96" lines={2} />
      </div>
      
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldSkeleton />
        <SelectFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
      
      {/* Description */}
      <TextareaFieldSkeleton />
      
      {/* Ingredients Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonText className="h-5 w-32" />
          <SkeletonButton className="w-24" />
        </div>
        
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <SelectFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <SkeletonButton className="w-8 h-8 self-end" />
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <TextareaFieldSkeleton />
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <SkeletonButton className="w-20" />
        <div className="flex space-x-2">
          <SkeletonButton className="w-24" />
          <SkeletonButton className="w-20" />
        </div>
      </div>
    </div>
  )
}

// Skeleton untuk Order Form
export function OrderFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <SkeletonText className="h-6 w-40" />
        <SkeletonText className="h-4 w-64" />
      </div>
      
      {/* Customer Info */}
      <div className="space-y-4">
        <SkeletonText className="h-5 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
      </div>
      
      {/* Order Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonText className="h-5 w-28" />
          <SkeletonButton className="w-28" />
        </div>
        
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <SelectFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <SkeletonButton className="w-8 h-8 self-end" />
          </div>
        ))}
      </div>
      
      {/* Delivery Info */}
      <div className="space-y-4">
        <SkeletonText className="h-5 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <TextareaFieldSkeleton />
      </div>
      
      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <SkeletonButton className="w-20" />
        <SkeletonButton className="w-24" />
      </div>
    </div>
  )
}

// Skeleton untuk Settings Form
export function SettingsFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Profile Section */}
      <div className="space-y-4">
        <SkeletonText className="h-6 w-40" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <SkeletonButton className="w-24" />
            <SkeletonText className="h-3 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
      </div>
      
      {/* Preferences Section */}
      <div className="space-y-4">
        <SkeletonText className="h-6 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="space-y-1">
                <SkeletonText className="h-4 w-32" />
                <SkeletonText className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <SkeletonButton className="w-32" />
      </div>
    </div>
  )
}

// Skeleton untuk Login/Register Form
export function AuthFormSkeleton({ className, type = "login" }: SkeletonProps & { type?: "login" | "register" }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <SkeletonText className="h-8 w-48 mx-auto" />
        <SkeletonText className="h-4 w-64 mx-auto" />
      </div>
      
      {/* Form Fields */}
      <div className="space-y-4">
        {type === "register" && <FormFieldSkeleton />}
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        {type === "register" && <FormFieldSkeleton />}
      </div>
      
      {/* Submit Button */}
      <SkeletonButton className="w-full h-10" />
      
      {/* Footer Links */}
      <div className="text-center space-y-2">
        <SkeletonText className="h-4 w-32 mx-auto" />
        <SkeletonText className="h-4 w-24 mx-auto" />
      </div>
    </div>
  )
}

// Skeleton untuk Modal Form
export function ModalFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Modal Header */}
      <div className="flex items-center justify-between">
        <SkeletonText className="h-6 w-40" />
        <Skeleton className="h-6 w-6" />
      </div>
      
      {/* Form Content */}
      <div className="space-y-4">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <TextareaFieldSkeleton />
      </div>
      
      {/* Modal Footer */}
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        <SkeletonButton className="w-20" />
        <SkeletonButton className="w-24" />
      </div>
    </div>
  )
}

// Skeleton untuk Search Form
export function SearchFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-9 flex-1" />
        <SkeletonButton className="w-20" />
        <SkeletonButton className="w-8 h-8" />
      </div>
      
      {/* Filters */}
      <div className="flex items-center space-x-2">
        <SkeletonText className="h-4 w-16" />
        <div className="flex space-x-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
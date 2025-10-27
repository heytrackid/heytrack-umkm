/**
 * Step Skeleton Component
 * For wizard/multi-step forms
 */

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface StepSkeletonProps {
  className?: string
  steps?: number
  currentStep?: number
}

export const StepSkeleton = ({ className, steps = 3, currentStep = 1 }: StepSkeletonProps) => (
    <div className={cn("space-y-6", className)}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              i + 1 <= currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 text-gray-600"
            )}>
              {i + 1}
            </div>
            {i < steps - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                i + 1 < currentStep ? "bg-primary" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Step Actions */}
      <div className="flex justify-between pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )

'use client'

import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import type { GenerationProgress as ProgressType } from '@/hooks/api/useAIRecipeEnhanced'

interface GenerationProgressProps {
  progress: ProgressType | null
  className?: string
}

const stageConfig = {
  validating: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500'
  },
  matching: {
    icon: Loader2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500'
  },
  generating: {
    icon: Loader2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500'
  },
  calculating: {
    icon: Loader2,
    color: 'text-green-500',
    bgColor: 'bg-green-500'
  },
  complete: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-600'
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500'
  }
}

export function GenerationProgress({ progress, className }: GenerationProgressProps) {
  if (!progress) return null

  const config = stageConfig[progress.stage]
  const Icon = config.icon
  const isAnimating = progress.stage !== 'complete' && progress.stage !== 'error'

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      <div className="relative">
        <Progress 
          value={progress.progress} 
          className="h-2"
        />
        <div 
          className={cn(
            'absolute top-0 left-0 h-2 rounded-full transition-all duration-300',
            config.bgColor
          )}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Status message */}
      <div className="flex items-center gap-2">
        <Icon 
          className={cn(
            'h-4 w-4',
            config.color,
            isAnimating && 'animate-spin'
          )} 
        />
        <span className={cn('text-sm font-medium', config.color)}>
          {progress.message}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {progress.progress}%
        </span>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <StageIndicator 
          label="Validasi" 
          isActive={progress.stage === 'validating'}
          isComplete={['matching', 'generating', 'calculating', 'complete'].includes(progress.stage)}
        />
        <StageIndicator 
          label="Cocokkan" 
          isActive={progress.stage === 'matching'}
          isComplete={['generating', 'calculating', 'complete'].includes(progress.stage)}
        />
        <StageIndicator 
          label="Generate" 
          isActive={progress.stage === 'generating'}
          isComplete={['calculating', 'complete'].includes(progress.stage)}
        />
        <StageIndicator 
          label="Hitung HPP" 
          isActive={progress.stage === 'calculating'}
          isComplete={progress.stage === 'complete'}
        />
        <StageIndicator 
          label="Selesai" 
          isActive={progress.stage === 'complete'}
          isComplete={false}
        />
      </div>
    </div>
  )
}

function StageIndicator({ 
  label, 
  isActive, 
  isComplete 
}: { 
  label: string
  isActive: boolean
  isComplete: boolean 
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className={cn(
          'h-2 w-2 rounded-full transition-colors',
          isActive && 'bg-primary animate-pulse',
          isComplete && 'bg-green-500',
          !isActive && !isComplete && 'bg-muted'
        )}
      />
      <span className={cn(
        isActive && 'text-primary font-medium',
        isComplete && 'text-green-600'
      )}>
        {label}
      </span>
    </div>
  )
}

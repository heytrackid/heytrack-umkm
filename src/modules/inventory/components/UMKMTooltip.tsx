'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface UMKMTooltipProps {
  title: string
  content: string
  children: React.ReactNode
}

/**
 * Educational tooltip component for UMKM users
 * Provides helpful information about business concepts
 */
export function UMKMTooltip({ title, content, children }: UMKMTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {children}
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-gray-600">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Import the HelpCircle icon to avoid circular imports
import { HelpCircle } from 'lucide-react'

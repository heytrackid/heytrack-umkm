'use client'

import { HelpCircle } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import type { ReactNode } from 'react'





interface UMKMTooltipProps {
  title: string
  content: string
  children: ReactNode
}

/**
 * Educational tooltip component for UMKM users
 */
export const UMKMTooltip = ({ title, content, children }: UMKMTooltipProps) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {children}
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs opacity-90">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )


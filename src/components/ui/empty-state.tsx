'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) => (
    <Card className={className}>
      <CardContent className="py-12">
        <div className="text-center">
          {Icon && (
            <div className="flex justify-center mb-4">
              {typeof Icon === 'function' ? (
                <Icon className="h-16 w-16 text-muted-foreground opacity-20" />
              ) : (
                <div className="text-muted-foreground opacity-20">{Icon}</div>
              )}
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {description}
          </p>
          {action && <div className="flex justify-center">{action}</div>}
        </div>
      </CardContent>
    </Card>
  )

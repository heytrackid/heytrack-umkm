import type { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    action?: ReactNode
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    )

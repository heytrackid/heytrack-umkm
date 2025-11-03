import type { ReactNode } from 'react'


interface PageHeaderProps {
    title: string
    description?: string
    action?: ReactNode
    actions?: ReactNode // Support multiple actions
}

export const PageHeader = ({ title, description, action, actions }: PageHeaderProps) => (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                            {description}
                        </p>
                    )}
                </div>
                {(action || actions) && (
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        {actions || action}
                    </div>
                )}
            </div>
        </div>
    )

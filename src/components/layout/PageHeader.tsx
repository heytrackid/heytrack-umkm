import type { ReactNode } from 'react'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface PageHeaderProps {
    title: string | ReactNode
    description?: string
    action?: ReactNode
    actions?: ReactNode // Support multiple actions
    breadcrumbs?: BreadcrumbItem[]
    icon?: ReactNode
}

export const PageHeader = ({ title, description, action, actions, breadcrumbs, icon }: PageHeaderProps) => (
        <div className="flex flex-col gap-4 mb-6 max-w-full overflow-hidden">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground overflow-x-auto">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index} className="flex items-center shrink-0">
                            {crumb.href ? (
                                <a href={crumb.href} className="hover:text-foreground transition-colors">
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="text-foreground font-medium">{crumb.label}</span>
                            )}
                            {index < breadcrumbs.length - 1 && (
                                <span className="mx-2">/</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 max-w-full">
                <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-3 max-w-full">
                        {icon && (
                            <div className="flex-shrink-0">
                                {icon}
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                            {title}
                        </h1>
                    </div>
                    {description && (
                        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                            {description}
                        </p>
                    )}
                </div>
                {(action ?? actions) && (
                    <div className="flex-shrink-0 w-full sm:w-auto max-w-full">
                        {actions ?? action}
                    </div>
                )}
            </div>
        </div>
    )

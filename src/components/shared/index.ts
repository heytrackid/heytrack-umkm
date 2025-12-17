
// Shared Components and Utilities Index

// Error Boundary
export { ErrorBoundary, useErrorHandler, withErrorBoundary } from './ErrorBoundary'

// Data Table
export { SharedDataTable } from './SharedDataTable'

// Form Components
export { SharedForm, SharedModalForm, useSharedForm } from './SharedForm'

// Page Components
export {
    ActionButtons, DetailView, ErrorCard, PageHeader,
    SharedStatsCards, StatusBadge
} from './PageComponents'

// Layout Components
export {
    CardGrid, Container, ContentGrid, DataView, MobileNav, PageLayout, Section
} from './LayoutComponents'

// Data Components
export {
    AdvancedFilters, BulkActions, CardSkeleton, EmptyState, ExportActions, FormSkeleton, QuickActions, SearchInput, SortableColumn, TableSkeleton
} from './DataComponents'

// Business Components
export {
    CustomerInsights, InventoryAlerts, MetricCard,
    ProfitabilityCalculator, StockLevelIndicator
} from './BusinessComponents'

// Alert Banner
export { AlertBanner, type AlertBannerProps, type AlertVariant } from './AlertBanner'

// Entity Form
export { EntityForm, type EntityFormProps, type FormField, type FormFieldType, type FormSection } from './EntityForm'



// Re-export utilities
export * from '@/lib/shared/constants'
export * from '@/lib/shared/data-management'
export * from '@/lib/shared/utilities'
export * from '@/lib/shared/validation'


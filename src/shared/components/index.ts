/**
 * Shared Components Module
 * Reusable UI components yang digunakan across domains
 */

// UI Components (from shadcn/ui) - only export existing components
export * from './ui/card'
// TODO: Add other UI components as needed (button, dialog, form, input, table, badge, skeleton)

// Data Display Components - only export existing components
export { default as LoadingSpinner } from './data/LoadingSpinner'
// TODO: Add other data components as needed (DataTable, StatsCard, EmptyState, ErrorMessage)

// Utility Components - only export existing components
export { default as LazyWrapper } from './utility/LazyWrapper'
export { default as ErrorBoundary } from './utility/ErrorBoundary'
// TODO: Add ThemeToggle when needed

// NOTE: Other components are commented out until they are created
// When you create these components, uncomment the corresponding export lines:

// Layout Components
// export { default as AppLayout } from './layout/AppLayout'
// export { default as Sidebar } from './layout/Sidebar'
// export { default as MobileHeader } from './layout/MobileHeader'
// export { default as MobileBottomNav } from './layout/MobileBottomNav'

// Form Components  
// export { default as FormField } from './forms/FormField'
// export { default as SearchInput } from './forms/SearchInput'
// export { default as FilterSelect } from './forms/FilterSelect'
// export { default as DateRangePicker } from './forms/DateRangePicker'

// Mobile Optimized Components
// export { default as MobileTable } from './mobile/MobileTable'
// export { default as MobileForm } from './mobile/MobileForm'
// export { default as MobileCharts } from './mobile/MobileCharts'
// export { default as PullToRefresh } from './mobile/PullToRefresh'
// export { default as SwipeActions } from './mobile/SwipeActions'

// Chart Components (lazy loaded)
// export { default as Chart } from './charts/Chart'
// export { default as MiniChart } from './charts/MiniChart'

// Feedback Components
// export { default as Alert } from './feedback/Alert'
// export { default as Toast } from './feedback/Toast'
// export { default as Modal } from './feedback/Modal'
// export { default as ConfirmDialog } from './feedback/ConfirmDialog'

// Navigation Components
// export { default as Breadcrumbs } from './navigation/Breadcrumbs'
// export { default as Pagination } from './navigation/Pagination'
// export { default as TabNavigation } from './navigation/TabNavigation'

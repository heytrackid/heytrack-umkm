// Shared Components and Utilities Index

// Error Boundary
export { ErrorBoundary, withErrorBoundary, useErrorHandler } from './ErrorBoundary'

// Data Table
export { SharedDataTable } from './SharedDataTable'

// Form Components
export { SharedForm, SharedModalForm, useSharedForm } from './SharedForm'

// Page Components
export {
  PageHeader,
  SharedStatsCards,
  ErrorCard,
  DetailView,
  ActionButtons,
  StatusBadge
} from './PageComponents'

// Layout Components
export {
  PageLayout,
  ContentGrid,
  CardGrid,
  Section,
  DataView,
  Container,
  Sidebar,
  MobileNav
} from './LayoutComponents'

// Data Components
export {
  SearchInput,
  AdvancedFilters,
  DateRangePicker,
  SortableColumn,
  ExportActions,
  BulkActions,
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  EmptyState,
  QuickActions
} from './DataComponents'

// Business Components
export {
  InventoryAlerts,
  StockLevelIndicator,
  MetricCard,
  ProfitabilityCalculator,
  SalesPerformanceChart,
  CustomerInsights
} from './BusinessComponents'

// Notification Components
export {
  NotificationCenter,
  ToastNotification,
  ActivityFeed,
  AlertBanner,
  NotificationBadge
} from './NotificationComponents'

// User Components
export {
  UserProfileCard,
  UserManagementTable,
  PasswordChange,
  UserPermissions,
  RoleManagement
} from './UserComponents'

// Re-export utilities
export * from '../../lib/shared/utilities'
export * from '../../lib/shared/constants'
export * from '../../lib/shared/validation'
export * from '../../lib/shared/data-management'

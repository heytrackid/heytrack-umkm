
/**
 * Organized Barrel Export for UI Components
 * Logically grouped UI components for better developer experience
 *
 * Usage:
 *   import { Button, Card, Dialog } from '@/components/ui'
 *   import { Button } from '@/components/ui/form' // Specific group import
 */

// ==========================================================
// FORM COMPONENTS
// ==========================================================

export {
  Button,
  buttonVariants
} from './button'

export {
  Input
} from './input'

export {
  Textarea
} from './textarea'

export {
  Label
} from './label'

export {
  Checkbox
} from './checkbox'

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'

export {
  RadioGroup,
  RadioGroupItem
} from './radio-group'

export {
  Switch
} from './switch'

// ==========================================================
// LAYOUT COMPONENTS
// ==========================================================

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './card'

export {
  Separator
} from './separator'

export {
  ScrollArea,
  ScrollBar
} from './scroll-area'

export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './tabs'

export {
  SwipeableTabs,
  SwipeableTabsList,
  SwipeableTabsTrigger,
  SwipeableTabsContent,
  SwipeableTabsContentContainer
} from './swipeable-tabs'

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './accordion'

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from './collapsible'

export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from './sheet'

// ==========================================================
// OVERLAY COMPONENTS
// ==========================================================

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog'

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './alert-dialog'

export {
  ConfirmDialog
} from './confirm-dialog'

export {
  Modal
} from './modal'

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from './dropdown-menu'

export {
  Popover,
  PopoverContent,
  PopoverTrigger
} from './popover'

// ==========================================================
// FEEDBACK COMPONENTS
// ==========================================================

export {
  Alert
} from './alert'

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from './toast'

export {
  Toaster
} from './sonner'

// ==========================================================
// DATA DISPLAY COMPONENTS
// ==========================================================

export {
  Badge,
  badgeVariants
} from './badge'

export {
  Avatar,
  AvatarFallback,
  AvatarImage
} from './avatar'

export {
  Skeleton
} from './skeleton'

export {
  Progress
} from './progress'

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from './breadcrumb'

// ==========================================================
// NAVIGATION COMPONENTS
// ==========================================================

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from './command'

// ==========================================================
// SPECIALIZED COMPONENTS
// ==========================================================

export {
  Calendar
} from './calendar'

export {
  Chart
} from './chart'

export {
  ThemeToggle
} from './theme-toggle'

export {
  PrefetchLink
} from './prefetch-link'

export {
  PageBreadcrumb,
  BreadcrumbPatterns
} from './page-breadcrumb'

export {
  StatsCards,
  StatCard,
  StatCardPatterns
} from './stats-cards'

export {
  PageLayout,
  DataGrid,
  ContentCard,
  PageActions
} from './page-layout'

export {
  CrudModal,
  CreateModal,
  EditModal,
  DeleteModal,
  CrudActionButtons
} from './crud-modal'

// ==========================================================
// SHARED COMPONENTS (NEW)
// ==========================================================

export {
  PageHeader,
  AlertBanner,
  LoadingState,
  EmptyState
} from './page-patterns'

export {
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  ListSkeleton,
  StatsSkeleton
} from './loading-states'

export {
  StatusBadges,
  ActionButtons,
  QuickActions
} from './status-actions'

export {
  SearchInput,
  FilterToggle,
  SortButton,
  ActiveFilters,
  SearchFilterBar,
  BulkActionsBar
} from './search-filters'

export {
  DetailHeader,
  DetailSection,
  DetailField,
  DetailGrid,
  DetailActions,
  DetailTabs,
  DetailTimeline
} from './detail-views'

// ==========================================================
// BUSINESS-SPECIFIC COMPONENTS
// ==========================================================



export {
  MobileForm
} from './mobile-forms'



// ==========================================================
// CHART COMPONENTS
// ==========================================================

export {
  MobilePieChart
} from './charts/pie-chart'

export {
  MobileBarChart
} from './charts/bar-chart'

export {
  MobileLineChart
} from './charts/line-chart'

export {
  MobileAreaChart
} from './charts/area-chart'

// ==========================================================
// FORM COMPONENTS (ADDITIONAL)
// ==========================================================

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './form'

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from './input-otp'

// ==========================================================
// LEGACY COMPATIBILITY
// ==========================================================

// Re-export everything for backward compatibility
export * from './accordion'
export * from './alert'
export * from './alert-dialog'
export * from './avatar'
export * from './badge'
export * from './breadcrumb'
export * from './button'
export * from './card'
export * from './checkbox'
export * from './collapsible'
export * from './confirm-dialog'
export * from './dialog'
export * from './dropdown-menu'
export * from './input'
export * from './label'
export * from './progress'
export * from './scroll-area'
export * from './select'
export * from './separator'
export * from './sheet'
export * from './skeleton'
export * from './skeleton-loader'
export * from './tabs'
export * from './modal'
export * from './modal-components'
export * from './textarea'
export * from './toast'
export { StepSkeleton } from './StepSkeleton'

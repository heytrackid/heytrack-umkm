
/**
 * Components Module
 * Barrel export for all application components
 */

// UI Components
export { Button } from './ui/button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
export { Input } from './ui/input'
export { Label } from './ui/label'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table'
export { Textarea } from './ui/textarea'
export { Checkbox } from './ui/checkbox'
export { Badge } from './ui/badge'
export { Progress } from './ui/progress'
export { Skeleton } from './ui/skeleton'
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'

// Chart Components
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, Chart } from './ui/chart'

// Form Components
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'

// Table Components
export { DataTable } from './data-table/data-table'
export { useReactTable } from '@tanstack/react-table'

// Layout Components
export { default as AppLayout } from './layout/app-layout'



// Error Components
// export { ErrorFallback as ErrorMessage } from './error-fallback' // Removed - file doesn't exist

// Export types if they exist
export type { ColumnDef } from '@tanstack/react-table'
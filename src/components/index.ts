
/**
 * Components Module
 * Barrel export for all application components
 */

// UI Components
export { Badge, badgeVariants } from './ui/badge'
export { Button } from './ui/button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
export { Checkbox } from './ui/checkbox'
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
export { Input } from './ui/input'
export { Label } from './ui/label'
export { Progress } from './ui/progress'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
export { Skeleton } from './ui/skeleton'
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table'
export { Textarea } from './ui/textarea'

// Form Components
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'

// Table Components
export { useReactTable } from '@tanstack/react-table'
export { DataTable } from './data-table/data-table'

// Layout Components
export { AppLayout } from './layout/app-layout'



// Error Components
// export { ErrorFallback as ErrorMessage } from './error-fallback' // Removed - file doesn't exist

// Export types if they exist
export type { ColumnDef } from '@tanstack/react-table'

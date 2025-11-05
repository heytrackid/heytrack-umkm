import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

/**
 * Data Table Column Helper
 * Common column definitions for reuse
 */


/**
 * Create a text column with sorting enabled
 */
export function createTextColumn<T extends Record<string, unknown>>(
  key: keyof T,
  header: string,
  options?: {
    sortable?: boolean
    width?: number
  }
): ColumnDef<T> {
  return {
    accessorKey: key,
    header,
    cell: ({ getValue }) => getValue(),
    enableSorting: options?.sortable !== false,
    size: options?.width,
  }
}

/**
 * Create a number column with sorting and formatting
 */
export function createNumberColumn<T extends Record<string, unknown>>(
  key: keyof T,
  header: string,
  options?: {
    sortable?: boolean
    format?: (value: number) => string
  }
): ColumnDef<T> {
  return {
    accessorKey: key,
    header,
    cell: ({ getValue }) => {
      const value = getValue() as number
      return options?.format ? options.format(value) : value.toString()
    },
    enableSorting: options?.sortable !== false,
  }
}

/**
 * Create a currency column
 */
export function createCurrencyColumn<T extends Record<string, unknown>>(
  key: keyof T,
  header: string,
  options?: {
    sortable?: boolean
    currency?: string
  }
): ColumnDef<T> {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: options?.currency ?? 'IDR',
    minimumFractionDigits: 0,
  })

  return {
    accessorKey: key,
    header,
    cell: ({ getValue }) => {
      const value = getValue() as number
      return formatter.format(value)
    },
    enableSorting: options?.sortable !== false,
  }
}

/**
 * Create a date column
 */
export function createDateColumn<T extends Record<string, unknown>>(
  key: keyof T,
  header: string,
  options?: {
    sortable?: boolean
    format?: (date: Date) => string
  }
): ColumnDef<T> {
  const defaultFormat = (date: Date) => date.toLocaleDateString('id-ID')

  return {
    accessorKey: key,
    header,
    cell: ({ getValue }) => {
      const value = getValue()
      if (!value) { return '-' }
      const date = new Date(value as string)
      return options?.format ? options.format(date) : defaultFormat(date)
    },
    enableSorting: options?.sortable !== false,
  }
}

/**
 * Create a status column with badge
 */
export function createStatusColumn<T extends Record<string, unknown>>(
  key: keyof T,
  header: string,
  statusConfig: Record<string, { label: string; className: string }>
): ColumnDef<T> {
  return {
    accessorKey: key,
    header,
    cell: ({ getValue }) => {
      const value = getValue() as string
      const config = statusConfig[value]
      if (!config) { return value }

      return (
        <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${config.className}`}>
          {config.label}
        </div>
      )
    },
  }
}

/**
 * Create an action column with buttons
 */
export function createActionColumn<T extends Record<string, unknown>>(
  actions: Array<{
    label: string
    onClick: (row: T) => void
    variant?: 'default' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'default' | 'lg'
  }>
): ColumnDef<T> {
  return {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant={action.variant ?? 'outline'}
            size={action.size ?? 'sm'}
            onClick={() => action.onClick(row.original)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    ),
  }
}

/**
 * Create a checkbox column
 */
export function createCheckboxColumn<T>(): ColumnDef<T> {
  return {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
      />
    ),
  }
}

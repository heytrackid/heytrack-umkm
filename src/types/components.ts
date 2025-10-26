/**
 * Component Prop Types
 * Provides reusable type definitions for React components
 */

import type { ReactNode } from 'react';

/**
 * Base props that most components should accept
 */
export interface BaseComponentProps {
    className?: string;
    children?: ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
    disabled?: boolean;
}

/**
 * Props for components with loading states
 */
export interface LoadingProps {
    isLoading?: boolean;
    loadingText?: string;
}

/**
 * Column definition for data tables
 * @template T - The type of data in the table rows
 */
export interface ColumnDef<T> {
    id: string;
    header: string;
    accessorKey?: keyof T;
    accessorFn?: (row: T) => unknown;
    cell?: (value: unknown, row: T) => ReactNode;
    sortable?: boolean;
    width?: string | number;
}

/**
 * Props for data table components
 * @template T - The type of data in the table rows
 */
export interface DataTableProps<T> extends BaseComponentProps, LoadingProps {
    data: T[];
    columns: ColumnDef<T>[];
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
}

/**
 * Props for form field components
 */
export interface FormFieldProps extends BaseComponentProps, DisableableProps {
    label?: string;
    error?: string;
    required?: boolean;
    helperText?: string;
}

/**
 * Props for button components
 */
export interface ButtonProps extends BaseComponentProps, DisableableProps, LoadingProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}

/**
 * Props for modal/dialog components
 */
export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    footer?: ReactNode;
}

/**
 * Props for card components
 */
export interface CardProps extends BaseComponentProps {
    title?: string;
    description?: string;
    footer?: ReactNode;
}

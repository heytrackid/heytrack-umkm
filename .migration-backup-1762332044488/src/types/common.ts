import type { Row } from './database'




/**
 * ✅ Common Types for Application
 * ------------------------------------------------------------
 * Specific types to replace generic 'unknown' usage
 */


/* -------------------------------------------------------------------------- */
/*  🔧 ERROR TYPES                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Standard error type for catch blocks
 */
export type CatchError = Error | { message: string; error?: CatchError } | string

/**
 * API Error Response
 */
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, string | number | boolean>
}

/* -------------------------------------------------------------------------- */
/*  📊 DATA TYPES                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Generic record with string keys
 */
export type StringRecord = Record<string, string | number | boolean | null | undefined>

/**
 * JSON-serializable value
 */
export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonValue[] 
  | { [key: string]: JsonValue }

/**
 * Generic data object
 */
export type DataObject = Record<string, JsonValue>

/* -------------------------------------------------------------------------- */
/*  📋 REPORT TYPES                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Generic report data
 */
export interface ReportData {
  id: string
  title: string
  description?: string
  type: string
  generated_at: string
  data: DataObject[]
}

/**
 * Report with specific data type
 */
export interface TypedReport<T extends DataObject = DataObject> {
  id: string
  title: string
  description?: string
  type: string
  data: T[]
  generated_at: string
}

/* -------------------------------------------------------------------------- */
/*  🔔 ALERT TYPES                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Inventory alert from database
 */
export type InventoryAlert = Row<'inventory_alerts'>

/**
 * Alert with ingredient details
 */
export interface AlertWithIngredient extends InventoryAlert {
  ingredient?: Row<'ingredients'>
}

/* -------------------------------------------------------------------------- */
/*  📦 CHART DATA TYPES                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Generic chart data point
 */
export interface ChartDataPoint {
  label: string
  value: number
  [key: string]: string | number | boolean | null
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  date: string
  value: number
  label?: string
}

/* -------------------------------------------------------------------------- */
/*  🎯 FUNCTION PARAMETER TYPES                                              */
/* -------------------------------------------------------------------------- */

/**
 * Generic ID parameter (string or number)
 */
export type IdParam = string | number

/**
 * Generic filter object
 */
export type FilterObject = Record<string, string | number | boolean | null | undefined>

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortDirection?: SortDirection
}

/* -------------------------------------------------------------------------- */
/*  🔄 MUTATION TYPES                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Generic mutation variables
 */
export type MutationVariables = Record<string, JsonValue>

/**
 * Generic mutation result
 */
export interface MutationResult<T = DataObject> {
  success: boolean
  data?: T
  error?: string
}

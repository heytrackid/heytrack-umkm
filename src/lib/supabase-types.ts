import type { Database } from '@/types'

type Tables = Database['public']['Tables']

export type TableName = keyof Tables
export type TableRow<T extends TableName> = Tables[T]['Row']
export type TableInsert<T extends TableName> = Tables[T]['Insert']
export type TableUpdate<T extends TableName> = Tables[T]['Update']

export function assertTableRow<T extends TableName>(data: unknown): TableRow<T> {
  return data as TableRow<T>
}

export function assertTableRows<T extends TableName>(data: unknown[]): TableRow<T>[] {
  return data as TableRow<T>[]
}

import type { 


/**
 * Supabase Database Enums
 * All enum types from the database
 * 
 * These types are re-exported from the main database.ts file to maintain
 * consistency with the generated Supabase types.
 */

  BusinessUnit as BusinessUnitDB,
  OrderStatus as OrderStatusDB,
  PaymentMethod as PaymentMethodDB,
  ProductionStatus as ProductionStatusDB,
  RecordType as RecordTypeDB,
  TransactionType as TransactionTypeDB,
  UserRole as UserRoleDB
} from '../database'

// Re-export enum types from the main database file for consistency
export type BusinessUnit = BusinessUnitDB
export type OrderStatus = OrderStatusDB
export type PaymentMethod = PaymentMethodDB
export type ProductionStatus = ProductionStatusDB
export type RecordType = RecordTypeDB
export type TransactionType = TransactionTypeDB
export type UserRole = UserRoleDB

// Constants for enum values
export const EnumConstants = {
  business_unit: ["kitchen", "sales", "inventory", "finance", "all"] as const,
  order_status: [
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "READY",
    "DELIVERED",
    "CANCELLED",
  ] as const,
  payment_method: [
    "CASH",
    "BANK_TRANSFER",
    "CREDIT_CARD",
    "DIGITAL_WALLET",
    "OTHER",
  ] as const,
  production_status: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const,
  record_type: ["INCOME", "EXPENSE", "INVESTMENT", "WITHDRAWAL"] as const,
  transaction_type: ["PURCHASE", "USAGE", "ADJUSTMENT", "WASTE"] as const,
  user_role: ["super_admin", "admin", "manager", "staff", "viewer"] as const,
} as const

/**
 * Supabase Database Enums
 * All enum types from the database
 */

export type BusinessUnit = "kitchen" | "sales" | "inventory" | "finance" | "all"

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "READY"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DIGITAL_WALLET"
  | "OTHER"

export type ProductionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type RecordType = "INCOME" | "EXPENSE" | "INVESTMENT" | "WITHDRAWAL"

export type TransactionType = "PURCHASE" | "USAGE" | "ADJUSTMENT" | "WASTE"

export type UserRole = "super_admin" | "admin" | "manager" | "staff" | "viewer"

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

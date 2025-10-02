// All database enums
export type BusinessUnit = "all"
export type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "READY" | "DELIVERED" | "CANCELLED"
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "DIGITAL_WALLET" | "OTHER"
export type ProductionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type RecordType = "INCOME" | "EXPENSE" | "INVESTMENT" | "WITHDRAWAL"
export type TransactionType = "PURCHASE" | "USAGE" | "ADJUSTMENT" | "WASTE"
export type UserRole = "admin" | "user"

// Constants object for enums (for easy access)
export const DatabaseEnums = {
  business_unit: ["all"],
  order_status: ["PENDING", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"],
  payment_method: ["CASH", "BANK_TRANSFER", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"],
  production_status: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
  record_type: ["INCOME", "EXPENSE", "INVESTMENT", "WITHDRAWAL"],
  transaction_type: ["PURCHASE", "USAGE", "ADJUSTMENT", "WASTE"],
  user_role: ["admin", "user"],
} as const

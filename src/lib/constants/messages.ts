/**
 * API Response Message Constants
 * Centralized success and error messages for consistent API responses
 */

// ==========================================================
// SUCCESS MESSAGES
// ==========================================================

export const SUCCESS_MESSAGES = {
  // Generic CRUD operations
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
  
  // Customer operations
  CUSTOMER_CREATED: 'Customer created successfully',
  CUSTOMER_UPDATED: 'Customer updated successfully',
  CUSTOMER_DELETED: 'Customer deleted successfully',
  
  // Ingredient operations
  INGREDIENT_CREATED: 'Ingredient created successfully',
  INGREDIENT_UPDATED: 'Ingredient updated successfully',
  INGREDIENT_DELETED: 'Ingredient deleted successfully',
  INGREDIENT_IMPORTED: 'Ingredients imported successfully',
  
  // Recipe operations
  RECIPE_CREATED: 'Recipe created successfully',
  RECIPE_UPDATED: 'Recipe updated successfully',
  RECIPE_DELETED: 'Recipe deleted successfully',
  RECIPE_GENERATED: 'Recipe generated successfully',
  
  // Order operations
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_DELETED: 'Order deleted successfully',
  ORDER_STATUS_UPDATED: 'Order status updated successfully',
  
  // Supplier operations
  SUPPLIER_CREATED: 'Supplier created successfully',
  SUPPLIER_UPDATED: 'Supplier updated successfully',
  SUPPLIER_DELETED: 'Supplier deleted successfully',
  SUPPLIER_IMPORTED: 'Suppliers imported successfully',
  
  // Financial operations
  EXPENSE_CREATED: 'Expense created successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  
  FINANCIAL_RECORD_CREATED: 'Financial record created successfully',
  FINANCIAL_RECORD_UPDATED: 'Financial record updated successfully',
  FINANCIAL_RECORD_DELETED: 'Financial record deleted successfully',
  
  // Operational costs
  OPERATIONAL_COST_CREATED: 'Operational cost created successfully',
  OPERATIONAL_COST_UPDATED: 'Operational cost updated successfully',
  OPERATIONAL_COST_DELETED: 'Operational cost deleted successfully',
  
  // Production operations
  PRODUCTION_BATCH_CREATED: 'Production batch created successfully',
  PRODUCTION_BATCH_UPDATED: 'Production batch updated successfully',
  PRODUCTION_BATCH_DELETED: 'Production batch deleted successfully',
  PRODUCTION_BATCH_COMPLETED: 'Production batch completed successfully',
  
  // HPP operations
  HPP_CALCULATED: 'HPP calculated successfully',
  HPP_ALERT_READ: 'HPP alert marked as read',
  HPP_ALERTS_READ: 'HPP alerts marked as read',
  
  // Inventory operations
  INVENTORY_ALERT_CREATED: 'Inventory alert created successfully',
  INVENTORY_ALERT_UPDATED: 'Inventory alert updated successfully',
  INVENTORY_ALERT_DELETED: 'Inventory alert deleted successfully',
  
  // Ingredient purchase operations
  INGREDIENT_PURCHASE_CREATED: 'Ingredient purchase created successfully',
  INGREDIENT_PURCHASE_UPDATED: 'Ingredient purchase updated successfully',
  INGREDIENT_PURCHASE_DELETED: 'Ingredient purchase deleted successfully',
  
  // WhatsApp template operations
  WHATSAPP_TEMPLATE_CREATED: 'WhatsApp template created successfully',
  WHATSAPP_TEMPLATE_UPDATED: 'WhatsApp template updated successfully',
  WHATSAPP_TEMPLATE_DELETED: 'WhatsApp template deleted successfully',
  WHATSAPP_DEFAULTS_GENERATED: 'Default WhatsApp templates generated successfully',
  
  // Onboarding
  ONBOARDING_COMPLETED: 'Onboarding completed successfully',
  ONBOARDING_STEP_COMPLETED: 'Onboarding step completed successfully',
  
  // Settings
  PROFILE_UPDATED: 'Profile updated successfully',
  BUSINESS_SETTINGS_UPDATED: 'Business settings updated successfully',
  PREFERENCES_UPDATED: 'Preferences updated successfully',
  
  // AI operations
  AI_SUGGESTION_GENERATED: 'AI suggestion generated successfully',
  AI_RECIPE_GENERATED: 'AI recipe generated successfully',
  AI_SESSION_CREATED: 'AI session created successfully',
  AI_SESSION_DELETED: 'AI session deleted successfully',
  AI_SESSIONS_CLEARED: 'AI sessions cleared successfully',
  AI_CONTEXT_SAVED: 'AI context saved successfully',
  
  // Export/Import operations
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully',
  ORDERS_IMPORTED: 'Orders imported successfully',
  
  // Report operations
  REPORT_GENERATED: 'Report generated successfully',
  ERROR_REPORTED: 'Error reported successfully',
} as const

// ==========================================================
// ERROR MESSAGES
// ==========================================================

export const ERROR_MESSAGES = {
  // Generic errors
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  INVALID_INPUT: 'Invalid input data',
  BODY_REQUIRED: 'Request body is required',
  
  // Authentication errors
  AUTH_REQUIRED: 'Authentication required',
  AUTH_FAILED: 'Authentication failed',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  
  // Resource-specific errors
  CUSTOMER_NOT_FOUND: 'Customer not found',
  CUSTOMER_CREATE_FAILED: 'Failed to create customer',
  CUSTOMER_UPDATE_FAILED: 'Failed to update customer',
  CUSTOMER_DELETE_FAILED: 'Failed to delete customer',
  
  INGREDIENT_NOT_FOUND: 'Ingredient not found',
  INGREDIENT_CREATE_FAILED: 'Failed to create ingredient',
  INGREDIENT_UPDATE_FAILED: 'Failed to update ingredient',
  INGREDIENT_DELETE_FAILED: 'Failed to delete ingredient',
  INGREDIENT_IMPORT_FAILED: 'Failed to import ingredients',
  
  RECIPE_NOT_FOUND: 'Recipe not found',
  RECIPE_CREATE_FAILED: 'Failed to create recipe',
  RECIPE_UPDATE_FAILED: 'Failed to update recipe',
  RECIPE_DELETE_FAILED: 'Failed to delete recipe',
  RECIPE_INGREDIENTS_FAILED: 'Failed to create recipe ingredients',
  
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_CREATE_FAILED: 'Failed to create order',
  ORDER_UPDATE_FAILED: 'Failed to update order',
  ORDER_DELETE_FAILED: 'Failed to delete order',
  ORDER_ITEMS_FAILED: 'Failed to create order items',
  
  SUPPLIER_NOT_FOUND: 'Supplier not found',
  SUPPLIER_CREATE_FAILED: 'Failed to create supplier',
  SUPPLIER_UPDATE_FAILED: 'Failed to update supplier',
  SUPPLIER_DELETE_FAILED: 'Failed to delete supplier',
  
  EXPENSE_CREATE_FAILED: 'Failed to create expense',
  EXPENSE_UPDATE_FAILED: 'Failed to update expense',
  EXPENSE_DELETE_FAILED: 'Failed to delete expense',
  
  FINANCIAL_RECORD_CREATE_FAILED: 'Failed to create financial record',
  FINANCIAL_RECORD_UPDATE_FAILED: 'Failed to update financial record',
  FINANCIAL_RECORD_DELETE_FAILED: 'Failed to delete financial record',
  
  OPERATIONAL_COST_CREATE_FAILED: 'Failed to create operational cost',
  OPERATIONAL_COST_UPDATE_FAILED: 'Failed to update operational cost',
  OPERATIONAL_COST_DELETE_FAILED: 'Failed to delete operational cost',
  
  PRODUCTION_BATCH_CREATE_FAILED: 'Failed to create production batch',
  PRODUCTION_BATCH_UPDATE_FAILED: 'Failed to update production batch',
  PRODUCTION_BATCH_DELETE_FAILED: 'Failed to delete production batch',
  
  HPP_CALCULATION_FAILED: 'Failed to calculate HPP',
  
  INVENTORY_ALERT_CREATE_FAILED: 'Failed to create inventory alert',
  INVENTORY_ALERT_UPDATE_FAILED: 'Failed to update inventory alert',
  INVENTORY_ALERT_DELETE_FAILED: 'Failed to delete inventory alert',
  
  // Database errors
  DATABASE_ERROR: 'Database error occurred',
  QUERY_FAILED: 'Database query failed',
  
  // Business logic errors
  INSUFFICIENT_STOCK: 'Insufficient stock',
  INVALID_STATUS: 'Invalid status',
  DUPLICATE_ENTRY: 'Duplicate entry',
  
  // File/Import/Export errors
  IMPORT_FAILED: 'Import failed',
  EXPORT_FAILED: 'Export failed',
  FILE_UPLOAD_FAILED: 'File upload failed',
  INVALID_FILE_FORMAT: 'Invalid file format',
  VALIDATION_FAILED: 'Validation failed',
  INVALID_DATA: 'Invalid ingredient data',
  SAVE_FAILED: 'Failed to save data',
  IMPORT_ERROR: 'Error occurred during import',
  
  // Production batch errors
  PRODUCTION_BATCH_NOT_FOUND: 'Production batch not found',
  
  // Recipe errors  
  RECIPE_NOT_FOUND_IN_IMPORT: 'Recipe not found',
  RECIPES_FETCH_FAILED: 'Failed to fetch recipes',
  
  // Customer errors
  CUSTOMER_CREATE_FAILED_IN_IMPORT: 'Failed to create customer',
} as const

// Type exports for TypeScript  
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES

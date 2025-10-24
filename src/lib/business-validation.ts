import {
  HPPCalculationInputSchema,
  CurrencyFormatSchema,
  InventoryCalculationSchema,
  SalesCalculationSchema,
  ReportGenerationSchema,
  CronJobConfigSchema,
  type HPPCalculationInput,
  type CurrencyFormat,
  type InventoryCalculation,
  type SalesCalculation,
  type ReportGeneration,
  type CronJobConfig
} from '@/lib/validations'

/**
 * Validates HPP calculation inputs
 */
export function validateHPPCalculation(data: any): HPPCalculationInput {
  const result = HPPCalculationInputSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`HPP calculation validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates currency formatting options
 */
export function validateCurrencyFormat(data: any): CurrencyFormat {
  const result = CurrencyFormatSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Currency format validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates inventory calculation parameters
 */
export function validateInventoryCalculation(data: any): InventoryCalculation {
  const result = InventoryCalculationSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Inventory calculation validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates sales calculation inputs
 */
export function validateSalesCalculation(data: any): SalesCalculation {
  const result = SalesCalculationSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Sales calculation validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates report generation parameters
 */
export function validateReportGeneration(data: any): ReportGeneration {
  const result = ReportGenerationSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Report generation validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates cron job configuration
 */
export function validateCronJobConfig(data: any): CronJobConfig {
  const result = CronJobConfigSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Cron job config validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Calculates HPP with validation
 */
export function calculateHPPWithValidation(input: any) {
  const validatedInput = validateHPPCalculation(input)

  // Calculate ingredient costs
  const totalIngredientCost = validatedInput.ingredients.reduce(
    (sum, ingredient) => sum + ingredient.totalCost,
    0
  )

  // Calculate operational costs
  const totalOperationalCost =
    validatedInput.laborCost +
    validatedInput.overheadCost +
    validatedInput.packagingCost +
    validatedInput.operationalCosts.reduce((sum, cost) => sum + cost.amount, 0)

  const totalHPP = totalIngredientCost + totalOperationalCost

  // Calculate suggested selling price based on target margin
  const suggestedSellingPrice = totalHPP / (1 - validatedInput.targetMargin)

  // Calculate margin percentage
  const marginPercentage = validatedInput.targetMargin * 100

  return {
    totalIngredientCost,
    totalOperationalCost,
    totalHPP,
    suggestedSellingPrice,
    marginPercentage,
    breakdown: {
      ingredients: validatedInput.ingredients,
      operationalCosts: validatedInput.operationalCosts,
      laborCost: validatedInput.laborCost,
      overheadCost: validatedInput.overheadCost,
      packagingCost: validatedInput.packagingCost,
    }
  }
}

/**
 * Formats currency with validation
 */
export function formatCurrencyWithValidation(amount: number, options: unknown = {}) {
  const validatedOptions = validateCurrencyFormat({ amount, ...options })

  const formatter = new Intl.NumberFormat(validatedOptions.locale, {
    style: validatedOptions.showSymbol ? 'currency' : 'decimal',
    currency: validatedOptions.currency,
    minimumFractionDigits: validatedOptions.decimals,
    maximumFractionDigits: validatedOptions.decimals,
    useGrouping: validatedOptions.useGrouping,
  })

  return formatter.format(validatedOptions.amount)
}

/**
 * Validates inventory levels and reorder needs
 */
export function validateInventoryLevels(data: any) {
  const validatedData = validateInventoryCalculation(data)

  const needsReorder = validatedData.currentStock <= validatedData.reorderPoint
  const isLowStock = validatedData.currentStock <= validatedData.minimumStock
  const isOverStock = validatedData.maximumStock
    ? validatedData.currentStock > validatedData.maximumStock
    : false

  // Calculate days until stock out
  const daysUntilStockOut = validatedData.consumptionRate > 0
    ? Math.floor(validatedData.currentStock / validatedData.consumptionRate)
    : Infinity

  return {
    currentStock: validatedData.currentStock,
    minimumStock: validatedData.minimumStock,
    maximumStock: validatedData.maximumStock,
    reorderPoint: validatedData.reorderPoint,
    reorderQuantity: validatedData.reorderQuantity,
    needsReorder,
    isLowStock,
    isOverStock,
    daysUntilStockOut,
    status: isOverStock ? 'overstock' : isLowStock ? 'low_stock' : 'normal',
  }
}

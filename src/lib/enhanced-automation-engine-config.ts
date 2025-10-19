// Enhanced Automation Engine Configuration
import type { EnhancedAutomationConfig } from './enhanced-automation-engine-types'

export const DEFAULT_ENHANCED_CONFIG: EnhancedAutomationConfig = {
  // HPP & Pricing defaults
  targetProfitMargin: 60,
  competitivePricingBuffer: 10,
  premiumPricingMultiplier: 2.5,

  // Inventory defaults
  predictiveDays: 30,
  seasonalityFactor: 1.2,
  supplierReliabilityScore: 0.8,
  emergencyStockDays: 3,

  // Production defaults
  maxProductionCapacityHours: 12,
  setupTimeMinutes: 15,
  qualityControlTimePercent: 10,

  // Business Intelligence defaults
  profitabilityTrendDays: 90,
  customerSatisfactionWeight: 0.3,
  seasonalPlanningMonths: 6,

  // Alert priorities
  alertPriorityWeights: {
    financial: 0.4,
    inventory: 0.3,
    production: 0.2,
    quality: 0.1
  }
}

// Configuration optimized for Indonesian UMKM F&B
export const ENHANCED_UMKM_CONFIG: EnhancedAutomationConfig = {
  // HPP & Pricing (Indonesian market standards)
  targetProfitMargin: 60,           // 60% target margin
  competitivePricingBuffer: 10,     // 10% buffer for competition
  premiumPricingMultiplier: 2.5,    // 2.5x for premium positioning

  // Inventory Intelligence
  predictiveDays: 30,               // 30-day prediction window
  seasonalityFactor: 1.3,           // 30% seasonal variation (Ramadan, holidays)
  supplierReliabilityScore: 0.8,    // 80% reliability assumption
  emergencyStockDays: 3,            // 3-day emergency buffer

  // Production Intelligence
  maxProductionCapacityHours: 10,   // 10-hour production days
  setupTimeMinutes: 20,             // 20-minute setup between recipes
  qualityControlTimePercent: 15,    // 15% time for quality control

  // Business Intelligence
  profitabilityTrendDays: 90,       // 90-day trend analysis
  customerSatisfactionWeight: 0.25, // 25% weight for customer ratings
  seasonalPlanningMonths: 6,        // 6-month seasonal planning

  // Alert Intelligence
  alertPriorityWeights: {
    financial: 0.4,                 // 40% weight for financial alerts
    inventory: 0.3,                 // 30% weight for inventory alerts
    production: 0.2,                // 20% weight for production alerts
    quality: 0.1                    // 10% weight for quality alerts
  }
}

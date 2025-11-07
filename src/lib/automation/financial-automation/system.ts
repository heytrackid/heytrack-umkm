import { AlertGenerator } from './alert-generator'
import { BreakEvenAnalyzer } from './break-even-analyzer'
import { MetricsCalculator } from './metrics-calculator'
import { PricingOptimizer } from './pricing-optimizer'
import { ProjectionEngine } from './projection-engine'
import { RecommendationEngine } from './recommendation-engine'
import { TrendAnalyzer } from './trend-analyzer'

/**
 * Financial Automation System Orchestrator
 * Main coordinator for financial automation functionality
 */

import type {
  BreakEvenResult,
  ROIResult,
  PricingOptimizationResult,
  HistoricalData,
  ProjectionResult
} from './types'
import type {
  AutomationConfig,
  SaleData,
  ExpenseData,
  Ingredient,
  FinancialAnalysis
} from '@/lib/automation/types'

export class FinancialAutomation {
  constructor(private readonly config: AutomationConfig) {}

  /**
   * 💰 FINANCIAL AUTOMATION: Smart Financial Insights
   */
  analyzeFinancialHealth(
    sales: SaleData[],
    expenses: ExpenseData[],
    inventory: Ingredient[]
  ): FinancialAnalysis {
    const recentSales = MetricsCalculator.filterRecentData(sales)
    const recentExpenses = MetricsCalculator.filterRecentData(expenses)

    const metrics = MetricsCalculator.calculateFinancialMetrics(recentSales, recentExpenses, inventory)
    const trends = TrendAnalyzer.analyzeFinancialTrends(recentSales, recentExpenses)
    const alerts = AlertGenerator.generateFinancialAlerts(metrics, inventory, this.config)
    const recommendations = RecommendationEngine.generateFinancialRecommendations(metrics, recentSales, recentExpenses)

    return {
      metrics,
      trends,
      alerts,
      recommendations
    }
  }

  /**
   * Calculate break-even analysis
   */
  calculateBreakEven(
    fixedCosts: number,
    variableCostPerUnit: number,
    pricePerUnit: number
  ): BreakEvenResult {
    return BreakEvenAnalyzer.calculateBreakEven(fixedCosts, variableCostPerUnit, pricePerUnit)
  }

  /**
   * Project future financial performance
   */
  projectFinancialPerformance(
    historicalData: HistoricalData[],
    projectionMonths = 12
  ): ProjectionResult | { error: string } {
    return ProjectionEngine.projectFinancialPerformance(historicalData, projectionMonths)
  }

  /**
   * Calculate ROI for potential investments
   */
  calculateROI(
    initialInvestment: number,
    expectedAnnualBenefit: number,
    timeHorizonYears = 3
  ): ROIResult {
    const totalBenefits = expectedAnnualBenefit * timeHorizonYears
    const simpleROI = ((totalBenefits - initialInvestment) / initialInvestment) * 100

    // Calculate NPV with 10% discount rate
    const discountRate = 0.10
    let npv = -initialInvestment

    for (let year = 1; year <= timeHorizonYears; year++) {
      npv += expectedAnnualBenefit / (1 + discountRate)**year
    }

    const paybackPeriod = initialInvestment / expectedAnnualBenefit

    return {
      simpleROI,
      netPresentValue: Math.round(npv),
      paybackPeriodYears: Math.round(paybackPeriod * 100) / 100,
      isViable: npv > 0 && paybackPeriod < timeHorizonYears,
      recommendation: this.generateROIRecommendation(simpleROI, npv, paybackPeriod)
    }
  }

  /**
   * Generate pricing optimization recommendations
   */
  optimizePricing(
    currentPrice: number,
    currentVolume: number,
    costPerUnit: number,
    priceElasticity = -1.2
  ): PricingOptimizationResult {
    return PricingOptimizer.optimizePricing(currentPrice, currentVolume, costPerUnit, priceElasticity)
  }

  /**
   * Generate ROI recommendation
   */
  private generateROIRecommendation(roi: number, npv: number, payback: number): string {
    if (npv > 0 && roi > 20 && payback < 2) {
      return '🟢 Excellent investment - high returns with quick payback'
    } if (npv > 0 && roi > 10) {
      return '🟡 Good investment - positive returns expected'
    } if (npv > 0) {
      return '🟠 Marginal investment - consider alternatives'
    } 
      return '🔴 Poor investment - negative returns expected'
    
  }
}

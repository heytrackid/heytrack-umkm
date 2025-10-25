#!/usr/bin/env node
/**
 * Script to create missing type definitions
 */

import fs from 'fs';

function createMissingTypes() {
  console.log('🔧 Creating missing type definitions...');
  
  const filePath = 'src/modules/recipes/services/EnhancedHPPCalculationService.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Add a proper interface for PricingInsights before it's used
    const pricingInsightsInterface = `
interface PricingInsights {
  marketRate: number
  competitorPrices: number[]
  suggestedPrice: number
  priceConfidenceScore: number
  seasonalAdjustments: Record<string, number>
  historicalTrends: {
    last30Days: number[]
    last90Days: number[]
    yearOverYear: number
  }
  costBasedRecommendations: {
    breakEvenPrice: number
    targetMarginPrice: number
    premiumPrice: number
  }
  demandFactors: {
    popularityScore: number
    seasonalityImpact: number
    competitionLevel: 'low' | 'medium' | 'high'
  }
}`;

    // Look for the position to insert the interface (before the MaterialCostCalculation interface)
    const materialCostCalcIndex = content.indexOf('interface MaterialCostCalculation {');
    
    if (materialCostCalcIndex !== -1) {
      // Insert the PricingInsights interface before MaterialCostCalculation
      const insertionPoint = materialCostCalcIndex;
      content = content.slice(0, insertionPoint) + pricingInsightsInterface + '\n\n' + content.slice(insertionPoint);
    }
    
    // Now replace the 'any' type with the proper interface
    content = content.replace(
      /pricingInsights: any \/\/ PricingInsights/g,
      'pricingInsights: PricingInsights // Pricing insights data'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed pricing insights type in ${filePath}`);
      return 1;
    } else {
      console.log(`  ℹ️  No changes made to ${filePath} (pattern not found)`);
      return 0;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Run the fix
const typeChanges = createMissingTypes();

console.log(`\\n🎯 Missing type definitions created: ${typeChanges} changes`);

export { createMissingTypes };
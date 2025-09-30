import { StockTransaction, Ingredient } from '../types'

/**
 * WeightedAverageCostService
 * 
 * Service untuk menghitung harga rata-rata tertimbang (weighted average cost)
 * dari pembelian bahan baku yang berbeda-beda harga.
 * 
 * Penting untuk akurasi HPP calculation!
 */
export class WeightedAverageCostService {
  
  /**
   * Calculate weighted average cost untuk ingredient berdasarkan purchase history
   */
  static calculateWeightedAveragePrice(
    ingredient: Ingredient,
    purchaseTransactions: StockTransaction[]
  ): {
    weightedAveragePrice: number
    totalQuantity: number
    totalValue: number
    purchaseHistory: PurchaseRecord[]
  } {
    
    const purchases = purchaseTransactions
      .filter(t => 
        t.ingredient_id === ingredient.id && 
        t.type === 'PURCHASE' && 
        t.unit_price !== null && 
        t.quantity > 0
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    if (purchases.length === 0) {
      return {
        weightedAveragePrice: ingredient.price_per_unit || 0,
        totalQuantity: 0,
        totalValue: 0,
        purchaseHistory: []
      }
    }

    let totalQuantity = 0
    let totalValue = 0
    const purchaseHistory: PurchaseRecord[] = []

    // Calculate weighted average dari semua pembelian
    for (const purchase of purchases) {
      const quantity = Math.abs(purchase.quantity)
      const unitPrice = purchase.unit_price || 0
      const value = quantity * unitPrice

      totalQuantity += quantity
      totalValue += value

      purchaseHistory.push({
        date: purchase.created_at,
        quantity,
        unitPrice,
        totalValue: value,
        reference: purchase.reference
      })
    }

    const weightedAveragePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0

    return {
      weightedAveragePrice: Math.round(weightedAveragePrice * 100) / 100, // 2 decimal places
      totalQuantity,
      totalValue,
      purchaseHistory
    }
  }

  /**
   * Calculate current stock value menggunakan FIFO (First In, First Out) method
   */
  static calculateFIFOStockValue(
    ingredient: Ingredient,
    allTransactions: StockTransaction[]
  ): {
    currentStockValue: number
    averageCostPerUnit: number
    stockLayers: StockLayer[]
  } {
    
    const transactions = allTransactions
      .filter(t => t.ingredient_id === ingredient.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    const stockLayers: StockLayer[] = []
    let remainingStock = ingredient.current_stock || 0

    // Process purchases (FIFO layers)
    const purchases = transactions.filter(t => t.type === 'PURCHASE')
    
    for (const purchase of purchases) {
      if (remainingStock <= 0) break

      const purchaseQuantity = Math.abs(purchase.quantity)
      const unitPrice = purchase.unit_price || 0
      
      const layerQuantity = Math.min(remainingStock, purchaseQuantity)
      
      if (layerQuantity > 0) {
        stockLayers.push({
          quantity: layerQuantity,
          unitPrice,
          totalValue: layerQuantity * unitPrice,
          purchaseDate: purchase.created_at,
          reference: purchase.reference
        })
        
        remainingStock -= layerQuantity
      }
    }

    // Calculate total value and average cost
    const currentStockValue = stockLayers.reduce((sum, layer) => sum + layer.totalValue, 0)
    const totalQuantityInLayers = stockLayers.reduce((sum, layer) => sum + layer.quantity, 0)
    const averageCostPerUnit = totalQuantityInLayers > 0 ? currentStockValue / totalQuantityInLayers : 0

    return {
      currentStockValue: Math.round(currentStockValue * 100) / 100,
      averageCostPerUnit: Math.round(averageCostPerUnit * 100) / 100,
      stockLayers
    }
  }

  /**
   * Calculate stock value menggunakan Moving Average method
   */
  static calculateMovingAverageValue(
    ingredient: Ingredient,
    allTransactions: StockTransaction[]
  ): {
    currentAveragePrice: number
    stockValue: number
    movementHistory: MovingAverageRecord[]
  } {
    
    const transactions = allTransactions
      .filter(t => t.ingredient_id === ingredient.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    let runningQuantity = 0
    let runningValue = 0
    let currentAveragePrice = ingredient.price_per_unit || 0
    const movementHistory: MovingAverageRecord[] = []

    for (const transaction of transactions) {
      const quantity = transaction.quantity
      const unitPrice = transaction.unit_price || currentAveragePrice

      if (transaction.type === 'PURCHASE') {
        // Add stock - recalculate average
        const newTotalValue = runningValue + (Math.abs(quantity) * unitPrice)
        const newTotalQuantity = runningQuantity + Math.abs(quantity)
        
        currentAveragePrice = newTotalQuantity > 0 ? newTotalValue / newTotalQuantity : unitPrice
        runningQuantity = newTotalQuantity
        runningValue = newTotalValue

      } else if (transaction.type === 'USAGE' || transaction.type === 'WASTE') {
        // Remove stock - keep same average price
        const usedQuantity = Math.abs(quantity)
        const usedValue = usedQuantity * currentAveragePrice
        
        runningQuantity = Math.max(0, runningQuantity - usedQuantity)
        runningValue = Math.max(0, runningValue - usedValue)
        
        // Recalculate average if needed
        if (runningQuantity > 0) {
          currentAveragePrice = runningValue / runningQuantity
        }
      }

      movementHistory.push({
        date: transaction.created_at,
        type: transaction.type,
        quantity,
        unitPrice,
        runningQuantity,
        runningValue,
        averagePrice: currentAveragePrice,
        reference: transaction.reference
      })
    }

    const finalStock = ingredient.current_stock || 0
    const stockValue = finalStock * currentAveragePrice

    return {
      currentAveragePrice: Math.round(currentAveragePrice * 100) / 100,
      stockValue: Math.round(stockValue * 100) / 100,
      movementHistory
    }
  }

  /**
   * Generate pricing recommendations untuk HPP calculation
   */
  static generatePricingInsights(
    ingredient: Ingredient,
    transactions: StockTransaction[]
  ): PricingInsights {
    
    const weightedAvg = this.calculateWeightedAveragePrice(ingredient, transactions)
    const fifoValue = this.calculateFIFOStockValue(ingredient, transactions)
    const movingAvg = this.calculateMovingAverageValue(ingredient, transactions)

    // Analyze price volatility
    const purchases = transactions
      .filter(t => t.type === 'PURCHASE' && t.unit_price)
      .map(t => t.unit_price!)
    
    const priceVolatility = this.calculatePriceVolatility(purchases)
    
    // Generate recommendations
    const recommendations: string[] = []
    
    if (priceVolatility.coefficient > 0.15) {
      recommendations.push('🔄 Harga fluktuatif - gunakan moving average untuk HPP')
    }
    
    if (weightedAvg.weightedAveragePrice > ingredient.price_per_unit * 1.1) {
      recommendations.push('📈 Harga rata-rata naik - pertimbangkan update price list')
    }
    
    if (fifoValue.stockLayers.length > 5) {
      recommendations.push('📊 Banyak lapisan harga - monitor stock rotation')
    }

    const priceDifference = Math.abs(fifoValue.averageCostPerUnit - movingAvg.currentAveragePrice)
    const priceDifferencePercent = fifoValue.averageCostPerUnit > 0 ? 
      (priceDifference / fifoValue.averageCostPerUnit) * 100 : 0
    
    if (priceDifferencePercent > 10) {
      recommendations.push('⚠️ Selisih FIFO vs Moving Average > 10% - review pricing method')
    }

    return {
      weightedAveragePrice: weightedAvg.weightedAveragePrice,
      fifoAveragePrice: fifoValue.averageCostPerUnit,
      movingAveragePrice: movingAvg.currentAveragePrice,
      currentListPrice: ingredient.price_per_unit,
      priceVolatility,
      recommendedPriceForHPP: movingAvg.currentAveragePrice, // Default recommendation
      stockValue: {
        weighted: weightedAvg.totalValue,
        fifo: fifoValue.currentStockValue,
        moving: movingAvg.stockValue
      },
      recommendations
    }
  }

  /**
   * Calculate price volatility coefficient
   */
  private static calculatePriceVolatility(prices: number[]): PriceVolatility {
    if (prices.length < 2) {
      return { coefficient: 0, standardDeviation: 0, mean: prices[0] || 0 }
    }

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
    const standardDeviation = Math.sqrt(variance)
    const coefficient = mean > 0 ? standardDeviation / mean : 0

    return {
      coefficient: Math.round(coefficient * 10000) / 10000, // 4 decimal places
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      mean: Math.round(mean * 100) / 100
    }
  }

  /**
   * Update ingredient price berdasarkan method yang dipilih
   */
  static updateIngredientPriceWithMethod(
    ingredient: Ingredient,
    transactions: StockTransaction[],
    method: 'weighted' | 'fifo' | 'moving' | 'latest' = 'moving'
  ): number {
    
    switch (method) {
      case 'weighted':
        return this.calculateWeightedAveragePrice(ingredient, transactions).weightedAveragePrice
      
      case 'fifo':
        return this.calculateFIFOStockValue(ingredient, transactions).averageCostPerUnit
      
      case 'moving':
        return this.calculateMovingAverageValue(ingredient, transactions).currentAveragePrice
      
      case 'latest':
        const latestPurchase = transactions
          .filter(t => t.type === 'PURCHASE' && t.unit_price)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        return latestPurchase?.unit_price || ingredient.price_per_unit
      
      default:
        return ingredient.price_per_unit
    }
  }
}

// Supporting interfaces
interface PurchaseRecord {
  date: string
  quantity: number
  unitPrice: number
  totalValue: number
  reference?: string
}

interface StockLayer {
  quantity: number
  unitPrice: number
  totalValue: number
  purchaseDate: string
  reference?: string
}

interface MovingAverageRecord {
  date: string
  type: string
  quantity: number
  unitPrice: number
  runningQuantity: number
  runningValue: number
  averagePrice: number
  reference?: string
}

interface PriceVolatility {
  coefficient: number // CV (Coefficient of Variation)
  standardDeviation: number
  mean: number
}

interface PricingInsights {
  weightedAveragePrice: number
  fifoAveragePrice: number
  movingAveragePrice: number
  currentListPrice: number
  priceVolatility: PriceVolatility
  recommendedPriceForHPP: number
  stockValue: {
    weighted: number
    fifo: number
    moving: number
  }
  recommendations: string[]
}

export type { PurchaseRecord, StockLayer, MovingAverageRecord, PriceVolatility, PricingInsights }
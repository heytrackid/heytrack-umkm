import { NextRequest, NextResponse } from 'next/server'
import { WeightedAverageCostService } from '@/modules/inventory/services/WeightedAverageCostService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ingredient, transactions, method } = body

    if (!ingredient || !transactions || !method) {
      return NextResponse.json(
        { error: 'Missing required parameters: ingredient, transactions, method' },
        { status: 400 }
      )
    }

    let result

    switch (method) {
      case 'weighted_average':
        result = WeightedAverageCostService.calculateWeightedAveragePrice(ingredient, transactions)
        break
      
      case 'fifo':
        result = WeightedAverageCostService.calculateFIFOStockValue(ingredient, transactions)
        break
      
      case 'moving_average':
        result = WeightedAverageCostService.calculateMovingAverageValue(ingredient, transactions)
        break
      
      case 'pricing_insights':
        result = WeightedAverageCostService.generatePricingInsights(ingredient, transactions)
        break
      
      case 'update_price':
        const { pricingMethod } = body
        if (!pricingMethod) {
          return NextResponse.json(
            { error: 'Missing pricingMethod parameter' },
            { status: 400 }
          )
        }
        
        const newPrice = WeightedAverageCostService.updateIngredientPriceWithMethod(
          ingredient,
          transactions,
          pricingMethod
        )
        
        result = {
          newPrice,
          method: pricingMethod,
          ingredient: ingredient.name
        }
        break
      
      default:
        return NextResponse.json(
          { error: `Unknown method: ${method}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      method,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Weighted Average Cost API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint untuk mendapatkan contoh usage
export async function GET() {
  return NextResponse.json({
    message: 'Weighted Average Cost API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/inventory/weighted-average',
      description: 'Calculate weighted average cost for ingredients'
    },
    methods: [
      {
        method: 'weighted_average',
        description: 'Calculate weighted average price from all purchases',
        params: ['ingredient', 'transactions']
      },
      {
        method: 'fifo',
        description: 'Calculate FIFO stock value with layers',
        params: ['ingredient', 'transactions']
      },
      {
        method: 'moving_average',
        description: 'Calculate moving average value',
        params: ['ingredient', 'transactions']
      },
      {
        method: 'pricing_insights',
        description: 'Generate comprehensive pricing insights',
        params: ['ingredient', 'transactions']
      },
      {
        method: 'update_price',
        description: 'Get updated price using specific method',
        params: ['ingredient', 'transactions', 'pricingMethod']
      }
    ],
    example_request: {
      ingredient: {
        id: 'ing-1',
        name: 'Tepung Terigu',
        unit: 'kg',
        current_stock: 45,
        price_per_unit: 15000
      },
      transactions: [
        {
          id: 't-1',
          ingredient_id: 'ing-1',
          type: 'PURCHASE',
          quantity: 25,
          unit_price: 14500,
          created_at: '2024-01-15'
        }
      ],
      method: 'pricing_insights'
    },
    umkm_tips: [
      '💡 Gunakan"moving_average" untuk HPP yang paling akurat',
      '📊 Review harga rata-rata setiap kali ada pembelian baru',
      '⚠️ Jika selisih harga >10%, pertimbangkan update price list',
      '🎯 Metode FIFO bagus untuk tracking stock rotation'
    ]
  })
}
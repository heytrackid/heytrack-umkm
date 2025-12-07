import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InventorySyncService } from '../InventorySyncService'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }))
}

describe('InventorySyncService - WAC Calculations', () => {
  let service: InventorySyncService

  beforeEach(() => {
    service = new InventorySyncService({
      userId: 'test-user',
      supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient<import('@/types/database').Database>
    })
  })

  describe('updateStockFromPurchase', () => {
    it('should calculate WAC correctly for new purchase', async () => {
      // Initial state: 100 units at WAC 1000
      const initialStock = 100
      const initialWac = 1000
      const purchaseQuantity = 50
      const purchasePrice = 1200

      // Expected: (100 * 1000 + 50 * 1200) / (100 + 50) = 1100
      const expectedNewWac = 1100
      const expectedNewStock = 150

      // Mock ingredient data
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  current_stock: initialStock,
                  weighted_average_cost: initialWac,
                  price_per_unit: 1000
                }
              })
            }))
          }))
        }))
      })

      // Mock transaction insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'tx-1' } })
          }))
        }))
      })

      // Mock stock log insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      })

      // Mock ingredient update
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
          }))
        }))
      })

      const result = await service.updateStockFromPurchase(
        'ingredient-1',
        purchaseQuantity,
        purchasePrice,
        'test-ref'
      )

      expect(result.newStock).toBe(expectedNewStock)
      expect(result.newWac).toBe(expectedNewWac)
    })

    it('should handle first purchase (no existing stock)', async () => {
      const purchaseQuantity = 100
      const purchasePrice = 500

      // Expected: WAC = purchase price, stock = purchase quantity
      const expectedNewWac = purchasePrice
      const expectedNewStock = purchaseQuantity

      // Mock empty ingredient data
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  current_stock: 0,
                  weighted_average_cost: null,
                  price_per_unit: null
                }
              })
            }))
          }))
        }))
      })

      // Mock transaction insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'tx-1' } })
          }))
        }))
      })

      // Mock stock log insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      })

      // Mock ingredient update
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
          }))
        }))
      })

      const result = await service.updateStockFromPurchase(
        'ingredient-1',
        purchaseQuantity,
        purchasePrice,
        'test-ref'
      )

      expect(result.newStock).toBe(expectedNewStock)
      expect(result.newWac).toBe(expectedNewWac)
    })
  })

  describe('reverseStockFromPurchase', () => {
    it('should recalculate WAC correctly when purchase is reversed', async () => {
      // Initial state: 150 units at WAC 1100
      const initialStock = 150
      const initialWac = 1100
      const reverseQuantity = 50
      const reversePrice = 1200

      // Reverse calculation:
      // totalOldValue = 150 * 1100 = 165,000
      // purchaseValueToRemove = 50 * 1200 = 60,000
      // newTotalValue = 165,000 - 60,000 = 105,000
      // newStock = 150 - 50 = 100
      // newWac = 105,000 / 100 = 1,050
      const expectedNewWac = 1050
      const expectedNewStock = 100

      // Mock ingredient data
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  current_stock: initialStock,
                  weighted_average_cost: initialWac,
                  price_per_unit: 1000,
                  name: 'Test Ingredient'
                }
              })
            }))
          }))
        }))
      })

      // Mock transaction insert (for reversal)
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'tx-reversal' } })
          }))
        }))
      })

      // Mock stock log insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      })

      // Mock ingredient update
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
          }))
        }))
      })

      const result = await service.reverseStockFromPurchase(
        'ingredient-1',
        reverseQuantity,
        reversePrice,
        'test-ref'
      )

      expect(result.newStock).toBe(expectedNewStock)
      expect(result.newWac).toBe(expectedNewWac)
    })

    it('should handle complete stock reversal', async () => {
      // Initial state: 50 units at WAC 1000
      const initialStock = 50
      const initialWac = 1000
      const reverseQuantity = 50
      const reversePrice = 1000

      // After reversal: stock = 0, WAC = fallback to previous WAC
      const expectedNewStock = 0
      const expectedNewWac = initialWac // fallback

      // Mock ingredient data
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  current_stock: initialStock,
                  weighted_average_cost: initialWac,
                  price_per_unit: 1000,
                  name: 'Test Ingredient'
                }
              })
            }))
          }))
        }))
      })

      // Mock transaction insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'tx-reversal' } })
          }))
        }))
      })

      // Mock stock log insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      })

      // Mock ingredient update
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
          }))
        }))
      })

      const result = await service.reverseStockFromPurchase(
        'ingredient-1',
        reverseQuantity,
        reversePrice,
        'test-ref'
      )

      expect(result.newStock).toBe(expectedNewStock)
      expect(result.newWac).toBe(expectedNewWac)
    })
  })
})
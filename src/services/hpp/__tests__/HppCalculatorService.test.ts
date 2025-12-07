import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HppCalculatorService } from '../../HppCalculatorService'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(),
                then: vi.fn()
              }))
            }))
          }))
        }))
      }))
    }))
  }))
}

describe('HppCalculatorService - Overhead Allocation', () => {
  let service: HppCalculatorService

  beforeEach(() => {
    service = new HppCalculatorService({
      userId: 'test-user',
      supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient<import('@/types/database').Database>
    })
  })

  describe('calculateOverheadCost', () => {
    it('should allocate overhead fairly per unit based on total volume', async () => {
      // Mock production data for volume-based allocation
      const mockProductions = [
        { actual_quantity: 100 },
        { actual_quantity: 200 },
        { actual_quantity: 50 }
      ]

      const totalVolume = 350 // 100 + 200 + 50
      const totalOverhead = 35000
      const expectedOverheadPerUnit = totalOverhead / totalVolume // 100

      // Mock the supabase query chain
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                then: vi.fn((callback) => callback({ data: mockProductions }))
              }))
            }))
          }))
        }))
      })

      const result = await service['calculateOverheadCost']('recipe-1', 100)

      expect(result).toBe(expectedOverheadPerUnit)
    })

    it('should handle recipes with no production history', async () => {
      // Mock empty production data
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                then: vi.fn((callback) => callback({ data: [] }))
              }))
            }))
          }))
        }))
      })

      // Mock recipe count for equal allocation
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            then: vi.fn((callback) => callback({ count: 5 }))
          }))
        }))
      })

      const result = await service['calculateOverheadCost']('recipe-1', 100)

      expect(result).toBe(0) // No overhead data available
    })
  })
})
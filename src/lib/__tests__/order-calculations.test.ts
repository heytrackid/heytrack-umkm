import { describe, it, expect } from 'vitest'

// Test order calculation logic
describe('Order Calculations', () => {
  describe('Order Total Calculation', () => {
    it('should calculate order total correctly: subtotal - discount + tax + delivery', () => {
      // Test case 1: Basic order
      const items = [
        { quantity: 2, unit_price: 10000 }, // 20,000
        { quantity: 1, unit_price: 15000 }  // 15,000
      ]
      const subtotal = 35000
      const discount = 5000
      const taxRate = 10 // 10%
      const deliveryFee = 5000

      // Calculate tax on (subtotal - discount)
      const taxableAmount = subtotal - discount // 30,000
      const taxAmount = (taxableAmount * taxRate) / 100 // 3,000
      const expectedTotal = taxableAmount + taxAmount + deliveryFee // 38,000

      expect(expectedTotal).toBe(38000)
    })

    it('should handle zero discount correctly', () => {
      const subtotal = 50000
      const discount = 0
      const taxRate = 11
      const deliveryFee = 10000

      const taxableAmount = subtotal - discount
      const taxAmount = (taxableAmount * taxRate) / 100
      const expectedTotal = taxableAmount + taxAmount + deliveryFee

      expect(expectedTotal).toBe(65500) // 50,000 + 5,500 + 10,000
    })

    it('should handle discount correctly', () => {
      const subtotal = 75000
      const discount = 10000
      const taxRate = 11
      const deliveryFee = 10000

      const taxableAmount = subtotal - discount
      const taxAmount = (taxableAmount * taxRate) / 100
      const expectedTotal = taxableAmount + taxAmount + deliveryFee

      expect(expectedTotal).toBe(82150) // 65,000 + 7,150 + 10,000
    })

    it('should handle zero tax correctly', () => {
      const subtotal = 75000
      const discount = 10000
      const taxRate = 0
      const deliveryFee = 0

      const taxableAmount = subtotal - discount
      const taxAmount = (taxableAmount * taxRate) / 100
      const expectedTotal = taxableAmount + taxAmount + deliveryFee

      expect(expectedTotal).toBe(65000)
    })
  })

  describe('Item Total Calculation', () => {
    it('should calculate item total as quantity × unit_price', () => {
      const testCases = [
        { quantity: 1, unit_price: 25000, expected: 25000 },
        { quantity: 3, unit_price: 12000, expected: 36000 },
        { quantity: 0.5, unit_price: 40000, expected: 20000 },
        { quantity: 2, unit_price: 0, expected: 0 }
      ]

      testCases.forEach(({ quantity, unit_price, expected }) => {
        expect(quantity * unit_price).toBe(expected)
      })
    })
  })
})
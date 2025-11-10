import { parseCSV } from '@/components/import/csv-helpers'
import { describe, it, expect } from 'vitest'


describe('CSV Helpers', () => {
  describe('parseCSV', () => {
    it('should parse simple CSV correctly', () => {
      const csv = `name,unit,price
Tepung,kg,12000
Gula,kg,15000`
      
      const result = parseCSV(csv)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        name: 'Tepung',
        unit: 'kg',
        price: '12000'
      })
      expect(result[1]).toEqual({
        name: 'Gula',
        unit: 'kg',
        price: '15000'
      })
    })

    it('should handle quoted fields with commas', () => {
      const csv = `name,address,phone
Budi,"Jl. Merdeka No. 123, Jakarta",081234567890
Siti,"Jl. Sudirman No. 45, Bandung",081298765432`
      
      const result = parseCSV(csv)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        name: 'Budi',
        address: 'Jl. Merdeka No. 123, Jakarta',
        phone: '081234567890'
      })
      expect(result[1]).toEqual({
        name: 'Siti',
        address: 'Jl. Sudirman No. 45, Bandung',
        phone: '081298765432'
      })
    })

    it('should handle escaped quotes', () => {
      const csv = `name,description
Product,"Description with ""quotes"" inside"`
      
      const result = parseCSV(csv)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        name: 'Product',
        description: 'Description with "quotes" inside'
      })
    })

    it('should handle empty fields', () => {
      const csv = `name,unit,price,stock
Tepung,kg,12000,
Gula,kg,,50`
      
      const result = parseCSV(csv)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        name: 'Tepung',
        unit: 'kg',
        price: '12000',
        stock: ''
      })
      expect(result[1]).toEqual({
        name: 'Gula',
        unit: 'kg',
        price: '',
        stock: '50'
      })
    })

    it('should return empty array for empty CSV', () => {
      const csv = ''
      const result = parseCSV(csv)
      expect(result).toHaveLength(0)
    })

    it('should return empty array for CSV with only header', () => {
      const csv = 'name,unit,price'
      const result = parseCSV(csv)
      expect(result).toHaveLength(0)
    })
  })
})

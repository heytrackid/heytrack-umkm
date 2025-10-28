import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HppExportService } from '@/modules/hpp'

// Mock Blob and URL for export testing
global.Blob = vi.fn()
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock document for downloadFile
Object.defineProperty(document, 'createElement', {
  writable: true,
  value: vi.fn().mockReturnValue({
    click: vi.fn(),
    set href(val: string) { this._href = val },
    get href() { return this._href }
  })
})

Object.defineProperty(document.body, 'appendChild', {
  writable: true,
  value: vi.fn()
})

Object.defineProperty(document.body, 'removeChild', {
  writable: true,
  value: vi.fn()
})

describe('HppExportService', () => {
  let service: HppExportService

  beforeEach(() => {
    service = new HppExportService()
    vi.clearAllMocks()
  })

  describe('exportAsCsv', () => {
    it('should export data as CSV format', async () => {
      const mockData = {
        calculations: [
          {
            recipes: { name: 'Test Recipe', category: 'Main Course' },
            calculation_date: '2025-01-01',
            total_hpp: 50000,
            material_cost: 30000,
            labor_cost: 15000,
            overhead_cost: 5000
          }
        ],
        metadata: {
          exportDate: '2025-01-01',
          options: { format: 'csv' }
        }
      }

      const result = (service as any).exportAsCsv(mockData)

      expect(result.data).toContain('Recipe Name,Category,Calculation Date,HPP Value')
      expect(result.data).toContain('Test Recipe,Main Course,2025-01-01,50000')
      expect(result.filename).toContain('hpp-data-')
      expect(result.filename).toContain('.csv')
      expect(result.mimeType).toBe('text/csv')
    })

    it('should handle empty data', async () => {
      const mockData = {
        calculations: [],
        metadata: { exportDate: '2025-01-01', options: { format: 'csv' } }
      }

      const result = (service as any).exportAsCsv(mockData)

      expect(result.data).toContain('Recipe Name,Category,Calculation Date')
      expect(result.filename).toContain('.csv')
    })
  })

  describe('exportAsJson', () => {
    it('should export data as JSON format', async () => {
      const mockData = {
        calculations: [{ id: 'calc-1', total_hpp: 50000 }],
        metadata: { exportDate: '2025-01-01', options: { format: 'json' } }
      }

      const result = (service as any).exportAsJson(mockData)

      expect(JSON.parse(result.data)).toEqual(mockData)
      expect(result.filename).toContain('.json')
      expect(result.mimeType).toBe('application/json')
    })
  })

  describe('getExportFormats', () => {
    it('should return available export formats', () => {
      const formats = HppExportService.getExportFormats()

      expect(formats).toHaveLength(4)
      expect(formats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: 'csv', label: 'CSV' }),
          expect.objectContaining({ value: 'excel', label: 'Excel' }),
          expect.objectContaining({ value: 'json', label: 'JSON' }),
          expect.objectContaining({ value: 'pdf', label: 'PDF' })
        ])
      )
    })
  })

  describe('downloadFile', () => {
    it('should trigger file download', () => {
      const data = 'test,data'
      const filename = 'test.csv'
      const mimeType = 'text/csv'

      HppExportService.downloadFile(data, filename, mimeType)

      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })
})

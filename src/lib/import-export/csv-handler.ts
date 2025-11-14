/**
 * CSV Import/Export Handler
 * Handles parsing, validation, and conversion of CSV data
 */

import Papa from 'papaparse'

export interface CSVParseResult<T> {
  data: T[]
  errors: Array<{
    row: number
    field: string
    message: string
  }>
  meta: {
    totalRows: number
    validRows: number
    invalidRows: number
  }
}

/**
 * Parse CSV file to JSON
 */
export function parseCSV<T>(
  file: File,
  expectedHeaders: string[]
): Promise<CSVParseResult<T>> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: CSVParseResult<T>['errors'] = []
        const validData: T[] = []

        // Validate headers
        const headers = results.meta.fields || []
        const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h))

        if (missingHeaders.length > 0) {
          errors.push({
            row: 0,
            field: 'headers',
            message: `Missing required columns: ${missingHeaders.join(', ')}`,
          })
        }

        // Validate each row
        results.data.forEach((row: unknown, index: number) => {
          const rowData = row as Record<string, unknown>
          let isValid = true

          // Check for required fields
          expectedHeaders.forEach((header) => {
            if (!rowData[header] || String(rowData[header]).trim() === '') {
              errors.push({
                row: index + 2, // +2 because of header row and 0-index
                field: header,
                message: `Required field "${header}" is empty`,
              })
              isValid = false
            }
          })

          if (isValid) {
            validData.push(rowData as T)
          }
        })

        resolve({
          data: validData,
          errors,
          meta: {
            totalRows: results.data.length,
            validRows: validData.length,
            invalidRows: results.data.length - validData.length,
          },
        })
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [
            {
              row: 0,
              field: 'file',
              message: error.message,
            },
          ],
          meta: {
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
          },
        })
      },
    })
  })
}

/**
 * Convert JSON data to CSV string
 */
export function jsonToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return headers ? headers.join(',') + '\n' : ''
  }

  const csv = Papa.unparse(data, {
    columns: headers,
    header: true,
  })

  return csv
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Generate CSV template
 */
export function generateTemplate(headers: string[], sampleData?: Record<string, string>[]): string {
  const data = sampleData || [
    headers.reduce((obj, header) => {
      obj[header] = `example_${header.toLowerCase()}`
      return obj
    }, {} as Record<string, string>),
  ]

  return jsonToCSV(data, headers)
}

/**
 * Validate ingredient CSV data
 */
export interface IngredientCSVRow {
  name: string
  category: string
  unit: string
  price_per_unit: string
  current_stock: string
  reorder_point: string
  supplier?: string
}

export function validateIngredientRow(row: IngredientCSVRow, rowNumber: number): string[] {
  const errors: string[] = []

  if (!row.name || row.name.trim() === '') {
    errors.push(`Row ${rowNumber}: Name is required`)
  }

  if (!row.unit || row.unit.trim() === '') {
    errors.push(`Row ${rowNumber}: Unit is required`)
  }

  const price = parseFloat(row.price_per_unit)
  if (isNaN(price) || price < 0) {
    errors.push(`Row ${rowNumber}: Price must be a positive number`)
  }

  const stock = parseFloat(row.current_stock)
  if (isNaN(stock) || stock < 0) {
    errors.push(`Row ${rowNumber}: Stock must be a positive number`)
  }

  const reorder = parseFloat(row.reorder_point)
  if (isNaN(reorder) || reorder < 0) {
    errors.push(`Row ${rowNumber}: Reorder point must be a positive number`)
  }

  return errors
}

/**
 * Validate recipe CSV data
 */
export interface RecipeCSVRow {
  name: string
  category: string
  serving_size: string
  selling_price: string
  description?: string
}

export function validateRecipeRow(row: RecipeCSVRow, rowNumber: number): string[] {
  const errors: string[] = []

  if (!row.name || row.name.trim() === '') {
    errors.push(`Row ${rowNumber}: Name is required`)
  }

  const servingSize = parseInt(row.serving_size)
  if (isNaN(servingSize) || servingSize <= 0) {
    errors.push(`Row ${rowNumber}: Serving size must be a positive number`)
  }

  const price = parseFloat(row.selling_price)
  if (isNaN(price) || price < 0) {
    errors.push(`Row ${rowNumber}: Selling price must be a positive number`)
  }

  return errors
}

/**
 * Validate customer CSV data
 */
export interface CustomerCSVRow {
  name: string
  phone: string
  email?: string
  address?: string
  is_vip?: string
}

export function validateCustomerRow(row: CustomerCSVRow, rowNumber: number): string[] {
  const errors: string[] = []

  if (!row.name || row.name.trim() === '') {
    errors.push(`Row ${rowNumber}: Name is required`)
  }

  if (!row.phone || row.phone.trim() === '') {
    errors.push(`Row ${rowNumber}: Phone is required`)
  }

  // Validate email format if provided
  if (row.email && row.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(row.email)) {
      errors.push(`Row ${rowNumber}: Invalid email format`)
    }
  }

  return errors
}

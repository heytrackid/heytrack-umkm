import { dbLogger } from '@/lib/logger';

export interface ExcelExportData<T = Record<string, unknown>> {
  sheetName: string
  data: T[]
  columns?: { key: string; header: string; width?: number }[]
}

// API response types
interface RecipeResponse {
  id: string
  name: string
  description?: string | null
  servings?: number | null
  selling_price?: number | null
  cost_price?: number | null
  category?: string | null
  created_at?: string
}

interface IngredientResponse {
  id: string
  name: string
  unit?: string | null
  cost_per_unit?: number | null
  min_stock?: number | null
  current_stock?: number | null
  created_at?: string
}

interface OrderResponse {
  id: string
  order_no?: string | null
  customer_name?: string | null
  order_date?: string | null
  status?: string | null
  total_amount?: number | null
  created_at?: string
}

interface CustomerResponse {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  created_at?: string
}

// Excel export row types
interface RecipeExportRow {
  id: string
  nama: string
  deskripsi: string
  porsi: number
  harga_jual: number
  hpp: number
  kategori: string
  dibuat: string
}

interface IngredientExportRow {
  id: string
  nama: string
  satuan: string
  harga_per_unit: number
  stok_minimum: number
  stok_saat_ini: number
  dibuat: string
}

interface OrderExportRow {
  id: string
  nomor_order: string
  nama_pelanggan: string
  tanggal_order: string
  status: string
  total_jumlah: number
  dibuat: string
}

interface CustomerExportRow {
  id: string
  nama: string
  telepon: string
  email: string
  alamat: string
  dibuat: string
}

export class LazyExcelExportService {
  private static async loadDependencies() {
    // Dynamically import heavy dependencies only when needed
    const [ExcelJS, { saveAs }] = await Promise.all([
      import('exceljs'),
      import('file-saver')
    ])
    return { ExcelJS: ExcelJS.default, saveAs }
  }

  /**
   * Export multiple sheets to Excel with dynamic imports
   */
  static async exportToExcel(sheets: ExcelExportData<Record<string, unknown>>[], fileName?: string) {
    try {
      // Load dependencies dynamically
      const { ExcelJS, saveAs } = await this.loadDependencies()

      const workbook = new ExcelJS.Workbook()

      sheets.forEach(sheet => {
        const worksheet = workbook.addWorksheet(sheet.sheetName)

        // If columns are specified, use them
        if (sheet.columns && sheet.columns.length > 0) {
          worksheet.columns = sheet.columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 20
          }))

          // Add data rows
          sheet.data.forEach(row => {
            worksheet.addRow(row)
          })
        } else {
          // Auto-generate columns from first data row
          if (sheet.data.length > 0) {
            const firstRow = sheet.data[0]
            if (firstRow) {
              worksheet.columns = Object.keys(firstRow).map(key => ({
                header: key,
                key: key,
                width: 20
              }))
            }

            // Add all data
            sheet.data.forEach(row => {
              worksheet.addRow(row)
            })
          }
        }
      })

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer()

      // Save file
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const defaultFileName = `HeyTrack-Export-${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, fileName || defaultFileName)
    } catch (error: unknown) {
      dbLogger.error({ err: error }, 'Excel export failed')
      throw new Error('Failed to export Excel file')
    }
  }

  /**
   * Fetch all application data for export
   */
  static async fetchAllData(): Promise<ExcelExportData<Record<string, unknown>>[]> {
    try {
      // Fetch data from all endpoints
      const [
        recipes,
        ingredients,
        orders,
        customers
      ] = await Promise.all([
        fetch('/api/recipes').then(r => r.ok ? r.json() : { recipes: [] }),
        fetch('/api/ingredients').then(r => r.ok ? r.json() : { ingredients: [] }),
        fetch('/api/orders').then(r => r.ok ? r.json() : { orders: [] }),
        fetch('/api/customers').then(r => r.ok ? r.json() : { customers: [] })
      ])

      const sheets: ExcelExportData<Record<string, unknown>>[] = [
        {
          sheetName: 'Resep',
          data: Array.isArray(recipes?.recipes) ? recipes.recipes.map((recipe: RecipeResponse): RecipeExportRow => ({
            id: (recipe as any).id,
            nama: (recipe as any).name,
            deskripsi: recipe.description || '',
            porsi: recipe.servings || 0,
            harga_jual: recipe.selling_price || 0,
            hpp: recipe.cost_price || 0,
            kategori: recipe.category || '',
            dibuat: recipe.created_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama Resep', width: 25 },
            { key: 'deskripsi', header: 'Deskripsi', width: 30 },
            { key: 'porsi', header: 'Porsi', width: 10 },
            { key: 'harga_jual', header: 'Harga Jual', width: 15 },
            { key: 'hpp', header: 'HPP', width: 15 },
            { key: 'kategori', header: 'Kategori', width: 15 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 }
          ]
        },
        {
          sheetName: 'Bahan Baku',
          data: Array.isArray(ingredients?.ingredients) ? ingredients.ingredients.map((ingredient: IngredientResponse): IngredientExportRow => ({
            id: (ingredient as any).id,
            nama: (ingredient as any).name,
            satuan: ingredient.unit || '',
            harga_per_unit: ingredient.cost_per_unit || 0,
            stok_minimum: (ingredient.min_stock ?? 0) || 0,
            stok_saat_ini: ((ingredient as any).current_stock ?? 0) || 0,
            dibuat: ingredient.created_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama Bahan', width: 25 },
            { key: 'satuan', header: 'Satuan', width: 10 },
            { key: 'harga_per_unit', header: 'Harga per Unit', width: 15 },
            { key: 'stok_minimum', header: 'Stok Minimum', width: 15 },
            { key: 'stok_saat_ini', header: 'Stok Saat Ini', width: 15 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 }
          ]
        },
        {
          sheetName: 'Pesanan',
          data: Array.isArray(orders?.orders) ? orders.orders.map((order: OrderResponse): OrderExportRow => ({
            id: (order as any).id,
            nomor_order: order.order_no || '',
            nama_pelanggan: order.customer_name || '',
            tanggal_order: order.order_date || '',
            status: (order as any).status || '',
            total_jumlah: order.total_amount || 0,
            dibuat: order.created_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nomor_order', header: 'Nomor Order', width: 20 },
            { key: 'nama_pelanggan', header: 'Nama Pelanggan', width: 25 },
            { key: 'tanggal_order', header: 'Tanggal Order', width: 15 },
            { key: 'status', header: 'Status Order', width: 15 },
            { key: 'total_jumlah', header: 'Total Jumlah', width: 15 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 }
          ]
        },
        {
          sheetName: 'Pelanggan',
          data: Array.isArray(customers?.customers) ? customers.customers.map((customer: CustomerResponse): CustomerExportRow => ({
            id: (customer as any).id,
            nama: (customer as any).name,
            telepon: customer.phone || '',
            email: customer.email || '',
            alamat: customer.address || '',
            dibuat: customer.created_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama', width: 25 },
            { key: 'telepon', header: 'Telepon', width: 15 },
            { key: 'email', header: 'Email', width: 25 },
            { key: 'alamat', header: 'Alamat', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 }
          ]
        }
      ]

      return sheets
    } catch (error: unknown) {
      dbLogger.error({ err: error }, 'Failed to fetch data for export')
      throw new Error('Failed to fetch data for export')
    }
  }

  /**
   * Export all data to Excel file
   */
  static async exportAllData(): Promise<void> {
    const sheets = await this.fetchAllData()
    await this.exportToExcel(sheets)
  }
}

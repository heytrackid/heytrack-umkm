import logger from '@/lib/logger';

export interface ExcelExportData {
  sheetName: string
  data: Record<string, any>[]
  columns?: { key: string; header: string; width?: number }[]
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
  static async exportToExcel(sheets: ExcelExportData[], fileName?: string) {
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
            worksheet.columns = Object.keys(firstRow).map(key => ({
              header: key,
              key: key,
              width: 20
            }))

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
    } catch (error: any) {
      logger.error({ err: error }, 'Excel export failed')
      throw new Error('Failed to export Excel file')
    }
  }

  /**
   * Fetch all application data for export
   */
  static async fetchAllData(): Promise<ExcelExportData[]> {
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

      const sheets: ExcelExportData[] = [
        {
          sheetName: 'Resep',
          data: Array.isArray(recipes?.recipes) ? recipes.recipes.map((recipe: any) => ({
            id: recipe.id,
            nama: recipe.name,
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
          data: Array.isArray(ingredients?.ingredients) ? ingredients.ingredients.map((ingredient: any) => ({
            id: ingredient.id,
            nama: ingredient.name,
            satuan: ingredient.unit || '',
            harga_per_unit: ingredient.cost_per_unit || 0,
            stok_minimum: (ingredient.min_stock ?? 0) || 0,
            stok_saat_ini: (ingredient.current_stock ?? 0) || 0,
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
          data: Array.isArray(orders?.orders) ? orders.orders.map((order: any) => ({
            id: order.id,
            nomor_order: order.order_no || '',
            nama_pelanggan: order.customer_name || '',
            tanggal_order: order.order_date || '',
            status: order.status || '',
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
          data: Array.isArray(customers?.customers) ? customers.customers.map((customer: any) => ({
            id: customer.id,
            nama: customer.name,
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
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to fetch data for export')
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

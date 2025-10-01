import type { WorkBook } from 'xlsx'
import type { saveAs as SaveAsType } from 'file-saver'

export interface ExcelExportData {
  sheetName: string
  data: Record<string, any>[]
  columns?: { key: string; header: string; width?: number }[]
}

export class LazyExcelExportService {
  private static async loadDependencies() {
    // Dynamically import heavy dependencies only when needed
    const [{ default: XLSX }, { saveAs }] = await Promise.all([
      import('xlsx'),
      import('file-saver')
    ])
    return { XLSX, saveAs }
  }

  /**
   * Export multiple sheets to Excel with dynamic imports
   */
  static async exportToExcel(sheets: ExcelExportData[], fileName?: string) {
    try {
      // Load dependencies dynamically
      const { XLSX, saveAs } = await this.loadDependencies()
      
      const workbook = XLSX.utils.book_new()
      
      sheets.forEach(sheet => {
        // If columns are specified, use them to order and format the data
        let processedData = sheet.data
        
        if (sheet.columns && sheet.columns.length > 0) {
          // Create headers row
          const headers = sheet.columns.reduce((acc, col) => {
            acc[col.key] = col.header
            return acc
          }, {} as Record<string, string>)
          
          // Reorder data according to columns specification
          processedData = sheet.data.map(row => {
            const newRow: Record<string, any> = {}
            sheet.columns!.forEach(col => {
              newRow[col.key] = row[col.key] || ''
            })
            return newRow
          })
          
          // Add headers as first row
          processedData.unshift(headers)
        }
        
        const worksheet = XLSX.utils.json_to_sheet(processedData, {
          skipHeader: sheet.columns ? true : false
        })
        
        // Set column widths if specified
        if (sheet.columns) {
          const colWidths = sheet.columns.map(col => ({
            wch: col.width || 20
          }))
          worksheet['!cols'] = colWidths
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      })
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Save file
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const defaultFileName = `HeyTrack-Export-${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, fileName || defaultFileName)
    } catch (error: any) {
      console.error('Excel export failed:', error)
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
        customers,
        suppliers,
        inventory,
        expenses,
        sales,
        productionBatches
      ] = await Promise.all([
        fetch('/api/recipes').then(r => r.ok ? r.json() : { recipes: [] }),
        fetch('/api/ingredients').then(r => r.ok ? r.json() : { ingredients: [] }),
        fetch('/api/orders').then(r => r.ok ? r.json() : { orders: [] }),
        fetch('/api/customers').then(r => r.ok ? r.json() : { customers: [] }),
        fetch('/api/suppliers').then(r => r.ok ? r.json() : { suppliers: [] }),
        fetch('/api/inventory').then(r => r.ok ? r.json() : { inventory: [] }),
        fetch('/api/expenses').then(r => r.ok ? r.json() : { expenses: [] }),
        fetch('/api/sales').then(r => r.ok ? r.json() : { sales: [] }),
        fetch('/api/production-batches').then(r => r.ok ? r.json() : { batches: [] })
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
            waktu_persiapan: recipe.prep_time || 0,
            waktu_memasak: recipe.cook_time || 0,
            tingkat_kesulitan: recipe.difficulty || '',
            instruksi: recipe.instructions || '',
            dibuat: recipe.created_at || '',
            diperbarui: recipe.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama Resep', width: 25 },
            { key: 'deskripsi', header: 'Deskripsi', width: 30 },
            { key: 'porsi', header: 'Porsi', width: 10 },
            { key: 'harga_jual', header: 'Harga Jual', width: 15 },
            { key: 'hpp', header: 'HPP', width: 15 },
            { key: 'kategori', header: 'Kategori', width: 15 },
            { key: 'waktu_persiapan', header: 'Waktu Persiapan (menit)', width: 20 },
            { key: 'waktu_memasak', header: 'Waktu Memasak (menit)', width: 20 },
            { key: 'tingkat_kesulitan', header: 'Tingkat Kesulitan', width: 15 },
            { key: 'instruksi', header: 'Instruksi', width: 40 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
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
            supplier: ingredient.supplier || '',
            deskripsi: ingredient.description || '',
            dibuat: ingredient.created_at || '',
            diperbarui: ingredient.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama Bahan', width: 25 },
            { key: 'satuan', header: 'Satuan', width: 10 },
            { key: 'harga_per_unit', header: 'Harga per Unit', width: 15 },
            { key: 'stok_minimum', header: 'Stok Minimum', width: 15 },
            { key: 'stok_saat_ini', header: 'Stok Saat Ini', width: 15 },
            { key: 'supplier', header: 'Supplier', width: 20 },
            { key: 'deskripsi', header: 'Deskripsi', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Pesanan',
          data: Array.isArray(orders?.orders) ? orders.orders.map((order: any) => ({
            id: order.id,
            nomor_order: order.order_no || '',
            nama_pelanggan: order.customer_name || '',
            telepon_pelanggan: order.customer_phone || '',
            email_pelanggan: order.customer_email || '',
            alamat_pelanggan: order.customer_address || '',
            tanggal_order: order.order_date || '',
            tanggal_pengiriman: order.delivery_date || '',
            waktu_pengiriman: order.delivery_time || '',
            status: order.status || '',
            status_pembayaran: order.payment_status || '',
            prioritas: order.priority || '',
            subtotal: order.subtotal || 0,
            pajak: order.tax_amount || 0,
            diskon: order.discount || 0,
            total_jumlah: order.total_amount || 0,
            catatan: order.notes || '',
            dibuat: order.created_at || '',
            diperbarui: order.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nomor_order', header: 'Nomor Order', width: 20 },
            { key: 'nama_pelanggan', header: 'Nama Pelanggan', width: 25 },
            { key: 'telepon_pelanggan', header: 'Telepon', width: 15 },
            { key: 'email_pelanggan', header: 'Email', width: 25 },
            { key: 'alamat_pelanggan', header: 'Alamat', width: 30 },
            { key: 'tanggal_order', header: 'Tanggal Order', width: 15 },
            { key: 'tanggal_pengiriman', header: 'Tanggal Pengiriman', width: 20 },
            { key: 'waktu_pengiriman', header: 'Waktu Pengiriman', width: 15 },
            { key: 'status', header: 'Status Order', width: 15 },
            { key: 'status_pembayaran', header: 'Status Pembayaran', width: 15 },
            { key: 'prioritas', header: 'Prioritas', width: 10 },
            { key: 'subtotal', header: 'Subtotal', width: 15 },
            { key: 'pajak', header: 'Pajak', width: 15 },
            { key: 'diskon', header: 'Diskon', width: 15 },
            { key: 'total_jumlah', header: 'Total Jumlah', width: 15 },
            { key: 'catatan', header: 'Catatan', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
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
            tipe: customer.type || 'individual',
            total_pesanan: customer.total_orders || 0,
            total_pembelian: customer.total_spent || 0,
            catatan: customer.notes || '',
            dibuat: customer.created_at || '',
            diperbarui: customer.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama', width: 25 },
            { key: 'telepon', header: 'Telepon', width: 15 },
            { key: 'email', header: 'Email', width: 25 },
            { key: 'alamat', header: 'Alamat', width: 30 },
            { key: 'tipe', header: 'Tipe', width: 15 },
            { key: 'total_pesanan', header: 'Total Pesanan', width: 15 },
            { key: 'total_pembelian', header: 'Total Pembelian', width: 15 },
            { key: 'catatan', header: 'Catatan', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        }
      ]

      return sheets
    } catch (error: any) {
      console.error('Failed to fetch data for export:', error)
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

import 'server-only'
import ExcelJS from 'exceljs'
import { createClient } from '@/utils/supabase/server'
import type { Row } from '@/types/database'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'



type Recipe = Row<'recipes'>
type Order = Row<'orders'>
type Ingredient = Row<'ingredients'>
type Customer = Row<'customers'>
type StockTransaction = Row<'stock_transactions'>

export class GlobalExportService {
  static async generateExport(userId: string): Promise<Buffer> {
    const supabase = await createClient()
    const workbook = new ExcelJS.Workbook()

    workbook.creator = 'HeyTrack'
    workbook.created = new Date()
    workbook.modified = new Date()

    // Fetch all data
    const [recipes, orders, ingredients, customers, stockTransactions] = await Promise.all([
      this.fetchRecipes(supabase, userId),
      this.fetchOrders(supabase, userId),
      this.fetchIngredients(supabase, userId),
      this.fetchCustomers(supabase, userId),
      this.fetchStockTransactions(supabase, userId),
    ])

    // Create sheets
    void this.createRecipesSheet(workbook, recipes)
    void this.createOrdersSheet(workbook, orders)
    void this.createIngredientsSheet(workbook, ingredients)
    void this.createCustomersSheet(workbook, customers)
    void this.createStockTransactionsSheet(workbook, stockTransactions)
    void this.createSummarySheet(workbook, { recipes, orders, ingredients, customers })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  private static async fetchRecipes(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, servings, selling_price, cost_per_unit, is_active, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {throw error}
    return (data || []) as Recipe[]
  }

  private static async fetchOrders(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_no, customer_name, total_amount, status, order_date, created_at')
      .eq('user_id', userId)
      .order('order_date', { ascending: false })
    if (error) {throw error}
    return (data || []) as Order[]
  }

  private static async fetchIngredients(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, unit, current_stock, min_stock, weighted_average_cost, price_per_unit, created_at')
      .eq('user_id', userId)
      .order('name')
    if (error) {throw error}
    return (data || []) as Ingredient[]
  }

  private static async fetchCustomers(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, email, address, created_at')
      .eq('user_id', userId)
      .order('name')
    if (error) {throw error}
    return (data || []) as Customer[]
  }

  private static async fetchStockTransactions(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<StockTransaction[]> {
    const { data, error } = await supabase
      .from('stock_transactions')
      .select('id, ingredient_id, type, quantity, unit_price, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) {throw error}
    return (data || []) as StockTransaction[]
  }

  private static createRecipesSheet(workbook: ExcelJS.Workbook, recipes: Recipe[]) {
    const sheet = workbook.addWorksheet('Resep', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    // Header styling
    sheet.columns = [
      { header: 'Nama Resep', key: 'name', width: 30 },
      { header: 'Porsi', key: 'servings', width: 10 },
      { header: 'Harga Jual', key: 'selling_price', width: 15 },
      { header: 'HPP', key: 'production_cost', width: 15 },
      { header: 'Margin', key: 'margin', width: 12 },
      { header: 'Margin %', key: 'margin_pct', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Dibuat', key: 'created_at', width: 15 },
    ]

    this.styleHeader(sheet)

    // Add data
    recipes.forEach((recipe: Recipe) => {
      const margin = (recipe.selling_price ?? 0) - (recipe.cost_per_unit ?? 0)
      const marginPct = recipe.selling_price ? (margin / recipe.selling_price) * 100 : 0

      sheet.addRow({
        name: recipe.name,
        servings: recipe.servings,
        selling_price: recipe.selling_price ?? 0,
        production_cost: recipe.cost_per_unit ?? 0,
        margin,
        margin_pct: marginPct,
        status: recipe.is_active ? 'Aktif' : 'Nonaktif',
        created_at: recipe.created_at ? format(new Date(recipe.created_at), 'dd/MM/yyyy', { locale: localeId }) : '',
      })
    })

    // Format currency columns
    sheet.getColumn('selling_price').numFmt = '#,##0'
    sheet.getColumn('production_cost').numFmt = '#,##0'
    sheet.getColumn('margin').numFmt = '#,##0'
    sheet.getColumn('margin_pct').numFmt = '0.00"%"'

    // Add conditional formatting for margin
    sheet.getColumn('margin_pct').eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        const value = cell.value as number
        if (value < 20) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFDE7E7' }
          }
        } else if (value >= 30) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE7F5E7' }
          }
        }
      }
    })
  }

  private static createOrdersSheet(workbook: ExcelJS.Workbook, orders: Order[]) {
    const sheet = workbook.addWorksheet('Pesanan', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    sheet.columns = [
      { header: 'No. Pesanan', key: 'order_no', width: 15 },
      { header: 'Pelanggan', key: 'customer_name', width: 25 },
      { header: 'Total', key: 'total_amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Tanggal Pesanan', key: 'order_date', width: 15 },
      { header: 'Dibuat', key: 'created_at', width: 15 },
    ]

    this.styleHeader(sheet)

    orders.forEach((order: Order) => {
      sheet.addRow({
        order_no: order.order_no,
        customer_name: order.customer_name,
        total_amount: order.total_amount ?? 0,
        status: this.translateStatus(order.status),
        order_date: order.order_date ? format(new Date(order.order_date), 'dd/MM/yyyy', { locale: localeId }) : '',
        created_at: order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy', { locale: localeId }) : '',
      })
    })

    sheet.getColumn('total_amount').numFmt = '#,##0'
  }

  private static createIngredientsSheet(workbook: ExcelJS.Workbook, ingredients: Ingredient[]) {
    const sheet = workbook.addWorksheet('Bahan', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    sheet.columns = [
      { header: 'Nama Bahan', key: 'name', width: 30 },
      { header: 'Satuan', key: 'unit', width: 10 },
      { header: 'Stok Saat Ini', key: 'current_stock', width: 15 },
      { header: 'Stok Minimum', key: 'min_stock', width: 15 },
      { header: 'WAC', key: 'wac', width: 15 },
      { header: 'Harga per Unit', key: 'price_per_unit', width: 15 },
      { header: 'Status Stok', key: 'stock_status', width: 15 },
      { header: 'Dibuat', key: 'created_at', width: 15 },
    ]

    this.styleHeader(sheet)

    ingredients.forEach((ingredient: Ingredient) => {
      const stockStatus = (ingredient.current_stock ?? 0) <= (ingredient.min_stock ?? 0) 
        ? 'Perlu Restock' 
        : 'Aman'

      sheet.addRow({
        name: ingredient.name,
        unit: ingredient.unit,
        current_stock: ingredient.current_stock ?? 0,
        min_stock: ingredient.min_stock ?? 0,
        wac: ingredient.weighted_average_cost || 0,
        price_per_unit: ingredient.price_per_unit || 0,
        stock_status: stockStatus,
        created_at: ingredient.created_at ? format(new Date(ingredient.created_at), 'dd/MM/yyyy', { locale: localeId }) : '',
      })
    })

    sheet.getColumn('current_stock').numFmt = '#,##0.00'
    sheet.getColumn('min_stock').numFmt = '#,##0.00'
    sheet.getColumn('wac').numFmt = '#,##0'
    sheet.getColumn('price_per_unit').numFmt = '#,##0'

    // Conditional formatting for stock status
    sheet.getColumn('stock_status').eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && cell.value === 'Perlu Restock') {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFDE7E7' }
        }
      }
    })
  }

  private static createCustomersSheet(workbook: ExcelJS.Workbook, customers: Customer[]) {
    const sheet = workbook.addWorksheet('Pelanggan', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    sheet.columns = [
      { header: 'Nama', key: 'name', width: 25 },
      { header: 'Telepon', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Alamat', key: 'address', width: 40 },
      { header: 'Dibuat', key: 'created_at', width: 15 },
    ]

    this.styleHeader(sheet)

    customers.forEach((customer: Customer) => {
      sheet.addRow({
        name: customer.name,
        phone: customer.phone ?? '-',
        email: customer.email ?? '-',
        address: customer.address ?? '-',
        created_at: customer.created_at ? format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: localeId }) : '',
      })
    })
  }

  private static createStockTransactionsSheet(workbook: ExcelJS.Workbook, transactions: StockTransaction[]) {
    const sheet = workbook.addWorksheet('Transaksi Stok', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    sheet.columns = [
      { header: 'Tanggal', key: 'created_at', width: 15 },
      { header: 'Tipe', key: 'type', width: 12 },
      { header: 'Jumlah', key: 'quantity', width: 12 },
      { header: 'Harga Satuan', key: 'unit_price', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ]

    this.styleHeader(sheet)

    transactions.forEach((tx: StockTransaction) => {
      const total = (tx.quantity ?? 0) * (tx.unit_price ?? 0)
      sheet.addRow({
        created_at: tx.created_at ? format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: localeId }) : '',
        type: this.translateTransactionType(tx.type),
        quantity: tx.quantity || 0,
        unit_price: tx.unit_price ?? 0,
        total,
      })
    })

    sheet.getColumn('quantity').numFmt = '#,##0.00'
    sheet.getColumn('unit_price').numFmt = '#,##0'
    sheet.getColumn('total').numFmt = '#,##0'
  }

  private static createSummarySheet(
    workbook: ExcelJS.Workbook,
    data: { recipes: Recipe[]; orders: Order[]; ingredients: Ingredient[]; customers: Customer[] }
  ) {
    const sheet = workbook.addWorksheet('Ringkasan', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    sheet.columns = [
      { header: 'Metrik', key: 'metric', width: 30 },
      { header: 'Nilai', key: 'value', width: 20 },
    ]

    this.styleHeader(sheet)

    // Calculate metrics
    const totalRecipes = data.recipes.length
    const activeRecipes = data.recipes.filter(r => r.is_active).length
    const totalOrders = data.orders.length
    const completedOrders = data.orders.filter(o => o.status === 'DELIVERED').length
    const totalRevenue = data.orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0
    const totalIngredients = data.ingredients.length
    const lowStockIngredients = data.ingredients.filter(
      i => (i.current_stock ?? 0) <= (i.min_stock ?? 0)
    ).length
    const totalCustomers = data.customers.length

    // Add summary rows
    sheet.addRow({ metric: 'Total Resep', value: totalRecipes })
    sheet.addRow({ metric: 'Resep Aktif', value: activeRecipes })
    sheet.addRow({ metric: '', value: '' })
    sheet.addRow({ metric: 'Total Pesanan', value: totalOrders })
    sheet.addRow({ metric: 'Pesanan Selesai', value: completedOrders })
    sheet.addRow({ metric: 'Total Pendapatan', value: totalRevenue })
    sheet.addRow({ metric: 'Rata-rata Nilai Pesanan', value: avgOrderValue })
    sheet.addRow({ metric: '', value: '' })
    sheet.addRow({ metric: 'Total Bahan', value: totalIngredients })
    sheet.addRow({ metric: 'Bahan Stok Rendah', value: lowStockIngredients })
    sheet.addRow({ metric: '', value: '' })
    sheet.addRow({ metric: 'Total Pelanggan', value: totalCustomers })

    // Format currency rows
    sheet.getRow(6).getCell(2).numFmt = '#,##0'
    sheet.getRow(7).getCell(2).numFmt = '#,##0'

    // Style metric column
    sheet.getColumn('metric').font = { bold: true }
  }

  private static styleHeader(sheet: ExcelJS.Worksheet) {
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    }
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
    sheet.getRow(1).height = 25
  }

  private static translateStatus(status: string | null): string {
    if (!status) {return 'Unknown'}
    const statusMap: Record<string, string> = {
      pending: 'Menunggu',
      confirmed: 'Dikonfirmasi',
      in_production: 'Produksi',
      ready: 'Siap',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      PENDING: 'Menunggu',
      CONFIRMED: 'Dikonfirmasi',
      IN_PROGRESS: 'Produksi',
      READY: 'Siap',
      DELIVERED: 'Selesai',
      CANCELLED: 'Dibatalkan',
    }
    return statusMap[status] || status
  }

  private static translateTransactionType(type: string | null): string {
    if (!type) {return 'Unknown'}
    const typeMap: Record<string, string> = {
      purchase: 'Pembelian',
      usage: 'Pemakaian',
      adjustment: 'Penyesuaian',
      return: 'Retur',
      PURCHASE: 'Pembelian',
      USAGE: 'Pemakaian',
      ADJUSTMENT: 'Penyesuaian',
      RETURN: 'Retur',
    }
    return typeMap[type] || type
  }
}

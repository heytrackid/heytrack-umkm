import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExcelExportData {
  sheetName: string;
  data: Record<string, any>[];
  columns?: { key: string; header: string; width?: number }[];
}

export class ExcelExportService {
  /**
   * Export multiple sheets to Excel
   */
  static async exportToExcel(sheets: ExcelExportData[], fileName?: string) {
    const workbook = XLSX.utils.book_new();
    
    sheets.forEach(sheet => {
      // If columns are specified, use them to order and format the data
      let processedData = sheet.data;
      
      if (sheet.columns && sheet.columns.length > 0) {
        // Create headers row
        const headers = sheet.columns.reduce((acc, col) => {
          acc[col.key] = col.header;
          return acc;
        }, {} as Record<string, string>);
        
        // Reorder data according to columns specification
        processedData = sheet.data.map(row => {
          const newRow: Record<string, any> = {};
          sheet.columns!.forEach(col => {
            newRow[col.key] = row[col.key] || '';
          });
          return newRow;
        });
        
        // Add headers as first row
        processedData.unshift(headers);
      }
      
      const worksheet = XLSX.utils.json_to_sheet(processedData, {
        skipHeader: sheet.columns ? true : false
      });
      
      // Set column widths if specified
      if (sheet.columns) {
        const colWidths = sheet.columns.map(col => ({
          wch: col.width || 20
        }));
        worksheet['!cols'] = colWidths;
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });
    
    // Save file
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const defaultFileName = `HeyTrack-Export-${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName || defaultFileName);
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
        fetch('/api/recipes').then(r => r.ok ? r.json() : []),
        fetch('/api/ingredients').then(r => r.ok ? r.json() : []),
        fetch('/api/orders').then(r => r.ok ? r.json() : []),
        fetch('/api/customers').then(r => r.ok ? r.json() : []),
        fetch('/api/suppliers').then(r => r.ok ? r.json() : []),
        fetch('/api/inventory').then(r => r.ok ? r.json() : []),
        fetch('/api/expenses').then(r => r.ok ? r.json() : []),
        fetch('/api/sales').then(r => r.ok ? r.json() : []),
        fetch('/api/production-batches').then(r => r.ok ? r.json() : [])
      ]);

      const sheets: ExcelExportData[] = [
        {
          sheetName: 'Resep',
          data: Array.isArray(recipes) ? recipes.map((recipe: any) => ({
            id: recipe.id,
            nama: recipe.name,
            deskripsi: recipe.description || '',
            porsi: recipe.servings || 0,
            harga: recipe.price || 0,
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
            { key: 'harga', header: 'Harga', width: 15 },
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
          data: Array.isArray(ingredients) ? ingredients.map((ingredient: any) => ({
            id: ingredient.id,
            nama: ingredient.name,
            kategori: ingredient.category || '',
            satuan: ingredient.unit || '',
            harga_per_unit: ingredient.price_per_unit || 0,
            stok_minimum: ingredient.min_stock || 0,
            stok_saat_ini: ingredient.current_stock || 0,
            supplier: ingredient.supplier || '',
            deskripsi: ingredient.description || '',
            tanggal_kedaluwarsa: ingredient.expiry_date || '',
            dibuat: ingredient.created_at || '',
            diperbarui: ingredient.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama Bahan', width: 25 },
            { key: 'kategori', header: 'Kategori', width: 15 },
            { key: 'satuan', header: 'Satuan', width: 10 },
            { key: 'harga_per_unit', header: 'Harga per Unit', width: 15 },
            { key: 'stok_minimum', header: 'Stok Minimum', width: 15 },
            { key: 'stok_saat_ini', header: 'Stok Saat Ini', width: 15 },
            { key: 'supplier', header: 'Supplier', width: 20 },
            { key: 'deskripsi', header: 'Deskripsi', width: 30 },
            { key: 'tanggal_kedaluwarsa', header: 'Tanggal Kedaluwarsa', width: 20 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Pesanan',
          data: Array.isArray(orders) ? orders.map((order: any) => ({
            id: order.id,
            nomor_order: order.order_no || '',
            nama_pelanggan: order.customer_name || '',
            telepon_pelanggan: order.customer_phone || '',
            email_pelanggan: order.customer_email || '',
            alamat_pelanggan: order.customer_address || '',
            tanggal_pengiriman: order.delivery_date || '',
            waktu_pengiriman: order.delivery_time || '',
            status: order.status || '',
            status_pembayaran: order.payment_status || '',
            prioritas: order.priority || '',
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
            { key: 'tanggal_pengiriman', header: 'Tanggal Pengiriman', width: 20 },
            { key: 'waktu_pengiriman', header: 'Waktu Pengiriman', width: 15 },
            { key: 'status', header: 'Status Order', width: 15 },
            { key: 'status_pembayaran', header: 'Status Pembayaran', width: 15 },
            { key: 'prioritas', header: 'Prioritas', width: 10 },
            { key: 'total_jumlah', header: 'Total Jumlah', width: 15 },
            { key: 'catatan', header: 'Catatan', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Pelanggan',
          data: Array.isArray(customers) ? customers.map((customer: any) => ({
            id: customer.id,
            nama: customer.name || '',
            telepon: customer.phone || '',
            email: customer.email || '',
            alamat: customer.address || '',
            tanggal_lahir: customer.birth_date || '',
            jenis_kelamin: customer.gender || '',
            catatan: customer.notes || '',
            total_pesanan: customer.total_orders || 0,
            total_pembelian: customer.total_purchases || 0,
            dibuat: customer.created_at || '',
            diperbarui: customer.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama', width: 25 },
            { key: 'telepon', header: 'Telepon', width: 15 },
            { key: 'email', header: 'Email', width: 25 },
            { key: 'alamat', header: 'Alamat', width: 30 },
            { key: 'tanggal_lahir', header: 'Tanggal Lahir', width: 15 },
            { key: 'jenis_kelamin', header: 'Jenis Kelamin', width: 15 },
            { key: 'catatan', header: 'Catatan', width: 30 },
            { key: 'total_pesanan', header: 'Total Pesanan', width: 15 },
            { key: 'total_pembelian', header: 'Total Pembelian', width: 15 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Supplier',
          data: Array.isArray(suppliers) ? suppliers.map((supplier: any) => ({
            id: supplier.id,
            nama: supplier.name || '',
            kontak_person: supplier.contact_person || '',
            telepon: supplier.phone || '',
            email: supplier.email || '',
            alamat: supplier.address || '',
            deskripsi: supplier.description || '',
            rating: supplier.rating || 0,
            dibuat: supplier.created_at || '',
            diperbarui: supplier.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama', header: 'Nama Supplier', width: 25 },
            { key: 'kontak_person', header: 'Kontak Person', width: 20 },
            { key: 'telepon', header: 'Telepon', width: 15 },
            { key: 'email', header: 'Email', width: 25 },
            { key: 'alamat', header: 'Alamat', width: 30 },
            { key: 'deskripsi', header: 'Deskripsi', width: 30 },
            { key: 'rating', header: 'Rating', width: 10 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Inventori',
          data: Array.isArray(inventory) ? inventory.map((item: any) => ({
            id: item.id,
            nama_bahan: item.ingredient?.name || '',
            stok_saat_ini: item.current_stock || 0,
            stok_minimum: item.min_stock || 0,
            satuan: item.unit || '',
            nilai_per_unit: item.value_per_unit || 0,
            total_nilai: item.total_value || 0,
            lokasi: item.location || '',
            tanggal_kedaluwarsa: item.expiry_date || '',
            batch_number: item.batch_number || '',
            dibuat: item.created_at || '',
            diperbarui: item.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nama_bahan', header: 'Nama Bahan', width: 25 },
            { key: 'stok_saat_ini', header: 'Stok Saat Ini', width: 15 },
            { key: 'stok_minimum', header: 'Stok Minimum', width: 15 },
            { key: 'satuan', header: 'Satuan', width: 10 },
            { key: 'nilai_per_unit', header: 'Nilai per Unit', width: 15 },
            { key: 'total_nilai', header: 'Total Nilai', width: 15 },
            { key: 'lokasi', header: 'Lokasi', width: 20 },
            { key: 'tanggal_kedaluwarsa', header: 'Tanggal Kedaluwarsa', width: 20 },
            { key: 'batch_number', header: 'Batch Number', width: 15 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Biaya Operasional',
          data: Array.isArray(expenses) ? expenses.map((expense: any) => ({
            id: expense.id,
            deskripsi: expense.description || '',
            kategori: expense.category || '',
            jumlah: expense.amount || 0,
            tanggal: expense.date || '',
            metode_pembayaran: expense.payment_method || '',
            vendor: expense.vendor || '',
            nomor_invoice: expense.invoice_number || '',
            status: expense.status || '',
            catatan: expense.notes || '',
            dibuat: expense.created_at || '',
            diperbarui: expense.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'deskripsi', header: 'Deskripsi', width: 30 },
            { key: 'kategori', header: 'Kategori', width: 15 },
            { key: 'jumlah', header: 'Jumlah', width: 15 },
            { key: 'tanggal', header: 'Tanggal', width: 15 },
            { key: 'metode_pembayaran', header: 'Metode Pembayaran', width: 20 },
            { key: 'vendor', header: 'Vendor', width: 20 },
            { key: 'nomor_invoice', header: 'Nomor Invoice', width: 20 },
            { key: 'status', header: 'Status', width: 15 },
            { key: 'catatan', header: 'Catatan', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Penjualan',
          data: Array.isArray(sales) ? sales.map((sale: any) => ({
            id: sale.id,
            tanggal: sale.date || '',
            nomor_transaksi: sale.transaction_number || '',
            nama_pelanggan: sale.customer_name || '',
            total_jumlah: sale.total_amount || 0,
            metode_pembayaran: sale.payment_method || '',
            status: sale.status || '',
            diskon: sale.discount || 0,
            pajak: sale.tax || 0,
            jumlah_bersih: sale.net_amount || 0,
            catatan: sale.notes || '',
            dibuat: sale.created_at || '',
            diperbarui: sale.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'tanggal', header: 'Tanggal', width: 15 },
            { key: 'nomor_transaksi', header: 'Nomor Transaksi', width: 20 },
            { key: 'nama_pelanggan', header: 'Nama Pelanggan', width: 25 },
            { key: 'total_jumlah', header: 'Total Jumlah', width: 15 },
            { key: 'metode_pembayaran', header: 'Metode Pembayaran', width: 20 },
            { key: 'status', header: 'Status', width: 15 },
            { key: 'diskon', header: 'Diskon', width: 15 },
            { key: 'pajak', header: 'Pajak', width: 15 },
            { key: 'jumlah_bersih', header: 'Jumlah Bersih', width: 15 },
            { key: 'catatan', header: 'Catatan', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        },
        {
          sheetName: 'Batch Produksi',
          data: Array.isArray(productionBatches) ? productionBatches.map((batch: any) => ({
            id: batch.id,
            nomor_batch: batch.batch_number || '',
            resep_id: batch.recipe_id || '',
            nama_resep: batch.recipe?.name || '',
            kuantitas: batch.quantity || 0,
            tanggal_produksi: batch.production_date || '',
            tanggal_mulai: batch.start_time || '',
            tanggal_selesai: batch.end_time || '',
            status: batch.status || '',
            biaya_produksi: batch.production_cost || 0,
            hasil_produksi: batch.yield_quantity || 0,
            kualitas: batch.quality_grade || '',
            catatan: batch.notes || '',
            dibuat: batch.created_at || '',
            diperbarui: batch.updated_at || ''
          })) : [],
          columns: [
            { key: 'id', header: 'ID', width: 15 },
            { key: 'nomor_batch', header: 'Nomor Batch', width: 20 },
            { key: 'resep_id', header: 'ID Resep', width: 15 },
            { key: 'nama_resep', header: 'Nama Resep', width: 25 },
            { key: 'kuantitas', header: 'Kuantitas', width: 15 },
            { key: 'tanggal_produksi', header: 'Tanggal Produksi', width: 20 },
            { key: 'tanggal_mulai', header: 'Tanggal Mulai', width: 20 },
            { key: 'tanggal_selesai', header: 'Tanggal Selesai', width: 20 },
            { key: 'status', header: 'Status', width: 15 },
            { key: 'biaya_produksi', header: 'Biaya Produksi', width: 15 },
            { key: 'hasil_produksi', header: 'Hasil Produksi', width: 15 },
            { key: 'kualitas', header: 'Kualitas', width: 15 },
            { key: 'catatan', header: 'Catatan', width: 30 },
            { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
            { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
          ]
        }
      ];

      return sheets;
    } catch (error) {
      console.error('Error fetching data for export:', error);
      return [];
    }
  }

  /**
   * Export all application data to Excel
   */
  static async exportAllData(fileName?: string) {
    const sheets = await this.fetchAllData();
    if (sheets.length > 0) {
      await this.exportToExcel(sheets, fileName);
    } else {
      throw new Error('No data available for export');
    }
  }
}
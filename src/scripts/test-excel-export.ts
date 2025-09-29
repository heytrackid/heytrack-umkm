/**
 * Test script for Excel export functionality
 * Run this to test the export feature in development
 */

import { ExcelExportService, ExcelExportData } from '@/services/excel-export.service'

// Sample test data to verify export functionality
const testData: ExcelExportData[] = [
  {
    sheetName: 'Resep',
    data: [
      {
        id: 'R001',
        nama: 'Kue Coklat Premium',
        deskripsi: 'Kue coklat dengan rasa premium menggunakan dark chocolate',
        porsi: 8,
        harga: 150000,
        kategori: 'Kue',
        waktu_persiapan: 30,
        waktu_memasak: 45,
        tingkat_kesulitan: 'Medium',
        instruksi: '1. Siapkan bahan... 2. Campurkan...',
        dibuat: '2024-01-15',
        diperbarui: '2024-01-20'
      },
      {
        id: 'R002',
        nama: 'Croissant Butter',
        deskripsi: 'Croissant klasik dengan mentega berkualitas tinggi',
        porsi: 12,
        harga: 25000,
        kategori: 'Pastry',
        waktu_persiapan: 120,
        waktu_memasak: 20,
        tingkat_kesulitan: 'Hard',
        instruksi: '1. Buat adonan... 2. Lakukan folding...',
        dibuat: '2024-01-10',
        diperbarui: '2024-01-18'
      }
    ],
    columns: [
      { key: 'id', header: 'ID', width: 15 },
      { key: 'nama', header: 'Nama Resep', width: 25 },
      { key: 'deskripsi', header: 'Deskripsi', width: 40 },
      { key: 'porsi', header: 'Porsi', width: 10 },
      { key: 'harga', header: 'Harga', width: 15 },
      { key: 'kategori', header: 'Kategori', width: 15 },
      { key: 'waktu_persiapan', header: 'Waktu Persiapan (menit)', width: 20 },
      { key: 'waktu_memasak', header: 'Waktu Memasak (menit)', width: 20 },
      { key: 'tingkat_kesulitan', header: 'Tingkat Kesulitan', width: 15 },
      { key: 'instruksi', header: 'Instruksi', width: 50 },
      { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
      { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
    ]
  },
  {
    sheetName: 'Bahan Baku',
    data: [
      {
        id: 'I001',
        nama: 'Tepung Terigu Premium',
        kategori: 'Tepung',
        satuan: 'kg',
        harga_per_unit: 15000,
        stok_minimum: 10,
        stok_saat_ini: 25,
        supplier: 'PT. Bogasari',
        deskripsi: 'Tepung terigu protein tinggi untuk kue premium',
        tanggal_kedaluwarsa: '2024-12-31',
        dibuat: '2024-01-01',
        diperbarui: '2024-01-25'
      },
      {
        id: 'I002',
        nama: 'Mentega Unsalted',
        kategori: 'Dairy',
        satuan: 'kg',
        harga_per_unit: 45000,
        stok_minimum: 5,
        stok_saat_ini: 8,
        supplier: 'Anchor',
        deskripsi: 'Mentega unsalted premium untuk pastry',
        tanggal_kedaluwarsa: '2024-06-30',
        dibuat: '2024-01-05',
        diperbarui: '2024-01-25'
      }
    ],
    columns: [
      { key: 'id', header: 'ID', width: 15 },
      { key: 'nama', header: 'Nama Bahan', width: 25 },
      { key: 'kategori', header: 'Kategori', width: 15 },
      { key: 'satuan', header: 'Satuan', width: 10 },
      { key: 'harga_per_unit', header: 'Harga per Unit', width: 15 },
      { key: 'stok_minimum', header: 'Stok Minimum', width: 15 },
      { key: 'stok_saat_ini', header: 'Stok Saat Ini', width: 15 },
      { key: 'supplier', header: 'Supplier', width: 20 },
      { key: 'deskripsi', header: 'Deskripsi', width: 40 },
      { key: 'tanggal_kedaluwarsa', header: 'Tanggal Kedaluwarsa', width: 20 },
      { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
      { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
    ]
  },
  {
    sheetName: 'Pesanan',
    data: [
      {
        id: 'O001',
        nomor_order: 'ORD-2024-001',
        nama_pelanggan: 'Budi Santoso',
        telepon_pelanggan: '08123456789',
        email_pelanggan: 'budi@email.com',
        alamat_pelanggan: 'Jl. Merdeka No. 123, Jakarta',
        tanggal_pengiriman: '2024-01-30',
        waktu_pengiriman: '14:00',
        status: 'CONFIRMED',
        status_pembayaran: 'PAID',
        prioritas: 'NORMAL',
        total_jumlah: 350000,
        catatan: 'Kue untuk ulang tahun, tolong dekorasi spesial',
        dibuat: '2024-01-25',
        diperbarui: '2024-01-28'
      }
    ],
    columns: [
      { key: 'id', header: 'ID', width: 15 },
      { key: 'nomor_order', header: 'Nomor Order', width: 20 },
      { key: 'nama_pelanggan', header: 'Nama Pelanggan', width: 25 },
      { key: 'telepon_pelanggan', header: 'Telepon', width: 15 },
      { key: 'email_pelanggan', header: 'Email', width: 25 },
      { key: 'alamat_pelanggan', header: 'Alamat', width: 40 },
      { key: 'tanggal_pengiriman', header: 'Tanggal Pengiriman', width: 20 },
      { key: 'waktu_pengiriman', header: 'Waktu Pengiriman', width: 15 },
      { key: 'status', header: 'Status Order', width: 15 },
      { key: 'status_pembayaran', header: 'Status Pembayaran', width: 15 },
      { key: 'prioritas', header: 'Prioritas', width: 10 },
      { key: 'total_jumlah', header: 'Total Jumlah', width: 15 },
      { key: 'catatan', header: 'Catatan', width: 40 },
      { key: 'dibuat', header: 'Tanggal Dibuat', width: 20 },
      { key: 'diperbarui', header: 'Tanggal Diperbarui', width: 20 }
    ]
  }
]

// Test function
export async function testExcelExport() {
  console.log('🧪 Testing Excel Export Functionality...')
  
  try {
    await ExcelExportService.exportToExcel(testData, 'HeyTrack-Test-Export.xlsx')
    console.log('✅ Excel export test completed successfully!')
    console.log('📁 File should be downloaded as: HeyTrack-Test-Export.xlsx')
    
  } catch (error) {
    console.error('❌ Excel export test failed:', error)
  }
}

// For browser console testing
if (typeof window !== 'undefined') {
  (window as any).testExcelExport = testExcelExport
}

export default testData
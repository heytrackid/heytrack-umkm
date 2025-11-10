export type VerticalType = 'fnb' | 'beauty' | 'fashion' | 'services' | 'general'

export class VerticalAdapter {
  static getInstructions(vertical: VerticalType): string {
    switch (vertical) {
      case 'fnb':
        return `
- F&B: gunakan bahan baku kuliner umum Indonesia, unit realistis (g, ml, pcs), yield per porsi.
- Sertakan biaya operasional seperti listrik, gas, sewa, gaji, kemasan.
- Resep harus punya komposisi bahan dan kuantitas realistis untuk produksi UMKM.`
      case 'beauty':
        return `
- Beauty/Cosmetics: gunakan struktur produk (BOM) seperti bahan aktif, carrier oil, kemasan.
- Unit umum: g, ml, pcs. Sertakan biaya kemasan dan label.
- Resep = product structure dengan yield (pcs atau ml total batch).
- Pastikan harga bahan sesuai pasar lokal dan jumlah realistis untuk batch kecil.`
      case 'fashion':
        return `
- Fashion: gunakan bahan (kain per meter, benang, kancing, label, kemasan) dan komponen.
- Unit umum: m, pcs (gunakan 'pcs' untuk item dan konversikan kain ke 'm' atau 'pcs' sesuai kebutuhan; jika sulit, gunakan 'pcs').
- Resep = product structure (1 pcs pakaian) dengan komponen dan biaya operasional (jahit, potong, finishing).`
      case 'services':
        return `
- Services: struktur biaya berbasis waktu/tenaga kerja, material pendukung (jika ada), dan overhead.
- Resep = paket layanan (1 paket) dengan komponen: jam kerja (konversikan ke biaya tenaga kerja per paket) dan material pendukung (pcs/ml).
- Sertakan biaya operasional seperti software, transport, sewa, listrik.`
      case 'general':
      default:
        return `
- General: gunakan struktur produk (BOM) generik dengan komponen/material dan biaya operasional umum.
- Unit: g, ml, pcs sesuai kebutuhan, dengan harga realistis IDR.`
    }
  }
}

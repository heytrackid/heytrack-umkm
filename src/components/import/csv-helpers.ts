
/**
 * Parse CSV text to array of objects
 */
export function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split('\n').filter(line => line.trim())
  
  if (lines.length < 2) {
    return []
  }

  // Parse header
  if (lines.length === 0 || !lines[0]) {return []}
  const headers = parseCSVLine(lines[0])

  // Parse rows
  const data: Array<Record<string, string>> = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) {continue}
    const values = parseCSVLine(line)
    
    // Skip if row doesn't have enough columns
    if (values.length > 0) {
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] ?? ''
      })
      data.push(row)
    }
  }
  
  return data
}

/**
 * Parse a single CSV line handling quoted values properly
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote ("")
        current += '"'
        i += 2
        continue
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
        continue
      }
    }
    
    if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
      i++
      continue
    }
    
    // Regular character
    current += char
    i++
  }
  
  // Push last field
  result.push(current.trim())
  
  return result
}

/**
 * Generate CSV template for ingredients
 */
export function generateIngredientsTemplate(): string {
  const headers = [
    'name',
    'unit',
    'price_per_unit',
    'current_stock',
    'min_stock',
    'category',
    'supplier',
    'description'
  ]
  
  const examples = [
    ['Tepung Terigu', 'kg', '12000', '50', '10', 'Bahan Pokok', 'Toko Bahan Kue', 'Tepung terigu protein sedang'],
    ['Gula Pasir', 'kg', '15000', '30', '5', 'Bahan Pokok', 'Toko Sembako', 'Gula pasir putih'],
    ['Telur', 'butir', '2500', '100', '20', 'Protein', 'Pasar Tradisional', 'Telur ayam negeri']
  ]
  
  // Wrap fields with commas or quotes in double quotes
  const escapeCSV = (field: string) => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }
  
  const rows = [
    headers.join(','),
    ...examples.map(row => row.map(escapeCSV).join(','))
  ]
  
  return rows.join('\n')
}

/**
 * Generate CSV template for suppliers
 */
export function generateSuppliersTemplate(): string {
  const headers = [
    'name',
    'contact_person',
    'phone',
    'email',
    'address',
    'company_type',
    'payment_terms',
    'notes'
  ]

  const examples = [
    ['PT. Bahan Kue Indonesia', 'Ahmad Rahman', '+6281234567890', 'ahmad@bahan-kue.com', 'Jl. Industri No. 123, Jakarta', 'PT', '30 hari', 'Supplier bahan baku terpercaya'],
    ['CV. Sembako Makmur', 'Siti Nurhaliza', '+6289876543210', 'siti@sembako-makmur.com', 'Jl. Perdagangan No. 45, Bandung', 'CV', '14 hari', 'Spesialis gula dan tepung'],
    ['Toko Bahan Kue Lokal', 'Budi Santoso', '+6281122334455', 'budi@tokobahan.com', 'Jl. Raya No. 67, Surabaya', 'Toko', 'Cash', 'Supplier lokal dengan harga kompetitif']
  ]

  // Wrap fields with commas or quotes in double quotes
  const escapeCSV = (field: string) => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }

  const rows = [
    headers.join(','),
    ...examples.map(row => row.map(escapeCSV).join(','))
  ]

  return rows.join('\n')
}

/**
 * Generate CSV template for orders
 */
export function generateOrdersTemplate(): string {
  const headers = [
    'order_no',
    'customer_name',
    'customer_phone',
    'customer_email',
    'customer_address',
    'recipe_name',
    'quantity',
    'unit_price',
    'delivery_date',
    'notes',
    'status'
  ]
  
  const examples = [
    ['ORD-001', 'Budi Santoso', '081234567890', 'budi@email.com', 'Jl. Merdeka No. 123, Jakarta', 'Kue Brownies', '10', '50000', '2025-11-01', 'Pesanan untuk acara ulang tahun', 'PENDING'],
    ['ORD-002', 'Siti Aminah', '081298765432', 'siti@email.com', 'Jl. Sudirman No. 45, Bandung', 'Kue Lapis', '5', '75000', '2025-11-02', 'Kemasan premium', 'CONFIRMED'],
    ['ORD-003', 'Ahmad Yani', '081234567899', 'ahmad@email.com', 'Jl. Gatot Subroto No. 88, Surabaya', 'Kue Brownies', '20', '50000', '2025-11-03', 'Untuk kantor', 'PENDING']
  ]
  
  // Wrap fields with commas or quotes in double quotes
  const escapeCSV = (field: string) => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }
  
  const rows = [
    headers.join(','),
    ...examples.map(row => row.map(escapeCSV).join(','))
  ]
  
  return rows.join('\n')
}

/**
 * Parse ingredients from CSV data
 */
export function parseIngredientsCSV(text: string) {
  const data = parseCSV(text)
  
  return data.map(row => ({
    name: (row['name'] ?? row['Name'] ?? row['NAMA']) ?? '',
    unit: (row['unit'] ?? row['Unit'] ?? row['SATUAN']) ?? '',
    price_per_unit: (row['price_per_unit'] ?? row['Price Per Unit'] ?? row['HARGA']) ?? '',
    current_stock: (row['current_stock'] ?? row['Current Stock'] ?? row['STOK']) ?? '0',
    min_stock: (row['min_stock'] ?? row['Min Stock'] ?? row['MIN_STOK']) ?? '0',
    category: (row['category'] ?? row['Category'] ?? row['KATEGORI']) ?? 'General',
    supplier: (row['supplier'] ?? row['Supplier'] ?? row['SUPPLIER']) ?? '',
    description: (row['description'] ?? row['Description'] ?? row['DESKRIPSI']) ?? ''
  }))
}

/**
 * Parse suppliers from CSV data
 */
export function parseSuppliersCSV(text: string) {
  const data = parseCSV(text)

  return data.map(row => ({
    name: (row['name'] ?? row['Name'] ?? row['NAMA']) ?? '',
    contact_person: (row['contact_person'] ?? row['Contact Person'] ?? row['KONTAK']) ?? '',
    phone: (row['phone'] ?? row['Phone'] ?? row['TELEPON']) ?? '',
    email: (row['email'] ?? row['Email'] ?? row['EMAIL']) ?? '',
    address: (row['address'] ?? row['Address'] ?? row['ALAMAT']) ?? '',
    company_type: (row['company_type'] ?? row['Company Type'] ?? row['TIPE_PERUSAHAAN']) ?? '',
    payment_terms: (row['payment_terms'] ?? row['Payment Terms'] ?? row['SYARAT_PEMBAYARAN']) ?? '',
    notes: (row['notes'] ?? row['Notes'] ?? row['CATATAN']) ?? ''
  }))
}

/**
 * Parse orders from CSV data
 */
export function parseOrdersCSV(text: string) {
  const data = parseCSV(text)
  
  return data.map(row => ({
    order_no: (row['order_no'] ?? row['Order No'] ?? row['NO_PESANAN']) ?? '',
    customer_name: (row['customer_name'] ?? row['Customer Name'] ?? row['NAMA_CUSTOMER']) ?? '',
    customer_phone: (row['customer_phone'] ?? row['Customer Phone'] ?? row['TELEPON']) ?? '',
    customer_email: (row['customer_email'] ?? row['Customer Email'] ?? row['EMAIL']) ?? '',
    customer_address: (row['customer_address'] ?? row['Customer Address'] ?? row['ALAMAT']) ?? '',
    recipe_name: (row['recipe_name'] ?? row['Recipe Name'] ?? row['NAMA_RESEP']) ?? '',
    quantity: (row['quantity'] ?? row['Quantity'] ?? row['JUMLAH']) ?? '',
    unit_price: (row['unit_price'] ?? row['Unit Price'] ?? row['HARGA_SATUAN']) ?? '',
    delivery_date: (row['delivery_date'] ?? row['Delivery Date'] ?? row['TANGGAL_KIRIM']) ?? '',
    notes: (row['notes'] ?? row['Notes'] ?? row['CATATAN']) ?? '',
    status: (row['status'] ?? row['Status'] ?? row['STATUS']) ?? 'PENDING'
  }))
}

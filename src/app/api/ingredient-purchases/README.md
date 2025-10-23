# Ingredient Purchases API

API untuk mengelola pembelian bahan baku dengan integrasi ke financial transactions dan stock management.

## Endpoints

### GET /api/ingredient-purchases

List semua pembelian bahan baku dengan filter optional.

**Query Parameters:**
- `bahan_id` (optional) - Filter by ingredient ID
- `start_date` (optional) - Filter by start date (YYYY-MM-DD)
- `end_date` (optional) - Filter by end date (YYYY-MM-DD)
- `supplier` (optional) - Filter by supplier name (partial match)

**Response:**
```json
[
  {
    "id": "uuid",
    "bahan_id": "uuid",
    "supplier": "Toko Bahan",
    "qty_beli": 10,
    "harga_satuan": 50000,
    "total_harga": 500000,
    "tanggal_beli": "2025-01-15",
    "catatan": "Pembelian rutin",
    "user_id": "uuid",
    "created_at": "2025-01-15T10:00:00Z",
    "bahan": {
      "id": "uuid",
      "nama_bahan": "Tepung Terigu",
      "satuan": "kg",
      "stok_tersedia": 50,
      "harga_per_satuan": 50000
    }
  }
]
```

---

### POST /api/ingredient-purchases

Create pembelian baru dan auto-update stock + financial transaction.

**Request Body:**
```json
{
  "bahan_id": "uuid",
  "qty_beli": 10,
  "harga_satuan": 50000,
  "supplier": "Toko Bahan",
  "tanggal_beli": "2025-01-15",
  "catatan": "Pembelian rutin"
}
```

**Required Fields:**
- `bahan_id` - UUID of ingredient
- `qty_beli` - Quantity purchased (number)
- `harga_satuan` - Price per unit (number)

**Optional Fields:**
- `supplier` - Supplier name
- `tanggal_beli` - Purchase date (defaults to today)
- `catatan` - Notes

**What Happens:**
1. Creates financial transaction (expense)
2. Creates purchase record
3. Updates ingredient stock (+qty_beli)
4. Creates stock ledger entry

**Response:**
```json
{
  "id": "uuid",
  "bahan_id": "uuid",
  "supplier": "Toko Bahan",
  "qty_beli": 10,
  "harga_satuan": 50000,
  "total_harga": 500000,
  "tanggal_beli": "2025-01-15",
  "catatan": "Pembelian rutin",
  "user_id": "uuid",
  "created_at": "2025-01-15T10:00:00Z",
  "bahan": {
    "id": "uuid",
    "nama_bahan": "Tepung Terigu",
    "satuan": "kg",
    "stok_tersedia": 60,
    "harga_per_satuan": 50000
  }
}
```

---

### DELETE /api/ingredient-purchases?id={id}

Delete purchase dan revert stock changes.

**Query Parameters:**
- `id` (required) - Purchase ID to delete

**What Happens:**
1. Reverts ingredient stock (-qty_beli)
2. Creates stock ledger entry (reversal)
3. Deletes purchase record

**Response:**
```json
{
  "message": "Purchase deleted successfully"
}
```

---

## Database Schema

### bahan_baku_pembelian Table
```sql
CREATE TABLE bahan_baku_pembelian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  bahan_id UUID REFERENCES bahan_baku(id),
  supplier TEXT,
  qty_beli NUMERIC CHECK (qty_beli > 0),
  harga_satuan NUMERIC CHECK (harga_satuan > 0),
  total_harga NUMERIC,
  tanggal_beli DATE DEFAULT (now() AT TIME ZONE 'asia/jakarta'),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);
```

---

## Usage Examples

### List All Purchases
```bash
curl http://localhost:3000/api/ingredient-purchases
```

### Filter by Ingredient
```bash
curl "http://localhost:3000/api/ingredient-purchases?bahan_id=uuid-here"
```

### Filter by Date Range
```bash
curl "http://localhost:3000/api/ingredient-purchases?start_date=2025-01-01&end_date=2025-01-31"
```

### Create Purchase
```bash
curl -X POST http://localhost:3000/api/ingredient-purchases \
  -H "Content-Type: application/json" \
  -d '{
    "bahan_id": "uuid-here",
    "qty_beli": 10,
    "harga_satuan": 50000,
    "supplier": "Toko Bahan",
    "tanggal_beli": "2025-01-15",
    "catatan": "Pembelian rutin"
  }'
```

### Delete Purchase
```bash
curl -X DELETE "http://localhost:3000/api/ingredient-purchases?id=uuid-here"
```

---

## Features

✅ **Authentication** - All endpoints require valid user session  
✅ **RLS Policies** - Data filtered by user_id  
✅ **Auto Stock Update** - Stock automatically updated on purchase  
✅ **Financial Integration** - Creates expense transaction  
✅ **Stock Ledger** - Tracks all stock movements  
✅ **Rollback Support** - Reverts changes on delete  
✅ **Error Handling** - Comprehensive error messages  

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "error": "Missing required fields: bahan_id, qty_beli, harga_satuan"
}
```

### 404 Not Found
```json
{
  "error": "Ingredient not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create purchase"
}
```

---

## Integration Points

### 1. Financial Transactions
Creates expense record in `financial_transactions`:
- `jenis`: 'pengeluaran'
- `kategori`: 'Pembelian Bahan Baku'
- `nominal`: total_harga
- `tanggal`: tanggal_beli
- `referensi`: Purchase details

### 2. Stock Management
Updates `bahan_baku.stok_tersedia`:
- On CREATE: stock + qty_beli
- On DELETE: stock - qty_beli

### 3. Stock Ledger
Creates entries in `stock_ledger`:
- On CREATE: type 'in' with qty_beli
- On DELETE: type 'out' with qty_beli (reversal)

---

## Notes

- All monetary values in Rupiah (IDR)
- Dates in ISO format (YYYY-MM-DD)
- Stock cannot go negative (Math.max(0, ...))
- Financial transaction is optional (continues if fails)
- Requires valid authentication token
- RLS policies enforce user data isolation

---

**Status:** ✅ Production Ready  
**Last Updated:** October 23, 2025  
**Version:** 2.0 (Rewritten with correct table names)

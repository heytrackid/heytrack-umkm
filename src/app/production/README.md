# Production Tracking Module

Modul untuk mengelola dan melacak batch produksi resep.

## Fitur

### ✅ Sudah Diimplementasikan

1. **Daftar Batch Produksi**
   - Menampilkan semua batch produksi dengan status
   - Filter berdasarkan status (Planned, In Progress, Completed, Cancelled)
   - Pencarian berdasarkan batch number atau nama produk
   - Statistik ringkasan (total batch, status breakdown)

2. **Buat Batch Produksi Baru**
   - Form dialog untuk membuat batch baru
   - Pilih resep dari daftar
   - Tentukan jumlah produksi
   - Atur tanggal rencana produksi
   - Tambahkan catatan (opsional)
   - Auto-generate batch number (format: BATCH-YYYYMM-XXXX)

3. **Status Tracking**
   - PLANNED: Batch yang direncanakan
   - IN_PROGRESS: Sedang dalam proses produksi
   - COMPLETED: Produksi selesai
   - CANCELLED: Batch dibatalkan

## Struktur File

```
src/app/production/
├── components/
│   ├── ProductionPage.tsx          # Main page component
│   └── ProductionFormDialog.tsx    # Form untuk buat batch baru
├── page.tsx                        # Route page
└── README.md                       # Dokumentasi ini
```

## API Endpoints

### GET /api/production-batches
Mengambil daftar batch produksi user

**Response:**
```json
[
  {
    "id": "uuid",
    "recipe_id": "uuid",
    "batch_number": "BATCH-202410-0001",
    "quantity": 100,
    "unit": "pcs",
    "status": "PLANNED",
    "planned_date": "2024-10-28T00:00:00Z",
    "started_at": null,
    "completed_at": null,
    "actual_cost": null,
    "notes": "Batch untuk event",
    "created_at": "2024-10-28T10:00:00Z",
    "recipe": {
      "name": "Kue Lapis"
    }
  }
]
```

### POST /api/production-batches
Membuat batch produksi baru

**Request Body:**
```json
{
  "recipe_id": "uuid",
  "quantity": 100,
  "planned_date": "2024-10-28T00:00:00Z",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "id": "uuid",
  "batch_number": "BATCH-202410-0001",
  ...
}
```

## Database Schema

Tabel: `production_batches`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User owner |
| recipe_id | UUID | Reference ke recipes |
| batch_number | VARCHAR(50) | Nomor batch unik |
| quantity | NUMERIC | Jumlah produksi |
| unit | VARCHAR(50) | Satuan (dari recipe) |
| status | VARCHAR(20) | Status produksi |
| planned_date | TIMESTAMPTZ | Tanggal rencana |
| started_at | TIMESTAMPTZ | Waktu mulai produksi |
| completed_at | TIMESTAMPTZ | Waktu selesai |
| actual_cost | NUMERIC | Biaya aktual |
| notes | TEXT | Catatan |
| created_at | TIMESTAMPTZ | Waktu dibuat |
| updated_at | TIMESTAMPTZ | Waktu update |

## Cara Penggunaan

1. **Membuat Batch Baru:**
   - Klik tombol "Produksi Baru" di header
   - Pilih resep yang akan diproduksi
   - Masukkan jumlah produksi
   - Pilih tanggal rencana produksi
   - Tambahkan catatan jika perlu
   - Klik "Buat Batch"

2. **Melihat Daftar Batch:**
   - Semua batch ditampilkan dalam card grid
   - Gunakan search box untuk mencari batch
   - Filter berdasarkan status menggunakan dropdown

3. **Status Batch:**
   - Badge berwarna menunjukkan status saat ini
   - Tombol aksi muncul sesuai status:
     - PLANNED: Tombol "Mulai Produksi"
     - IN_PROGRESS: Tombol "Selesaikan"
     - COMPLETED/CANCELLED: Hanya tombol "Detail"

## Fitur yang Akan Datang

- [ ] Update status batch (Start, Complete, Cancel)
- [ ] Detail view batch dengan breakdown cost
- [ ] Edit batch yang masih PLANNED
- [ ] Delete batch
- [ ] Export data batch ke Excel
- [ ] Integrasi dengan inventory (auto-deduct ingredients)
- [ ] Kalkulasi actual cost otomatis
- [ ] Production timeline/gantt chart
- [ ] Batch comparison dan analytics

## Notes

- Batch number di-generate otomatis dengan format: `BATCH-YYYYMM-XXXX`
- Setiap user hanya bisa melihat batch miliknya sendiri (RLS enforced)
- Unit produksi diambil dari recipe yang dipilih
- Tombol "Buat Batch Pertama" sudah dihapus untuk menghindari duplikasi dengan tombol "Produksi Baru"

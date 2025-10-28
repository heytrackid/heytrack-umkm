# HPP Module

Modul terpusat untuk semua fitur HPP (Harga Pokok Produksi).

## Struktur

```
src/modules/hpp/
├── components/          # Komponen UI HPP
│   ├── UnifiedHppPage.tsx
│   ├── HppCalculatorSkeleton.tsx
│   ├── HppQuickStats.tsx
│   ├── HppCostTrendsChart.tsx
│   └── RecentSnapshotsTable.tsx
├── services/           # Business logic services
│   ├── HppCalculatorService.ts
│   ├── HppSnapshotService.ts
│   ├── HppAlertService.ts
│   └── HppExportService.ts
├── hooks/              # React hooks
│   ├── useUnifiedHpp.ts
│   ├── useHppOverview.ts
│   ├── useHppWorker.ts
│   ├── useHppCalculatorWorker.ts
│   └── useInfiniteHppAlerts.ts
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   ├── calculations.ts
│   └── index.ts
└── index.ts            # Public exports

## Fitur Utama

### 1. Perhitungan HPP
- Hitung biaya produksi per porsi
- Breakdown biaya: bahan, tenaga kerja, overhead
- WAC (Weighted Average Cost) adjustment
- Simpan history perhitungan

### 2. Snapshot Harian
- Snapshot otomatis setiap hari
- Tracking trend biaya
- Perbandingan historis

### 3. Alert & Notifikasi
- Deteksi kenaikan harga bahan
- Alert margin rendah
- Notifikasi cost spike
- Peringatan bahan tidak tersedia

### 4. Analisis & Laporan
- Perbandingan antar produk
- Trend analysis
- Export ke CSV/Excel/PDF
- Rekomendasi harga jual

## Cara Penggunaan

### Import Module

```typescript
// Import semua dari module
import { 
  UnifiedHppPage,
  HppCalculatorService,
  useUnifiedHpp,
  HppCalculation 
} from '@/modules/hpp'

// Atau import spesifik
import { HppCalculatorService } from '@/modules/hpp/services/HppCalculatorService'
```

### Menggunakan Service

```typescript
import { HppCalculatorService } from '@/modules/hpp'

const calculatorService = new HppCalculatorService()

// Hitung HPP untuk recipe
const result = await calculatorService.calculateRecipeHpp(recipeId)

// Get latest HPP
const latestHpp = await calculatorService.getLatestHpp(recipeId)
```

### Menggunakan Hook

```typescript
import { useUnifiedHpp } from '@/modules/hpp'

function MyComponent() {
  const {
    recipes,
    overview,
    recipe,
    calculateHpp,
    updatePrice
  } = useUnifiedHpp()

  // Use the data and functions
}
```

## API Routes

HPP module menggunakan API routes berikut:

- `POST /api/hpp/calculate` - Hitung HPP
- `GET /api/hpp/overview` - Get overview data
- `GET /api/hpp/snapshots` - Get snapshots
- `GET /api/hpp/alerts` - Get alerts
- `PATCH /api/hpp/alerts/:id/read` - Mark alert as read
- `GET /api/hpp/comparison` - Get comparison data

## Cron Jobs

Module ini memiliki scheduled jobs:

1. **Daily Snapshots** - Setiap hari jam 00:00
2. **Alert Detection** - Setiap 5 menit
3. **Archive Old Data** - Setiap minggu

## Database Tables

- `hpp_calculations` - History perhitungan HPP
- `hpp_snapshots` - Daily snapshots
- `hpp_alerts` - Alert & notifikasi

## Best Practices

1. Selalu gunakan service layer untuk business logic
2. Gunakan hooks untuk data fetching di components
3. Leverage caching dengan React Query
4. Handle errors dengan proper error boundaries
5. Log semua operasi penting dengan logger

## Testing

```bash
# Run tests
pnpm test src/modules/hpp

# Run specific test
pnpm test src/modules/hpp/services/HppCalculatorService.test.ts
```

## Maintenance

- Review alerts threshold setiap bulan
- Monitor performance cron jobs
- Archive old data secara berkala
- Update calculation logic sesuai kebutuhan bisnis

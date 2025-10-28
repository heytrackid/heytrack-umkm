# HPP Module Documentation

## Overview

HPP (Harga Pokok Produksi / Cost of Goods Sold) Module adalah modul terpusat untuk mengelola semua fitur terkait perhitungan biaya produksi di HeyTrack.

## Lokasi

```
src/modules/hpp/
```

## Struktur Lengkap

```
src/modules/hpp/
├── components/                    # UI Components
│   ├── UnifiedHppPage.tsx        # Main HPP page
│   ├── HppCalculatorSkeleton.tsx # Loading skeleton
│   ├── HppQuickStats.tsx         # Quick stats widget
│   ├── HppCostTrendsChart.tsx    # Cost trends chart
│   └── RecentSnapshotsTable.tsx  # Recent snapshots table
│
├── services/                      # Business Logic Services
│   ├── HppCalculatorService.ts   # HPP calculation logic
│   ├── HppSnapshotService.ts     # Daily snapshots management
│   ├── HppAlertService.ts        # Alert detection & management
│   └── HppExportService.ts       # Export to CSV/Excel/PDF
│
├── hooks/                         # React Hooks
│   ├── useUnifiedHpp.ts          # Main HPP hook
│   ├── useHppOverview.ts         # Overview data hook
│   ├── useHppWorker.ts           # Web Worker for heavy calculations
│   ├── useHppCalculatorWorker.ts # Calculator worker hook
│   └── useInfiniteHppAlerts.ts   # Infinite scroll alerts
│
├── types/                         # TypeScript Types
│   └── index.ts                  # All HPP types
│
├── utils/                         # Utility Functions
│   ├── calculations.ts           # Calculation helpers
│   └── index.ts                  # Utils exports
│
├── index.ts                       # Public API exports
└── README.md                      # Module documentation
```

## Fitur Utama

### 1. Perhitungan HPP Otomatis

**Service:** `HppCalculatorService`

Menghitung biaya produksi per porsi dengan breakdown:
- **Material Cost**: Biaya bahan baku (menggunakan WAC)
- **Labor Cost**: Biaya tenaga kerja
- **Overhead Cost**: Biaya operasional (listrik, gas, dll)
- **WAC Adjustment**: Penyesuaian Weighted Average Cost

```typescript
import { HppCalculatorService } from '@/modules/hpp'

const service = new HppCalculatorService()
const result = await service.calculateRecipeHpp(recipeId)

console.log(result.totalHpp) // Total HPP
console.log(result.materialBreakdown) // Detail per bahan
```

### 2. Daily Snapshots

**Service:** `HppSnapshotService`

Membuat snapshot harian untuk tracking trend:
- Snapshot otomatis setiap hari
- Menyimpan HPP, harga jual, margin
- Untuk analisis trend dan perbandingan

```typescript
import { HppSnapshotService } from '@/modules/hpp'

const service = new HppSnapshotService()

// Create snapshot for one recipe
await service.createSnapshot(recipeId)

// Create snapshots for all recipes
const result = await service.createDailySnapshots()
```

### 3. Alert System

**Service:** `HppAlertService`

Deteksi otomatis berbagai kondisi:
- **PRICE_INCREASE**: Kenaikan harga > 10%
- **MARGIN_LOW**: Margin < 20%
- **COST_SPIKE**: Lonjakan biaya > 15%
- **INGREDIENT_UNAVAILABLE**: Bahan tidak tersedia

```typescript
import { HppAlertService } from '@/modules/hpp'

const service = new HppAlertService()

// Detect alerts for one recipe
const alerts = await service.detectAlertsForRecipe(recipeId)

// Detect alerts for all recipes
const result = await service.detectAlertsForAllRecipes()

// Mark alert as read
await service.markAsRead(alertId)
```

### 4. Export & Reporting

**Service:** `HppExportService`

Export data ke berbagai format:
- CSV untuk Excel
- JSON untuk integrasi
- PDF untuk laporan

```typescript
import { HppExportService } from '@/modules/hpp'

const service = new HppExportService()

const result = await service.exportHppData({
  format: 'csv',
  recipeIds: ['recipe-1', 'recipe-2'],
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  },
  metrics: ['hpp', 'margin', 'cost_breakdown']
})
```

## React Hooks

### useUnifiedHpp

Hook utama untuk HPP page:

```typescript
import { useUnifiedHpp } from '@/modules/hpp'

function HppPage() {
  const {
    // Data
    recipes,           // List of recipes
    overview,          // Overview stats
    recipe,            // Selected recipe detail
    comparison,        // Comparison data
    alerts,            // Unread alerts
    
    // Loading states
    isLoading,
    recipeLoading,
    
    // Actions
    selectedRecipeId,
    setSelectedRecipeId,
    calculateHpp,      // Mutation to calculate HPP
    updatePrice,       // Mutation to update price
    markAlertAsRead    // Mutation to mark alert as read
  } = useUnifiedHpp()
  
  return (
    // Your UI
  )
}
```

### useHppOverview

Hook untuk overview data:

```typescript
import { useHppOverview } from '@/modules/hpp'

function Dashboard() {
  const { data, isLoading } = useHppOverview()
  
  return (
    <div>
      <p>Total Recipes: {data?.totalRecipes}</p>
      <p>Average HPP: {data?.averageHpp}</p>
      <p>Unread Alerts: {data?.unreadAlerts}</p>
    </div>
  )
}
```

## API Routes

Module ini menggunakan API routes berikut:

### POST /api/hpp/calculate
Hitung HPP untuk recipe tertentu atau semua recipe

**Request:**
```json
{
  "recipeId": "uuid" // Optional, jika kosong hitung semua
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipeId": "uuid",
    "totalHpp": 25000,
    "materialCost": 20000,
    "laborCost": 3000,
    "overheadCost": 2000
  }
}
```

### GET /api/hpp/overview
Get overview statistics

**Response:**
```json
{
  "totalRecipes": 50,
  "recipesWithHpp": 45,
  "averageHpp": 28000,
  "unreadAlerts": 5
}
```

### GET /api/hpp/snapshots
Get snapshots dengan filter

**Query Params:**
- `recipeId`: Filter by recipe
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `limit`: Limit results

### GET /api/hpp/alerts
Get alerts dengan filter

**Query Params:**
- `is_read`: Filter by read status
- `severity`: Filter by severity
- `limit`: Limit results

### PATCH /api/hpp/alerts/:id/read
Mark alert as read

### GET /api/hpp/comparison
Get comparison data antar recipes

## Cron Jobs

Module ini memiliki 3 scheduled jobs:

### 1. Daily Snapshots
**Schedule:** Setiap hari jam 00:00  
**Function:** `HPPCronJobs.createDailyHPPSnapshots()`  
**Purpose:** Membuat snapshot harian untuk semua recipe aktif

### 2. Alert Detection
**Schedule:** Setiap 5 menit  
**Function:** `HPPCronJobs.detectHPPAlertsForAllUsers()`  
**Purpose:** Deteksi kondisi yang memerlukan alert

### 3. Archive Old Data
**Schedule:** Setiap minggu  
**Function:** `HPPCronJobs.archiveOldHPPSnapshots()`  
**Purpose:** Archive snapshots > 90 hari

## Database Tables

### hpp_calculations
Menyimpan history perhitungan HPP

```sql
CREATE TABLE hpp_calculations (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  calculation_date DATE,
  material_cost DECIMAL,
  labor_cost DECIMAL,
  overhead_cost DECIMAL,
  total_hpp DECIMAL,
  cost_per_unit DECIMAL,
  wac_adjustment DECIMAL,
  production_quantity INTEGER,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### hpp_snapshots
Menyimpan daily snapshots

```sql
CREATE TABLE hpp_snapshots (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  snapshot_date DATE,
  hpp_value DECIMAL,
  material_cost DECIMAL,
  labor_cost DECIMAL,
  overhead_cost DECIMAL,
  selling_price DECIMAL,
  margin_percentage DECIMAL,
  notes TEXT,
  created_at TIMESTAMP
);
```

### hpp_alerts
Menyimpan alerts

```sql
CREATE TABLE hpp_alerts (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  alert_type VARCHAR,
  severity VARCHAR,
  message TEXT,
  current_value DECIMAL,
  previous_value DECIMAL,
  threshold_value DECIMAL,
  is_read BOOLEAN,
  read_at TIMESTAMP,
  created_at TIMESTAMP
);
```

## Utility Functions

### Calculations

```typescript
import { 
  calculateMarginPercentage,
  calculateSuggestedPrice,
  calculateOperationalCost,
  roundToNearestHundred
} from '@/modules/hpp/utils'

// Calculate margin
const margin = calculateMarginPercentage(50000, 30000) // 40%

// Calculate suggested price
const price = calculateSuggestedPrice(30000, 60) // 48000

// Calculate operational cost
const opCost = calculateOperationalCost(20000) // 3000 (15%)

// Round price
const rounded = roundToNearestHundred(48750) // 48800
```

## Best Practices

### 1. Selalu Gunakan Service Layer

❌ **Jangan:**
```typescript
// Direct database access in component
const { data } = await supabase
  .from('hpp_calculations')
  .select('*')
```

✅ **Lakukan:**
```typescript
// Use service
const service = new HppCalculatorService()
const result = await service.calculateRecipeHpp(recipeId)
```

### 2. Gunakan Hooks untuk Data Fetching

❌ **Jangan:**
```typescript
// Manual fetch in component
useEffect(() => {
  fetch('/api/hpp/overview')
    .then(res => res.json())
    .then(setData)
}, [])
```

✅ **Lakukan:**
```typescript
// Use hook with React Query
const { data, isLoading } = useHppOverview()
```

### 3. Handle Errors Properly

```typescript
try {
  const result = await service.calculateRecipeHpp(recipeId)
  toast.success('HPP berhasil dihitung')
} catch (error) {
  logger.error({ error }, 'Failed to calculate HPP')
  toast.error('Gagal menghitung HPP')
}
```

### 4. Use TypeScript Types

```typescript
import type { HppCalculation, HppAlert } from '@/modules/hpp'

function processHpp(calculation: HppCalculation) {
  // Type-safe processing
}
```

## Migration Guide

Jika Anda memiliki kode lama yang menggunakan HPP, update import:

### Before:
```typescript
import { HppCalculatorService } from '@/modules/orders/services/HppCalculatorService'
import { useUnifiedHpp } from '@/hooks/useUnifiedHpp'
import { UnifiedHppPage } from '@/components/hpp/UnifiedHppPage'
```

### After:
```typescript
import { 
  HppCalculatorService,
  useUnifiedHpp,
  UnifiedHppPage 
} from '@/modules/hpp'
```

## Testing

```bash
# Run all HPP tests
pnpm test src/modules/hpp

# Run specific service test
pnpm test src/modules/hpp/services/HppCalculatorService.test.ts

# Run with coverage
pnpm test:coverage src/modules/hpp
```

## Troubleshooting

### HPP tidak terhitung

1. Cek apakah semua bahan memiliki harga
2. Cek apakah recipe memiliki ingredients
3. Lihat logs di console untuk error details

### Alert tidak muncul

1. Pastikan cron job berjalan
2. Cek threshold di `HppAlertService`
3. Pastikan ada snapshot untuk perbandingan

### Performance issues

1. Gunakan Web Worker untuk perhitungan berat
2. Enable caching di React Query
3. Limit jumlah data yang di-fetch

## Support

Untuk pertanyaan atau issue terkait HPP module:
1. Baca dokumentasi ini terlebih dahulu
2. Cek logs di browser console
3. Lihat API response di Network tab
4. Contact tim development

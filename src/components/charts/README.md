# Interactive Charts - shadcn/ui

Komponen chart interaktif yang sudah terintegrasi dengan shadcn/ui dan Recharts.

## Components

### 1. ChartLineInteractive
Line chart dengan toggle untuk switch antara multiple datasets.

### 2. ChartBarInteractive  
Bar chart dengan toggle untuk switch antara multiple datasets.

### 3. ChartAreaInteractive
Area chart dengan dropdown filter untuk time range (7d, 30d, 90d).

## Usage Example

```tsx
import { ChartLineInteractive, ChartBarInteractive, ChartAreaInteractive } from '@/components/charts'
import type { ChartConfig } from '@/components/ui/chart'

// Sample data
const chartData = [
  { date: '2024-01-01', revenue: 5000000, orders: 45 },
  { date: '2024-01-02', revenue: 6200000, orders: 52 },
  { date: '2024-01-03', revenue: 4800000, orders: 38 },
  // ... more data
]

// Chart configuration
const chartConfig = {
  revenue: {
    label: 'Pendapatan',
    color: 'hsl(var(--chart-1))',
  },
  orders: {
    label: 'Pesanan',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

// In your component
export function DashboardCharts() {
  return (
    <div className="grid gap-4">
      <ChartLineInteractive
        data={chartData}
        config={chartConfig}
        title="Tren Penjualan"
        description="Data penjualan 30 hari terakhir"
        defaultChart="revenue"
      />

      <ChartBarInteractive
        data={chartData}
        config={chartConfig}
        title="Perbandingan Harian"
        description="Pendapatan vs Jumlah Pesanan"
      />

      <ChartAreaInteractive
        data={chartData}
        config={chartConfig}
        title="Area Chart"
        description="Visualisasi data dengan filter waktu"
        timeRanges={[
          { value: '90d', label: '3 Bulan Terakhir', days: 90 },
          { value: '30d', label: '30 Hari Terakhir', days: 30 },
          { value: '7d', label: '7 Hari Terakhir', days: 7 },
        ]}
      />
    </div>
  )
}
```

## Props

### ChartLineInteractive & ChartBarInteractive

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<{ date: string; [key: string]: number \| string }>` | Required | Data untuk chart |
| `config` | `ChartConfig` | Required | Konfigurasi chart (colors, labels) |
| `title` | `string` | `'Line/Bar Chart - Interactive'` | Judul chart |
| `description` | `string` | `'Showing data trends'` | Deskripsi chart |
| `defaultChart` | `string` | First key in config | Dataset yang aktif pertama kali |

### ChartAreaInteractive

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<{ date: string; [key: string]: number \| string }>` | Required | Data untuk chart |
| `config` | `ChartConfig` | Required | Konfigurasi chart (colors, labels) |
| `title` | `string` | `'Area Chart - Interactive'` | Judul chart |
| `description` | `string` | `'Showing data trends'` | Deskripsi chart |
| `timeRanges` | `Array<{ value: string; label: string; days: number }>` | 90d, 30d, 7d | Opsi filter waktu |

## Chart Config

```tsx
import type { ChartConfig } from '@/components/ui/chart'

const chartConfig = {
  dataKey1: {
    label: 'Label yang ditampilkan',
    color: 'hsl(var(--chart-1))', // atau hex color
  },
  dataKey2: {
    label: 'Label lainnya',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig
```

## Available Chart Colors

Gunakan CSS variables yang sudah didefinisikan di `globals.css`:

- `hsl(var(--chart-1))` - Primary chart color
- `hsl(var(--chart-2))` - Secondary chart color
- `hsl(var(--chart-3))` - Tertiary chart color
- `hsl(var(--chart-4))` - Quaternary chart color
- `hsl(var(--chart-5))` - Quinary chart color

## Features

✅ Fully responsive (mobile & desktop)
✅ Dark mode support
✅ Interactive tooltips
✅ Smooth animations
✅ Accessible (keyboard navigation)
✅ TypeScript support
✅ Indonesian date formatting
✅ Customizable colors & labels

## Integration with Existing Code

Kamu bisa replace chart yang ada di:
- `src/modules/charts/components/FinancialTrendsChart.tsx`
- `src/modules/charts/components/InventoryTrendsChart.tsx`
- `src/app/dashboard/components/HppDashboardWidget.tsx`

Dengan menggunakan komponen interactive charts ini untuk UX yang lebih baik.

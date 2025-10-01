# Sample Data System

Sample data system untuk development environment. Data sample **HANYA muncul di development**, production tetap menggunakan data real dari database.

## 📋 Fitur

- ✅ Auto-detect development vs production environment
- ✅ Sample data lengkap (Customers, Ingredients, Recipes, Orders, Costs)
- ✅ Banner info development mode
- ✅ Easy-to-use hooks
- ✅ Type-safe

## 🎯 Data yang Tersedia

### 1. **Customers** (5 sample customers)
- Ibu Siti Nurhaliza (pelanggan setia)
- PT. Maju Jaya (corporate client)
- Bapak Andi Wijaya
- Ibu Dewi Lestari
- Cafe Aroma (cafe partner)

### 2. **Ingredients** (8 sample ingredients)
- Tepung Terigu
- Butter Anchor
- Telur Ayam
- Gula Pasir
- Susu Cair
- Cokelat Blok
- Ragi Instan
- Keju Cheddar

### 3. **Recipes** (3 sample recipes)
- Croissant Original (margin 53%)
- Roti Tawar Gandum (margin 48%)
- Cake Cokelat Custom (margin 66%)

### 4. **Orders** (4 sample orders)
- Mix status: delivered, in_production, confirmed
- Total value: Rp 14,775,000

### 5. **Operational Costs** (5 sample costs)
- Listrik, Gaji, Transportasi, Perawatan, Marketing

### 6. **Dashboard Stats**
- Total Sales: Rp 15,420,000
- Total Orders: 148
- Total Customers: 89
- Growth metrics included

## 🚀 Cara Menggunakan

### Method 1: Using Hook (Recommended)

```typescript
import { useSampleOrRealData } from '@/hooks/useSampleOrRealData'

function MyComponent() {
  // Fetch real data from API
  const { data: realCustomers } = useQuery('customers', fetchCustomers)
  
  // Auto use sample in dev, real in prod
  const customers = useSampleOrRealData('customers', realCustomers)
  
  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  )
}
```

### Method 2: Direct Import

```typescript
import { 
  useSampleData,
  sampleCustomers,
  sampleOrders 
} from '@/lib/sample-data'

function MyComponent() {
  const shouldUseSample = useSampleData()
  const data = shouldUseSample ? sampleCustomers : realData
  
  return <div>{/* render data */}</div>
}
```

### Method 3: Helper Function

```typescript
import { getSampleOrRealData } from '@/lib/sample-data'

const customers = getSampleOrRealData(sampleCustomers, realCustomers)
```

## 🎨 Development Banner

Banner otomatis muncul di top page saat development mode aktif:

```tsx
import { DevModeBanner } from '@/components/ui/dev-mode-banner'

export default function MyPage() {
  return (
    <AppLayout>
      <DevModeBanner />
      {/* Your content */}
    </AppLayout>
  )
}
```

## ⚙️ Configuration

### Enable/Disable Sample Data

```bash
# .env.local

# Disable sample data even in development
NEXT_PUBLIC_USE_SAMPLE_DATA=false

# Default: Auto-enabled in development
# (no need to set if you want default behavior)
```

### Environment Detection

```typescript
// Automatically detects NODE_ENV
isDevelopment = process.env.NODE_ENV === 'development'

// Sample data ONLY in development
useSampleData() // returns true only in dev mode
```

## 📊 Check Current Mode

```typescript
import { useIsSampleDataMode } from '@/hooks/useSampleOrRealData'

function MyComponent() {
  const isSampleMode = useIsSampleDataMode()
  
  return (
    <div>
      {isSampleMode && (
        <Badge>Using Sample Data</Badge>
      )}
    </div>
  )
}
```

## 🏗️ Adding New Sample Data

1. Edit `src/lib/sample-data.ts`
2. Add your sample data array:

```typescript
export const sampleMyNewData = [
  {
    id: 'sample-new-1',
    name: 'Sample Item',
    // ... other fields
  }
]
```

3. Export and use:

```typescript
import { sampleMyNewData } from '@/lib/sample-data'
```

## 🔍 Example Usage in Pages

### Dashboard Example

```typescript
// src/app/dashboard/page.tsx
import { useSampleData, sampleDashboardStats } from '@/lib/sample-data'
import { DevModeBanner } from '@/components/ui/dev-mode-banner'

export default function Dashboard() {
  const stats = useSampleData() 
    ? sampleDashboardStats 
    : realStatsFromAPI
  
  return (
    <AppLayout>
      <DevModeBanner />
      <StatsCards stats={stats} />
    </AppLayout>
  )
}
```

### Customers Page Example

```typescript
// src/app/customers/page.tsx
import { useSampleOrRealData } from '@/hooks/useSampleOrRealData'

export default function CustomersPage() {
  const { data } = useCustomers() // Your API hook
  const customers = useSampleOrRealData('customers', data)
  
  return (
    <div>
      <DevModeBanner />
      <CustomersTable data={customers} />
    </div>
  )
}
```

## 🎭 Production Behavior

In production (`NODE_ENV=production`):
- ✅ Sample data **TIDAK akan muncul**
- ✅ Banner development **TIDAK akan muncul**
- ✅ Semua data dari database/API
- ✅ Zero overhead (sample data code tree-shaken)

## 📝 Best Practices

1. **Always use hooks** for automatic environment detection
2. **Add DevModeBanner** to pages using sample data
3. **Keep sample data realistic** (real-world scenarios)
4. **Update sample data** when schema changes
5. **Test both modes** (dev & prod) before deploy

## 🐛 Troubleshooting

### Sample data tidak muncul

```bash
# Check NODE_ENV
echo $NODE_ENV  # Should be 'development'

# Check env variable
echo $NEXT_PUBLIC_USE_SAMPLE_DATA  # Should NOT be 'false'

# Restart dev server
npm run dev
```

### Banner tidak muncul

```typescript
// Check di browser console
console.log(process.env.NODE_ENV)  // Should be 'development'
```

## 🚢 Deployment

Production deployment otomatis menggunakan real data:

```bash
# Build production
npm run build

# Start production server
npm start

# Sample data akan disabled otomatis ✅
```

---

**Created**: 2024-10-01  
**Status**: ✅ Active  
**Environment**: Development Only

# Bakery Management System

Sistem manajemen toko roti modern dengan fitur lengkap untuk mengelola resep, inventori, pesanan, dan keuangan.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Components-000000)

## 🚀 Fitur Utama

### ✅ Sudah Selesai
- **Dashboard Modern** - Overview bisnis dengan KPI dan statistik
- **HPP Calculator** - Perhitungan Harga Pokok Produksi otomatis
- **UI/UX Modern** - Menggunakan shadcn/ui components
- **Database Schema** - PostgreSQL dengan Supabase
- **Responsive Design** - Support mobile dan desktop

### 🚧 Dalam Pengembangan
- **Manajemen Resep** - CRUD resep dengan bahan dan instruksi
- **Manajemen Pesanan** - Tracking status pesanan dari pending hingga delivered
- **Inventori & Stok** - Manajemen bahan baku dengan alert stok menipis
- **Laporan Keuangan** - Cashflow dan profit margin analysis
- **Sistem Produksi** - Planning dan tracking produksi

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account

### Installation

1. **Clone repository**
```bash
git clone [repository-url]
cd bakery-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```
Update dengan Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Setup database**
- Masuk ke Supabase Dashboard
- Buka SQL Editor
- Jalankan script `database.sql`

5. **Run development server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📊 Database Schema

### Tables
- **ingredients** - Bahan baku (tepung, gula, dll)
- **recipes** - Resep produk (brownies, nastar, dll)  
- **recipe_ingredients** - Komposisi bahan dalam resep
- **customers** - Data pelanggan
- **orders** - Data pesanan
- **order_items** - Item dalam pesanan
- **productions** - Data produksi
- **stock_transactions** - Transaksi stok (masuk/keluar)
- **payments** - Data pembayaran
- **financial_records** - Catatan keuangan

## 🧮 HPP Calculator

Sistem perhitungan HPP (Harga Pokok Produksi) yang canggih:

- **Auto Calculate** - Hitung biaya berdasarkan komposisi resep
- **Profit Margin** - Saran harga jual dengan margin keuntungan
- **Batch Production** - Hitung biaya untuk produksi dalam jumlah besar
- **Ingredient Breakdown** - Detail kontribusi biaya setiap bahan

### Contoh Penggunaan
```typescript
import { HPPCalculator } from '@/lib/hpp-calculator'

// Hitung HPP resep
const hppResult = HPPCalculator.calculateRecipeHPP(recipe)

// Tambah profit margin
const withMargin = HPPCalculator.calculateSuggestedPrice(hppResult, 30) // 30% margin

console.log(`Biaya produksi: ${hppResult.costPerUnit}`)
console.log(`Harga jual disarankan: ${withMargin.suggestedPrice}`)
```

## 🎨 UI Components

Menggunakan shadcn/ui untuk komponen yang konsisten dan modern:

- **Cards** - Display informasi dengan style yang clean
- **Tables** - Data grid untuk manajemen data
- **Forms** - Input forms dengan validasi
- **Dialogs** - Modal untuk create/edit
- **Badges** - Status indicators
- **Charts** - Visualisasi data keuangan

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
├── components/          
│   ├── layout/         # Layout components
│   └── ui/             # shadcn/ui components
├── lib/                
│   ├── supabase.ts     # Supabase client
│   ├── hpp-calculator.ts # HPP calculation logic
│   └── utils.ts        # Utility functions
└── styles/             # Global styles
```

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect repository ke Vercel
2. Set environment variables
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Jika ada pertanyaan atau issues:
- Buat issue di GitHub repository
- Email: your-email@example.com

---

**Dibuat dengan ❤️ untuk memudahkan manajemen toko roti**

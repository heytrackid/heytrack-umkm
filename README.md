# HeyTrack - Sistem Manajemen UMKM Kuliner

Aplikasi manajemen bisnis komprehensif untuk UMKM kuliner Indonesia dengan fitur AI Assistant.

## 🚀 Fitur Utama

- **Kelola Pesanan** - Sistem pesanan terintegrasi dengan tracking status
- **Kelola Resep** - Database resep dengan kalkulasi HPP otomatis
- **Hitung HPP** - Kalkulasi Harga Pokok Produksi dengan metode WAC
- **Kelola Bahan Baku** - Inventory management dengan alert otomatis
- **Laporan Keuangan** - Cash flow, profit/loss, dan analitik bisnis
- **AI Assistant** - Chatbot pintar untuk bantuan bisnis

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS 4 + shadcn/ui
- **State**: TanStack Query + Zustand
- **Language**: TypeScript 5.9 (Strict Mode)
- **Package Manager**: pnpm 9.15

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan credentials Supabase Anda

# Run development server
pnpm dev
```

## 🔧 Development

```bash
# Development
pnpm dev              # Start dev server (Turbopack)
pnpm dev:webpack      # Start dev with webpack

# Build
pnpm build            # Production build
pnpm build:analyze    # Build with bundle analysis

# Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
```

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── modules/          # Feature modules
├── lib/              # Utilities & business logic
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── services/         # External services

supabase/
├── migrations/       # Database migrations
└── functions/        # Edge Functions
```

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📚 Documentation

- [Tutorial Fitur Lengkap](docs/TUTORIAL_FITUR_LENGKAP.md)
- [Cara Pakai HPP](docs/CARA_PAKAI_HPP.md)
- [Performance Guide](docs/PERFORMANCE_GUIDE.md)

## 🧪 Testing

```bash
# Run tests
pnpm test

# Type checking
pnpm type-check
```

## 🚀 Deployment

Deploy ke Vercel:

```bash
vercel deploy
```

## 📄 License

Private - All Rights Reserved

## 👥 Support

Untuk bantuan dan support, hubungi tim development.

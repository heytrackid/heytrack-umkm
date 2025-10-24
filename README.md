# HeyTrack - UMKM Kuliner Management System

Platform manajemen bisnis lengkap untuk UMKM kuliner dengan AI Assistant cerdas.

## 🚀 Fitur Utama

- 📊 **HPP Calculator** - Hitung harga pokok produksi secara akurat
- 🤖 **AI Assistant** - Konsultasi bisnis dengan AI cerdas
- 📦 **Inventory Management** - Kontrol stok bahan baku real-time
- 👨‍🍳 **Recipe Management** - Optimasi resep dan profitabilitas
- 💰 **Financial Analytics** - Analisis keuangan dan cash flow
- 📋 **Order Management** - Sistem pesanan lengkap

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **AI**: OpenRouter (Claude-3)

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup Husky hooks (important!)
npm run prepare

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Development Workflow

### Pre-commit Hooks (Husky)

HeyTrack menggunakan **Husky** untuk menjaga kualitas kode:

#### Pre-commit Checks:
```bash
🔍 Running pre-commit checks...
📝 Running TypeScript type check...
🧹 Running ESLint...
📊 Checking bundle size... (jika tersedia)
✅ All pre-commit checks passed!
```

#### Pre-push Checks:
```bash
🚀 Running pre-push checks...
🔨 Running production build check...
📊 Running bundle size analysis...
✅ Pre-push checks completed!
```

### Available Scripts:

```bash
# Development
npm run dev              # Start dev server (webpack)
npm run dev:webpack      # Start dev server (webpack)

# Quality Checks
npm run type-check       # TypeScript type checking
npm run lint            # ESLint code linting
npm run lint:fix        # Auto-fix ESLint issues

# Bundle Analysis
npm run build:analyze    # Visual bundle analyzer
npm run build:monitor    # Bundle size monitoring

# Production
npm run build           # Production build
npm run start           # Start production server
```

### Bundle Size Monitoring:

HeyTrack memantau ukuran bundle secara otomatis:

```bash
# Check current bundle size
npm run build:monitor

# Visual bundle analysis
npm run build:analyze
```

**Budget**: 500KB total, 300KB vendor, 200KB app code

### Code Splitting:

✅ **Route-based splitting**: 5 halaman utama dioptimalkan
✅ **Component-level splitting**: Komponen berat diload lazy
✅ **Utility splitting**: Function utilities dimodularisasi

**Total bundle reduction**: 315-425KB (25-35% dari ukuran app)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   └── ai-chatbot/        # AI Chatbot interface
├── components/            # Reusable UI components
├── lib/                   # Utilities & business logic
│   ├── nlp-processor.ts   # AI NLP engine
│   ├── external-ai-service.ts # AI API integration
│   └── supabase.ts        # Database client
└── middleware.ts          # Route protection
```

## 🔐 Authentication

HeyTrack menggunakan Supabase Auth untuk authentication yang aman:
- Email/password authentication
- Google OAuth integration
- Session management
- Route protection

## 🤖 AI Chatbot

AI Assistant cerdas dengan kemampuan:
- Natural Language Processing
- Business intelligence insights
- Strategic recommendations
- Real-time data analysis
- Contextual conversations

## 📊 Business Intelligence

- Real-time dashboard
- Profit margin analysis
- Inventory optimization
- Customer insights
- Sales forecasting

## 🌐 Deployment

Project ini siap untuk deployment ke:
- Vercel
- Netlify
- Railway
- VPS (manual deployment)

## 📝 License

MIT License - feel free to use for your UMKM business!

## 🤝 Contributing

Contributions welcome! Please create issues and pull requests.

---

**HeyTrack** - Membantu UMKM kuliner sukses dengan teknologi modern. 🍜🍣🍛

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

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

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

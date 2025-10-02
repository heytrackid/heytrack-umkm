<div align="center">
<img width="1200" height="475" alt="Generator Resep AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Generator Resep AI untuk UMKM

Aplikasi web modern untuk membantu UMKM F&B di Indonesia membuat resep kreatif, strategi pemasaran, dan menghitung HPP menggunakan AI.

## ✨ Fitur Utama

- 🤖 **Generator Resep AI** - Buat resep unik berdasarkan kategori makanan
- 📊 **Kalkulator HPP** - Hitung harga pokok produksi dan saran harga jual
- 🎯 **Strategi Pemasaran** - Dapatkan strategi marketing yang dipersonalisasi
- 📱 **Mobile-First Design** - Responsif di semua perangkat
- 🔒 **Keamanan Enhanced** - Input validation, rate limiting, dan CSP

## 🛡️ Keamanan & Perlindungan

Aplikasi ini dilengkapi dengan lapisan keamanan komprehensif:

### Input Validation & Sanitization
- ✅ Validasi input kategori resep (max 100 karakter)
- ✅ Sanitasi input bisnis untuk strategi pemasaran (max 2000 karakter)
- ✅ Validasi format harga untuk kalkulasi HPP
- ✅ Pencegahan XSS dan prompt injection

### Rate Limiting
- ⏱️ 5 permintaan per menit untuk generator resep
- ⏱️ 3 permintaan per menit untuk strategi pemasaran dan HPP
- 🔄 Auto cleanup setiap 5 menit

### Error Handling
- 🚫 Tidak expose informasi sensitif ke user
- 📝 Error message yang user-friendly
- 🛡️ Graceful error recovery

### Content Security Policy
- 🔐 CSP header untuk mencegah XSS
- 🚷 Frame ancestors protection
- ✅ Strict referrer policy

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js (versi 16 atau lebih baru)
- npm atau yarn

### Langkah Instalasi

1. **Clone repository:**
   ```bash
   git clone https://github.com/heytrackid/resep-umkm.git
   cd resep-umkm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**

   Salin file `.env.local` dan isi API key:
   ```bash
   cp .env.local .env.local.backup  # backup file asli
   ```

   Edit `.env.local`:
   ```env
   # OpenRouter API Key - Dapatkan di https://openrouter.ai/
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Buka browser:**
   ```
   http://localhost:5173
   ```

## 🔑 Mendapatkan API Key

1. Daftar di [OpenRouter.ai](https://openrouter.ai/)
2. Generate API key dari dashboard
3. Pastikan memiliki credit yang cukup
4. Jaga kerahasiaan API key - jangan commit ke Git

## 📁 Struktur Proyek

```
├── lib/
│   └── security.ts          # Security utilities
├── services/
│   └── openrouterService.ts # AI API integration
├── components/              # React components
├── types.ts                 # TypeScript definitions
├── constants.ts             # App constants
└── index.html              # HTML template with CSP
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Security Testing

Untuk test security features:

```bash
# Test input validation
npm run test:security

# Check CSP headers
curl -I http://localhost:5173
```

## 🚢 Deployment

### Production Checklist
- [ ] API key sudah dikonfigurasi
- [ ] Environment variables sudah di-set
- [ ] CSP headers aktif
- [ ] HTTPS enabled
- [ ] Rate limiting aktif

### Recommended Deployment
- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Docker**

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## ⚠️ Disclaimer

- Informasi nutrisi bersifat perkiraan AI
- Selalu konsultasikan dengan ahli gizi untuk informasi akurat
- HPP calculation untuk referensi saja
- Gunakan API key dengan bijak untuk menghindari overuse

## 📞 Support

- 📧 Email: support@heytrack.id
- 🐛 Issues: [GitHub Issues](https://github.com/heytrackid/resep-umkm/issues)
- 📖 Docs: [Dokumentasi Lengkap](https://docs.heytrack.id)

---

**Dibuat dengan ❤️ untuk UMKM Indonesia**

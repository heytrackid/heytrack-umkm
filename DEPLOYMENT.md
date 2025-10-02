# 🚀 Deployment Guide - Bakery Management System

## 📱 Aplikasi Telah Di-Deploy!

### 🌍 URLs Aplikasi:
- **Production**: https://heytrack-umkm-5a5lrfaj6-monifine-bakerys-projects.vercel.app
- **Preview**: https://heytrack-umkm-i4ct6gbdx-monifine-bakerys-projects.vercel.app

---

## ✨ Perubahan Terbaru

### 🍞 **Halaman Produksi - Disederhanakan untuk UMKM**

**❌ Fitur Kompleks yang Dihapus:**
- Production Analytics
- Quality Control System
- Resource Manager
- Batch Planner
- Integration Dashboard
- Tab-based complex interface

**✅ Fitur Sederhana yang Tersisa:**
- **Breadcrumb Navigation** - Ganti dari dialog ke navigasi breadcrumb
- **Simple Recipe Management** - Buat dan kelola resep produk
- **Easy Ingredient Selection** - Pilih bahan dari dropdown
- **Automatic HPP Calculation** - HPP dihitung otomatis
- **Visual Recipe Cards** - Tampilan card yang mudah dipahami
- **Helpful Guide Tips** - Panduan cara penggunaan
- **Category Organization** - Kategori produk yang relevan untuk toko roti

### 🔄 **Urutan Menu di Sidebar**
**STEP 1: DATA MASTER** sekarang:
1. 🏪 **Bahan Baku** - Input harga & stok bahan
2. 💰 **Biaya Operasional** - Listrik, gas, gaji, dll *(dipindah ke posisi 2)*
3. 👨‍🍳 **Resep Produk** - Komposisi & takaran *(dipindah ke posisi 3)*

### 🎯 **Breadcrumb Navigation**
- Ganti dialog modal dengan breadcrumb navigation
- Navigasi: Dashboard > Resep Produk > (Tambah Resep / Edit Resep)
- Tombol back dan navigasi yang intuitif
- Form yang lebih spacious dan user-friendly

---

## 🛠️ Deployment menggunakan Vercel CLI

### Prerequisites
```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login
```

### Setup Environment Variables
```bash
# Jalankan script setup environment
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
```

### Deploy
```bash
# Deploy ke preview
vercel

# Deploy ke production
vercel --prod
```

### Environment Variables yang Disetup:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `AI_MODEL`

---

## 📱 User Experience untuk UMKM

### **Lebih User-Friendly:**
- 💡 **Tips Box** - Panduan langkah demi langkah
- 🎯 **Clear Call-to-Actions** - Button yang jelas fungsinya
- 📱 **Mobile Responsive** - Nyaman dipakai di HP
- 🏪 **Bakery-Specific Categories** - Roti, Kue Basah, Kue Kering, dll
- ⚠️ **Smart Validation** - Peringatan jika belum ada bahan baku
- 🧮 **Direct HPP Link** - Langsung ke kalkulator HPP

### **Interface yang Sederhana:**
- Satu halaman fokus untuk manajemen resep
- Form tambah resep yang straightforward dengan breadcrumb
- Tidak ada tab rumit atau fitur advanced
- Visual feedback yang jelas (HPP estimasi, jumlah bahan)

### **Workflow yang Logis:**
1. User input bahan baku di **Inventory** 
2. User setup biaya operasional di **Finance**
3. User buat resep di **Production** (sekarang sederhana)
4. System hitung HPP otomatis di **HPP Calculator**

---

## 🔧 Konfigurasi Proyek

### **Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev", 
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "AI_MODEL": "x-ai/grok-4-fast:free",
    "AI_TEMPERATURE": "0.2",
    "AI_MAX_TOKENS": "1500"
  },
  "functions": {
    "src/app/api/**/*": {
      "maxDuration": 30
    }
  }
}
```

### **Tech Stack:**
- **Frontend**: Next.js 15.5.4 (App Router)
- **Backend**: Supabase (PostgreSQL)
- **UI**: Shadcn/ui + Tailwind CSS
- **Deployment**: Vercel
- **Package Manager**: pnpm

---

## 🎯 Hasil Akhir

Halaman produksi sekarang **jauh lebih mudah dipahami** oleh pemilik UMKM yang tidak memiliki background teknis, **fokus pada yang penting saja** yaitu membuat resep untuk menghitung HPP dengan akurat!

**Navigation flow yang intuitif** dengan breadcrumb membuat user tidak bingung dan bisa dengan mudah kembali ke halaman sebelumnya.

✅ **Aplikasi berhasil di-deploy dan siap digunakan!**
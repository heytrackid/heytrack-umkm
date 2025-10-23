# 🚀 AI Recipe Generator - Quick Start Guide

Halo! Ini panduan super cepat buat mulai pakai AI Recipe Generator. Gak ribet, langsung to the point!

---

## ⚡ Setup dalam 5 Menit

### Step 1: Get API Key (2 menit)

Pilih salah satu:

**Option A: OpenAI (Recommended)**
1. Buka https://platform.openai.com/api-keys
2. Login atau sign up
3. Klik "Create new secret key"
4. Copy key yang muncul (mulai dengan `sk-...`)
5. Simpan baik-baik!

**Option B: Anthropic Claude**
1. Buka https://console.anthropic.com/
2. Login atau sign up
3. Klik "Get API Keys"
4. Copy key yang muncul (mulai dengan `sk-ant-...`)
5. Simpan baik-baik!

### Step 2: Add ke Environment (1 menit)

1. Buka file `.env.local` di root project
2. Tambahkan baris ini:

```bash
# Kalau pakai OpenAI:
OPENAI_API_KEY=sk-your-key-here

# Atau kalau pakai Anthropic:
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

3. Save file
4. Restart development server (`npm run dev`)

### Step 3: Test! (2 menit)

1. Buka browser: http://localhost:3000/recipes/ai-generator
2. Isi form:
   - Nama: "Roti Tawar"
   - Jenis: Roti
   - Servings: 2
3. Klik "Generate Resep dengan AI"
4. Tunggu 15-20 detik
5. Boom! Resep muncul! 🎉

---

## 💡 Tips Cepat

### Biar Hasil Bagus:

1. **Isi Inventory Dulu**
   - Minimal 10-15 bahan basic
   - Tepung, telur, gula, mentega, susu, dll
   - Harga harus akurat

2. **Nama Produk yang Jelas**
   - ✅ "Roti Tawar Premium"
   - ❌ "Roti"

3. **Set Target Harga**
   - AI akan optimize untuk margin sehat
   - Contoh: Rp 85.000 untuk roti tawar

4. **Pilih Dietary Restrictions**
   - Halal (default untuk Indonesia)
   - Vegan, Gluten-Free, dll kalau perlu

---

## 🎯 Contoh Cepat

### Roti Tawar Basic

```
Input:
- Nama: Roti Tawar Klasik
- Jenis: Roti
- Servings: 2
- Target: Rp 85.000
- Dietary: Halal

Output:
✅ Resep lengkap dengan 8-10 bahan
✅ 10-12 step instruksi detail
✅ HPP: ~Rp 35.000
✅ Rekomendasi jual: Rp 87.500
✅ Margin: 60%
```

### Brownies Premium

```
Input:
- Nama: Brownies Coklat Premium
- Jenis: Cake
- Servings: 12
- Target: Rp 75.000
- Bahan: coklat premium, kacang almond
- Dietary: Halal

Output:
✅ Resep dengan coklat premium
✅ Include kacang almond
✅ HPP: ~Rp 32.000
✅ Rekomendasi jual: Rp 80.000
✅ Margin: 60%
```

---

## 🚨 Troubleshooting Cepat

### "AI API key not configured"
**Fix:** Cek `.env.local`, pastikan API key udah diisi dan server udah direstart

### "Ingredient not found in inventory"
**Fix:** Tambah bahan yang diminta AI ke inventory dulu

### "Failed to generate recipe"
**Fix:** 
1. Cek internet connection
2. Cek API key masih valid
3. Cek quota API belum habis

### Resep gak masuk akal
**Fix:**
1. Pastikan inventory lengkap
2. Set target harga yang realistic
3. Generate lagi (AI kadang perlu retry)

---

## 💰 Biaya API

### OpenAI GPT-4:
- ~$0.03 per recipe generation
- 100 recipes = $3
- Affordable untuk UMKM!

### Anthropic Claude:
- ~$0.02 per recipe generation
- 100 recipes = $2
- Sedikit lebih murah

**Pro Tip:** Start dengan $5 credit, cukup untuk 150-200 recipes!

---

## 🎓 Next Steps

Setelah berhasil generate resep pertama:

1. ✅ Save resep ke database
2. ✅ Test resep di production
3. ✅ Adjust kalau perlu
4. ✅ Generate variasi lain
5. ✅ Share dengan team

---

## 📞 Butuh Bantuan?

- 📧 Email: support@heytrack.id
- 💬 WhatsApp: +62-xxx-xxxx-xxxx
- 📚 Full Docs: `/docs/AI_RECIPE_GENERATOR.md`

---

**Selamat mencoba! Semoga AI-nya bikin resep yang enak! 🎂🤖**

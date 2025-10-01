# 🎯 Simple Priorities untuk UMKM FnB (Bakery)

## ✅ PRIORITAS TERTINGGI (Must Have - Minggu Ini)

### 1. **Expense Tracking** 💰
**Kenapa Penting:**
- UMKM sering kelupaan catat biaya operasional
- Susah tau profit asli kalau expense ga tercatat
- Biaya listrik, gas, gaji, sewa harus teratur dicatat

**Yang Dibutuhkan:**
```
✅ Catat biaya harian (listrik, gas, transport)
✅ Catat biaya bulanan (sewa, gaji, internet)
✅ Lihat total biaya per bulan
✅ Bandingkan biaya bulan ini vs bulan lalu
```

**Implementation:**
- Simple form untuk input expense
- Dashboard lihat total expense bulan ini
- Alert kalau expense melebihi budget

---

### 2. **Daily Sales Summary** 📊
**Kenapa Penting:**
- Owner perlu tau untung/rugi per hari
- Mana produk yang laku, mana yang engga
- Kapan hari/jam ramai customer

**Yang Dibutuhkan:**
```
✅ Total penjualan hari ini
✅ Total biaya hari ini
✅ Profit hari ini (penjualan - biaya)
✅ Produk terlaris hari ini
✅ Jam ramai (peak hours)
```

**Implementation:**
- Dashboard daily summary
- Grafik simple penjualan per hari
- Top 5 produk terlaris

---

### 3. **Payment Tracking** 💳
**Kenapa Penting:**
- Banyak customer bayar cicil/DP
- Suka lupa siapa yang belum bayar lunas
- Perlu rekonsiliasi uang cash vs digital

**Yang Dibutuhkan:**
```
✅ Catat payment method (cash/transfer/QRIS)
✅ Track payment status (lunas/belum)
✅ Alert customer yang belum bayar
✅ Rekap uang masuk per hari
```

**Implementation:**
- Add payment status ke order
- Simple payment history
- Filter order by payment status

---

## 🎨 NICE TO HAVE (Bulan Depan)

### 4. **Customer Favorites** 👥
**Kenapa Penting:**
- Repeat customer = bisnis stabil
- Bisa kasih promo ke customer setia
- Tau customer prefer produk apa

**Yang Dibutuhkan:**
```
- Top 10 customer setia
- Produk favorit per customer
- Frekuensi belanja customer
- Customer yang lama ga order (churn alert)
```

---

### 5. **Stock Alerts WhatsApp** 📱
**Kenapa Penting:**
- Bahan habis tengah malam = disaster pagi hari
- Owner perlu notif real-time
- WhatsApp = channel paling sering dibuka

**Yang Dibutuhkan:**
```
- WhatsApp alert kalau stok habis/rendah
- WhatsApp reminder untuk restock
- WhatsApp order confirmation
```

---

## ❌ SKIP DULU (Too Complex untuk UMKM)

❌ Customer Analytics (CLV, churn prediction) - Too advanced  
❌ Advanced Forecasting - UMKM biasa manual aja  
❌ Supplier Performance - Biasa supplier tetap 1-2 aja  
❌ Multi-format Reports - Excel export udah cukup  

---

## 📋 IMPLEMENTATION PLAN SIMPLE

### Week 1: Expense Tracking ✅
```typescript
// Simple expense page
- Form: tanggal, kategori, jumlah, keterangan
- Table: list expense bulan ini
- Card: total expense bulan ini vs bulan lalu
- Chart: expense per kategori (pie chart)
```

**Files:**
```
src/app/operational-costs/page.tsx  ✅ (sudah ada, enhance)
src/services/expense/ExpenseService.ts  ❌ (buat baru)
src/app/api/expenses/summary/route.ts  ❌ (buat baru)
```

---

### Week 2: Daily Summary & Payment ✅
```typescript
// Daily sales summary
- Card: penjualan hari ini
- Card: biaya hari ini
- Card: profit hari ini
- Chart: trend 7 hari terakhir
- Table: top 5 produk

// Payment tracking
- Add payment_status filter di orders
- Payment history modal
- Alert unpaid orders
```

**Files:**
```
src/app/dashboard/page.tsx  ✅ (enhance daily summary)
src/services/payment/PaymentService.ts  ❌ (buat baru)
src/components/dashboard/DailySummaryCard.tsx  ❌ (buat baru)
```

---

### Week 3-4: Customer Favorites (Optional)
```typescript
// Customer insights
- Top 10 loyal customers
- Customer purchase history
- Favorite products per customer
```

---

## 🎯 QUICK WINS (Bisa Sekarang Juga!)

### 1. Enhance Dashboard (30 menit)
```typescript
// Add cards:
- Profit Hari Ini = Penjualan - (HPP + Biaya Operasional)
- Produk Terlaris Hari Ini
- Customer Repeat Hari Ini
```

### 2. Add Payment Status Filter (15 menit)
```typescript
// Di orders page, add filter:
- Semua
- Lunas
- DP/Sebagian
- Belum Bayar
```

### 3. Expense Quick Entry (20 menit)
```typescript
// Add floating button di dashboard:
- Quick add expense
- Modal simple: kategori, jumlah, selesai
```

---

## 💡 REKOMENDASI PRIORITAS

**Minggu Ini - Implement:**
1. ✅ ExpenseService (2-3 jam)
2. ✅ Daily Summary Enhancement (1-2 jam)
3. ✅ Payment Status Filter (30 menit)

**Total Time:** ~1 hari kerja

**Impact:**
- Owner langsung bisa track biaya harian
- Langsung tau profit bersih per hari
- Langsung tau customer mana yang belum bayar

---

## 📊 SUCCESS METRICS

Setelah implement ini, owner bisa:
1. ✅ Cek profit bersih dalam 5 detik
2. ✅ Tau biaya operasional bulan ini vs target
3. ✅ Identifikasi customer yang belum bayar
4. ✅ Lihat produk mana yang paling laku
5. ✅ Ambil keputusan bisnis berdasarkan data

---

**Philosophy:** 
> "Better 3 features yang DIPAKAI daripada 10 features yang KOMPLEKS tapi ga kepake"

**Focus:**
- Simple input (mobile-friendly)
- Clear output (cards + simple charts)
- Actionable insights (bisa langsung action)


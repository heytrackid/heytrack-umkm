# 📱 Panduan WhatsApp Templates

## Overview

Fitur WhatsApp Templates membantu kamu mengirim pesan ke pelanggan dengan cepat dan konsisten. Template sudah dilengkapi dengan variabel dinamis yang otomatis terisi dengan data pesanan.

---

## 🎉 Template Bawaan (Default Templates)

Kami sudah menyiapkan 8 template siap pakai yang friendly dan profesional:

### 1. **Konfirmasi Pesanan** (Default)
**Kategori:** `order_confirmation`  
**Digunakan untuk:** Mengkonfirmasi pesanan yang baru masuk

**Contoh:**
```
Halo Budi! 👋

Terima kasih sudah pesan di Warung Makan Enak! ✨

📋 *Detail Pesanan*
No. Pesanan: ORD-001
Total: Rp 150.000
Tanggal: 30 Oktober 2025

- Nasi Goreng Spesial x2
- Es Teh Manis x2

✅ Pesanan kamu sudah kami terima dan sedang kami proses.

Kalau ada pertanyaan, langsung chat aja ya! 😊
```

### 2. **Pesanan Siap**
**Kategori:** `order_ready`  
**Digunakan untuk:** Memberitahu pesanan sudah siap diambil/diantar

**Contoh:**
```
Halo Budi! 🎉

Kabar baik nih! Pesanan kamu sudah siap lho! 🥳

📦 *Pesanan #ORD-001*
- Nasi Goreng Spesial x2
- Es Teh Manis x2

📍 Bisa diambil di: Jl. Merdeka No. 123
⏰ Jam operasional: 08:00 - 20:00

Ditunggu ya! Kalau mau diantar juga bisa kok 🚗

Sampai jumpa! 😊
```

### 3. **Reminder Pembayaran**
**Kategori:** `payment_reminder`  
**Digunakan untuk:** Mengingatkan pembayaran yang belum lunas

**Contoh:**
```
Halo Budi! 👋

Ini reminder friendly aja ya 😊

💳 *Info Pembayaran*
No. Pesanan: ORD-001
Total: Rp 150.000
Jatuh tempo: 31 Oktober 2025

📱 Transfer ke:
BCA 1234567890 a.n. Warung Makan Enak

Setelah transfer, tolong kirim buktinya ya! Nanti langsung kami proses 🚀

Terima kasih! 🙏
```

### 4. **Terima Kasih**
**Kategori:** `thank_you`  
**Digunakan untuk:** Ucapan terima kasih setelah transaksi selesai

**Contoh:**
```
Halo Budi! 💙

Terima kasih banyak ya sudah order di Warung Makan Enak! 🙏

Semoga suka sama produknya! Kalau ada feedback atau mau order lagi, langsung chat aja ya 😊

⭐ Puas dengan pelayanan kami? Boleh dong kasih review atau rekomendasiin ke teman-teman! 🤗

Sampai jumpa lagi! ✨
```

### 5. **Tanya Custom Order**
**Kategori:** `inquiry`  
**Digunakan untuk:** Merespon pertanyaan tentang custom order

**Contoh:**
```
Halo Budi! 👋

Terima kasih sudah tertarik dengan produk kami! 😊

✨ Untuk custom order, kami bisa bantu kok!

Bisa kasih tau detail yang kamu mau:
• Jenis produk
• Jumlah/porsi
• Tanggal dibutuhkan
• Budget (kalau ada)
• Request khusus lainnya

Nanti kami buatkan penawaran terbaik ya! 💪

Ditunggu infonya! 🙏
```

### 6. **Update Pengiriman**
**Kategori:** `delivery_update`  
**Digunakan untuk:** Update status pengiriman pesanan

**Contoh:**
```
Halo Budi! 🚗

Pesanan kamu sedang dalam perjalanan nih! 📦

*Pesanan #ORD-001*
- Nasi Goreng Spesial x2
- Es Teh Manis x2

🚚 Driver: Pak Joko
📱 Kontak: 0812-3456-7890
⏰ Estimasi tiba: 15 menit lagi

Kalau ada kendala, langsung hubungi driver atau chat kami ya!

Terima kasih sudah sabar menunggu! 😊
```

### 7. **Pengumuman Promo**
**Kategori:** `promotion`  
**Digunakan untuk:** Mengumumkan promo atau diskon

**Contoh:**
```
Halo Budi! 🎉

Ada kabar gembira nih! 🎊

🔥 *Promo Akhir Bulan*
Diskon 20% untuk semua menu!

💰 Diskon: 20%
⏰ Periode: 28-31 Oktober 2025
📝 Syarat & Ketentuan: Min. pembelian Rp 100.000

Jangan sampai kelewatan ya! Buruan order sekarang! 🚀

Order langsung chat aja atau klik link ini:
wa.me/628123456789

Sampai jumpa! 😊
```

### 8. **Pesanan Dibatalkan**
**Kategori:** `order_cancelled`  
**Digunakan untuk:** Konfirmasi pembatalan pesanan

**Contoh:**
```
Halo Budi! 👋

Pesanan kamu sudah kami batalkan sesuai permintaan.

📋 *Detail Pembatalan*
No. Pesanan: ORD-001
Alasan: Berubah pikiran
Tanggal: 30 Oktober 2025

💰 Untuk pembayaran yang sudah masuk, akan kami refund dalam 1-3 hari kerja.

Kalau ada pertanyaan atau mau order lagi, langsung chat aja ya! 😊

Terima kasih atas pengertiannya! 🙏
```

---

## 🚀 Cara Menggunakan

### 1. Generate Template Default

Jika kamu baru pertama kali menggunakan fitur ini:

1. Buka menu **Pesanan** → **WhatsApp Templates**
2. Klik tombol **"Buat Template Default"**
3. Tunggu beberapa detik, 8 template akan otomatis dibuat
4. Edit template sesuai kebutuhan bisnis kamu

### 2. Membuat Template Baru

1. Klik tombol **"Tambah Template"**
2. Isi form:
   - **Nama Template**: Nama untuk identifikasi (contoh: "Konfirmasi Pesanan VIP")
   - **Kategori**: Pilih kategori yang sesuai
   - **Deskripsi**: Penjelasan singkat tentang template
   - **Konten Template**: Tulis pesan dengan variabel dinamis
3. Klik **"Simpan"**

### 3. Menggunakan Variabel

Variabel adalah placeholder yang otomatis diganti dengan data real. Format: `{nama_variabel}`

**Variabel yang tersedia:**

| Variabel | Deskripsi | Contoh |
|----------|-----------|--------|
| `{customer_name}` | Nama pelanggan | Budi Santoso |
| `{business_name}` | Nama bisnis kamu | Warung Makan Enak |
| `{order_no}` | Nomor pesanan | ORD-001 |
| `{total_amount}` | Total pembayaran | Rp 150.000 |
| `{order_date}` | Tanggal pesanan | 30 Oktober 2025 |
| `{items_list}` | Daftar item pesanan | - Nasi Goreng x2<br>- Es Teh x2 |
| `{pickup_location}` | Alamat pickup | Jl. Merdeka No. 123 |
| `{business_hours}` | Jam operasional | 08:00 - 20:00 |
| `{due_date}` | Tanggal jatuh tempo | 31 Oktober 2025 |
| `{payment_details}` | Detail pembayaran | BCA 1234567890 |
| `{driver_name}` | Nama driver | Pak Joko |
| `{driver_phone}` | No HP driver | 0812-3456-7890 |
| `{estimated_time}` | Estimasi waktu | 15 menit |
| `{promo_title}` | Judul promo | Promo Akhir Bulan |
| `{promo_description}` | Deskripsi promo | Diskon 20% semua menu |
| `{discount_amount}` | Jumlah diskon | 20% |
| `{promo_period}` | Periode promo | 28-31 Oktober |
| `{terms}` | Syarat & ketentuan | Min. pembelian Rp 100k |
| `{order_link}` | Link order | wa.me/628123456789 |
| `{cancellation_reason}` | Alasan batal | Berubah pikiran |
| `{cancellation_date}` | Tanggal batal | 30 Oktober 2025 |
| `{refund_period}` | Waktu refund | 1-3 hari kerja |

### 4. Preview Template

Sebelum menggunakan template:

1. Klik icon **"Preview"** (mata) di tabel
2. Lihat hasil akhir dengan data contoh
3. Pastikan format dan variabel sudah benar

### 5. Set Template Default

Template default akan otomatis digunakan untuk kategori tertentu:

1. Klik toggle **"Default"** di tabel
2. Hanya 1 template per kategori yang bisa jadi default
3. Template default akan digunakan saat kirim pesan otomatis

### 6. Edit Template

1. Klik icon **"Edit"** (pensil) di tabel
2. Ubah konten sesuai kebutuhan
3. Klik **"Simpan"**

### 7. Duplicate Template

Untuk membuat variasi dari template yang ada:

1. Klik icon **"Duplicate"** (copy) di tabel
2. Template akan dicopy dengan nama "(Copy)"
3. Edit sesuai kebutuhan

### 8. Hapus Template

1. Klik icon **"Hapus"** (trash) di tabel
2. Konfirmasi penghapusan
3. Template akan dihapus permanen

---

## 💡 Tips & Best Practices

### 1. Gunakan Bahasa yang Friendly
```
✅ GOOD: "Halo Budi! 👋 Terima kasih sudah pesan ya!"
❌ BAD: "Pesanan Anda telah diterima."
```

### 2. Tambahkan Emoji untuk Kesan Ramah
```
✅ GOOD: "Pesanan kamu sudah siap! 🎉"
❌ BAD: "Pesanan sudah siap."
```

### 3. Gunakan Format yang Rapi
```
✅ GOOD:
📋 *Detail Pesanan*
No: ORD-001
Total: Rp 150.000

❌ BAD:
Detail Pesanan No ORD-001 Total Rp 150.000
```

### 4. Sertakan Call-to-Action
```
✅ GOOD: "Kalau ada pertanyaan, langsung chat aja ya! 😊"
❌ BAD: (tidak ada CTA)
```

### 5. Personalisasi dengan Nama
```
✅ GOOD: "Halo {customer_name}! 👋"
❌ BAD: "Halo!"
```

### 6. Berikan Informasi Lengkap
```
✅ GOOD: Sertakan nomor pesanan, total, tanggal, dan item
❌ BAD: Hanya "Pesanan diterima"
```

### 7. Gunakan Variabel dengan Benar
```
✅ GOOD: {customer_name} (dengan kurung kurawal)
❌ BAD: customer_name (tanpa kurung kurawal)
```

### 8. Test dengan Preview
Selalu gunakan preview untuk memastikan template terlihat baik dengan data real.

---

## 🎨 Contoh Customization

### Untuk Bisnis Katering
```
Halo {customer_name}! 👋

Terima kasih sudah mempercayakan acara kamu ke {business_name}! 🎉

📋 *Detail Pesanan Katering*
No. Pesanan: {order_no}
Tanggal Acara: {event_date}
Lokasi: {event_location}
Jumlah Porsi: {portions}
Total: {total_amount}

Menu yang dipesan:
{items_list}

✅ Pesanan sudah kami terima dan akan kami siapkan dengan sebaik-baiknya!

Tim kami akan datang 2 jam sebelum acara untuk setup.

Ada pertanyaan? Chat aja ya! 😊
```

### Untuk Bisnis Kue
```
Halo {customer_name}! 🎂

Yeay! Pesanan kue kamu sudah kami terima! ✨

🍰 *Detail Pesanan*
No: {order_no}
Jenis Kue: {cake_type}
Ukuran: {cake_size}
Tanggal Ambil: {pickup_date}
Total: {total_amount}

Catatan Khusus:
{special_notes}

✅ Kue akan kami buat fresh di hari H!

Jangan lupa ambil tepat waktu ya, biar tetap segar! 😊

Terima kasih! 💙
```

### Untuk Bisnis Frozen Food
```
Halo {customer_name}! ❄️

Terima kasih sudah order frozen food di {business_name}! 🥟

📦 *Detail Pesanan*
No: {order_no}
Total: {total_amount}

Produk yang dipesan:
{items_list}

🚚 Pengiriman:
Metode: {delivery_method}
Estimasi: {estimated_delivery}

⚠️ Penting: Produk akan dikirim dengan dry ice untuk menjaga kesegaran!

Setelah terima, langsung masukkan ke freezer ya! ❄️

Happy cooking! 👨‍🍳
```

---

## 🔧 Troubleshooting

### Template tidak muncul saat kirim pesan
- Pastikan template sudah di-set sebagai **active** (toggle hijau)
- Pastikan kategori template sesuai dengan konteks pengiriman

### Variabel tidak terganti
- Cek format variabel: harus `{nama_variabel}` dengan kurung kurawal
- Pastikan nama variabel sesuai dengan yang tersedia
- Cek data pesanan sudah lengkap

### Template terlalu panjang
- WhatsApp memiliki limit karakter per pesan
- Buat template lebih ringkas atau split menjadi beberapa pesan

### Emoji tidak muncul
- Pastikan device mendukung emoji
- Gunakan emoji standar yang umum

---

## 📞 Support

Butuh bantuan? Hubungi tim support atau buka dokumentasi lengkap di aplikasi.

---

**Happy messaging! 💬✨**

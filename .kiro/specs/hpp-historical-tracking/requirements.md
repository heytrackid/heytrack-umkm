# Requirements Document

## Introduction

Fitur Historical HPP Tracking & Trends adalah sistem untuk melacak dan menganalisis perubahan Harga Pokok Produksi (HPP) dari waktu ke waktu. Sistem ini memungkinkan pengguna untuk memantau tren HPP, mengidentifikasi fluktuasi biaya, dan mendapatkan alert otomatis ketika terjadi perubahan signifikan pada HPP produk.

## Glossary

- **HPP System**: Sistem perhitungan dan tracking Harga Pokok Produksi
- **User**: Pemilik atau pengelola bisnis yang menggunakan aplikasi
- **Recipe**: Resep produk yang memiliki komposisi bahan dan HPP
- **HPP Snapshot**: Rekaman data HPP pada titik waktu tertentu
- **Alert Threshold**: Batas persentase perubahan HPP yang memicu notifikasi
- **Time Period**: Rentang waktu untuk analisis (7 hari, 30 hari, 90 hari, 1 tahun)
- **Cost Component**: Komponen biaya yang membentuk HPP (bahan baku, biaya operasional)
- **Export Function**: Fungsi untuk mengekspor data HPP ke format Excel

## Requirements

### Requirement 1

**User Story:** Sebagai User, saya ingin melihat grafik tren HPP per produk, sehingga saya dapat memahami bagaimana biaya produksi berubah dari waktu ke waktu

#### Acceptance Criteria

1. WHEN User membuka halaman HPP, THE HPP System SHALL menampilkan tab "HPP Lanjutan" dengan grafik tren HPP
2. WHEN User memilih produk dari dropdown, THE HPP System SHALL menampilkan line chart dengan data HPP produk tersebut dalam 30 hari terakhir
3. THE HPP System SHALL menyediakan filter periode waktu dengan pilihan 7 hari, 30 hari, 90 hari, dan 1 tahun
4. WHEN User mengubah filter periode, THE HPP System SHALL memperbarui grafik dengan data sesuai periode yang dipilih dalam waktu kurang dari 2 detik
5. THE HPP System SHALL menampilkan nilai HPP minimum, maksimum, dan rata-rata pada periode yang dipilih

### Requirement 2

**User Story:** Sebagai User, saya ingin membandingkan HPP periode saat ini dengan periode sebelumnya, sehingga saya dapat mengidentifikasi perubahan biaya produksi

#### Acceptance Criteria

1. THE HPP System SHALL menampilkan persentase perubahan HPP dibandingkan periode sebelumnya
2. WHEN HPP naik lebih dari 5%, THE HPP System SHALL menampilkan indikator warna merah dengan ikon panah naik
3. WHEN HPP turun lebih dari 5%, THE HPP System SHALL menampilkan indikator warna hijau dengan ikon panah turun
4. WHEN perubahan HPP kurang dari 5%, THE HPP System SHALL menampilkan indikator warna abu-abu dengan ikon stabil
5. THE HPP System SHALL menampilkan nilai absolut perubahan HPP dalam format mata uang

### Requirement 3

**User Story:** Sebagai User, saya ingin mendapatkan alert otomatis ketika HPP naik signifikan, sehingga saya dapat segera mengambil tindakan

#### Acceptance Criteria

1. WHEN HPP produk naik lebih dari 10% dalam 7 hari, THE HPP System SHALL menampilkan notifikasi alert di dashboard
2. THE HPP System SHALL menyimpan riwayat alert dalam database dengan timestamp dan detail perubahan
3. WHEN User membuka halaman HPP, THE HPP System SHALL menampilkan badge jumlah alert yang belum dibaca
4. WHEN User mengklik alert, THE HPP System SHALL menampilkan detail produk, persentase kenaikan, dan komponen biaya yang berubah
5. THE HPP System SHALL menandai alert sebagai sudah dibaca setelah User melihat detailnya

### Requirement 4

**User Story:** Sebagai User, saya ingin melihat breakdown komponen biaya yang membentuk HPP, sehingga saya dapat mengidentifikasi sumber perubahan biaya

#### Acceptance Criteria

1. THE HPP System SHALL menampilkan pie chart yang menunjukkan proporsi biaya bahan baku dan biaya operasional
2. WHEN User mengklik segmen pie chart, THE HPP System SHALL menampilkan detail breakdown komponen biaya tersebut
3. THE HPP System SHALL menampilkan daftar 5 bahan baku dengan kontribusi biaya tertinggi
4. THE HPP System SHALL menghitung dan menampilkan persentase kontribusi setiap komponen terhadap total HPP
5. WHEN biaya bahan baku tertentu naik lebih dari 15%, THE HPP System SHALL menandai bahan tersebut dengan highlight warna merah

### Requirement 5

**User Story:** Sebagai User, saya ingin mengekspor data HPP historical ke Excel, sehingga saya dapat melakukan analisis lebih lanjut atau membuat laporan

#### Acceptance Criteria

1. THE HPP System SHALL menyediakan tombol "Export to Excel" pada halaman HPP Lanjutan
2. WHEN User mengklik tombol export, THE HPP System SHALL menghasilkan file Excel dengan data HPP dalam periode yang dipilih
3. THE HPP System SHALL menyertakan kolom tanggal, nama produk, HPP, perubahan persentase, dan breakdown biaya dalam file Excel
4. THE HPP System SHALL menambahkan sheet terpisah untuk summary statistik (min, max, average, trend)
5. WHEN proses export selesai, THE HPP System SHALL otomatis mendownload file dengan nama format "HPP_History_[ProductName]_[Date].xlsx"

### Requirement 6

**User Story:** Sebagai User, saya ingin melihat multiple produk dalam satu grafik, sehingga saya dapat membandingkan tren HPP antar produk

#### Acceptance Criteria

1. THE HPP System SHALL menyediakan opsi multi-select untuk memilih hingga 5 produk sekaligus
2. WHEN User memilih multiple produk, THE HPP System SHALL menampilkan line chart dengan garis berbeda warna untuk setiap produk
3. THE HPP System SHALL menampilkan legend yang menunjukkan warna dan nama setiap produk
4. WHEN User menghover garis pada grafik, THE HPP System SHALL menampilkan tooltip dengan nama produk, tanggal, dan nilai HPP
5. THE HPP System SHALL menyediakan toggle untuk show/hide produk tertentu dari grafik tanpa menghapus seleksi

### Requirement 7

**User Story:** Sebagai User, saya ingin sistem otomatis menyimpan snapshot HPP secara berkala, sehingga data historical selalu tersedia tanpa input manual

#### Acceptance Criteria

1. THE HPP System SHALL menjalankan cron job setiap hari pada pukul 00:00 untuk menyimpan snapshot HPP semua produk
2. THE HPP System SHALL menyimpan data snapshot dengan timestamp, recipe_id, hpp_value, dan breakdown komponen biaya
3. WHEN terjadi perubahan harga bahan baku, THE HPP System SHALL otomatis menghitung ulang HPP dan menyimpan snapshot baru
4. THE HPP System SHALL menyimpan data snapshot minimal 1 tahun terakhir
5. WHEN data snapshot lebih dari 1 tahun, THE HPP System SHALL mengarsipkan data lama ke tabel terpisah untuk optimasi performa

### Requirement 8

**User Story:** Sebagai User, saya ingin melihat rekomendasi optimasi biaya berdasarkan analisis historical, sehingga saya dapat meningkatkan efisiensi produksi

#### Acceptance Criteria

1. WHEN HPP produk konsisten naik dalam 30 hari terakhir, THE HPP System SHALL menampilkan rekomendasi untuk review supplier atau bahan alternatif
2. WHEN biaya operasional meningkat lebih dari 20%, THE HPP System SHALL menampilkan saran untuk evaluasi efisiensi operasional
3. THE HPP System SHALL menampilkan perbandingan HPP produk dengan rata-rata industri jika data tersedia
4. THE HPP System SHALL menghitung potensi penghematan jika User mengganti bahan dengan harga lebih rendah
5. WHEN margin profit turun di bawah 15%, THE HPP System SHALL menampilkan alert dengan rekomendasi penyesuaian harga jual atau optimasi biaya

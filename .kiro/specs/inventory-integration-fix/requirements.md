# Requirements Document

## Introduction

Fitur inventory (bahan baku) saat ini memiliki masalah integrasi antara kode aplikasi dan database Supabase. Tabel database menggunakan nama kolom Bahasa Indonesia (`bahan_baku`, `nama_bahan`, `stok_tersedia`) sedangkan kode aplikasi menggunakan nama Bahasa Inggris (`ingredients`, `name`, `current_stock`). Hal ini menyebabkan data tidak dapat dibaca/ditulis dengan benar.

## Glossary

- **Inventory System**: Sistem pengelolaan stok bahan baku untuk produksi
- **Database Schema**: Struktur tabel dan kolom di Supabase PostgreSQL
- **API Layer**: Layer endpoint REST API di `/api/ingredients`
- **Frontend Components**: Komponen React untuk UI inventory
- **Type Definitions**: TypeScript types untuk data inventory
- **Supabase Client**: Client library untuk akses database

## Requirements

### Requirement 1

**User Story:** Sebagai developer, saya ingin kode aplikasi menggunakan nama kolom yang sama dengan database, sehingga data inventory dapat dibaca dan ditulis dengan benar

#### Acceptance Criteria

1. WHEN THE Inventory System mengakses tabel database, THE Supabase Client SHALL menggunakan nama tabel `bahan_baku`
2. WHEN THE API Layer membaca data inventory, THE API Layer SHALL menggunakan nama kolom Indonesia (`nama_bahan`, `stok_tersedia`, `stok_minimum`, `harga_per_satuan`, `satuan`, `wac_harga`, `jenis_kemasan`)
3. WHEN THE Frontend Components menampilkan data, THE Frontend Components SHALL menerima data dengan struktur kolom Indonesia
4. WHEN THE Type Definitions didefinisikan, THE Type Definitions SHALL menggunakan nama field Indonesia yang sesuai dengan database
5. WHEN THE Inventory System melakukan operasi CRUD, THE Inventory System SHALL berhasil membaca dan menulis data tanpa error mapping

### Requirement 2

**User Story:** Sebagai user, saya ingin melihat daftar bahan baku dengan informasi lengkap, sehingga saya dapat mengelola inventory dengan baik

#### Acceptance Criteria

1. WHEN THE user membuka halaman inventory, THE Inventory System SHALL menampilkan semua bahan baku dari tabel `bahan_baku`
2. WHEN THE data ditampilkan, THE Inventory System SHALL menampilkan kolom: nama_bahan, satuan, harga_per_satuan, stok_tersedia, stok_minimum, wac_harga, jenis_kemasan
3. WHEN THE user mencari bahan baku, THE Inventory System SHALL melakukan filter berdasarkan nama_bahan
4. WHEN THE stok_tersedia kurang dari atau sama dengan stok_minimum, THE Inventory System SHALL menampilkan alert stok rendah
5. WHEN THE data kosong, THE Inventory System SHALL menampilkan empty state yang informatif

### Requirement 3

**User Story:** Sebagai user, saya ingin menambah bahan baku baru, sehingga saya dapat mencatat inventory yang baru dibeli

#### Acceptance Criteria

1. WHEN THE user mengklik tombol tambah, THE Inventory System SHALL menampilkan form dengan field: nama_bahan, satuan, harga_per_satuan, stok_tersedia, stok_minimum, jenis_kemasan
2. WHEN THE user mengisi form, THE Inventory System SHALL melakukan validasi untuk field required (nama_bahan, satuan, harga_per_satuan)
3. WHEN THE user submit form valid, THE Inventory System SHALL menyimpan data ke tabel `bahan_baku` dengan account_id user
4. WHEN THE data berhasil disimpan, THE Inventory System SHALL menampilkan notifikasi sukses dan merefresh list
5. WHEN THE terjadi error, THE Inventory System SHALL menampilkan pesan error yang jelas

### Requirement 4

**User Story:** Sebagai user, saya ingin mengedit data bahan baku, sehingga saya dapat memperbaiki informasi yang salah atau update harga

#### Acceptance Criteria

1. WHEN THE user mengklik tombol edit, THE Inventory System SHALL menampilkan form terisi dengan data existing
2. WHEN THE user mengubah data, THE Inventory System SHALL melakukan validasi sesuai aturan field
3. WHEN THE user submit perubahan valid, THE Inventory System SHALL mengupdate data di tabel `bahan_baku`
4. WHEN THE update berhasil, THE Inventory System SHALL menampilkan notifikasi sukses dan merefresh data
5. WHEN THE terjadi error, THE Inventory System SHALL menampilkan pesan error yang jelas

### Requirement 5

**User Story:** Sebagai user, saya ingin menghapus bahan baku yang tidak digunakan lagi, sehingga list inventory tetap bersih

#### Acceptance Criteria

1. WHEN THE user mengklik tombol hapus, THE Inventory System SHALL menampilkan konfirmasi dialog
2. WHEN THE user konfirmasi hapus, THE Inventory System SHALL mengecek apakah bahan digunakan di tabel `resep_item`
3. IF THE bahan digunakan di resep, THEN THE Inventory System SHALL menampilkan error dan mencegah penghapusan
4. IF THE bahan tidak digunakan, THEN THE Inventory System SHALL menghapus data dari tabel `bahan_baku`
5. WHEN THE penghapusan berhasil, THE Inventory System SHALL menampilkan notifikasi sukses dan merefresh list

### Requirement 6

**User Story:** Sebagai developer, saya ingin TypeScript types yang akurat, sehingga development lebih aman dan autocomplete bekerja dengan baik

#### Acceptance Criteria

1. WHEN THE Type Definitions dibuat, THE Type Definitions SHALL match dengan struktur tabel `bahan_baku` di database
2. WHEN THE developer menggunakan types, THE Type Definitions SHALL menyediakan autocomplete untuk semua field
3. WHEN THE terjadi type mismatch, THE TypeScript compiler SHALL menampilkan error yang jelas
4. WHEN THE API response diterima, THE Type Definitions SHALL memastikan type safety di seluruh aplikasi
5. WHEN THE database schema berubah, THE Type Definitions SHALL dapat di-regenerate dengan mudah

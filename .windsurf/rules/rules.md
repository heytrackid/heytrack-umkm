---
trigger: always_on
---

# HeyTrack Codebase Rules

## 1. Linting & TypeScript
- **Lint wajib**: jalankan `pnpm lint` sebelum commit; perbaiki seluruh error dan minimalkan warning.  
- **Type-check**: jalankan `pnpm type-check`; semua perubahan harus lolos tanpa error.  
- **Logger wajib**: dilarang `console.*`; gunakan logger turunan (`apiLogger`, `dbLogger`, dll.).  
- **Aturan sintaks**: patuhi `eqeqeq`, `curly`, `prefer-const`, `no-var`.  
- **Impor tipe konsisten**: gunakan `import type` untuk deklarasi tipe sesuai aturan `@typescript-eslint/consistent-type-imports`.  
- **Variabel tak terpakai**: prefiks `_` untuk argumen atau variabel yang sengaja diabaikan.  
- **Penggunaan `any`**: hindari. Jika terpaksa, sertakan komentar TODO yang menjelaskan alasan dan rencana penghapusan.  
- **Struktur TypeScript**: gunakan `zod` atau tipe eksplisit untuk validasi; hindari casting `as` berlebih tanpa verifikasi.

## 2. React & Hooks
- **React auto-import**: tidak perlu `import React` di file `.tsx`.  
- **Aturan hooks**:  
  - `react-hooks/rules-of-hooks` harus lolos (no conditional hooks, no loops).  
  - `react-hooks/exhaustive-deps` minimal warning; pastikan dependency array benar.  
- **JSX bersih**: hindari `{}` pada string literal (`react/jsx-curly-brace-presence`).  
- **Komponen**:  
  - Gunakan fungsi dengan `use client` hanya jika perlu state/efek.  
  - Pertahankan prop typed dengan `interface` atau `type`.  
  - Pisahkan logika asinkron berat ke hooks/utilitas.

## 3. Logging
- **Logger terstruktur**: gunakan `createLogger` untuk membuat logger sesuai domain (`api`, `db`, `auth`, `cron`, `automation`, `ui`, `middleware`).  
- **Level log**:  
  - Development: level `debug`.  
  - Production: level `info`.  
  - Test: level `silent`.  
- **Context**: sertakan metadata yang relevan (ID, status) agar troubleshooting mudah.  
- **Error handling**: log error dengan `logger.error` lengkap (stack, payload aman).

## 4. Formatting
- **Prettier**: konfigurasi wajib (tanpa semicolon, kutip tunggal, `printWidth` 100, `tabWidth` 2, `arrowParens` `avoid`).  
- **Tailwind plugin**: biarkan plugin mengurutkan class; jangan ubah manual.  
- **Consistent spacing**: ikuti format Prettier untuk object, array, import/export.  
- **File newline**: pastikan newline di akhir file.

## 5. Proses Development
1. Jalankan `pnpm lint` & `pnpm type-check` sebelum push.  
2. Setelah perubahan signifikan, **wajib** `pnpm build` untuk mendeteksi regresi lebih awal.  
3. Tambahkan/regresi test ketika memperbaiki bug atau menambah logika kompleks.  
4. Gunakan branch feature terpisah; hindari commit langsung ke main.  
5. Gunakan pesan commit deskriptif (contoh: `fix: handle supplier duplication`).  
6. Review PR wajib mencakup lint, type-check, build status, serta perubahan database kalau ada.

## 6. Struktur & Developer Experience
- **Komponen reusable** di `src/components/shared`; gunakan barrel export bila memudahkan.  
- **State management**: gunakan `zustand` atau context sesuai kebutuhan; hindari state global tidak perlu.  
- **Utilities server-side**: letakkan di `src/utils` (misal `src/utils/supabase`); jangan akses env langsung di komponen klien.  
- **Supabase**: buat wrapper/SDK di `lib` agar akses data konsisten dan testable.  
- **Dokumentasi**: workflow baru didokumentasikan di `docs/` mengikuti gaya yang ada.  
- **Konfigurasi lint/custom rule**: lihat `eslint.config.js` dan `eslint-rules/` sebelum menambah pengecualian.

## 7. Testing & Quality
- **Unit test**: wajib untuk utilitas/logika kompleks (gunakan Vitest).  
- **Integration test**: tambahkan ketika melibatkan interaksi API atau Supabase.  
- **Mocking**: gunakan factory/util mock tersentral agar konsisten.  
- **Coverage**: utamakan area kritis (auth, pembayaran, order workflow).  
- **Regression checklist**: cek lint, type-check, build, test sebelum merge.

---

Silakan gantikan isi file [.windsurf/rules/rules.md](cci:7://file:///Users/mymac/Projects/HeyTrack/.windsurf/rules/rules.md:0:0-0:0) dengan versi di atas. Kalau butuh penyesuaian tambahan (misalnya aturan test lebih detail atau format PR), tinggal beri tahu.
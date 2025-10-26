# HeyTrack Codebase Rules

## 1. Linting & TypeScript
- Selalu jalankan lint sebelum commit; selesaikan semua error dan minimalkan warning.
- Hindari `console.*`; gunakan logger kontekstual (`apiLogger`, `dbLogger`, dst.).
- Tegakkan `eqeqeq`, `curly`, `prefer-const`, `no-var`, dan konsistensi impor tipe (`@typescript-eslint/consistent-type-imports`).
- Gunakan prefiks `_` untuk argumen/variabel yang sengaja diabaikan.
- Batasi penggunaan `any`; bila terpaksa, sertakan komentar TODO dengan alasan dan rencana penghapusan.

## 2. React & Hooks
- Tidak perlu `import React` di file JSX (Next.js sudah meng-handle).
- Patuhi aturan hooks: `react-hooks/rules-of-hooks` (error) dan `react-hooks/exhaustive-deps` (minimal warning).
- Jaga JSX bebas `{}` yang tidak diperlukan (`react/jsx-curly-brace-presence`).

## 3. Logging
- Gunakan logger turunan (`createLogger`) sesuai domain modul.
- Level log: `debug` (development), `info` (production), `silent` (test) sesuai konfigurasi `pino`.

## 4. Formatting
- Ikuti Prettier: tanpa semicolon, kutip tunggal, `printWidth` 100.
- Plugin Tailwind aktif; jangan ubah urutan class secara manual yang bertentangan dengan output Prettier.

## 5. Proses Development
1. Jalankan `pnpm lint` dan `pnpm type-check` sebelum push.
2. Setelah perubahan signifikan, jalankan `pnpm build` untuk memastikan tidak ada regresi.
3. Tambahkan test/regresi jika memperbaiki bug atau menambahkan logika kompleks.

## 6. Struktur & Developer Experience
- Komponen reusable ditempatkan di `src/components/shared`; gunakan barrel export bila membantu.
- Variabel environment atau logic server-side dikelola melalui utilitas (mis. `src/utils/supabase`); hindari akses langsung di komponen klien.
- Dokumentasikan workflow baru mengikuti gaya di folder `docs/`.

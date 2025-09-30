#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common i18n patterns to replace with Indonesian text
const COMMON_TRANSLATIONS = {
  // Actions
  "t('common.actions.add')": "'Tambah'",
  "t('common.actions.edit')": "'Edit'",
  "t('common.actions.delete')": "'Hapus'",
  "t('common.actions.save')": "'Simpan'",
  "t('common.actions.cancel')": "'Batal'",
  "t('common.actions.confirm')": "'Konfirmasi'",
  "t('common.actions.close')": "'Tutup'",
  "t('common.actions.view')": "'Lihat'",
  "t('common.actions.back')": "'Kembali'",
  "t('common.actions.next')": "'Selanjutnya'",
  "t('common.actions.submit')": "'Kirim'",
  "t('common.actions.reset')": "'Reset'",
  "t('common.actions.refresh')": "'Refresh'",
  "t('common.actions.export')": "'Export'",
  "t('common.actions.import')": "'Import'",
  "t('common.actions.search')": "'Cari'",
  "t('common.actions.filter')": "'Filter'",
  "t('common.actions.sort')": "'Urutkan'",

  // Status
  "t('common.status.active')": "'Aktif'",
  "t('common.status.inactive')": "'Tidak Aktif'",
  "t('common.status.pending')": "'Menunggu'",
  "t('common.status.completed')": "'Selesai'",
  "t('common.status.cancelled')": "'Dibatalkan'",

  // Labels
  "t('common.labels.name')": "'Nama'",
  "t('common.labels.description')": "'Deskripsi'",
  "t('common.labels.category')": "'Kategori'",
  "t('common.labels.type')": "'Tipe'",
  "t('common.labels.status')": "'Status'",
  "t('common.labels.amount')": "'Jumlah'",
  "t('common.labels.quantity')": "'Kuantitas'",
  "t('common.labels.price')": "'Harga'",
  "t('common.labels.total')": "'Total'",
  "t('common.labels.date')": "'Tanggal'",
  "t('common.labels.time')": "'Waktu'",

  // Messages
  "t('common.messages.success')": "'Berhasil'",
  "t('common.messages.error')": "'Error'",
  "t('common.messages.loading')": "'Memuat...'",
  "t('common.messages.saving')": "'Menyimpan...'",
  "t('common.messages.confirmDelete')": "'Apakah Anda yakin ingin menghapus?'",

  // Navigation
  "t('navigation.dashboard.title')": "'Dashboard'",

  // Placeholders
  "t('common.placeholders.search')": "'Cari...'",
  "t('common.placeholders.enterName')": "'Masukkan nama'",
  "t('common.placeholders.enterDescription')": "'Masukkan deskripsi'",

  // Tables
  "t('common.tables.headers.actions')": "'Aksi'",
  "t('common.tables.headers.name')": "'Nama'",
  "t('common.tables.headers.status')": "'Status'",
  "t('common.tables.headers.date')": "'Tanggal'",

  // Forms
  "t('forms.labels.name')": "'Nama'",
  "t('forms.labels.description')": "'Deskripsi'",
  "t('forms.labels.category')": "'Kategori'",
  "t('forms.labels.amount')": "'Jumlah'",
  "t('forms.labels.date')": "'Tanggal'",

  // Buttons
  "t('buttons.primary.addNew')": "'Tambah Baru'",
  "t('buttons.primary.saveChanges')": "'Simpan Perubahan'",
  "t('buttons.secondary.editItem')": "'Edit Item'",
  "t('buttons.secondary.viewDetails')": "'Lihat Detail'",
  "t('buttons.secondary.deleteItem')": "'Hapus Item'",
};

function findFilesWithI18n(directory) {
  const files = [];
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFilesWithI18n(fullPath));
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('useI18n') || content.includes("t('")) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function cleanFile(filePath) {
  console.log(`🧹 Cleaning: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove useI18n import
  content = content.replace(/import\s*{\s*useI18n\s*}\s*from\s*['"]@\/providers\/I18nProvider['"];?\s*/g, '');
  content = content.replace(/,\s*useI18n\s*}/g, '}');

  // Remove t variable declaration
  content = content.replace(/const\s*{\s*t\s*}\s*=\s*useI18n\(\);?\s*/g, '');
  content = content.replace(/const\s*{\s*[^}]*,\s*t\s*}\s*=\s*useI18n\(\);?\s*/g, (match) => {
    return match.replace(/,\s*t\s*/g, '');
  });

  // Replace common translations
  for (const [pattern, replacement] of Object.entries(COMMON_TRANSLATIONS)) {
    content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
  }

  // Handle dynamic translations (simplified approach - convert to Indonesian strings)
  content = content.replace(/t\(['"]([^'"]+)['"]\)/g, (match, key) => {
    // Simple fallback - convert common patterns to Indonesian
    if (key.includes('title')) return `'Judul'`;
    if (key.includes('name')) return `'Nama'`;
    if (key.includes('description')) return `'Deskripsi'`;
    if (key.includes('category')) return `'Kategori'`;
    if (key.includes('status')) return `'Status'`;
    if (key.includes('date')) return `'Tanggal'`;
    if (key.includes('amount') || key.includes('total')) return `'Jumlah'`;
    if (key.includes('price')) return `'Harga'`;
    if (key.includes('quantity')) return `'Kuantitas'`;
    if (key.includes('add') || key.includes('create')) return `'Tambah'`;
    if (key.includes('edit') || key.includes('update')) return `'Edit'`;
    if (key.includes('delete') || key.includes('remove')) return `'Hapus'`;
    if (key.includes('save')) return `'Simpan'`;
    if (key.includes('cancel')) return `'Batal'`;
    if (key.includes('confirm')) return `'Konfirmasi'`;
    if (key.includes('view') || key.includes('show')) return `'Lihat'`;
    if (key.includes('close')) return `'Tutup'`;
    if (key.includes('back')) return `'Kembali'`;
    if (key.includes('next')) return `'Selanjutnya'`;
    if (key.includes('loading')) return `'Memuat...'`;
    if (key.includes('saving')) return `'Menyimpan...'`;
    if (key.includes('success')) return `'Berhasil'`;
    if (key.includes('error')) return `'Error'`;

    // Default fallback - keep the key but make it Indonesian-style
    return `'${key.replace(/[^a-zA-Z]/g, ' ').trim()}'`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Cleaned: ${filePath}`);
}

function main() {
  const srcDir = path.join(process.cwd(), 'src');

  console.log('🔍 Finding files with i18n usage...');
  const files = findFilesWithI18n(srcDir);

  console.log(`📋 Found ${files.length} files with i18n usage:`);
  files.forEach(file => console.log(`  - ${file}`));

  console.log('\n🚀 Starting cleanup process...');

  for (const file of files) {
    try {
      cleanFile(file);
    } catch (error) {
      console.error(`❌ Error cleaning ${file}:`, error.message);
    }
  }

  console.log('\n🎉 Cleanup completed!');
  console.log('🔧 Note: Some dynamic translations may need manual review.');
  console.log('📝 Run: npm run build to check for any remaining issues.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { cleanFile, findFilesWithI18n };

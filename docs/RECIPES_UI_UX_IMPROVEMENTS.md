# Recipes UI/UX Improvements Plan

## Current Issues

1. **Terlalu kompleks**: Banyak view dan state yang membingungkan
2. **Tidak ada breadcrumb**: Navigasi tidak jelas
3. **Form terlalu panjang**: Ingredient management dalam satu form
4. **Tidak ada progress indicator**: User tidak tahu sudah sampai mana
5. **Empty state kurang informatif**: Tidak ada guidance untuk user baru
6. **Tidak ada halaman detail**: Semua dalam modal/inline edit

## Proposed Improvements

### 1. Simplified Page Structure
```
/recipes              → List semua resep (dengan search & filter)
/recipes/new          → Form tambah resep baru
/recipes/[id]         → Detail resep (view mode)
/recipes/[id]/edit    → Edit resep
/recipes/ai-generator → AI generator (sudah ada)
```

### 2. List Page Improvements
- **Clean header** dengan breadcrumb
- **Search & filter** yang intuitif
- **Card view** untuk mobile, table untuk desktop
- **Quick actions**: View, Edit, Delete, Calculate HPP
- **Stats summary**: Total resep, rata-rata HPP, dll
- **Empty state** dengan CTA jelas

### 3. Form Improvements
- **Step-by-step wizard**: 
  - Step 1: Info Dasar (nama, kategori, porsi)
  - Step 2: Bahan-bahan (ingredient list)
  - Step 3: Review & Save
- **Progress indicator** di atas
- **Validation** real-time
- **Auto-save draft** (optional)
- **Tips & guidance** di setiap step

### 4. Detail Page (NEW)
- **Header** dengan nama resep dan actions
- **Info card**: Porsi, waktu, kategori
- **Ingredient list**: Dengan harga dan total
- **Cost breakdown**: Bahan, operasional, total
- **Pricing info**: Harga jual, margin, profit
- **Actions**: Edit, Delete, Calculate HPP, Duplicate

### 5. Better UX Flow

#### Scenario 1: User Baru
1. Masuk ke /recipes → Empty state dengan guidance
2. Klik "Tambah Resep Pertama" → Redirect ke /recipes/new
3. Form wizard dengan progress indicator
4. Save → Redirect ke detail page dengan success message
5. Lihat hasil → CTA untuk "Hitung HPP" atau "Tambah Resep Lagi"

#### Scenario 2: User Existing
1. Masuk ke /recipes → List resep dengan search
2. Klik resep → Detail page
3. Klik "Edit" → Edit page dengan form pre-filled
4. Save → Kembali ke detail dengan success message

#### Scenario 3: Calculate HPP
1. Di detail page → Klik "Hitung HPP"
2. Redirect ke /hpp dengan resep pre-selected
3. Selesai → Kembali ke detail dengan HPP updated

## Implementation Priority

### Phase 1: Critical ✅ COMPLETED
- ✅ Clean up list page
- ✅ Add breadcrumb navigation
- ✅ Improve empty state
- ✅ Better search & filter UI
- ✅ Responsive card/table view
- ✅ Stats cards with meaningful data
- ✅ Mobile-optimized cards

### Phase 2: Important ✅ COMPLETED
- ✅ Create detail page (/recipes/[id])
- ✅ Create edit page (/recipes/[id]/edit)
- ✅ Create new page (/recipes/new)
- ✅ Improve form with better validation
- ✅ Add quick actions (view, edit, delete, calculate HPP)
- ✅ Ingredient management in form

### Phase 3: Nice to Have (Future)
- Step-by-step wizard for form
- Auto-save draft
- Bulk actions (delete multiple recipes)
- Advanced filters (by date, popularity, tags)
- Export functionality (PDF, Excel)
- Recipe duplication feature
- Recipe versioning/history
- Print-friendly view
- Recipe sharing/collaboration

## Design Principles

1. **Consistency**: Sama dengan ingredients dan HPP
2. **Clarity**: Jelas apa yang harus dilakukan
3. **Feedback**: Selalu ada feedback untuk setiap action
4. **Efficiency**: Minimal clicks untuk common tasks
5. **Guidance**: Tips dan help text di tempat yang tepat

## Technical Notes

- Use Next.js App Router untuk routing
- Use React Hook Form + Zod untuk validation
- Use TanStack Query untuk data fetching
- Use shadcn/ui untuk components
- Follow existing patterns dari ingredients & HPP

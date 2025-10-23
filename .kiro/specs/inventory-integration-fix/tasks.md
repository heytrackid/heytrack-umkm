# Implementation Plan - Inventory Integration Fix

- [x] 1. Update type definitions untuk bahan baku
  - Add BahanBaku interface to src/types/database.ts with Indonesian field names
  - Add BahanBakuFormData interface for form handling
  - Ensure all fields match database schema exactly (nama_bahan, satuan, harga_per_satuan, stok_tersedia, stok_minimum, wac_harga, jenis_kemasan)
  - _Requirements: 1.4, 6.1, 6.2_

- [x] 2. Update validation schema
  - Add BahanBakuSchema to src/lib/validations.ts
  - Use Indonesian field names (nama_bahan, satuan, harga_per_satuan, stok_tersedia, stok_minimum, jenis_kemasan)
  - Add validation rules: nama_bahan required, satuan enum, harga_per_satuan positive, stok non-negative
  - Add custom validation: stok_minimum <= stok_tersedia
  - _Requirements: 3.2, 4.2, 6.3_

- [x] 3. Update API endpoints untuk bahan baku
- [x] 3.1 Update GET /api/ingredients endpoint
  - Change table name from 'ingredients' to 'bahan_baku'
  - Update field names in SELECT query to Indonesian
  - Update search filter to use nama_bahan instead of name
  - Ensure account_id filtering works via RLS
  - _Requirements: 1.1, 1.2, 2.1, 2.3_

- [x] 3.2 Update POST /api/ingredients endpoint
  - Change table name to 'bahan_baku'
  - Use BahanBakuSchema for validation
  - Update INSERT query with Indonesian field names
  - Return created record with Indonesian fields
  - _Requirements: 1.1, 1.2, 3.3, 3.4_

- [x] 3.3 Update GET /api/ingredients/[id] endpoint
  - Change table name to 'bahan_baku'
  - Update SELECT query with Indonesian field names
  - Return single record with Indonesian fields
  - _Requirements: 1.1, 1.2_

- [x] 3.4 Update PUT /api/ingredients/[id] endpoint
  - Change table name to 'bahan_baku'
  - Use BahanBakuSchema.partial() for validation
  - Update UPDATE query with Indonesian field names
  - Return updated record with Indonesian fields
  - _Requirements: 1.1, 1.2, 4.3, 4.4_

- [x] 3.5 Update DELETE /api/ingredients/[id] endpoint
  - Change table name to 'bahan_baku'
  - Update check for usage in resep_item table (use bahan_id foreign key)
  - Update DELETE query
  - Return appropriate error if bahan is used in recipes
  - _Requirements: 1.1, 5.2, 5.3, 5.4_

- [x] 4. Update custom hooks
  - Update useSupabaseCRUD.ts to add useBahanBaku hook
  - Change table name from 'ingredients' to 'bahan_baku' in hook
  - Update tableMap if needed to map 'ingredients' → 'bahan_baku'
  - Ensure hook returns data with Indonesian field structure
  - _Requirements: 1.1, 1.5, 6.4_

- [x] 5. Update ingredients page component
  - Change import from useIngredients to useBahanBaku
  - Update all field references: name → nama_bahan, current_stock → stok_tersedia, minimum_stock → stok_minimum, price_per_unit → harga_per_satuan, unit → satuan
  - Update stats calculations to use Indonesian field names
  - Update low stock filter to use stok_tersedia and stok_minimum
  - Keep UI labels in Indonesian (already correct)
  - _Requirements: 1.3, 2.1, 2.2, 2.4, 2.5_

- [x] 6. Update ingredients CRUD component
  - Change type from Ingredient to BahanBaku
  - Update form field names to Indonesian (nama_bahan, satuan, harga_per_satuan, stok_tersedia, stok_minimum, jenis_kemasan)
  - Update validation to use BahanBakuSchema
  - Update table columns to use Indonesian field names
  - Update form initial data structure
  - Keep display labels in Indonesian (already correct)
  - _Requirements: 1.3, 3.1, 3.2, 4.1, 4.2, 5.1_

- [x] 7. Test inventory integration
  - Test GET /api/ingredients returns data with Indonesian fields
  - Test POST /api/ingredients creates record successfully
  - Test PUT /api/ingredients updates record correctly
  - Test DELETE /api/ingredients deletes unused bahan
  - Test DELETE /api/ingredients prevents deletion of used bahan
  - Test ingredients page displays data correctly
  - Test add new bahan baku form works
  - Test edit bahan baku form works
  - Test delete bahan baku with confirmation
  - Test search by nama_bahan
  - Test low stock alert appears correctly
  - Verify TypeScript compilation has no errors
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.3, 3.4, 3.5, 4.3, 4.4, 4.5, 5.2, 5.3, 5.4, 5.5, 6.3, 6.4, 6.5_

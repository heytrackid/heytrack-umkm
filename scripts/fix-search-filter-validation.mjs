#!/usr/bin/env node
/**
 * Script to replace search/filter 'any' with generic constraint types
 */

import fs from 'fs';

function fixSearchFilterTypes() {
  console.log('🔧 Replacing search/filter "any" with generic constraint types...');
  
  const filePath = 'src/lib/search-filter.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace: conditions: Record<keyof T, any>
    // With: conditions: Partial<Record<keyof T, unknown>>
    // This properly constrains the type while maintaining flexibility
    content = content.replace(
      /Record<keyof T, any>/g,
      'Partial<Record<keyof T, unknown>>'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed search filter types in ${filePath}`);
      return 1;
    } else {
      console.log(`  ℹ️  No changes made to ${filePath} (pattern not found)`);
      return 0;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function fixSettingsValidationType() {
  console.log('\\n🔧 Replacing validation function "any" with proper types...');
  
  const filePath = 'src/lib/settings-validation.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace the return type to be more specific
    // The validation result should return the validated data in a more specific form
    content = content.replace(
      /export function validateSettingsCategory\(category: string, data: unknown\): \{ success: boolean; data\?: any; errors\?: string\[] \} {/g,
      'export function validateSettingsCategory(category: string, data: unknown): { success: boolean; data?: Record<string, unknown>; errors?: string[] } {'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed settings validation type in ${filePath}`);
      return 1;
    } else {
      console.log(`  ℹ️  No changes made to ${filePath} (pattern not found)`);
      return 0;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Run the fixes
const searchFilterChanges = fixSearchFilterTypes();
const validationChanges = fixSettingsValidationType();

console.log(`\\n🎯 Search/filter and validation fixes completed: ${searchFilterChanges + validationChanges} changes`);

export { fixSearchFilterTypes, fixSettingsValidationType };
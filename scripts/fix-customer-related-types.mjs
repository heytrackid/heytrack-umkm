#!/usr/bin/env node
/**
 * Script to replace customer-related 'any' with proper Customer type
 */

import fs from 'fs';
import path from 'path';

function replaceCustomerAny() {
  console.log('🔧 Replacing customer-related "any" with proper Customer type...');
  
  const filePath = 'src/app/orders/types/orders.types.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Add import for CustomersTable if it's not already imported
    if (!content.includes('CustomersTable') && !content.includes('Customer')) {
      // Add import at the top of the file, after the first import statement
      const lines = content.split('\n');
      let firstImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import')) {
          firstImportIndex = i;
          break;
        }
      }
      
      if (firstImportIndex !== -1) {
        lines.splice(firstImportIndex + 1, 0, "import type { CustomersTable } from '@/types/customers'");
        content = lines.join('\n');
      }
    }
    
    // Replace the customer field type
    content = content.replace(
      /customer\?: any \/\/ Will be properly typed when customers module is done/g,
      'customer?: CustomersTable[\'Row\'] // Customer data type'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed customer type in ${filePath}`);
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

function replaceRecipeAny() {
  console.log('\\n🔧 Replacing recipe-related "any" with proper Recipe type...');
  
  const filePath = 'src/app/resep/types/production.types.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Add import for RecipesTable if it's not already imported
    if (!content.includes('RecipesTable') && !content.includes('Recipe')) {
      // Add import at the top of the file, after the first import statement
      const lines = content.split('\n');
      let firstImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import')) {
          firstImportIndex = i;
          break;
        }
      }
      
      if (firstImportIndex !== -1) {
        lines.splice(firstImportIndex + 1, 0, "import type { RecipesTable } from '@/types/recipes'");
        content = lines.join('\n');
      }
    }
    
    // Replace the recipe field type
    content = content.replace(
      /recipe\?: any \/\/ Will be properly typed when recipes module is integrated/g,
      'recipe?: RecipesTable[\'Row\'] // Recipe data type'
    );
    
    // Replace the quality_inspector field - this might be a user profile type
    content = content.replace(
      /quality_inspector\?: any \/\/ Staff member/g,
      'quality_inspector?: UserProfilesTable[\'Row\'] // Staff member'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed recipe types in ${filePath}`);
      return 2; // Two changes
    } else {
      console.log(`  ℹ️  No changes made to ${filePath} (pattern not found)`);
      return 0;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function replaceCrudFormAny() {
  console.log('\\n🔧 Replacing CRUD form "any" with proper type...');
  
  const filePath = 'src/components/ui/crud-form.tsx';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // For the value field in FormField, it could be any type of input value
    // A more specific type would be unknown | string | number | boolean | null | undefined | Date
    // But we can use a union that covers the common types
    content = content.replace(
      /value: any;/g,
      'value: unknown;'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed CRUD form value type in ${filePath}`);
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

// Run all fixes
const customerFixed = replaceCustomerAny();
const recipeFixed = replaceRecipeAny();
const crudFormFixed = replaceCrudFormAny();

console.log(`\n🎯 Customer-related fixes completed: ${customerFixed + recipeFixed + crudFormFixed} changes`);

// Export for potential reuse
export { replaceCustomerAny, replaceRecipeAny, replaceCrudFormAny };
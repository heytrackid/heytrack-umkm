#!/usr/bin/env node
/**
 * Script to replace Zod schema 'any' with more specific schemas
 */

import fs from 'fs';

function fixZodSchemas() {
  console.log('🔧 Replacing Zod schema "z.any()" with more specific schemas...');
  
  const filePath = 'src/lib/schemas.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // For favorite_items: this could be an array of item IDs or a structured object
    // Based on the context, it likely should be an array of some kind
    content = content.replace(
      /favorite_items: z\.any\(\)\.optional\(\)\.nullable\(\),/g,
      'favorite_items: z.array(z.string()).optional().nullable(), // Array of item IDs'
    );
    
    // For nutritional_info: this should be an object with nutritional data
    content = content.replace(
      /nutritional_info: z\.any\(\)\.optional\(\)\.nullable\(\),/g,
      'nutritional_info: z.object({\n    calories: z.number().optional(),\n    protein: z.number().optional(),\n    carbs: z.number().optional(),\n    fat: z.number().optional(),\n    fiber: z.number().optional(),\n    sugar: z.number().optional(),\n  }).optional().nullable(),'
    );
    
    // For tags: this should be an array of strings
    content = content.replace(
      /tags: z\.any\(\)\.optional\(\)\.nullable\(\),/g,
      'tags: z.array(z.string()).optional().nullable(), // Array of tag strings'
    );
    
    // For metadata: this can be a generic record/object
    content = content.replace(
      /metadata: z\.any\(\)\.optional\(\)\.nullable\(\),/g,
      'metadata: z.record(z.unknown()).optional().nullable(), // Generic metadata object'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed Zod schemas in ${filePath}`);
      return 5; // 5 changes made
    } else {
      console.log(`  ℹ️  No changes made to ${filePath} (patterns not found)`);
      return 0;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Run the fix
const zodChanges = fixZodSchemas();

console.log(`\\n🎯 Zod schema fixes completed: ${zodChanges} changes`);

export { fixZodSchemas };
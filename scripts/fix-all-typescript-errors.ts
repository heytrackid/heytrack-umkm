#!/usr/bin/env ts-node

/**
 * Comprehensive TypeScript Error Fix Script
 * Fixes all remaining TypeScript errors in the HeyTrack codebase
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface FixResult {
  fixed: number;
  errors: string[];
}

function runTypeCheck(): string {
  try {
    const result = execSync('npm run type-check', { 
      encoding: 'utf-8',
      timeout: 60000 
    });
    return result;
  } catch (error: any) {
    return error.stdout || error.stderr || 'Unknown error';
  }
}

function parseErrors(output: string): string[] {
  const errors = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('error TS')) {
      errors.push(line.trim());
    }
  }
  
  return errors;
}

function fixStringUndefinedErrors(errors: string[]): FixResult {
  let fixed = 0;
  const errorFiles = new Set<string>();
  
  // Collect files with string | undefined errors
  for (const error of errors) {
    if (error.includes('string | undefined') && error.includes('is not assignable to parameter of type \'string\'')) {
      const match = error.match(/src\/[^\s]+\.ts(?:x)?/);
      if (match) {
        errorFiles.add(match[0]);
      }
    }
  }
  
  // Fix each file
  for (const file of errorFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      let modified = content;
      
      // Fix specific patterns
      modified = modified.replace(
        /\.eq\('order_date', yesterdayStr\)/g,
        `.eq('order_date', yesterdayStr!)`
      );
      
      modified = modified.replace(
        /\.eq\('expense_date', today\)/g,
        `.eq('expense_date', today!)`
      );
      
      modified = modified.replace(
        /\.gte\('order_date', comparisonRange\.start\)/g,
        `.gte('order_date', comparisonRange.start!)`
      );
      
      modified = modified.replace(
        /\.lte\('order_date', comparisonRange\.end\)/g,
        `.lte('order_date', comparisonRange.end!)`
      );
      
      modified = modified.replace(
        /\.gte\('expense_date', dateRange\.start\)/g,
        `.gte('expense_date', dateRange.start!)`
      );
      
      modified = modified.replace(
        /\.lte\('expense_date', dateRange\.end\)/g,
        `.lte('expense_date', dateRange.end!)`
      );
      
      // Fix sales_date issues
      modified = modified.replace(
        /sales_date: today,/g,
        'sales_date: today!,'
      );
      
      if (modified !== content) {
        fs.writeFileSync(file, modified);
        fixed++;
        console.log(`✅ Fixed string | undefined errors in: ${file}`);
      }
    } catch (error) {
      console.log(`❌ Failed to fix: ${file}`);
    }
  }
  
  return { fixed, errors: [] };
}

function fixIndexSignatureErrors(errors: string[]): FixResult {
  let fixed = 0;
  const errorFiles = new Set<string>();
  
  // Collect files with index signature errors
  for (const error of errors) {
    if (error.includes('comes from an index signature') && error.includes('must be accessed with')) {
      const match = error.match(/src\/[^\s]+\.ts(?:x)?/);
      if (match) {
        errorFiles.add(match[0]);
      }
    }
  }
  
  // Fix each file
  for (const file of errorFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      let modified = content;
      
      // Fix property access patterns
      modified = modified.replace(
        /body\.recipe_id/g,
        'body["recipe_id"]'
      );
      
      modified = modified.replace(
        /body\.quantity/g,
        'body["quantity"]'
      );
      
      modified = modified.replace(
        /body\.cost_per_unit/g,
        'body["cost_per_unit"]'
      );
      
      modified = modified.replace(
        /body\.total_cost/g,
        'body["total_cost"]'
      );
      
      modified = modified.replace(
        /body\.labor_cost/g,
        'body["labor_cost"]'
      );
      
      modified = modified.replace(
        /body\.status/g,
        'body["status"]'
      );
      
      modified = modified.replace(
        /body\.planned_start_time/g,
        'body["planned_start_time"]'
      );
      
      modified = modified.replace(
        /body\.actual_start_time/g,
        'body["actual_start_time"]'
      );
      
      modified = modified.replace(
        /body\.actual_end_time/g,
        'body["actual_end_time"]'
      );
      
      modified = modified.replace(
        /body\.actual_quantity/g,
        'body["actual_quantity"]'
      );
      
      modified = modified.replace(
        /body\.actual_labor_cost/g,
        'body["actual_labor_cost"]'
      );
      
      modified = modified.replace(
        /body\.actual_material_cost/g,
        'body["actual_material_cost"]'
      );
      
      modified = modified.replace(
        /body\.actual_overhead_cost/g,
        'body["actual_overhead_cost"]'
      );
      
      modified = modified.replace(
        /body\.notes/g,
        'body["notes"]'
      );
      
      // Fix form field access
      modified = modified.replace(
        /errors\.description/g,
        'errors["description"]'
      );
      
      modified = modified.replace(
        /touched\.description/g,
        'touched["description"]'
      );
      
      modified = modified.replace(
        /errors\.category/g,
        'errors["category"]'
      );
      
      modified = modified.replace(
        /touched\.category/g,
        'touched["category"]'
      );
      
      modified = modified.replace(
        /errors\.amount/g,
        'errors["amount"]'
      );
      
      modified = modified

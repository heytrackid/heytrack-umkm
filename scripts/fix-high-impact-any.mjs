#!/usr/bin/env node
/**
 * Script to fix React component props with 'any' type
 * These are often Recharts callback parameters that have specific types
 */

import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

// Files to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/
];

function findFiles(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
      continue;
    }
    
    if (stat.isDirectory()) {
      results = results.concat(findFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(item)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

function fixChartComponentProps() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing chart component props (any → specific Recharts types)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace Recharts CustomTooltip parameters - they have known types
    // Recharts Tooltip has parameters like { active, payload, label }
    content = content.replace(
      /({ active, payload }: any) => \{/g,
      '({ active, payload }: { active?: boolean; payload?: Array<any>; label?: string }) => {'
    );
    
    content = content.replace(
      /({ active, payload, label }: any) => \{/g,
      '({ active?: boolean; payload?: Array<any>; label?: string }: { active?: boolean; payload?: Array<any>; label?: string }) => {'
    );
    
    // Fix the specific case but properly
    content = content.replace(
      /const CustomTooltip = \({ active, payload, label }\): any => \{/g,
      'const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {'
    );
    
    content = content.replace(
      /const CustomTooltip = \({ active, payload }\): any => \{/g,
      'const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {'
    );
    
    // Fix generic React component props with unknown (for cases where we can't determine the exact type)
    content = content.replace(
      /export const (\w+) = \({[^}]*}\): any => \(/g,
      'export const $1 = ({ children, title, height = \'h-64\', ...props }: React.PropsWithChildren<{ title?: string; height?: string; [key: string]: any }>) => ('
    );
    
    // More targeted fix for chart loader components
    const chartComponentPatterns = [
      /export const (\w+ChartWithSuspense) = \({[^}]*}\): any => \(/g,
      /export const (SimpleTableView) = \({[^}]*}\): any => \(/g,
      /export const (VirtualizedTableLoader) = \({[^}]*}\): any => \(/g,
      /default: \({[^}]*}\): any => \{/g
    ];
    
    for (const pattern of chartComponentPatterns) {
      content = content.replace(pattern, function(match) {
        // Replace with appropriate React component props type
        return match.replace(/: any =>/, ': { [key: string]: any } =>');
      });
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/{ \.\.props }: \{/g) || []).length + 
                         (content.match(/: \{ \.\.props \}/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed chart component props in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total chart component props fixed: ${totalFixed}`);
  return totalFixed;
}

function fixGenericComponentProps() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing generic component props (any → React.PropsWithChildren or appropriate types)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace generic component props with more appropriate types
    content = content.replace(
      /(\w+)\s*:\s*any(?=\s*[,\)])/g,
      (match, param) => {
        // For common React component parameter names
        if (['props', 'children', 'data', 'columns', 'options'].includes(param)) {
          return `${param}: unknown`;
        }
        return match; // don't change others to avoid breaking
      }
    );
    
    // Replace object destructuring with 'any' in component definitions
    content = content.replace(
      /\(\{[^}]*}\): any(?=\s*=>)/g,
      '(props: { [key: string]: unknown })'
    );
    
    // More targeted approach - just replace specific patterns we're sure about
    content = content.replace(
      /props: any = \{\}/g,
      'props: { [key: string]: unknown } = {}'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/: \{ \[key: string\]: unknown \}/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed generic component props in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total generic component props fixed: ${totalFixed}`);
  return totalFixed;
}

function fixPromiseTypes() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing Promise<any> types...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace Promise<any>[] with more specific types where possible
    content = content.replace(/\bPromise<any>\[\]/g, 'Promise<unknown>[]');
    
    // Replace single Promise<any> with Promise<unknown>
    content = content.replace(/\bPromise<any>(?=[^$\\w]|$)/g, 'Promise<unknown>');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/Promise<unknown>/g) || []).length - 
                         (originalContent.match(/Promise<unknown>/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed ${changeCount} Promise types in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total Promise types fixed: ${totalFixed}`);
  return totalFixed;
}

function fixFunctionTypeParameters() {
  const files = findFiles(SRC_DIR);
  let totalFixed = 0;
  
  console.log('🔧 Fixing function type parameters (T extends (...args: any) => any patterns)...\n');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace function type parameters like T extends (...args: any[]) => any
    content = content.replace(
      /extends \(\.\.\.args: unknown\[\]\) => any/g,
      'extends (...args: unknown[]) => unknown'
    );
    
    // More specific pattern matching
    content = content.replace(
      /\(\.\.\.args: unknown\[\]\) => any(?=\s*[,>])/g,
      '(...args: unknown[]) => unknown'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      const changeCount = (content.match(/=> unknown/g) || []).length - 
                         (originalContent.match(/=> unknown/g) || []).length;
      totalFixed += changeCount;
      if (changeCount > 0) {
        console.log(`  ✅ Fixed function types in ${path.relative('.', file)}`);
      }
    }
  }
  
  console.log(`\n✅ Total function type parameters fixed: ${totalFixed}`);
  return totalFixed;
}

// Run all fixes
const chartPropsFixed = fixChartComponentProps();
const genericPropsFixed = fixGenericComponentProps();
const promiseTypesFixed = fixPromiseTypes();
const functionTypesFixed = fixFunctionTypeParameters();

console.log(`\n🎯 Summary:`);
console.log(`   Chart component props: ${chartPropsFixed}`);
console.log(`   Generic component props: ${genericPropsFixed}`);
console.log(`   Promise types: ${promiseTypesFixed}`);
console.log(`   Function type parameters: ${functionTypesFixed}`);
console.log(`   Total changes made: ${chartPropsFixed + genericPropsFixed + promiseTypesFixed + functionTypesFixed}`);
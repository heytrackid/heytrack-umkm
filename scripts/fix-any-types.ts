import { promises as fs } from 'fs';
import { join } from 'path';

interface AnyTypeLocation {
  file: string;
  line: number;
  code: string;
  context: string;
}

/**
 * Script to find and help fix 'any' types in the codebase
 */
async function findAnyTypes(directory: string): Promise<AnyTypeLocation[]> {
  const results: AnyTypeLocation[] = [];

  try {
    const files = await getAllFiles(directory);

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (!line) continue;

          const explicitAnyRegex = /\bany\b/g;

          // Check for explicit 'any' types first
          if (explicitAnyRegex.test(line)) {
            const contextStart = Math.max(0, i - 2);
            const contextEnd = Math.min(lines.length, i + 3);
            const context = lines.slice(contextStart, contextEnd).join('\n');

            results.push({
              file,
              line: i + 1,
              code: line.trim(),
              context
            });
          }

          // Check for potentially implicit 'any' types in function parameters
          const paramPattern = /(function\s+\w+|const\s+\w+\s*=|:\s*\w+\s*=>)\s*\([^)]*\)/;
          if (paramPattern.test(line) && !line.includes(':')) {
            // This might be a function with implicitly typed parameters
            const contextStart = Math.max(0, i - 2);
            const contextEnd = Math.min(lines.length, i + 3);
            const context = lines.slice(contextStart, contextEnd).join('\n');

            results.push({
              file,
              line: i + 1,
              code: line.trim(),
              context
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error finding any types:', error);
  }

  return results;
}

/**
 * More specific function to find 'any' types, including implicit ones
 */
async function findAnyTypesDetailed(directory: string): Promise<AnyTypeLocation[]> {
  const results: AnyTypeLocation[] = [];

  try {
    const files = await getAllFiles(directory);

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        let content = await fs.readFile(file, 'utf8');

        // Find explicit 'any' types
        const explicitAnyPattern = /:\s*any\b|:\s*any\s*(?=\[)/g;
        let match;
        while ((match = explicitAnyPattern.exec(content)) !== null) {
          const position = match.index;
          const lineStart = content.lastIndexOf('\n', position);
          const lineEnd = content.indexOf('\n', position);
          const lineNum = content.substring(0, position).split('\n').length;
          const line = content.substring(lineStart + 1, lineEnd === -1 ? content.length : lineEnd);

          // Get context (surrounding lines)
          const lines = content.split('\n');
          const contextStart = Math.max(0, lineNum - 3);
          const contextEnd = Math.min(lines.length, lineNum + 2);
          const context = lines.slice(contextStart, contextEnd).join('\n');

          results.push({
            file,
            line: lineNum,
            code: line.trim(),
            context
          });
        }

        // Find implicitly typed parameters (function parameters without explicit type)
        const implicitAnyPattern = /(function\s+\w+|const\s+\w+\s*=|=>)\s*\(([^)]*)\)[^{]*{/g;
        while ((match = implicitAnyPattern.exec(content)) !== null) {
          const paramsStr = match[2];
          if (paramsStr && !paramsStr.includes(':')) {
            // If params don't have type annotations, they are implicitly 'any'
            const position = match.index;
            const lineNum = content.substring(0, position).split('\n').length;
            const lines = content.split('\n');
            const contextStart = Math.max(0, lineNum - 2);
            const contextEnd = Math.min(lines.length, lineNum + 3);
            const context = lines.slice(contextStart, contextEnd).join('\n');

            const line = content.substring(content.lastIndexOf('\n', position) + 1, content.indexOf('\n', position) === -1 ? content.length : content.indexOf('\n', position));

            results.push({
              file,
              line: lineNum,
              code: line.trim(),
              context
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error finding any types:', error);
  }

  return results;
}

/**
 * Find files recursively
 */
async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(path) : [path];
  }));
  return files.flat();
}

/**
 * Generate a fix script for identified 'any' types
 */
async function generateFixScript(locations: AnyTypeLocation[]): Promise<string> {
  let fixScript = `// Auto-generated script to help fix 'any' types\n\n`;

  for (const location of locations) {
    fixScript += `// File: ${location.file}:${location.line}\n`;
    fixScript += `// Code: ${location.code}\n`;

    // Try to suggest type replacements based on context
    let suggestedType = 'any'; // default

    if (location.code.includes('error:')) {
      suggestedType = 'Error';
    } else if (location.code.includes('item') || location.code.includes('data')) {
      suggestedType = 'unknown'; // safer than 'any'
    } else if (location.code.includes('req') || location.code.includes('request')) {
      suggestedType = 'Request';
    } else if (location.code.includes('res') || location.code.includes('response')) {
      suggestedType = 'Response';
    }

    fixScript += `// Suggested replacement: Change 'any' to '${suggestedType}'\n\n`;
  }

  return fixScript;
}

/**
 * Main function
 */
async function main() {
  const directory = process.argv[2] || './src';
  console.log(`Scanning directory: ${directory}`);

  const anyTypeLocations = await findAnyTypesDetailed(directory);

  console.log(`\nFound ${anyTypeLocations.length} potential 'any' type locations:\n`);

  for (const location of anyTypeLocations) {
    console.log(`${location.file}:${location.line}`);
    console.log(`  ${location.code}`);
    console.log(`  Context: ...${location.context}...`);
    console.log();
  }

  // Generate a fix script
  const fixScript = await generateFixScript(anyTypeLocations.slice(0, 10)); // Limit to first 10 for demo
  await fs.writeFile('./scripts/any-type-fixes-suggestions.ts', fixScript);
  console.log('Fix suggestions saved to ./scripts/any-type-fixes-suggestions.ts');

  // Create a summary report
  const report = `
# 'Any' Type Analysis Report

## Summary
- Total files scanned: ${new Set(anyTypeLocations.map(loc => loc.file)).size}
- Total 'any' type locations found: ${anyTypeLocations.length}

## Distribution by file:
${anyTypeLocations.reduce((acc, curr) => {
    acc[curr.file] = (acc[curr.file] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)}

## Recommendations
1. Replace explicit 'any' types with more specific types
2. Use 'unknown' as a safer alternative to 'any' when type is truly unknown
3. Leverage TypeScript's type inference where possible
4. Create proper type definitions for API responses
  `;

  await fs.writeFile('./scripts/any-types-report.md', report);
  console.log('Analysis report saved to ./scripts/any-types-report.md');
}

// Run the script if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('fix-any-types.ts')) {
  main().catch(console.error);
}

export { findAnyTypes, findAnyTypesDetailed };
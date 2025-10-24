#!/usr/bin/env node

/**
 * Type Safety Analysis Script
 * Analyzes and reports on remaining 'any' types in the codebase
 * Identifies patterns that can be automatically fixed
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class TypeSafetyAnalyzer {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.results = {
      totalFiles: 0,
      filesWithAny: 0,
      totalAnyTypes: 0,
      byFile: {},
      patterns: {},
      autoFixable: []
    };
  }

  /**
   * Find all TypeScript files
   */
  findTsFiles() {
    const files = [];
    const walk = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    };

    walk(path.join(this.rootDir, 'src'));
    return files;
  }

  /**
   * Analyze a single file for any types
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      let anyCount = 0;
      const anyLocations = [];
      const patterns = {};

      // Find all 'any' occurrences
      lines.forEach((line, index) => {
        const anyMatches = line.match(/\bany\b/g);
        if (anyMatches) {
          anyCount += anyMatches.length;
          anyLocations.push({
            line: index + 1,
            content: line.trim(),
            matches: anyMatches.length
          });

          // Analyze patterns
          if (line.includes('data: any')) {
            patterns.dataAny = (patterns.dataAny || 0) + 1;
          }
          if (line.includes('props: any')) {
            patterns.propsAny = (patterns.propsAny || 0) + 1;
          }
          if (line.includes('params: any')) {
            patterns.paramsAny = (patterns.paramsAny || 0) + 1;
          }
          if (line.includes('result: any')) {
            patterns.resultAny = (patterns.resultAny || 0) + 1;
          }
          if (line.includes('Record<string, any>')) {
            patterns.recordStringAny = (patterns.recordStringAny || 0) + 1;
          }
        }
      });

      if (anyCount > 0) {
        this.results.filesWithAny++;
        this.results.byFile[filePath] = {
          anyCount,
          locations: anyLocations,
          patterns
        };
      }

      this.results.totalAnyTypes += anyCount;
      return { anyCount, patterns };

    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return { anyCount: 0, patterns: {} };
    }
  }

  /**
   * Analyze all files
   */
  analyzeAll() {
    console.log('🔍 Analyzing TypeScript files for any types...\n');

    const files = this.findTsFiles();
    this.results.totalFiles = files.length;

    let processed = 0;
    for (const file of files) {
      const result = this.analyzeFile(file);
      processed++;

      if (result.anyCount > 0) {
        const relativePath = path.relative(this.rootDir, file);
        console.log(`📁 ${relativePath}: ${result.anyCount} any types`);
      }

      // Progress indicator
      if (processed % 50 === 0) {
        console.log(`⏳ Processed ${processed}/${files.length} files...`);
      }
    }

    this.analyzePatterns();
    this.generateReport();
  }

  /**
   * Analyze common patterns
   */
  analyzePatterns() {
    const allPatterns = {};

    Object.values(this.results.byFile).forEach(fileData => {
      Object.entries(fileData.patterns).forEach(([pattern, count]) => {
        allPatterns[pattern] = (allPatterns[pattern] || 0) + count;
      });
    });

    this.results.patterns = allPatterns;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TYPE SAFETY ANALYSIS REPORT');
    console.log('='.repeat(60));

    console.log(`\n📁 Files Analyzed: ${this.results.totalFiles}`);
    console.log(`📝 Files with any types: ${this.results.filesWithAny}`);
    console.log(`🎯 Total any types: ${this.results.totalAnyTypes}`);

    const improvement = ((1154 - this.results.totalAnyTypes) / 1154 * 100).toFixed(1);
    console.log(`📈 Improvement: ${improvement}% (${1154 - this.results.totalAnyTypes} types fixed)`);

    console.log('\n🔍 TOP FILES WITH ANY TYPES:');
    const sortedFiles = Object.entries(this.results.byFile)
      .sort(([,a], [,b]) => b.anyCount - a.anyCount)
      .slice(0, 10);

    sortedFiles.forEach(([file, data]) => {
      const relativePath = path.relative(this.rootDir, file);
      console.log(`  ${data.anyCount.toString().padStart(3)} | ${relativePath}`);
    });

    console.log('\n📋 COMMON PATTERNS:');
    Object.entries(this.results.patterns)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pattern, count]) => {
        console.log(`  ${count.toString().padStart(3)} | ${pattern}`);
      });

    console.log('\n🎯 AUTO-FIXABLE PATTERNS:');
    const autoFixable = [
      'Record<string, any> → Record<string, unknown>',
      'data: any → data: unknown',
      'props: any → props: ComponentProps',
      'params: any → params: Record<string, unknown>',
      'result: any → result: unknown'
    ];

    autoFixable.forEach(pattern => {
      console.log(`  ✅ ${pattern}`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('  1. Focus on files with >5 any types first');
    console.log('  2. Replace data: any with specific interfaces');
    console.log('  3. Use unknown instead of any for better type safety');
    console.log('  4. Create proper interfaces for API responses');
    console.log('  5. Use Record<string, unknown> for dynamic objects');

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Generate auto-fix suggestions
   */
  generateAutoFixes() {
    console.log('\n🔧 AUTO-FIX SUGGESTIONS:');

    Object.entries(this.results.byFile).forEach(([file, data]) => {
      const relativePath = path.relative(this.rootDir, file);

      data.locations.forEach(location => {
        if (location.content.includes('Record<string, any>')) {
          console.log(`  ${relativePath}:${location.line} - Replace Record<string, any> with Record<string, unknown>`);
        }
        if (location.content.includes('data: any')) {
          console.log(`  ${relativePath}:${location.line} - Replace data: any with data: unknown`);
        }
        if (location.content.includes('props: any')) {
          console.log(`  ${relativePath}:${location.line} - Create proper props interface`);
        }
      });
    });
  }
}

// Run the analysis
const analyzer = new TypeSafetyAnalyzer();
analyzer.analyzeAll();
analyzer.generateAutoFixes();

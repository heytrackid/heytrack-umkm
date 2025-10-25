// Bundle Size Monitoring Script
// Automatically checks bundle sizes and alerts on regressions

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BundleStats {
  timestamp: string;
  totalSize: number;
  chunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
}

class BundleMonitor {
  private static readonly STATS_FILE = path.join(process.cwd(), '.bundle-stats.json');
  private static readonly BUDGET_MB = 500; // 500KB budget

  static async analyzeBundle(): Promise<void> {
    console.log('🔍 Analyzing bundle sizes...\n');

    try {
      // Run build with analysis
      execSync('npm run build:analyze', {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      // Read build output (Next.js puts bundle info in .next/static/chunks)
      const buildDir = path.join(process.cwd(), '.next', 'static', 'chunks');
      const stats = this.analyzeBuildOutput(buildDir);

      console.log('\n📊 Bundle Analysis Results:');
      console.log('='.repeat(50));

      console.log(`📦 Total Bundle Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
      console.log(`🎯 Budget: ${this.BUDGET_MB} KB`);
      console.log(`✅ Status: ${stats.totalSize > this.BUDGET_MB * 1024 ? '❌ OVER BUDGET' : '✅ UNDER BUDGET'}`);

      console.log('\n📋 Largest Chunks:');
      stats.chunks
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach((chunk, index) => {
          console.log(`${index + 1}. ${chunk.name}: ${(chunk.size / 1024).toFixed(2)} KB (${chunk.percentage.toFixed(1)}%)`);
        });

      // Save stats for comparison
      this.saveStats(stats);

      // Check for regressions
      const regression = this.checkForRegressions(stats);
      if (regression) {
        console.log('\n⚠️  Bundle Size Regression Detected!');
        console.log(`📈 Size increased by: ${(regression.increase / 1024).toFixed(2)} KB`);
        console.log('🔍 Consider code splitting or tree shaking optimization');
      }

    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
    }
  }

  private static analyzeBuildOutput(buildDir: string): BundleStats {
    const chunks: Array<{name: string, size: number, percentage: number}> = [];
    let totalSize = 0;

    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found. Run build first.');
    }

    // Read all JS files in chunks directory
    const files = fs.readdirSync(buildDir, { recursive: true })
      .filter((file) => typeof file === 'string' && file.endsWith('.js'))
      .map(file => path.join(buildDir, file as string));

    files.forEach(file => {
      try {
        const stats = fs.statSync(file);
        const fileName = path.basename(file);
        chunks.push({
          name: fileName,
          size: stats.size,
          percentage: 0 // Will calculate after total
        });
        totalSize += stats.size;
      } catch (error) {
        // Skip files that can't be read
      }
    });

    // Calculate percentages
    chunks.forEach(chunk => {
      chunk.percentage = (chunk.size / totalSize) * 100;
    });

    return {
      timestamp: new Date().toISOString(),
      totalSize,
      chunks
    };
  }

  private static saveStats(stats: BundleStats): void {
    try {
      const existingStats = this.loadPreviousStats();
      existingStats.push(stats);

      // Keep only last 10 builds
      if (existingStats.length > 10) {
        existingStats.shift();
      }

      fs.writeFileSync(this.STATS_FILE, JSON.stringify(existingStats, null, 2));
      console.log('\n💾 Bundle stats saved to .bundle-stats.json');
    } catch (error) {
      console.warn('⚠️  Could not save bundle stats:', error);
    }
  }

  private static loadPreviousStats(): BundleStats[] {
    try {
      if (fs.existsSync(this.STATS_FILE)) {
        const parsed = JSON.parse(fs.readFileSync(this.STATS_FILE, 'utf-8'));
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      // Ignore errors
    }
    return [];
  }

  private static checkForRegressions(currentStats: BundleStats): {increase: number} | null {
    const previousStats = this.loadPreviousStats();

    if (previousStats.length === 0) {
      return null; // No previous stats to compare
    }

    const lastStats = previousStats[previousStats.length - 1];
    if (!lastStats) {
      return null; // Safety check in case of unexpected empty elements
    }
    
    const increase = currentStats.totalSize - lastStats.totalSize;

    // Only report significant increases (>5KB)
    if (increase > 5120) {
      return { increase };
    }

    return null;
  }
}

// CLI runner
if (require.main === module) {
  BundleMonitor.analyzeBundle().catch(console.error);
}

export { BundleMonitor };

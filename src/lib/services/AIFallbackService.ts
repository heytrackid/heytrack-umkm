import { logger } from '@/lib/logger';

import type { BusinessContext } from '@/types/features/chat';


// AI Fallback Service - Handles AI service failures gracefully


interface CachedResponse {
  query: string;
  response: string;
  timestamp: number;
}

export class AIFallbackService {
  private static readonly responseCache = new Map<string, CachedResponse>();
  private static readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  /**
   * Get response with fallback strategy
   */
  static async getResponseWithFallback(
    query: string,
    _context: BusinessContext,
    aiServiceFn: () => Promise<string>
  ): Promise<{ response: string; fallbackUsed: boolean }> {
    try {
      // Try primary AI service
      const response = await aiServiceFn();
      
      // Cache successful response
      this.cacheResponse(query, response);
      
      return { response, fallbackUsed: false };
    } catch (error) {
      logger.warn({ error }, 'Primary AI service failed, trying fallback');

      // Try cached response
      const cached = this.getCachedResponse(query);
      if (cached) {
        logger.info('Using cached response');
        return { response: cached, fallbackUsed: true };
      }

      // Try rule-based response
      const ruleBased = this.getRuleBasedResponse(query, _context);
      if (ruleBased) {
        logger.info('Using rule-based response');
        return { response: ruleBased, fallbackUsed: true };
      }

      // Return helpful error message
      const errorResponse = this.getHelpfulError(query, _context);
      return { response: errorResponse, fallbackUsed: true };
    }
  }

  /**
   * Cache a successful response
   */
  private static cacheResponse(query: string, response: string): void {
    const key = this.normalizeQuery(query);
    this.responseCache.set(key, {
      query,
      response,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    this.cleanupCache();
  }

  /**
   * Get cached response if available and not expired
   */
  private static getCachedResponse(query: string): string | null {
      const key = this.normalizeQuery(query);
      const cached = this.responseCache.get(key);

      if (!cached) {return null;}

      const age = Date.now() - cached['timestamp'];
      if (age > this.CACHE_TTL) {
        this.responseCache.delete(key);
        return null;
      }

      return cached.response;
  }

  /**
   * Generate rule-based response for common queries
   */
  private static getRuleBasedResponse(
    query: string,
    _context: BusinessContext
  ): string | null {
    const normalized = query.toLowerCase();

    // HPP-related queries
    if (normalized.includes('hpp') && normalized.includes('naik')) {
      return this.getHppIncreaseResponse(_context);
    }

    if (normalized.includes('hpp') && normalized.includes('turun')) {
      return this.getHppDecreaseResponse();
    }

    // Stock-related queries
    if (
      normalized.includes('stok') || normalized.includes('stock') ||
      normalized.includes('restock')
    ) {
      return this.getStockResponse(_context);
    }

    // Profit-related queries
    if (normalized.includes('profit') || normalized.includes('untung')) {
      return this.getProfitResponse(_context);
    }

    // Recipe-related queries
    if (
      normalized.includes('resep') &&
      (normalized.includes('menguntungkan') || normalized.includes('profit'))
    ) {
      return this.getMostProfitableRecipeResponse(_context);
    }

    return null;
  }

  /**
   * Get helpful error message with manual links
   */
  private static getHelpfulError(
    query: string,
    _context: BusinessContext
  ): string {
    const parts = [
      'Maaf, saya sedang mengalami kendala teknis. Namun, saya bisa membantu Anda dengan cara lain:',
      '',
    ];

    // Add relevant links based on query
    const normalized = query.toLowerCase();

    if (normalized.includes('hpp')) {
      parts.push(
        '📊 **HPP Tracking**: Lihat halaman [HPP](/hpp) untuk analisis lengkap',
        '💡 **Rekomendasi**: Cek [Rekomendasi HPP](/hpp#recommendations)'
      );
    }

    if (normalized.includes('resep') || normalized.includes('recipe')) {
      parts.push(
        '📖 **Resep**: Kelola resep di halaman [Resep](/recipes)',
        '🤖 **AI Generator**: Buat resep baru dengan [AI Generator](/recipes/ai-generator)'
      );
    }

    if (normalized.includes('bahan') || normalized.includes('ingredient')) {
      parts.push(
        '🥕 **Bahan**: Kelola bahan di halaman [Bahan](/ingredients)',
        '📦 **Stok**: Cek stok bahan yang menipis'
      );
    }

    if (normalized.includes('pesanan') || normalized.includes('order')) {
      parts.push(
        '📋 **Pesanan**: Kelola pesanan di halaman [Pesanan](/orders)',
        '📈 **Laporan**: Lihat laporan penjualan'
      );
    }

    // Add general help
    parts.push(
      '',
      '❓ **Bantuan**: Lihat [Tutorial](/docs/tutorial) untuk panduan lengkap',
      '',
      'Silakan coba lagi dalam beberapa saat atau gunakan link di atas untuk mengakses fitur yang Anda butuhkan.'
    );

    return parts.join('\n');
  }

  /**
   * Rule-based response for HPP increase
   */
  private static getHppIncreaseResponse(_context: BusinessContext): string {
    const parts = [
      '📈 **HPP Naik - Analisis & Rekomendasi**',
      '',
      'Beberapa faktor yang mungkin menyebabkan HPP naik:',
      '',
      '1. **Harga Bahan Baku Naik**',
      '   - Cek harga pembelian bahan terbaru',
      '   - Bandingkan dengan supplier lain',
      '',
      '2. **Biaya Operasional Meningkat**',
      '   - Review biaya listrik, gas, dan operasional lainnya',
      '   - Optimalkan penggunaan resources',
      '',
      '3. **Waste/Pemborosan**',
      '   - Periksa penggunaan bahan dalam produksi',
      '   - Kurangi waste dengan portion control yang lebih baik',
      '',
    ];

    if (_context.hpp && _context.hpp.alerts_count > 0) {
      parts.push(
        `⚠️ Anda memiliki ${_context.hpp.alerts_count} alert HPP yang perlu ditinjau.`,
        ''
      );
    }

    parts.push(
      '**Rekomendasi:**',
      '- Lihat detail di halaman [HPP Tracking](/hpp)',
      '- Analisis breakdown biaya per produk',
      '- Pertimbangkan penyesuaian harga jual'
    );

    return parts.join('\n');
  }

  /**
   * Rule-based response for HPP decrease tips
   */
  private static getHppDecreaseResponse(): string {
    return `💡 **Cara Menurunkan HPP**

1. **Optimasi Bahan Baku**
   - Negosiasi harga dengan supplier
   - Beli dalam jumlah besar (bulk) untuk diskon
   - Cari supplier alternatif yang lebih murah

2. **Efisiensi Produksi**
   - Kurangi waste dengan portion control
   - Standardisasi resep dan proses
   - Training tim untuk konsistensi

3. **Manajemen Stok**
   - Gunakan metode FIFO (First In First Out)
   - Hindari overstocking yang menyebabkan expired
   - Monitor stok secara real-time

4. **Review Resep**
   - Substitusi bahan dengan alternatif lebih murah
   - Optimalkan komposisi tanpa mengurangi kualitas
   - Gunakan AI Recipe Generator untuk ide baru

**Lihat analisis lengkap di [HPP Tracking](/hpp)**`;
  }

  /**
   * Rule-based response for stock queries
   */
  private static getStockResponse(_context: BusinessContext): string {
    const lowStock = _context.ingredients?.filter((i) => i.low_stock) ?? [];

    if (lowStock.length === 0) {
      return '✅ **Stok Aman**\n\nSemua bahan memiliki stok yang cukup. Tidak ada yang perlu direstock saat ini.';
    }

    const parts = [
      `⚠️ **Perlu Restock - ${lowStock.length} Bahan**`,
      '',
      'Bahan yang perlu segera direstock:',
      '',
    ];

    lowStock.slice(0, 10).forEach((ing) => {
      parts.push(`- **${ing.name}**: ${ing.stock} ${ing.unit} (stok menipis)`);
    });

    if (lowStock.length > 10) {
      parts.push('', `...dan ${lowStock.length - 10} bahan lainnya`);
    }

    parts.push(
      '',
      '**Rekomendasi:**',
      '- Buat purchase order segera',
      '- Prioritaskan bahan dengan stok paling kritis',
      '- Set reminder untuk restock rutin',
      '',
      'Lihat detail di [Halaman Bahan](/ingredients)'
    );

    return parts.join('\n');
  }

  /**
   * Rule-based response for profit queries
   */
  private static getProfitResponse(_context: BusinessContext): string {
    if (!_context.financial) {
      return 'Untuk melihat analisis profit, silakan kunjungi [Halaman Laporan](/reports)';
    }

    const { total_revenue, total_costs, profit, period } = _context.financial;
    const profitMargin =
      total_revenue > 0 ? (profit / total_revenue) * 100 : 0;

    const parts = [
      `📊 **Ringkasan Profit - ${period}**`,
      '',
      `💰 **Revenue**: Rp ${total_revenue.toLocaleString('id-ID')}`,
      `💸 **Costs**: Rp ${total_costs.toLocaleString('id-ID')}`,
      `${profit >= 0 ? '✅' : '⚠️'} **Profit**: Rp ${profit.toLocaleString('id-ID')}`,
      `📈 **Margin**: ${profitMargin.toFixed(1)}%`,
      '',
    ];

    if (profit < 0) {
      parts.push(
        '**⚠️ Profit Negatif - Action Items:**',
        '1. Review dan kurangi biaya operasional',
        '2. Tingkatkan harga jual (jika memungkinkan)',
        '3. Fokus pada produk dengan margin tinggi',
        '4. Kurangi waste dan inefficiency',
        ''
      );
    } else if (profitMargin < 20) {
      parts.push(
        '**💡 Margin Bisa Ditingkatkan:**',
        '1. Optimasi HPP untuk margin lebih baik',
        '2. Upsell produk dengan margin tinggi',
        '3. Review pricing strategy',
        ''
      );
    } else {
      parts.push('**✅ Performa Bagus!** Pertahankan strategi saat ini.', '');
    }

    parts.push('Lihat analisis lengkap di [Laporan Profit](/reports)');

    return parts.join('\n');
  }

  /**
   * Rule-based response for most profitable recipe
   */
  private static getMostProfitableRecipeResponse(
    _context: BusinessContext
  ): string {
    if (!_context.recipes || _context.recipes.length === 0) {
      return 'Belum ada data resep. Silakan tambahkan resep di [Halaman Resep](/recipes)';
    }

    // Sort by lowest HPP (assuming selling price is similar)
    const sortedRecipes = [..._context.recipes].sort((a, b) => a.hpp - b.hpp);
    const topRecipes = sortedRecipes.slice(0, 5);

    const parts = [
      '🏆 **Resep Paling Menguntungkan**',
      '',
      'Berdasarkan HPP terendah (asumsi harga jual sama):',
      '',
    ];

    topRecipes.forEach((recipe, index) => {
      parts.push(
        `${index + 1}. **${recipe.name}**`,
        `   HPP: Rp ${recipe.hpp.toLocaleString('id-ID')}`,
        ''
      );
    });

    parts.push(
      '💡 **Tips:**',
      '- Fokus promosi pada resep dengan HPP rendah',
      '- Bundling dengan resep margin tinggi',
      '- Review pricing untuk maksimalkan profit',
      '',
      'Lihat analisis lengkap di [Halaman Resep](/recipes)'
    );

    return parts.join('\n');
  }

  /**
   * Normalize query for caching
   */
  private static normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Clean up expired cache entries
   */
  private static cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.responseCache.entries()) {
      if (now - cached['timestamp'] > this.CACHE_TTL) {
        this.responseCache.delete(key);
      }
    }
  }
}
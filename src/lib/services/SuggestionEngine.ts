// @ts-nocheck
// Suggestion Engine - Generates dynamic chat suggestions

import type { ChatSuggestion, BusinessContext } from '@/types/features/chat';

export class SuggestionEngine {
  /**
   * Generate suggestions based on context
   */
  static generateSuggestions(
    context: BusinessContext,
    maxSuggestions = 4
  ): ChatSuggestion[] {
    const suggestions: ChatSuggestion[] = [];

    // Page-specific suggestions
    const pageSuggestions = this.getPageSuggestions(context.currentPage);
    suggestions.push(...pageSuggestions);

    // State-specific suggestions
    const stateSuggestions = this.getStateSuggestions(context);
    suggestions.push(...stateSuggestions);

    // Common suggestions
    const commonSuggestions = this.getCommonSuggestions();
    suggestions.push(...commonSuggestions);

    // Sort by priority and return top N
    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxSuggestions);
  }

  /**
   * Get page-specific suggestions
   */
  private static getPageSuggestions(
    currentPage?: string
  ): ChatSuggestion[] {
    if (!currentPage) {return [];}

    const suggestionsByPage: Record<string, ChatSuggestion[]> = {
      '/recipes': [
        {
          id: 'recipe-1',
          text: 'Resep mana yang paling menguntungkan?',
          category: 'page',
          priority: 10,
        },
        {
          id: 'recipe-2',
          text: 'Bagaimana cara menurunkan HPP resep ini?',
          category: 'page',
          priority: 9,
        },
        {
          id: 'recipe-3',
          text: 'Buat resep baru dengan bahan yang ada',
          category: 'page',
          priority: 8,
        },
      ],
      '/ingredients': [
        {
          id: 'ingredient-1',
          text: 'Bahan apa yang perlu direstock?',
          category: 'page',
          priority: 10,
        },
        {
          id: 'ingredient-2',
          text: 'Analisis tren harga bahan baku',
          category: 'page',
          priority: 9,
        },
        {
          id: 'ingredient-3',
          text: 'Supplier mana yang paling ekonomis?',
          category: 'page',
          priority: 8,
        },
      ],
      '/orders': [
        {
          id: 'order-1',
          text: 'Pesanan mana yang paling urgent?',
          category: 'page',
          priority: 10,
        },
        {
          id: 'order-2',
          text: 'Hitung estimasi waktu produksi',
          category: 'page',
          priority: 9,
        },
        {
          id: 'order-3',
          text: 'Analisis profit pesanan bulan ini',
          category: 'page',
          priority: 8,
        },
      ],
      '/hpp': [
        {
          id: 'hpp-1',
          text: 'Mengapa HPP naik minggu ini?',
          category: 'page',
          priority: 10,
        },
        {
          id: 'hpp-2',
          text: 'Produk mana yang HPP-nya paling tinggi?',
          category: 'page',
          priority: 9,
        },
        {
          id: 'hpp-3',
          text: 'Rekomendasi untuk menurunkan HPP',
          category: 'page',
          priority: 8,
        },
      ],
      '/dashboard': [
        {
          id: 'dashboard-1',
          text: 'Ringkasan bisnis bulan ini',
          category: 'page',
          priority: 10,
        },
        {
          id: 'dashboard-2',
          text: 'Apa yang perlu saya perhatikan hari ini?',
          category: 'page',
          priority: 9,
        },
        {
          id: 'dashboard-3',
          text: 'Bandingkan performa bulan ini vs bulan lalu',
          category: 'page',
          priority: 8,
        },
      ],
    };

    // Find matching page (exact or partial match)
    for (const [path, suggestions] of Object.entries(suggestionsByPage)) {
      if (currentPage.includes(path)) {
        return suggestions;
      }
    }

    return [];
  }

  /**
   * Get state-specific suggestions based on business data
   */
  private static getStateSuggestions(
    context: BusinessContext
  ): ChatSuggestion[] {
    const suggestions: ChatSuggestion[] = [];

    // Low stock alert
    const lowStockCount =
      context.ingredients?.filter((i) => i.low_stock).length || 0;
    if (lowStockCount > 0) {
      suggestions.push({
        id: 'state-low-stock',
        text: `Ada ${lowStockCount} bahan yang stoknya menipis`,
        category: 'state',
        priority: 15,
      });
    }

    // HPP alerts
    if (context.hpp && context.hpp.alerts_count > 0) {
      suggestions.push({
        id: 'state-hpp-alert',
        text: `Lihat ${context.hpp.alerts_count} alert HPP yang belum dibaca`,
        category: 'state',
        priority: 14,
      });
    }

    // HPP trend
    if (context.hpp?.trend === 'up') {
      suggestions.push({
        id: 'state-hpp-trend',
        text: 'HPP sedang naik, apa yang harus dilakukan?',
        category: 'state',
        priority: 13,
      });
    }

    // Negative profit
    if (context.financial && context.financial.profit < 0) {
      suggestions.push({
        id: 'state-negative-profit',
        text: 'Profit negatif bulan ini, bagaimana cara memperbaikinya?',
        category: 'state',
        priority: 16,
      });
    }

    // Recent orders
    const recentOrdersCount = context.orders?.length || 0;
    if (recentOrdersCount > 5) {
      suggestions.push({
        id: 'state-busy-orders',
        text: `Analisis ${recentOrdersCount} pesanan terbaru`,
        category: 'state',
        priority: 12,
      });
    }

    return suggestions;
  }

  /**
   * Get common suggestions
   */
  private static getCommonSuggestions(): ChatSuggestion[] {
    return [
      {
        id: 'common-1',
        text: 'Bagaimana cara menggunakan fitur ini?',
        category: 'common',
        priority: 5,
      },
      {
        id: 'common-2',
        text: 'Tips untuk meningkatkan profit',
        category: 'common',
        priority: 6,
      },
      {
        id: 'common-3',
        text: 'Cara menghitung HPP yang akurat',
        category: 'common',
        priority: 5,
      },
      {
        id: 'common-4',
        text: 'Strategi pricing yang efektif',
        category: 'common',
        priority: 5,
      },
    ];
  }

  /**
   * Get contextual suggestions based on recent activity
   */
  static getContextualSuggestions(
    recentMessages: string[]
  ): ChatSuggestion[] {
    const suggestions: ChatSuggestion[] = [];

    // Analyze recent messages for context
    const hasAskedAboutHpp = recentMessages.some((msg) =>
      msg.toLowerCase().includes('hpp')
    );
    const hasAskedAboutRecipes = recentMessages.some((msg) =>
      msg.toLowerCase().includes('resep')
    );

    if (hasAskedAboutHpp) {
      suggestions.push({
        id: 'contextual-hpp-followup',
        text: 'Lihat detail breakdown HPP',
        category: 'contextual',
        priority: 11,
      });
    }

    if (hasAskedAboutRecipes) {
      suggestions.push({
        id: 'contextual-recipe-followup',
        text: 'Bandingkan dengan resep lain',
        category: 'contextual',
        priority: 11,
      });
    }

    return suggestions;
  }
}

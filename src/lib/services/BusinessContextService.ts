// Business Context Service - Aggregates business data for AI context

import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated'
import type {
  BusinessContext,
  RecipeSummary,
  IngredientSummary,
  OrderSummary,
  HppSummary,
  FinancialSummary,
  QuickStat,
  BusinessInsight,
} from '@/types/features/chat'
import { logger } from '@/lib/logger';

const CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class BusinessContextService {
  /**
   * Load full business context for user
   */
  static async loadContext(
    userId: string,
    currentPage?: string
  ): Promise<BusinessContext> {
    const startTime = Date.now();

    try {
      // Try to get from cache first
      const cached = await this.getCachedContext(userId);
      if (cached) {
        logger.info({ userId }, 'Using cached business context');
        return { ...cached, currentPage };
      }

      // Load fresh context
      const context = await this.loadFreshContext(userId, currentPage)

      // Cache the result
      await this.cacheContext(userId, context);

      const duration = Date.now() - startTime;
      logger.info({ userId, duration }, 'Business context loaded');

      return context;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to load business context');
      // Return minimal context on error
      return { currentPage, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Load fresh context from database
   */
  private static async loadFreshContext(
    userId: string,
    currentPage?: string
  ): Promise<BusinessContext> {
    const supabase = await createClient()

    const [recipes, ingredients, orders, hpp, financial, insights, quickStats] =
      await Promise.all([
        this.loadRecipes(supabase, userId),
        this.loadIngredients(supabase, userId),
        this.loadOrders(supabase, userId),
        this.loadHpp(supabase, userId),
        this.loadFinancial(supabase, userId),
        this.loadInsights(supabase, userId),
        this.loadQuickStats(supabase, userId),
      ])

    return {
      recipes,
      ingredients,
      orders,
      hpp,
      financial,
      businessInsights: insights,
      quickStats,
      currentPage,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Load top recipes by usage
   */
  private static async loadRecipes(
    supabase: ReturnType<typeof createClient>,
    userId: string
  ): Promise<RecipeSummary[]> {
    const { data } = await supabase
      .from('recipes')
      .select('id, name, hpp')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return data || [];
  }

  /**
   * Load ingredients with low stock priority
   */
  private static async loadIngredients(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
  ): Promise<IngredientSummary[]> {
    const { data } = await supabase
      .from('ingredients')
      .select('id, name, stock, unit, minimum_stock')
      .eq('user_id', userId)
      .order('stock', { ascending: true })
      .limit(20);

    return (
      data?.map((ing) => ({
        id: ing.id,
        name: ing.name,
        stock: ing.stock,
        unit: ing.unit,
        low_stock: ing.stock <= (ing.minimum_stock || 0),
      })) || []
    );
  }

  /**
   * Load recent orders
   */
  private static async loadOrders(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
  ): Promise<OrderSummary[]> {
    const { data } = await supabase
      .from('orders')
      .select('id, customer_name, total_amount, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return data || [];
  }

  /**
   * Load HPP summary
   */
  private static async loadHpp(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
  ): Promise<HppSummary> {
    // Get latest HPP snapshot
    const { data: snapshot } = await supabase
      .from('hpp_snapshots')
      .select('average_hpp, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2);

    // Get unread alerts count
    const { count: alertsCount } = await supabase
      .from('hpp_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    const current = snapshot?.[0];
    const previous = snapshot?.[1];

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (current && previous) {
      const diff = current.average_hpp - previous.average_hpp;
      if (diff > 0.05) {trend = 'up';}
      else if (diff < -0.05) {trend = 'down';}
    }

    return {
      average_hpp: current?.average_hpp || 0,
      trend,
      alerts_count: alertsCount || 0,
      last_updated: current?.created_at || new Date().toISOString(),
    };
  }

  /**
   * Load financial summary for current month
   */
  private static async loadFinancial(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
  ): Promise<FinancialSummary> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get revenue from orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    const totalRevenue =
      orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Get costs from operational_costs and ingredient_purchases
    const { data: opCosts } = await supabase
      .from('operational_costs')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString());

    const { data: purchases } = await supabase
      .from('ingredient_purchases')
      .select('total_price')
      .eq('user_id', userId)
      .gte('purchase_date', startOfMonth.toISOString());

    const totalCosts =
      (opCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0) +
      (purchases?.reduce((sum, purchase) => sum + purchase.total_price, 0) ||
        0);

    return {
      total_revenue: totalRevenue,
      total_costs: totalCosts,
      profit: totalRevenue - totalCosts,
      period: startOfMonth.toISOString().substring(0, 7), // YYYY-MM
    };
  }

  /**
   * Get cached context if available and not expired
   */
  private static async getCachedContext(
    userId: string
  ): Promise<BusinessContext | null> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('chat_context_cache')
      .select('data, expires_at')
      .eq('user_id', userId)
      .eq('context_type', 'full_context')
      .single();

    if (!data) {return null;}

    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    return data.data as BusinessContext;
  }

  /**
   * Cache context with TTL
   */
  private static async cacheContext(
    userId: string,
    context: BusinessContext
  ): Promise<void> {
    const supabase = await createClient();

    const expiresAt = new Date(Date.now() + CONTEXT_CACHE_TTL);

    await supabase.from('chat_context_cache').upsert({
      user_id: userId,
      context_type: 'full_context',
      data: context,
      expires_at: expiresAt.toISOString(),
    });
  }

  /**
   * Invalidate cached context
   */
  static async invalidateCache(userId: string): Promise<void> {
    const supabase = await createClient();

    await supabase
      .from('chat_context_cache')
      .delete()
      .eq('user_id', userId)
      .eq('context_type', 'full_context');

    logger.info({ userId }, 'Context cache invalidated');
  }

  /**
   * Format context for AI prompt
   */
  static formatForPrompt(context: BusinessContext): string {
    const parts: string[] = [];

    if (context.currentPage) {
      parts.push(`Current page: ${context.currentPage}`);
    }

    if (context.recipes && context.recipes.length > 0) {
      parts.push(
        `\nRecipes (${context.recipes.length}):`,
        context.recipes
          .map((r) => `- ${r.name} (HPP: Rp ${r.hpp.toLocaleString('id-ID')})`)
          .join('\n')
      );
    }

    if (context.ingredients && context.ingredients.length > 0) {
      const lowStock = context.ingredients.filter((i) => i.low_stock);
      if (lowStock.length > 0) {
        parts.push(
          `\nLow stock ingredients (${lowStock.length}):`,
          lowStock.map((i) => `- ${i.name}: ${i.stock} ${i.unit}`).join('\n')
        );
      }
    }

    if (context.hpp) {
      parts.push(
        `\nHPP Status:`,
        `- Average HPP: Rp ${context.hpp.average_hpp.toLocaleString('id-ID')}`,
        `- Trend: ${context.hpp.trend}`,
        `- Unread alerts: ${context.hpp.alerts_count}`
      );
    }

    if (context.financial) {
      parts.push(
        `\nFinancial Summary (${context.financial.period}):`,
        `- Revenue: Rp ${context.financial.total_revenue.toLocaleString('id-ID')}`,
        `- Costs: Rp ${context.financial.total_costs.toLocaleString('id-ID')}`,
        `- Profit: Rp ${context.financial.profit.toLocaleString('id-ID')}`
      );
    }

    if (context.businessInsights && context.businessInsights.length > 0) {
      parts.push(
        `\nBusiness Insights (${context.businessInsights.length}):`,
        context.businessInsights
          .slice(0, 5)
          .map(
            (insight) =>
              `- ${insight.title} [${insight.category}] (confidence ${Math.round(
                insight.confidence * 100
              )}%)${insight.impact ? ` impact: ${insight.impact}` : ''}`
          )
          .join('\n')
      )
    }

    if (context.quickStats && context.quickStats.length > 0) {
      parts.push(
        `\nKey Metrics:`,
        context.quickStats
          .slice(0, 5)
          .map((stat) => {
            const base = `- ${stat.label}: ${stat.value}`
            const trend = stat.trend ? ` (trend: ${stat.trend}${stat.delta ? `, Δ ${stat.delta}%` : ''})` : ''
            return `${base}${trend}`
          })
          .join('\n')
      )
    }

    return parts.join('\n')
  }

  private static async loadInsights(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
  ): Promise<BusinessInsight[]> {
    const { data } = await supabase
      .from('business_insights')
      .select('id, title, summary, category, confidence, impact, action_items, sources')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    return (
      data?.map((insight) => ({
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
        category: insight.category,
        confidence: insight.confidence,
        impact: insight.impact,
        actionItems: insight.action_items || undefined,
        sources: insight.sources || undefined,
      })) || []
    )
  }

  private static async loadQuickStats(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
  ): Promise<QuickStat[]> {
    const { data } = await supabase
      .from('business_quick_stats')
      .select('label, value, trend, delta, context')
      .eq('user_id', userId)
      .order('priority', { ascending: true })
      .limit(10)

    return (
      data?.map((stat) => ({
        label: stat.label,
        value: stat.value,
        trend: stat.trend || undefined,
        delta: stat.delta || undefined,
        context: stat.context || undefined,
      })) || []
    )
  }
}

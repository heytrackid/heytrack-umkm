import { logger } from '@/lib/logger';
import { BaseService, type ServiceContext } from '@/services/base';

import type { Json } from '@/types/database';
import type {
    BusinessContext,
    BusinessInsight,
    FinancialSummary,
    HppSummary,
    IngredientSummary,
    OrderSummary,
    QuickStat,
    RecipeSummary,
} from '@/types/features/chat';

// Business Context Service - Aggregates business data for AI context

const CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class BusinessContextService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }
  /**
   * Load full business context for user
   */
  async loadContext(currentPage?: string): Promise<BusinessContext> {
    const startTime = Date.now();

    try {
      // Try to get from cache first
      const cached = await this.getCachedContext();
      if (cached) {
        logger.info({ userId: this.context.userId }, 'Using cached business context');
        return { ...cached, ...(currentPage && { currentPage }) };
      }

      // Load fresh context
      const context = await this.loadFreshContext(currentPage)

      // Cache the result
      void this.cacheContext(context);

      const duration = Date.now() - startTime;
      logger.info({ userId: this.context.userId, duration }, 'Business context loaded');

      return context;
    } catch (error) {
      logger.error({ error, userId: this.context.userId }, 'Failed to load business context');
      // Return minimal context on error
      const result: BusinessContext = { timestamp: new Date().toISOString() };
      if (currentPage) result.currentPage = currentPage;
      return result;
    }
  }

  /**
   * Load fresh context from database
   */
  private async loadFreshContext(currentPage?: string): Promise<BusinessContext> {
    const [recipes, ingredients, orders, hpp, financial, insights, quickStats] =
      await Promise.all([
        this.loadRecipes(),
        this.loadIngredients(),
        this.loadOrders(),
        this.loadHpp(),
        this.loadFinancial(),
        this.loadInsights(),
        this.loadQuickStats(),
      ])

    return {
      recipes,
      ingredients,
      orders,
      hpp,
      financial,
      businessInsights: insights,
      quickStats,
      ...(currentPage && { currentPage }),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Load top recipes by usage
   */
  private async loadRecipes(): Promise<RecipeSummary[]> {
    const { data } = await this.context.supabase
      .from('recipes')
      .select('id, name, cost_per_unit')
      .eq('user_id', this.context.userId)
      .order('created_at', { ascending: false })
      .limit(100);

    return data?.map(r => {
      const typed = r as unknown as { id: string; name: string; cost_per_unit: number | null } // Type assertion for RLS
      return {
        id: typed.id,
        name: typed.name,
        hpp: typed.cost_per_unit ?? 0
      }
    }) ?? [];
  }

  /**
   * Load ingredients with low stock priority
   */
  private async loadIngredients(): Promise<IngredientSummary[]> {
    const { data } = await this.context.supabase
      .from('ingredients')
      .select('id, name, current_stock, unit, min_stock')
      .eq('user_id', this.context.userId)
      .order('current_stock', { ascending: true })
      .limit(20);

    return (
      data?.map((ing) => {
        const typed = ing as unknown as { id: string; name: string; current_stock: number | null; unit: string; min_stock: number | null } // Type assertion for RLS
        return {
          id: typed.id,
          name: typed.name,
          stock: typed.current_stock ?? 0,
          unit: typed.unit,
          low_stock: (typed.current_stock ?? 0) <= (typed.min_stock ?? 0),
        }
      }) ?? []
    );
  }

  /**
   * Load recent orders
   */
  private async loadOrders(): Promise<OrderSummary[]> {
    const { data } = await this.context.supabase
      .from('orders')
      .select('id, customer_name, total_amount, status, created_at')
      .eq('user_id', this.context.userId)
      .order('created_at', { ascending: false })
      .limit(100);

    return (data ?? []).map(order => {
      const typed = order as unknown as { id: string; customer_name: string | null; total_amount: number | null; status: string | null; created_at: string | null } // Type assertion for RLS
      return {
        id: typed.id,
        customer_name: typed.customer_name ?? 'Unknown customer',
        total_amount: typed.total_amount ?? 0,
        status: typed['status'] ?? 'UNKNOWN',
        created_at: typed.created_at ?? new Date().toISOString()
      }
    });
  }

  /**
   * Load HPP summary
   */
  private async loadHpp(): Promise<HppSummary> {
    // Get latest HPP calculations
    const { data: calculations } = await this.context.supabase
      .from('hpp_calculations')
      .select('total_hpp, created_at')
      .eq('user_id', this.context.userId)
      .order('created_at', { ascending: false })
      .limit(2);

    const alertsCount = 0;

    const current = calculations?.[0] as unknown as Record<string, unknown>; // Type assertion for RLS
    const previous = calculations?.[1] as unknown as Record<string, unknown>; // Type assertion for RLS

    let trend: 'down' | 'stable' | 'up' = 'stable';
    if (current && previous) {
      const diff = (current['total_hpp'] as number) - (previous['total_hpp'] as number);
      if (diff > 0.05) {trend = 'up';}
      else if (diff < -0.05) {trend = 'down';}
    }

    return {
      average_hpp: (current?.['total_hpp'] as number) ?? 0,
      trend,
      alerts_count: alertsCount || 0,
      last_updated: (current?.['created_at'] as string) ?? new Date().toISOString(),
    };
  }

  /**
   * Load financial summary for current month
   */
  private async loadFinancial(): Promise<FinancialSummary> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get revenue from orders
    const { data: orders } = await this.context.supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', this.context.userId)
      .gte('created_at', startOfMonth.toISOString());

    const totalRevenue =
      orders?.reduce((sum, order) => sum + ((order as { total_amount: number }).total_amount ?? 0), 0) ?? 0;

    // Get costs from operational_costs and ingredient_purchases
    const { data: opCosts } = await this.context.supabase
      .from('operational_costs')
      .select('amount')
      .eq('user_id', this.context.userId)
      .gte('date', startOfMonth.toISOString());

    const { data: purchases } = await this.context.supabase
      .from('ingredient_purchases')
      .select('total_price')
      .eq('user_id', this.context.userId)
      .gte('purchase_date', startOfMonth.toISOString());

    const totalCosts =
      (opCosts?.reduce((sum, cost) => sum + (cost as { amount: number }).amount, 0) ?? 0) +
      (purchases?.reduce((sum, purchase) => sum + (purchase as { total_price: number }).total_price, 0) ??
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
  private async getCachedContext(): Promise<BusinessContext | null> {
    const { data } = await this.context.supabase
      .from('chat_context_cache')
      .select('data, expires_at')
      .eq('user_id', this.context.userId)
      .eq('context_type', 'full_context')
      .single();

    if (!data) {return null;}

    const typedData = data as unknown as { expires_at: string } // Type assertion for RLS
    const expiresAt = new Date(typedData.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    return data['data'] as BusinessContext;
  }

  /**
   * Cache context with TTL
   */
  private async cacheContext(context: BusinessContext): Promise<void> {
    const expiresAt = new Date(Date.now() + CONTEXT_CACHE_TTL);

    const serializableContext = JSON.parse(JSON.stringify(context)) as Json

    await this.context.supabase.from('chat_context_cache').upsert({
      user_id: this.context.userId,
      context_type: 'full_context',
      data: serializableContext,
      expires_at: expiresAt.toISOString(),
    } as never);
  }

  /**
   * Invalidate cached context
   */
  async invalidateCache(): Promise<void> {
    await this.context.supabase
      .from('chat_context_cache')
      .delete()
      .eq('user_id', this.context.userId)
      .eq('context_type', 'full_context');

    logger.info({ userId: this.context.userId }, 'Context cache invalidated');
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

  private loadInsights(): Promise<BusinessInsight[]> {
    // Return empty array for now - business_insights table may not exist yet
    return Promise.resolve([])
  }

  private loadQuickStats(): Promise<QuickStat[]> {
    // Return empty array for now - business_quick_stats table may not exist yet
    return Promise.resolve([])
  }
}

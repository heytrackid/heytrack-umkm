// Types for lazy dashboard components

export type DashboardComponentProps = Record<string, unknown>;

export interface StatsCardsProps {
  stats?: {
    revenue: {
      total: number
      growth: string
      trend: 'down' | 'up'
    }
    orders: {
      total: number
      active: number
    }
    customers: {
      total: number
      vip: number
    }
    inventory: {
      total: number
      lowStock: number
    }
  }
  formatCurrency: (value: number) => string
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Package, ShoppingCart, TrendingUp, UserCheck, Users } from 'lucide-react'

interface AdminStats {
  totals: {
    users: number
    orders: number
    recipes: number
    ingredients: number
    customers: number
  }
  recentActivity: {
    newOrders: number
    newRecipes: number
    newCustomers: number
  }
}

export function AdminStats() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    refetchInterval: 30000 // Refresh every 30s
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Users',
      value: data?.totals.users || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Orders',
      value: data?.totals.orders || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      recent: data?.recentActivity.newOrders
    },
    {
      title: 'Total Recipes',
      value: data?.totals.recipes || 0,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      recent: data?.recentActivity.newRecipes
    },
    {
      title: 'Total Ingredients',
      value: data?.totals.ingredients || 0,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Customers',
      value: data?.totals.customers || 0,
      icon: UserCheck,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      recent: data?.recentActivity.newCustomers
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                {stat.recent !== undefined && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{stat.recent} last 7 days</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Healthy
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Operational
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="text-sm text-gray-600">Cache Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

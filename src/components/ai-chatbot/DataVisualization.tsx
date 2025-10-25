'use client';
import * as React from 'react'

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Package, Users, Calendar } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

// Dynamically import Recharts components to reduce bundle size
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false })

// Type definitions for data structures
interface ChartEntry {
  name: string
  value: number
  color: string
}

interface Customer {
  name: string
  total_spent?: number
  total_orders?: number
}

interface Recipe {
  name: string
  total_revenue?: number
  times_made?: number
}

interface InventoryItem {
  name: string
  current_stock: number
  unit: string
}

interface FinancialData {
  revenue: number
  costs: number
  profitMargin: number
}

interface InventoryData {
  criticalItems: InventoryItem[]
  alerts: unknown[]
  recommendations: string[]
}

interface CustomerData {
  topCustomers: Customer[]
  summary: string
}

interface ProductData {
  topRecipes: Recipe[]
  recommendations: string[]
}

interface AnalysisData {
  analysis: {
    financial: FinancialData
    inventory: InventoryData
    recipes: ProductData
    customers: CustomerData
  }
}

interface DataVisualizationProps {
  type: 'financial' | 'inventory' | 'customers' | 'products' | 'analysis';
  data: unknown;
  compact?: boolean;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ type, data, compact = false }) => {
  const { formatCurrency } = useCurrency();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatNumber = (value: number) =>
    new Intl.NumberFormat.format;

  // Financial Performance Visualization
  const FinancialChart = ({ data }: { data: FinancialData }) => {
    const chartData: ChartEntry[] = [
      {
        name: 'Revenue',
        value: data.revenue,
        color: '#00C49F'
      },
      {
        name: 'Costs',
        value: data.costs,
        color: '#FF8042'
      },
      {
        name: 'Profit',
        value: data.revenue - data.costs,
        color: data.revenue - data.costs > 0 ? '#0088FE' : '#FF4444'
      }
    ];

    const marginStatus = data.profitMargin > 25 ? 'success' : data.profitMargin > 15 ? 'warning' : 'danger';
    
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Financial Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.revenue)}</div>
                <div className="text-sm text-gray-500">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(data.costs)}</div>
                <div className="text-sm text-gray-500">Costs</div>
              </div>
              <div className="text-center col-span-2 md:col-span-1">
                <div className="flex items-center justify-center space-x-2">
                  <div className={`text-2xl font-bold ${
                    marginStatus === 'success' ? 'text-green-600' :
                    marginStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {data.profitMargin.toFixed(1)}%
                  </div>
                  {marginStatus === 'success' ? <TrendingUp className="h-5 w-5 text-green-600" /> :
                   marginStatus === 'warning' ? <AlertCircle className="h-5 w-5 text-yellow-600" /> :
                   <TrendingDown className="h-5 w-5 text-red-600" />}
                </div>
                <div className="text-sm text-gray-500">Profit Margin</div>
              </div>
            </div>

            {/* Chart */}
            {!compact && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {chartData.map((entry: ChartEntry, index: number) => (
                        <Cell key={`cell-${_index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Margin progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profit Margin Status</span>
                <span className="font-medium">{data.profitMargin.toFixed(1)}% / 30% target</span>
              </div>
              <Progress 
                value={Math.min(data.profitMargin, 30) / 30 * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Inventory Status Visualization
  const InventoryChart = ({ data }: { data: InventoryData }) => {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Inventory Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Critical items alert */}
            {data.criticalItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">
                    {data.criticalItems.length} Critical Items
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {data.criticalItems.slice(0, 3).map((item: InventoryItem, index: number) => (
                    <div key={index} className="text-sm text-red-700">
                      • {item.name}: {item.current_stock} {item.unit} remaining
                    </div>
                  ))}
                  {data.criticalItems.length > 3 && (
                    <div className="text-sm text-red-600 font-medium">
                     {data.criticalItems.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.alerts.length}</div>
                <div className="text-sm text-gray-600">Low Stock Items</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.criticalItems.length}</div>
                <div className="text-sm text-gray-600">Critical Items</div>
              </div>
            </div>

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recommendations:</h4>
                {data.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">•</Badge>
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Customer Analysis Visualization
  const CustomerChart = ({ data }: { data: CustomerData }) => {
    const pieData = data.topCustomers.slice(0, 5).map((customer: Customer, index: number) => ({
      name: customer.name,
      value: customer.total_spent || 0,
      color: COLORS[index % COLORS.length]
    }));

    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Customer Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{data.topCustomers.length}</div>
                <div className="text-sm text-gray-500">Total Customers</div>
              </div>
              <div>
                <div className="text-xl font-bold">{data.summary.split('T')[1]?.split('T')[1]?.replace(')', '') || 'N/A'}</div>
                <div className="text-sm text-gray-500">Retention Rate</div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-xl font-bold">{data.summary.split('T')[1] || 'N/A'}</div>
                <div className="text-sm text-gray-500">Avg Order Value</div>
              </div>
            </div>

            {/* Top customers chart */}
            {!compact && pieData.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, _index) => (
                        <Cell key={`cell-${_index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top customers list */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Top Customers:</h4>
              {data.topCustomers.slice(0, 3).map((customer: Customer, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{customer.name}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(customer.total_spent || 0)}</div>
                    <div className="text-xs text-gray-500">{customer.total_orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Product Analysis Visualization
  const ProductChart = ({ data }: { data: ProductData }) => {
    const chartData = data.topRecipes.slice(0, 5).map((recipe: Recipe) => ({
      name: recipe.name.length > 10 ? recipe.name.substring(0, 10) + '...' : recipe.name,
      revenue: recipe.total_revenue || 0,
      count: recipe.times_made || 0
    }));

    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-orange-600" />
            <span>Product Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            {!compact && chartData.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                    <Tooltip formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                      name === 'revenue' ? 'Revenue' : 'Sales Count'
                    ]} />
                    <Bar dataKey="revenue" fill="#FF8042" />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top products list */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Best Selling Products:</h4>
              {data.topRecipes.slice(0, 3).map((recipe: Recipe, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{recipe.name}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(recipe.total_revenue || 0)}</div>
                    <div className="text-xs text-gray-500">{recipe.times_made}x sold</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recommendations:</h4>
                {data.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">•</Badge>
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Comprehensive Analysis Dashboard
  const AnalysisChart = ({ data }: { data: AnalysisData }) => {
    const { financial, inventory, recipes, customers } = data.analysis;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataVisualization type="financial" data={financial} compact />
          <DataVisualization type="inventory" data={inventory} compact />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataVisualization type="products" data={recipes} compact />
          <DataVisualization type="customers" data={customers} compact />
        </div>
      </div>
    );
  };

  // Render appropriate chart based on type
  switch (type) {
    case 'financial':
      return <FinancialChart data={data} />;
    case 'inventory':
      return <InventoryChart data={data} />;
    case 'customers':
      return <CustomerChart data={data} />;
    case 'products':
      return <ProductChart data={data} />;
    case 'analysis':
      return <AnalysisChart data={data} />;
    default:
      return (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-gray-500">
              Data visualization not available for this type.
            </div>
          </CardContent>
        </Card>
      );
  }
};

export default DataVisualization;
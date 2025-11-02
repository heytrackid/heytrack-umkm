'use client'

import type { CustomersTable, RecipesTable } from '@/types/database'
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { useMemo } from 'react';


type Customer = CustomersTable
type Recipe = RecipesTable

// Dynamically import Recharts components to reduce bundle size
const BarChart = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.BarChart),
  { ssr: false }
)
const Bar = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.Tooltip),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
)
const Cell = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.Cell),
  { ssr: false }
)


// Type definitions for data structures
interface ChartEntry {
  name: string
  value: number
  color: string
}

// Extended types for visualization
interface CustomerForViz extends Omit<Customer, 'total_spent' | 'total_orders'> {
  total_spent?: number
  total_orders?: number
}

interface RecipeForViz extends Omit<Recipe, 'total_revenue' | 'times_made'> {
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
  topCustomers: CustomerForViz[]
  summary: string
}

interface ProductData {
  topRecipes: RecipeForViz[]
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

// Standalone components extracted from the main component
const FinancialChart = ({ data, compact = false, formatCurrency, COLORS }: {
  data: FinancialData;
  compact?: boolean;
  formatCurrency: (value: number) => string;
  COLORS: string[];
}) => {
  const chartData: ChartEntry[] = useMemo(() => [
    {
      name: 'Revenue',
      value: data.revenue,
      color: '#10B981'
    },
    {
      name: 'Costs',
      value: data.costs,
      color: '#EF4444'
    },
    {
      name: 'Profit',
      value: data.revenue - data.costs,
      color: '#3B82F6'
    }
  ], [data.revenue, data.costs]);

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{formatCurrency(data.revenue)}</div>
              <div className="text-sm text-gray-500">Revenue</div>
            </div>
            <div>
              <div className="text-xl font-bold">{formatCurrency(data.costs)}</div>
              <div className="text-sm text-gray-500">Costs</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(data.revenue - data.costs)}
              </div>
              <div className="text-sm text-gray-500">Profit</div>
            </div>
            <div>
              <div className={`text-xl font-bold ${data.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.profitMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Margin</div>
            </div>
          </div>

          {/* Profit chart */}
          {!compact && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights */}
          {!compact && (
            <div className="space-y-2">
              <h4 className="font-medium">Key Insights</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Revenue is growing steadily with {data.profitMargin.toFixed(1)}% profit margin</li>
                <li>Consider optimizing costs to increase profitability</li>
                <li>Diversifying product offerings can boost revenue streams</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Placeholder components for other chart types
const InventoryChart = ({ data, compact, formatCurrency, COLORS }: { data: InventoryData; compact?: boolean; formatCurrency: (value: number) => string; COLORS: string[] }) => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Inventory visualization</div></CardContent></Card>
);

const CustomerChart = ({ data, compact, formatCurrency, COLORS }: { data: CustomerData; compact?: boolean; formatCurrency: (value: number) => string; COLORS: string[] }) => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Customer visualization</div></CardContent></Card>
);

const ProductChart = ({ data, compact, formatCurrency, COLORS }: { data: ProductData; compact?: boolean; formatCurrency: (value: number) => string; COLORS: string[] }) => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Product visualization</div></CardContent></Card>
);

const AnalysisChart = ({ data, compact, formatCurrency, COLORS }: { data: AnalysisData; compact?: boolean; formatCurrency: (value: number) => string; COLORS: string[] }) => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Analysis visualization</div></CardContent></Card>
);

const DataVisualization = ({ type, data, compact = false }: DataVisualizationProps) => {
  const { formatCurrency } = useCurrency();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Product Analysis Visualization

  const isFinancialData = (data: unknown): data is FinancialData => {
    if (!data || typeof data !== 'object') { return false; }
    return 'revenue' in data || 'profit' in data || 'expenses' in data;
  };

  const isInventoryData = (data: unknown): data is InventoryData => {
    if (!data || typeof data !== 'object') { return false; }
    return 'criticalItems' in data && 'alerts' in data && Array.isArray((data as InventoryData).criticalItems);
  };

  const isCustomerData = (data: unknown): data is CustomerData => {
    if (!data || typeof data !== 'object') { return false; }
    return 'topCustomers' in data && 'summary' in data && Array.isArray((data as CustomerData).topCustomers);
  };

  const isProductData = (data: unknown): data is ProductData => {
    if (!data || typeof data !== 'object') { return false; }
    return 'topRecipes' in data && 'recommendations' in data && Array.isArray((data as ProductData).topRecipes);
  };

  const isAnalysisData = (data: unknown): data is AnalysisData => {
    if (!data || typeof data !== 'object') { return false; }
    return 'analysis' in data && typeof (data as AnalysisData).analysis === 'object';
  };

  // Render appropriate chart based on type
  switch (type) {
    case 'financial':
      if (isFinancialData(data)) {
        return <FinancialChart data={data} compact={compact} formatCurrency={formatCurrency} COLORS={COLORS} />;
      }
      break;
    case 'inventory':
      if (isInventoryData(data)) {
        return <InventoryChart data={data} compact={compact} formatCurrency={formatCurrency} COLORS={COLORS} />;
      }
      break;
    case 'customers':
      if (isCustomerData(data)) {
        return <CustomerChart data={data} compact={compact} formatCurrency={formatCurrency} COLORS={COLORS} />;
      }
      break;
    case 'products':
      if (isProductData(data)) {
        return <ProductChart data={data} compact={compact} formatCurrency={formatCurrency} COLORS={COLORS} />;
      }
      break;
    case 'analysis':
      if (isAnalysisData(data)) {
        return <AnalysisChart data={data} compact={compact} formatCurrency={formatCurrency} COLORS={COLORS} />;
      }
      break;
    default:
      break;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center text-gray-500">
          Data visualization not available for this type or data validation failed.
        </div>
      </CardContent>
    </Card>
  );
};

export default DataVisualization;

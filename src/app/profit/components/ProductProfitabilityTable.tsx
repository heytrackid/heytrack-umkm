import { TrendingDown, TrendingUp } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { ProfitData } from '@/app/profit/components/types'


interface ProductProfitabilityTableProps {
  products: ProfitData['products']
  formatCurrency: (amount: number) => string
}

export const ProductProfitabilityTable = ({
  products,
  formatCurrency
}: ProductProfitabilityTableProps) => {
  // Function to determine badge variant based on margin
  const getMarginBadgeVariant = (margin: number) => {
    if (margin >= 30) {
      return 'default'
    }
    if (margin >= 15) {
      return 'secondary'
    }
    return 'destructive'
  }

  // Function to get profit trend indicator
  const getProfitTrend = (margin: number) => {
    if (margin >= 30) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    }
    if (margin >= 15) {
      return <TrendingUp className="h-4 w-4 text-yellow-600" />
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  return (
    <Card className="border-0 ">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detail Profitabilitas Produk
            </CardTitle>
            <CardDescription>
              Analisis keuntungan per produk menggunakan WAC
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {products.length} produk
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-background/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
              <tr>
                <th className="text-left py-3 px-4 font-medium rounded-l-lg">Produk</th>
                <th className="text-right py-3 px-4 font-medium">Terjual</th>
                <th className="text-right py-3 px-4 font-medium">Pendapatan</th>
                <th className="text-right py-3 px-4 font-medium">HPP</th>
                <th className="text-right py-3 px-4 font-medium">Laba</th>
                <th className="text-right py-3 px-4 font-medium rounded-r-lg">Margin</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).map((product, index) => (
                <tr 
                  key={index}
                  className="border-b hover:bg-accent transition-colors last:border-b-0 even:bg-muted/30"
                >
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      {getProfitTrend(product.profit_margin)}
                      <span>{product.product_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{product.quantity_sold}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(product.revenue)}</td>
                  <td className="py-3 px-4 text-right text-orange-600">
                    {formatCurrency(product.cogs)}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatCurrency(product.profit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={getMarginBadgeVariant(product.profit_margin)}>
                      {product.profit_margin.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

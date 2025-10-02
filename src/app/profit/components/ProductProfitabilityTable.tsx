import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProductProfit } from '../constants'

interface ProductProfitabilityTableProps {
  products: ProductProfit[]
  formatCurrency: (amount: number) => string
}

export function ProductProfitabilityTable({
  products,
  formatCurrency
}: ProductProfitabilityTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Profitabilitas Produk</CardTitle>
        <CardDescription>
          Analisis keuntungan per produk menggunakan WAC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Produk</th>
                <th className="text-right py-3 px-4 font-medium">Terjual</th>
                <th className="text-right py-3 px-4 font-medium">Pendapatan</th>
                <th className="text-right py-3 px-4 font-medium">HPP</th>
                <th className="text-right py-3 px-4 font-medium">Laba</th>
                <th className="text-right py-3 px-4 font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).map((product, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{product.product_name}</td>
                  <td className="py-3 px-4 text-right">{product.quantity_sold}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(product.revenue)}</td>
                  <td className="py-3 px-4 text-right text-orange-600">
                    {formatCurrency(product.cogs)}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    product.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(product.profit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={product.profit_margin >= 30 ? 'default' : 'secondary'}>
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

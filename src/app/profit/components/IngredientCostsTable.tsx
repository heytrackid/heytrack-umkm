import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { ProfitData } from '@/app/profit/components/types'


interface IngredientCostsTableProps {
  ingredients: ProfitData['ingredients']
  formatCurrency: (amount: number) => string
}

export const IngredientCostsTable = ({
  ingredients,
  formatCurrency
}: IngredientCostsTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Biaya Bahan Baku (WAC)</CardTitle>
      <CardDescription>
        Rincian biaya bahan baku dengan metode Weighted Average Cost
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Bahan Baku</th>
              <th className="text-right py-3 px-4 font-medium">Jumlah Terpakai</th>
              <th className="text-right py-3 px-4 font-medium">Harga WAC</th>
              <th className="text-right py-3 px-4 font-medium">Total Biaya</th>
            </tr>
          </thead>
          <tbody>
            {(ingredients || []).map((ingredient, index) => (
              <tr key={index} className="border-b hover:bg-accent transition-colors last:border-b-0 even:bg-muted/30">
                <td className="py-3 px-4">{ingredient['ingredient_name']}</td>
                <td className="py-3 px-4 text-right">{ingredient.quantity_used.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(ingredient.wac_cost)}</td>
                <td className="py-3 px-4 text-right font-medium">
                  {formatCurrency(ingredient.total_cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)

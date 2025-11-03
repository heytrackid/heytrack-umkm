import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfitData } from './types'


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
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Bahan Baku</th>
              <th className="text-right py-3 px-4 font-medium">Jumlah Terpakai</th>
              <th className="text-right py-3 px-4 font-medium">Harga WAC</th>
              <th className="text-right py-3 px-4 font-medium">Total Biaya</th>
            </tr>
          </thead>
          <tbody>
            {(ingredients || []).map((ingredient, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">{ingredient.ingredient_name}</td>
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

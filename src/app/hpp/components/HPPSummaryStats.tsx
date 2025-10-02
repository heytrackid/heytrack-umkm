'use client'

import { Card, CardContent } from '@/components/ui/card'

interface HPPSummaryStatsProps {
  totalRecipes: number
  highMarginRecipes: number
  mediumMarginRecipes: number
  lowMarginRecipes: number
  isMobile?: boolean
}

export default function HPPSummaryStats({
  totalRecipes,
  highMarginRecipes,
  mediumMarginRecipes,
  lowMarginRecipes,
  isMobile = false
}: HPPSummaryStatsProps) {
  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {totalRecipes}
            </div>
            <p className="text-sm text-muted-foreground">Total Resep</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {highMarginRecipes}
            </div>
            <p className="text-sm text-muted-foreground">Margin {'>'} 30%</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className={`font-bold text-amber-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {mediumMarginRecipes}
            </div>
            <p className="text-sm text-muted-foreground">Margin 15-30%</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className={`font-bold text-red-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {lowMarginRecipes}
            </div>
            <p className="text-sm text-muted-foreground">Margin {'<'} 15%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

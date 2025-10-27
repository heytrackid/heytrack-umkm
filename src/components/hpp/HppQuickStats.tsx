'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { uiLogger } from '@/lib/logger'
import { Calculator, Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HppQuickStatsProps {
  totalRecipes: number
  recipesWithHpp: number
  averageHpp: number
  unreadAlerts: number
  onViewDetails: (section: string) => void
}

export const HppQuickStats = ({
  totalRecipes,
  recipesWithHpp,
  averageHpp,
  unreadAlerts,
  onViewDetails
}: HppQuickStatsProps) => {
  const { formatCurrency } = useCurrency()
  const { isMobile } = useResponsive()
  const router = useRouter()

  const handleViewDetails = (section: string) => {
    uiLogger.info({
      message: `HPP Quick Stats: User clicked ${section} section`,
      section,
      totalRecipes,
      recipesWithHpp,
      averageHpp,
      unreadAlerts
    })
    onViewDetails(section)
  }

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="cursor-pointer" onClick={() => onViewDetails('calculator')}>
          <CardContent className="p-4 text-center">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{recipesWithHpp}/{totalRecipes}</div>
            <div className="text-xs text-muted-foreground">Recipes</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => onViewDetails('alerts')}>
          <CardContent className="p-4 text-center relative">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{unreadAlerts}</div>
            <div className="text-xs text-muted-foreground">Alerts</div>
            {unreadAlerts > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => onViewDetails('snapshots')}>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold">{formatCurrency(averageHpp)}</div>
            <div className="text-xs text-muted-foreground">Avg HPP</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => onViewDetails('comparison')}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">Compare</div>
            <div className="text-xs text-muted-foreground">Recipes</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Recipes with HPP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {recipesWithHpp}/{totalRecipes}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => onViewDetails('calculator')}
          >
            View Calculator
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-4 w-4" />
            Average HPP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(averageHpp)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => onViewDetails('snapshots')}
          >
            View Trends
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {unreadAlerts}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => onViewDetails('alerts')}
          >
            View Alerts
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">
            Analytics
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => onViewDetails('comparison')}
          >
            Compare Recipes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb, Info } from 'lucide-react'
import type { HPPCalculationResult } from '@/modules/recipes/types'





interface RecommendationsCardProps {
  calculationResult: HPPCalculationResult
}

/**
 * Recommendations display card component
 */
export const RecommendationsCard = ({ calculationResult }: RecommendationsCardProps) => {
  if (calculationResult.recommendations.length === 0) {return null}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Saran & Rekomendasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {calculationResult.recommendations.map((recommendation) => (
            <Alert key={recommendation}>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {recommendation}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

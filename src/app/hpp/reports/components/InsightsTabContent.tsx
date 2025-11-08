'use client'

import { TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InsightsTabContentProps {
  isMobile: boolean
}

const InsightsTabContent = ({ isMobile }: InsightsTabContentProps): JSX.Element => (
  <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
    <Card>
      <CardHeader>
        <CardTitle>Cost Optimization Opportunities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <span className="font-semibold">Supplier Negotiation</span>
          </div>
          <p className="text-sm text-muted-foreground">
            3 ingredients have potential cost savings of 12% through bulk purchasing
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <span className="font-semibold">Recipe Optimization</span>
          </div>
          <p className="text-sm text-muted-foreground">
            5 recipes can reduce costs by optimizing ingredient quantities
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <span className="font-semibold">Seasonal Pricing</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Peak season pricing can increase margins by 15-20%
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Performance Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Most Profitable Recipe</span>
            <Badge variant="secondary">Nasi Goreng Special</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Highest Cost Recipe</span>
            <Badge variant="outline">Seafood Paella</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Best Margin Category</span>
            <Badge variant="secondary">Desserts</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Cost Volatility</span>
            <Badge variant="destructive">High (15%)</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

export default InsightsTabContent
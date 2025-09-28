'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Package,
  Zap,
  Award
} from "lucide-react"
import { 
  useProductionAnalytics,
  useProductionCurrency 
} from '../hooks/use-production'

interface ProductionAnalyticsProps {
  className?: string
}

export default function ProductionAnalytics({ className }: ProductionAnalyticsProps) {
  const [dateRange, setDateRange] = useState('7d') // 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('efficiency')
  
  const { analytics, loading, error } = useProductionAnalytics()
  const { formatCost } = useProductionCurrency()

  // Mock data for visualization
  const efficiencyTrend = [
    { date: '2024-01-01', efficiency: 82, target: 85 },
    { date: '2024-01-02', efficiency: 84, target: 85 },
    { date: '2024-01-03', efficiency: 87, target: 85 },
    { date: '2024-01-04', efficiency: 85, target: 85 },
    { date: '2024-01-05', efficiency: 89, target: 85 },
    { date: '2024-01-06', efficiency: 91, target: 85 },
    { date: '2024-01-07', efficiency: 88, target: 85 }
  ]

  const productionVolume = [
    { recipe: 'Roti Tawar', batches: 15, units: 750, efficiency: 92 },
    { recipe: 'Croissant', batches: 8, units: 400, efficiency: 88 },
    { recipe: 'Danish Pastry', batches: 6, units: 180, efficiency: 95 },
    { recipe: 'Sourdough', batches: 4, units: 120, efficiency: 85 },
    { recipe: 'Bagel', batches: 3, units: 150, efficiency: 90 }
  ]

  const qualityMetrics = [
    { stage: 'Ingredient Prep', score: 96, target: 90, trend: 2 },
    { stage: 'Mixing', score: 94, target: 90, trend: 1 },
    { stage: 'Baking', score: 89, target: 90, trend: -1 },
    { stage: 'Cooling', score: 92, target: 90, trend: 3 },
    { stage: 'Packaging', score: 88, target: 90, trend: -2 },
    { stage: 'Final Inspection', score: 95, target: 90, trend: 4 }
  ]

  const costAnalysis = [
    { category: 'Raw Materials', amount: 2500000, percentage: 45, trend: -2 },
    { category: 'Labor', amount: 1800000, percentage: 32, trend: 1 },
    { category: 'Utilities', amount: 650000, percentage: 12, trend: 5 },
    { category: 'Equipment', amount: 400000, percentage: 7, trend: -1 },
    { category: 'Overhead', amount: 220000, percentage: 4, trend: 0 }
  ]

  const getEfficiencyColor = (efficiency: number, target: number) => {
    if (efficiency >= target + 5) return 'text-gray-600 dark:text-gray-400'
    if (efficiency >= target) return 'text-gray-600 dark:text-gray-400'
    if (efficiency >= target - 5) return 'text-orange-600'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    return <div className="h-4 w-4" />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Production Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Performance metrics and insights
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efficiency">Efficiency</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Efficiency
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  87.2%
                </p>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+3.1%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Target: 85%</span>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Above Target</Badge>
              </div>
              <Progress value={87.2} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Quality Score
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  92.1%
                </p>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+1.8%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Target: 90%</span>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Excellent</Badge>
              </div>
              <Progress value={92.1} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cost per Unit
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCost(12500)}
                </p>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+2.1%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Target: {formatCost(12000)}</span>
                <Badge className="bg-orange-100 text-orange-800">Above Target</Badge>
              </div>
              <Progress value={104.2} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Units Produced
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  1,600
                </p>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+12.5%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>This week</span>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">On Track</Badge>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency trend chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Efficiency Trend</CardTitle>
            <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
              <Target className="h-3 w-3 mr-1" />
              Target: 85%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            {efficiencyTrend.map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(data.date).toLocaleDateString('id-ID', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Efficiency
                    </span>
                    <span className={`font-medium ${getEfficiencyColor(data.efficiency, data.target)}`}>
                      {data.efficiency}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={data.efficiency} className="h-3" />
                    {/* Target line */}
                    <div 
                      className="absolute top-0 w-0.5 h-3 bg-red-400"
                      style={{ left: `${data.target}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production volume and quality metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production volume by recipe */}
        <Card>
          <CardHeader>
            <CardTitle>Production Volume by Recipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productionVolume.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.recipe}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.units} units
                        </span>
                        <Badge variant="outline" className={getEfficiencyColor(item.efficiency, 85)}>
                          {item.efficiency}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.efficiency} className="h-2" />
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{item.batches} batches</span>
                      <span>Efficiency</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality metrics by stage */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Score by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {metric.stage}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getEfficiencyColor(metric.score, metric.target)}`}>
                          {metric.score}%
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>Target: {metric.target}%</span>
                      <span>
                        {metric.trend > 0 ? '+' : ''}{metric.trend}% vs last period
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costAnalysis.map((cost, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cost.category}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCost(cost.amount)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(cost.trend)}
                        <span className={`text-xs ${cost.trend > 0 ? 'text-gray-600 dark:text-gray-400' : cost.trend < 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                          {cost.trend > 0 ? '+' : ''}{cost.trend}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Progress value={cost.percentage} className="h-2" />
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>{cost.percentage}% of total cost</span>
                    <span>vs last period</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Total Production Cost
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCost(costAnalysis.reduce((sum, cost) => sum + cost.amount, 0))}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-orange-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">+1.2% from last week</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Cost per unit: {formatCost(12500)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span>Performance Highlights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Quality target exceeded
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    92.1% quality score vs 90% target
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Production efficiency improved
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    +3.1% increase from last period
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Danish Pastry best performer
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    95% efficiency rate across all batches
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Areas for Improvement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Cost per unit increasing
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    +2.1% above target, review material costs
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Baking stage quality dip
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    89% vs 90% target, check temperature control
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Utility costs rising
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    +5% increase, consider energy optimization
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
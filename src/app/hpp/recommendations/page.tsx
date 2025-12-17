'use client'

import { AlertTriangle, CheckCircle, Lightbulb, Sparkles, TrendingUp } from '@/components/icons'
import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListSkeleton } from '@/components/ui/skeleton-loader'
import { useHppRecommendations } from '@/hooks/api/useHpp'
import { infoToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import { handleError } from '@/lib/error-handling'

const recommendationsBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing', href: '/hpp' },
  { label: 'Cost Optimization' }
]



const HppRecommendationsPage = (): JSX.Element => {
  const { formatCurrency } = useCurrency()
  type RecommendationFilter = 'all' | 'implemented' | 'pending'

  const [filter, setFilter] = useState<RecommendationFilter>('pending')

  const { data: recommendations = [], isLoading: loading } = useHppRecommendations()



  const markAsImplemented = (recommendationId: string) => {
    try {
      // In a real implementation, this would call an API to update the recommendation
      infoToast('Info', `Implementation tracking for recommendation ${recommendationId} will be available in the API`)
    } catch (error) {
      handleError(error as Error, 'HPP Recommendations: update', true, 'Gagal memperbarui rekomendasi')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'COST_OPTIMIZATION':
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />
      case 'SUPPLIER_CHANGE':
        return <Lightbulb className="h-4 w-4 text-muted-foreground" />
      case 'RECIPE_ADJUSTMENT':
        return <Sparkles className="h-4 w-4 text-muted-foreground" />
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const totalPotentialSavings = recommendations
    .filter(r => !r.is_implemented)
    .reduce((sum, r) => sum + (r.potential_savings || 0), 0)

  return (
    <AppLayout pageTitle="Recommendations">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Cost Optimization"
          description="Saran cerdas untuk optimasi biaya produksi dan efisiensi"
          breadcrumbs={recommendationsBreadcrumbs}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Total Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {recommendations.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                saran tersedia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {recommendations.filter(r => !r.is_implemented).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                belum diimplementasi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Implemented
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {recommendations.filter(r => r.is_implemented).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                sudah diterapkan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Potential Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {formatCurrency(totalPotentialSavings)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                penghematan potensial
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label htmlFor="recommendation-filter" className="text-sm font-medium">Filter:</label>
              <Select
                value={filter}
                onValueChange={(value: string) => {
                  if (value === 'all' || value === 'pending' || value === 'implemented') {
                    setFilter(value)
                  }
                }}
              >
                <SelectTrigger id="recommendation-filter" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Implementation</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="all">All Recommendations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations List */}
        <div className="space-y-4">
          {(() => {
            if (loading) {
              return (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <ListSkeleton items={5} />
                    </div>
                  </CardContent>
                </Card>
              )
            }
            
            if (recommendations.length === 0) {
              return (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                      <p>No cost optimization recommendations available at this time.</p>
                      <p className="text-sm mt-2">Recommendations will be generated based on your HPP analysis.</p>
                    </div>
                  </CardContent>
                </Card>
              )
            }
            
            return (
            recommendations.map((rec) => (
              <Card key={rec['id']} className={`transition-all ${rec.is_implemented ? 'opacity-75' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getRecommendationTypeIcon(rec.recommendation_type)}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge variant={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          {rec.is_implemented && (
                            <Badge variant="outline" className="text-muted-foreground">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Implemented
                            </Badge>
                          )}
                        </div>

                        <p className="text-muted-foreground">{rec.description}</p>



                        {rec.potential_savings > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                            <span className="font-medium">Potential Savings:</span>
                            <Badge variant="secondary" className="text-muted-foreground">
                              {formatCurrency(rec.potential_savings)}
                            </Badge>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {new Date(rec.created_at).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {!rec.is_implemented && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsImplemented(rec['id'])}
                        className="flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Mark Implemented
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
            )
          })()}
        </div>

        {/* Empty State */}
        {recommendations.length === 0 && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Rekomendasi</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Sistem akan menganalisis data HPP, supplier, dan resep Anda untuk memberikan rekomendasi optimasi biaya.
                Pastikan Anda sudah memiliki data yang cukup.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

export default HppRecommendationsPage
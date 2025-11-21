'use client'

import { AlertTriangle, CheckCircle, Lightbulb, Sparkles, TrendingUp } from '@/components/icons'
import { useEffect, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useCurrency } from '@/hooks/useCurrency'
import { dbLogger } from '@/lib/logger'

const recommendationsBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing', href: '/hpp' },
  { label: 'Cost Optimization' }
]

interface Recommendation {
  id: string
  recipe_id: string
  recommendation_type: string
  title: string
  description: string
  potential_savings: number
  priority: string
  is_implemented: boolean
  created_at: string
  recipes: {
    id: string
    name: string
    category: string
  } | null
}

const HppRecommendationsPage = (): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  type RecommendationFilter = 'all' | 'implemented' | 'pending'

  const [filter, setFilter] = useState<RecommendationFilter>('pending')

  // Load recommendations
  useEffect(() => {
    void loadRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'pending') {
        params.append('is_implemented', 'false')
      } else if (filter === 'implemented') {
        params.append('is_implemented', 'true')
      }

      const response = await fetch(`/api/hpp/recommendations?${params.toString()}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (response.ok) {
        const data = await response.json() as { recommendations?: Recommendation[] }
        setRecommendations(data.recommendations ?? [])
      }
    } catch (_error) {
      dbLogger.error({ _error }, 'Failed to load recommendations')
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const markAsImplemented = (recommendationId: string) => {
    try {
      // In a real implementation, this would call an API to update the recommendation
      toast(`Implementation tracking for recommendation ${recommendationId} will be available in the API`)
    } catch (error) {
      dbLogger.error({ error }, 'Failed to mark recommendation as implemented')
      toast.error('Failed to update recommendation')
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="flex items-center gap-4">
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
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
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
                        <div className="flex items-center gap-2">
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

                        {rec.recipes && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Recipe:</span>
                            <Badge variant="outline">{rec.recipes.name}</Badge>
                          </div>
                        )}

                        {rec.potential_savings > 0 && (
                          <div className="flex items-center gap-2 text-sm">
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
                        className="flex items-center gap-2"
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

        {/* Sample Recommendations */}
        {recommendations.length === 0 && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Sample Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Berikut adalah contoh jenis rekomendasi yang akan dihasilkan sistem:
              </div>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Supplier Cost Reduction</span>
                    <Badge variant="default">High</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bahan baku X memiliki harga 15% lebih murah di supplier Y. Potensi penghematan: Rp 2.5 juta per bulan.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Recipe Optimization</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mengurangi jumlah bahan Z sebesar 10% tidak mempengaruhi kualitas akhir. Potensi penghematan: Rp 800 ribu per bulan.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Bulk Purchasing</span>
                    <Badge variant="outline">Low</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pembelian bahan W dalam jumlah besar memberikan diskon 8%. Potensi penghematan: Rp 1.2 juta per bulan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

export default HppRecommendationsPage
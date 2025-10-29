'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target, RefreshCw, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { dbLogger } from '@/lib/logger'
import { PageHeader, SharedStatsCards } from '@/components/shared'
import { HppTrendChart } from '@/modules/orders/components/hpp/HppTrendChart'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type HppSnapshot = Database['public']['Tables']['hpp_snapshots']['Row']

interface SnapshotSummary {
  total: number
  thisWeek: number
  lastWeek: number
  averageChange: number
}

export default function HppSnapshotsPage() {
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [summary, setSummary] = useState<SnapshotSummary | null>(null)
  const [triggering, setTriggering] = useState(false)

  // Load recipes
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await fetch('/api/recipes?limit=1000')
        if (response.ok) {
          const data = await response.json()
          void setRecipes(data.recipes || [])
          // Auto-select first recipe
          if (data.recipes?.length > 0) {
            void setSelectedRecipe(data.recipes[0].id)
          }
        }
      } catch (err: unknown) {
        dbLogger.error({ err }, 'Failed to load recipes')
        toast({
          title: 'Error',
          description: 'Failed to load recipes',
          variant: 'destructive'
        })
      }
    }

    void loadRecipes()
  }, [toast])

  // Load summary when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      void loadSummary()
    }
  }, [selectedRecipe])

  const loadSummary = async () => {
    if (!selectedRecipe) { return }

    try {
      const response = await fetch(`/api/hpp/snapshots?recipe_id=${selectedRecipe}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        calculateSummary(data.snapshots || [])
      }
    } catch (err: unknown) {
      dbLogger.error({ err }, 'Failed to load snapshots summary')
    }
  }

  const calculateSummary = (snapshots: HppSnapshot[]) => {
    if (snapshots.length === 0) {
      void setSummary(null)
      return
    }

    const total = snapshots.length
    const thisWeek = snapshots.filter(s =>
      new Date(s.snapshot_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const lastWeek = snapshots.filter(s => {
      const date = new Date(s.snapshot_date)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      return date >= twoWeeksAgo && date < weekAgo
    }).length

    // Calculate average change percentage
    const changes = snapshots
      .filter(s => s.change_percentage !== null)
      .map(s => s.change_percentage)
    const averageChange = changes.length > 0
      ? changes.reduce((sum, change) => sum + change, 0) / changes.length
      : 0

    setSummary({
      total,
      thisWeek,
      lastWeek,
      averageChange
    })
  }

  // Trigger daily snapshots
  const triggerSnapshots = async () => {
    try {
      void setTriggering(true)
      const response = await fetch('/api/hpp/snapshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipeIds: selectedRecipe ? [selectedRecipe] : undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Success',
          description: `Daily snapshots executed: ${result.data?.snapshotsCreated || 0} created`,
        })

        // Reload summary
        void loadSummary()
      } else {
        throw new Error('Failed to trigger snapshots')
      }
    } catch (err: unknown) {
      dbLogger.error({ err }, 'Failed to trigger snapshots')
      toast({
        title: 'Error',
        description: 'Failed to trigger daily snapshots',
        variant: 'destructive'
      })
    } finally {
      void setTriggering(false)
    }
  }

  return (
    <AppLayout pageTitle="Daily Snapshots">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Daily Snapshots"
          description="Tren HPP harian otomatis dan analisis perubahan biaya"
          actions={
            <Button
              onClick={triggerSnapshots}
              disabled={triggering}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${triggering ? 'animate-spin' : ''}`} />
              {triggering ? 'Running...' : 'Run Snapshots'}
            </Button>
          }
        />

        {/* Stats Cards */}
        {summary && (
          <SharedStatsCards
            stats={[
              {
                title: "Total Snapshots",
                value: summary.total.toString(),
                subtitle: "Jumlah snapshot yang diambil",
                icon: <Target className="h-4 w-4" />
              },
              {
                title: "This Week",
                value: summary.thisWeek.toString(),
                subtitle: "Snapshot minggu ini",
                icon: <Calendar className="h-4 w-4" />
              },
              {
                title: "Avg. Change",
                value: `${summary.averageChange.toFixed(2)}%`,
                subtitle: "Perubahan rata-rata",
                icon: <TrendingUp className="h-4 w-4" />
              },
              {
                title: "Last Week",
                value: summary.lastWeek.toString(),
                subtitle: "Snapshot minggu lalu",
                icon: <TrendingDown className="h-4 w-4" />
              }
            ]}
          />
        )}

        {/* Recipe Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Pilih Resep
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Pilih resep untuk melihat tren..." />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Snapshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {summary.total}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  hari tercatat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Minggu Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {summary.thisWeek}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  snapshots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Minggu Lalu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {summary.lastWeek}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  snapshots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {summary.averageChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  Avg Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${summary.averageChange >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                  {summary.averageChange >= 0 ? '+' : ''}{summary.averageChange.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  perubahan rata-rata
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trend Chart */}
        {selectedRecipe && (
          <Card>
            <CardHeader>
              <CardTitle>HPP Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <HppTrendChart
                recipeId={selectedRecipe}
                days={30}
                height={400}
              />
            </CardContent>
          </Card>
        )}

        {/* Recent Snapshots Table */}
        {/* {selectedRecipe && (
          <RecentSnapshotsTable recipeId={selectedRecipe} />
        )} */}
      </div>
    </AppLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/hooks/useCurrency'
import { dbLogger } from '@/lib/logger'
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react'

interface SnapshotData {
  id: string
  snapshot_date: string
  hpp_value: number
  previous_hpp: number | null
  change_percentage: number | null
  material_cost_breakdown: any
}

interface RecentSnapshotsTableProps {
  recipeId: string
}

export const RecentSnapshotsTable = ({ recipeId }: RecentSnapshotsTableProps) => {
  const { formatCurrency } = useCurrency()
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadSnapshots()
  }, [recipeId])

  const loadSnapshots = async () => {
    try {
      void setLoading(true)
      const response = await fetch(`/api/hpp/snapshots?recipe_id=${recipeId}&limit=20`)

      if (response.ok) {
        const data = await response.json()
        void setSnapshots(data.snapshots || [])
      }
    } catch (err: unknown) {
      dbLogger.error({ err: error }, 'Failed to load recent snapshots')
    } finally {
      void setLoading(false)
    }
  }

  const getChangeIcon = (change: number | null) => {
    if (!change) {return <Minus className="h-4 w-4 text-gray-500" />}
    return change > 0
      ? <TrendingUp className="h-4 w-4 text-red-500" />
      : <TrendingDown className="h-4 w-4 text-green-500" />
  }

  const getChangeColor = (change: number | null) => {
    if (!change) {return 'text-gray-600'}
    return change > 0 ? 'text-red-600' : 'text-green-600'
  }

  const formatChange = (change: number | null) => {
    if (!change) {return 'N/A'}
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded" />
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded" />
                <div className="animate-pulse bg-gray-200 h-4 w-16 rounded" />
                <div className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (snapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No snapshots available for this recipe yet.</p>
            <p className="text-sm mt-2">Snapshots will be created automatically or manually.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Snapshots
          <Button variant="outline" size="sm" onClick={loadSnapshots}>
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">HPP Value</TableHead>
                <TableHead className="text-right">Previous HPP</TableHead>
                <TableHead className="text-center">Change</TableHead>
                <TableHead className="text-right">Material Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell className="font-medium">
                    {new Date(snapshot.snapshot_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(snapshot.hpp_value)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {snapshot.previous_hpp ? formatCurrency(snapshot.previous_hpp) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`flex items-center justify-center gap-1 ${getChangeColor(snapshot.change_percentage)}`}>
                      {getChangeIcon(snapshot.change_percentage)}
                      <span className="font-semibold">
                        {formatChange(snapshot.change_percentage)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {snapshot.material_cost_breakdown?.totalMaterialCost
                      ? formatCurrency(snapshot.material_cost_breakdown.totalMaterialCost)
                      : formatCurrency(snapshot.hpp_value * 0.7) // Estimate if not available
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {snapshots.length >= 20 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Load More Snapshots
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

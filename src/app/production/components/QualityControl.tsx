'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  Eye,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter
} from "lucide-react"
import { 
  useQualityChecks,
  useTemperatureMonitoring,
  useProductionBatches 
} from '../hooks/use-production'
import { 
  QUALITY_CHECK_DETAILS,
  DEFAULT_PRODUCTION_CONFIG 
} from '../config/production.config'
import type { 
  QualityCheck, 
  QualityCheckPoint, 
  QualityStatus,
  TemperatureLog 
} from '../types/production.types'

interface QualityControlProps {
  className?: string
}

export default function QualityControl({ className }: QualityControlProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<QualityStatus | 'all'>('all')
  const [showQualityCheckDialog, setShowQualityCheckDialog] = useState(false)

  // Get batches that need quality checks
  const { batches } = useProductionBatches({
    status: ['quality_check', 'in_progress', 'completed'],
    search: searchTerm || undefined
  })

  // Quality summary metrics
  const qualityMetrics = {
    totalChecks: 45,
    passedChecks: 42,
    failedChecks: 2,
    pendingChecks: 1,
    passRate: 93.3,
    trend: 2.1 // positive trend
  }

  const checksByStage = [
    { stage: 'ingredient_prep', total: 12, passed: 12, failed: 0 },
    { stage: 'mixing', total: 10, passed: 10, failed: 0 },
    { stage: 'baking', total: 8, passed: 7, failed: 1 },
    { stage: 'cooling', total: 6, passed: 6, failed: 0 },
    { stage: 'packaging', total: 5, passed: 4, failed: 1 },
    { stage: 'final_inspection', total: 4, passed: 3, failed: 0 }
  ]

  const recentTemperatureAlerts = [
    {
      id: '1',
      batch_id: 'batch-001',
      batch_name: 'Roti Tawar #001',
      stage: 'baking' as QualityCheckPoint,
      temperature: 195,
      target: 180,
      severity: 'warning',
      time: '10:30 AM'
    },
    {
      id: '2', 
      batch_id: 'batch-023',
      batch_name: 'Croissant #023',
      stage: 'cooling',
      temperature: 32,
      target: 25,
      severity: 'critical',
      time: '09:45 AM'
    }
  ]

  const getQualityStatusColor = (status: QualityStatus) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'conditional': return 'text-orange-600 bg-orange-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      case 'retesting': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getQualityIcon = (status: QualityStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'conditional': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'retesting': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quality Control Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor quality checks and temperature compliance
          </p>
        </div>

        <Dialog open={showQualityCheckDialog} onOpenChange={setShowQualityCheckDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Quality Check</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Quality Check</DialogTitle>
            </DialogHeader>
            <QualityCheckForm 
              onSubmit={() => setShowQualityCheckDialog(false)}
              onCancel={() => setShowQualityCheckDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quality metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pass Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {qualityMetrics.passRate}%
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{qualityMetrics.trend}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Checks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {qualityMetrics.totalChecks}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Failed Checks
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {qualityMetrics.failedChecks}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {qualityMetrics.pendingChecks}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality by stage */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Checks by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checksByStage.map(stage => {
              const passRate = stage.total > 0 ? (stage.passed / stage.total) * 100 : 0
              return (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {QUALITY_CHECK_DETAILS[stage.stage as QualityCheckPoint]?.name || stage.stage}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stage.passed}/{stage.total} ({passRate.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={passRate} className="h-2" />
                  </div>
                  {stage.failed > 0 && (
                    <Badge variant="destructive" className="ml-4">
                      {stage.failed} failed
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Temperature alerts */}
      {recentTemperatureAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <span>Recent Temperature Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTemperatureAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950' 
                      : 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        alert.severity === 'critical' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {alert.batch_name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        • {alert.stage}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Temperature: {alert.temperature}°C (Target: {alert.target}°C)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.time}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active quality checks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Quality Checks
          </h3>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QualityStatus | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
                <SelectItem value="retesting">Retesting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches?.slice(0, 6).map(batch => (
            <Card key={batch.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {batch.batch_number}
                  </CardTitle>
                  <Badge className={getQualityStatusColor(batch.quality_status)}>
                    {getQualityIcon(batch.quality_status)}
                    <span className="ml-1">{batch.quality_status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {batch.recipe_name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Quality score */}
                  {batch.quality_score && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Overall Score
                        </span>
                        <span className="font-medium">
                          {batch.quality_score}/100
                        </span>
                      </div>
                      <Progress 
                        value={batch.quality_score} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Temperature status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <Thermometer className="h-4 w-4 mr-1" />
                      Temperature
                    </span>
                    <Badge variant="outline" className="text-green-600">
                      Within range
                    </Badge>
                  </div>

                  {/* Last check */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Check
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      2 hours ago
                    </span>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedBatchId(batch.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Quality Check Form Component
interface QualityCheckFormProps {
  onSubmit: () => void
  onCancel: () => void
}

function QualityCheckForm({ onSubmit, onCancel }: QualityCheckFormProps) {
  const [formData, setFormData] = useState({
    batch_id: '',
    check_point: '' as QualityCheckPoint,
    temperature: '',
    appearance_score: 85,
    texture_score: 90,
    taste_score: 88,
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Process quality check submission
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Batch</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="batch-001">Roti Tawar #001</SelectItem>
            <SelectItem value="batch-002">Croissant #023</SelectItem>
            <SelectItem value="batch-003">Danish Pastry #045</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Check Point</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, check_point: value as QualityCheckPoint })}>
          <SelectTrigger>
            <SelectValue placeholder="Select check point" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ingredient_prep">Ingredient Preparation</SelectItem>
            <SelectItem value="mixing">Mixing Process</SelectItem>
            <SelectItem value="baking">Baking Process</SelectItem>
            <SelectItem value="cooling">Cooling Process</SelectItem>
            <SelectItem value="packaging">Packaging</SelectItem>
            <SelectItem value="final_inspection">Final Inspection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Temperature (°C)</Label>
        <Input
          type="number"
          value={formData.temperature}
          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
          placeholder="25"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Appearance ({formData.appearance_score})</Label>
          <Input
            type="range"
            min="0"
            max="100"
            value={formData.appearance_score}
            onChange={(e) => setFormData({ ...formData, appearance_score: parseInt(e.target.value) })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Texture ({formData.texture_score})</Label>
          <Input
            type="range"
            min="0"
            max="100"
            value={formData.texture_score}
            onChange={(e) => setFormData({ ...formData, texture_score: parseInt(e.target.value) })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Taste ({formData.taste_score})</Label>
          <Input
            type="range"
            min="0"
            max="100"
            value={formData.taste_score}
            onChange={(e) => setFormData({ ...formData, taste_score: parseInt(e.target.value) })}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any observations or issues..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Submit Check
        </Button>
      </div>
    </form>
  )
}
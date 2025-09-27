'use client'

import React, { Suspense, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChefHat, 
  Calendar, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Link
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy loaded components
const BatchPlannerLazy = React.lazy(() => import('./BatchPlanner'))
const QualityControlLazy = React.lazy(() => import('./QualityControl'))
const ResourceManagerLazy = React.lazy(() => import('./ResourceManager'))
const ProductionAnalyticsLazy = React.lazy(() => import('./ProductionAnalytics'))
const IntegrationDashboardLazy = React.lazy(() => import('./IntegrationDashboard'))

// Loading skeleton components
const BatchPlannerSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    {[1, 2, 3].map(i => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const QualityControlSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map(i => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const ResourceManagerSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

const ProductionAnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
)

const IntegrationDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
)

interface ProductionPageProps {
  className?: string
}

export default function ProductionPage({ className }: ProductionPageProps) {
  const [activeTab, setActiveTab] = useState('integration')
  const [notifications] = useState([
    {
      id: '1',
      type: 'batch_completion',
      title: 'Batch Ready',
      message: 'Roti Tawar Batch #001 is ready for quality check',
      priority: 'medium' as const,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'quality_failure',
      title: 'Quality Alert',
      message: 'Croissant Batch #023 failed temperature check',
      priority: 'high' as const,
      timestamp: new Date().toISOString()
    }
  ])

  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with real-time notifications */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Production Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage batches, quality control, and resources
            </p>
          </div>
        </div>
        
        {/* Notifications panel */}
        {notifications.length > 0 && (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <Badge variant="secondary">
              {notifications.length} alerts
            </Badge>
          </div>
        )}
      </div>

      {/* Real-time alerts */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications.slice(0, 2).map(notification => (
            <Card key={notification.id} className="border-l-4 border-orange-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      <span className="text-sm font-medium">
                        {notification.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Production overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Batches
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Quality Pass Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  94.2%
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  On-Time Completion
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  87.5%
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Equipment Usage
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  78%
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs with lazy loading */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger 
            value="integration" 
            className="flex items-center space-x-2"
          >
            <Link className="h-4 w-4" />
            <span>Integration</span>
          </TabsTrigger>
          <TabsTrigger 
            value="batches" 
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Batch Planning</span>
          </TabsTrigger>
          <TabsTrigger 
            value="quality" 
            className="flex items-center space-x-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Quality Control</span>
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-4">
          <Suspense fallback={<IntegrationDashboardSkeleton />}>
            <IntegrationDashboardLazy />
          </Suspense>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Suspense fallback={<BatchPlannerSkeleton />}>
            <BatchPlannerLazy />
          </Suspense>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Suspense fallback={<QualityControlSkeleton />}>
            <QualityControlLazy />
          </Suspense>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Suspense fallback={<ResourceManagerSkeleton />}>
            <ResourceManagerLazy />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<ProductionAnalyticsSkeleton />}>
            <ProductionAnalyticsLazy />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CardSkeleton } from '@/components/ui'
import { apiLogger } from '@/lib/logger'
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Bell, 
  Package, 
  Settings,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface AutomationStatus {
  timestamp: string
  automation: {
    autoReorder: { enabled: boolean; lastRun: string | null }
    smartNotifications: { enabled: boolean; lastRun: string | null }
    automationEngine: { enabled: boolean; lastRun: string | null }
  }
  available_tasks: string[]
}

interface TaskResult {
  timestamp: string
  task: string
  status: string
  reorder?: unknown
  notifications?: unknown
  engine?: unknown
  cleanup?: unknown
}

export default function AutomationPage() {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)
  const [result, setResult] = useState<TaskResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/automation/run')
      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }
      const data = await response.json()
      setStatus(data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      apiLogger.error({ error: err }, 'Error fetching status:')
    } finally {
      setLoading(false)
    }
  }

  const runTask = async (task: string) => {
    try {
      setRunning(task)
      setError(null)
      setResult(null)

      const response = await fetch('/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to run task')
      }

      const data = await response.json()
      setResult(data)
      
      // Refresh status after task completion
      setTimeout(fetchStatus, 1000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      apiLogger.error({ error: err }, 'Error running task:')
    } finally {
      setRunning(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) {return 'Never'}
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <CardSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 Automation Control</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your UMKM automations</p>
        </div>
        <Button onClick={fetchStatus} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {result && result.status === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Task <strong>{result.task}</strong> completed successfully at {formatDate(result.timestamp)}
          </AlertDescription>
        </Alert>
      )}

      {/* Automation Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Auto Reorder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 text-blue-600" />
              <Badge variant={status?.automation.autoReorder.enabled ? "default" : "secondary"}>
                {status?.automation.autoReorder.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardTitle className="mt-4">Auto Reorder</CardTitle>
            <CardDescription>Automatic inventory reorder alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Last run: {formatDate(status?.automation.autoReorder.lastRun || null)}
              </div>
              <Button 
                onClick={() => runTask('reorder')}
                disabled={running === 'reorder'}
                className="w-full"
              >
                {running === 'reorder' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Smart Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Bell className="w-8 h-8 text-purple-600" />
              <Badge variant={status?.automation.smartNotifications.enabled ? "default" : "secondary"}>
                {status?.automation.smartNotifications.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardTitle className="mt-4">Smart Notifications</CardTitle>
            <CardDescription>Alerts for inventory, orders & finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Last run: {formatDate(status?.automation.smartNotifications.lastRun || null)}
              </div>
              <Button 
                onClick={() => runTask('notifications')}
                disabled={running === 'notifications'}
                className="w-full"
              >
                {running === 'notifications' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Automation Engine */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Settings className="w-8 h-8 text-orange-600" />
              <Badge variant={status?.automation.automationEngine.enabled ? "default" : "secondary"}>
                {status?.automation.automationEngine.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardTitle className="mt-4">Automation Engine</CardTitle>
            <CardDescription>Core automation processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Last run: {formatDate(status?.automation.automationEngine.lastRun || null)}
              </div>
              <Button 
                onClick={() => runTask('engine')}
                disabled={running === 'engine'}
                className="w-full"
              >
                {running === 'engine' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Run multiple automations at once</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => runTask('all')}
              disabled={running === 'all'}
              size="lg"
              className="w-full"
            >
              {running === 'all' ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Running All Tasks...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Run All Automations
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => runTask('cleanup')}
              disabled={running === 'cleanup'}
              size="lg"
              variant="outline"
              className="w-full"
            >
              {running === 'cleanup' ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Cleaning Up...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Cleanup Old Notifications
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Last Task Results</CardTitle>
            <CardDescription>
              Task: <strong>{result.task}</strong> | Completed: {formatDate(result.timestamp)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📋 How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Auto Reorder:</strong> Checks inventory levels and creates alerts when stock is low</p>
            <p>• <strong>Smart Notifications:</strong> Monitors orders, expiry dates, and financial alerts</p>
            <p>• <strong>Automation Engine:</strong> Core processing engine for all automation tasks</p>
            <p>• <strong>Cleanup:</strong> Removes old notifications to keep the system clean</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⏰ Scheduled Runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Auto Reorder:</strong> Every 6 hours (00:00, 06:00, 12:00, 18:00)</p>
            <p>• <strong>Smart Notifications:</strong> Every 15 minutes</p>
            <p>• <strong>Automation Engine:</strong> Every 5 minutes</p>
            <p>• <strong>Cleanup:</strong> Daily at 02:00 AM</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

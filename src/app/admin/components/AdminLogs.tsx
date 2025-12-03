'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

// Generate initial logs outside component to avoid impure function calls during render
const generateInitialLogs = () => {
  const now = Date.now()
  return [
    { id: 1, timestamp: new Date(now).toISOString(), level: 'info', message: 'System started', user: 'system' },
    { id: 2, timestamp: new Date(now - 300000).toISOString(), level: 'info', message: 'User logged in', user: 'admin@example.com' },
    { id: 3, timestamp: new Date(now - 600000).toISOString(), level: 'warning', message: 'High memory usage detected', user: 'system' },
    { id: 4, timestamp: new Date(now - 900000).toISOString(), level: 'info', message: 'Cache cleared', user: 'admin@example.com' },
    { id: 5, timestamp: new Date(now - 1200000).toISOString(), level: 'info', message: 'Broadcast sent to all users', user: 'admin@example.com' }
  ]
}

export function AdminLogs() {
  const initialLogs = useMemo(() => generateInitialLogs(), [])
  const [logs] = useState(initialLogs)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-700'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700'
      case 'info':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Logs</CardTitle>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{log.message}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>{log.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This is a placeholder for system logs. In production, integrate with your logging service (e.g., Vercel Logs, Sentry, or custom logging).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

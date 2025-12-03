'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function AdminCache() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const queryClient = useQueryClient()

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/cache/clear', {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Failed to clear cache')
      return res.json()
    },
    onSuccess: (data) => {
      setResult({ success: true, message: data.message })
      // Clear React Query cache too
      queryClient.clear()
      setTimeout(() => setResult(null), 5000)
    },
    onError: (error: Error) => {
      setResult({ success: false, message: error.message })
      setTimeout(() => setResult(null), 5000)
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={result.success ? 'text-green-900' : 'text-red-900'}>
                {result.message}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Clear Server Cache</h3>
              <p className="text-sm text-gray-600 mb-4">
                Clear Next.js server-side cache for all pages. This will force fresh data on next page load.
              </p>
              <Button
                onClick={() => clearCacheMutation.mutate()}
                disabled={clearCacheMutation.isPending}
                variant="destructive"
                className="gap-2"
              >
                {clearCacheMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Clear Server Cache
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Cache Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Type</span>
                  <span className="font-medium text-gray-900">Next.js + React Query</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cached Paths</span>
                  <span className="font-medium text-gray-900">10+ routes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Strategy</span>
                  <span className="font-medium text-gray-900">Revalidate on demand</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Clear cache after database migrations or schema changes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Use broadcast updates instead of clearing cache when possible</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Cache is automatically cleared on deployment</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>React Query cache is client-side and cleared on page refresh</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

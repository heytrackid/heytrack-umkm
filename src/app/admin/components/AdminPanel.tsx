'use client'

import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface BroadcastResponse {
  success: boolean
  message: string
  broadcastedAt: string
}

const PRESET_MESSAGES = [
  {
    label: 'Data Updated',
    message: 'Data has been updated. Click refresh to see the latest changes.',
    queryKeys: [['orders'], ['recipes'], ['ingredients'], ['dashboard']]
  },
  {
    label: 'Orders Updated',
    message: 'Orders have been updated. Please refresh to see new orders.',
    queryKeys: [['orders']]
  },
  {
    label: 'Recipes Updated',
    message: 'Recipes have been updated. Please refresh to see the changes.',
    queryKeys: [['recipes']]
  },
  {
    label: 'Inventory Updated',
    message: 'Inventory has been updated. Please refresh to see current stock levels.',
    queryKeys: [['ingredients']]
  },
  {
    label: 'Dashboard Updated',
    message: 'Dashboard data has been updated. Please refresh to see the latest statistics.',
    queryKeys: [['dashboard']]
  }
]

export function AdminPanel() {
  const [customMessage, setCustomMessage] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [lastBroadcast, setLastBroadcast] = useState<BroadcastResponse | null>(null)

  const mutation = useMutation({
    mutationFn: async (data: { message: string; queryKeys: string[][] }) => {
      const res = await fetch('/api/admin/broadcast-realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        throw new Error('Failed to broadcast update')
      }

      return res.json() as Promise<BroadcastResponse>
    },
    onSuccess: (data) => {
      setLastBroadcast(data)
      setCustomMessage('')
      setSelectedPreset(null)
      setTimeout(() => setLastBroadcast(null), 5000)
    }
  })

  const handleBroadcast = (message: string, queryKeys: string[][]) => {
    mutation.mutate({ message, queryKeys })
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {lastBroadcast && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900">{lastBroadcast.message}</p>
            <p className="text-sm text-green-700">
              Broadcasted at {new Date(lastBroadcast.broadcastedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Preset Messages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Updates</h2>
        <div className="grid grid-cols-1 gap-3">
          {PRESET_MESSAGES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPreset(idx)
                handleBroadcast(preset.message, preset.queryKeys)
              }}
              disabled={mutation.isPending}
              className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{preset.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{preset.message}</p>
                </div>
                {mutation.isPending && selectedPreset === idx && (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Message */}
      <div className="border-t pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Update</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter custom message for users..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={() => handleBroadcast(customMessage, [['orders'], ['recipes'], ['ingredients'], ['dashboard']])}
            disabled={!customMessage.trim() || mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Broadcasting...
              </>
            ) : (
              'Broadcast Custom Update'
            )}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Click any button above to send an update notification</li>
            <li>All connected users will see a banner with a refresh button</li>
            <li>Users can click refresh to update their data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

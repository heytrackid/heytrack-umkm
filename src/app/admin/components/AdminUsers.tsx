'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
}

export function AdminUsers() {
  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users ({data?.users.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{user.email}</p>
                <p className="text-sm text-gray-600">
                  Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </p>
              </div>
              {user.last_sign_in_at && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last sign in</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          ))}
          {(!data?.users || data.users.length === 0) && (
            <p className="text-center text-gray-500 py-8">No users found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

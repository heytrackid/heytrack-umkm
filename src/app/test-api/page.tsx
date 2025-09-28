'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAPIPage() {
  const { isSignedIn, user } = useUser()
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const testProtectedAPI = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/protected')
      const data = await res.json()
      setResponse({ endpoint: 'GET /api/protected', data })
    } catch (error) {
      setResponse({ endpoint: 'GET /api/protected', error: error.message })
    }
    setLoading(false)
  }

  const getUserProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setResponse({ endpoint: 'GET /api/user/profile', data })
    } catch (error) {
      setResponse({ endpoint: 'GET /api/user/profile', error: error.message })
    }
    setLoading(false)
  }

  const updateUserProfile = async () => {
    if (!firstName || !lastName) {
      alert('Please enter both first name and last name')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName })
      })
      const data = await res.json()
      setResponse({ endpoint: 'POST /api/user/profile', data })
      
      // Refresh the page to see updated user info
      window.location.reload()
    } catch (error) {
      setResponse({ endpoint: 'POST /api/user/profile', error: error.message })
    }
    setLoading(false)
  }

  if (!isSignedIn) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        <p className="text-muted-foreground">Please sign in to test the APIs</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Testing Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Image:</strong> <img src={user?.imageUrl} alt="Avatar" className="w-8 h-8 rounded-full inline-block ml-2" /></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testProtectedAPI} disabled={loading} className="w-full">
              Test Protected API
            </Button>
            
            <Button onClick={getUserProfile} disabled={loading} className="w-full">
              Get User Profile
            </Button>

            <div className="space-y-2">
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Button onClick={updateUserProfile} disabled={loading} className="w-full">
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {response && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-semibold mb-2">{response.endpoint}</p>
              <pre className="bg-muted p-4 rounded-md overflow-auto">
                {JSON.stringify(response.data || response.error, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
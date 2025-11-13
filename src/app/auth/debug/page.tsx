'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

export default function AuthDebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setSessionInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check session')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  const testLogin = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123456'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Login berhasil! Cek session info di bawah.')
        await checkSession()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth Debug Tool</CardTitle>
            <CardDescription>
              Tool untuk debug masalah authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={checkSession} disabled={loading}>
                Refresh Session Info
              </Button>
              <Button onClick={testLogin} disabled={loading} variant="secondary">
                Test Login (test@example.com)
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && <p className="text-muted-foreground">Loading...</p>}

            {!loading && sessionInfo && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Session Status:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(sessionInfo, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Cookies:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {document.cookie || 'No cookies found'}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Environment:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify({
                      supabaseUrl: process.env['NEXT_PUBLIC_SUPABASE_URL']?.substring(0, 30) + '...',
                      hasAnonKey: !!process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Pastikan environment variables sudah benar (.env.local)</li>
              <li>✓ Cek Supabase Dashboard → Authentication → Settings</li>
              <li>✓ Pastikan "Enable email confirmations" sesuai kebutuhan</li>
              <li>✓ Cek Site URL dan Redirect URLs di Supabase</li>
              <li>✓ Pastikan tidak ada rate limiting (tunggu 1 jam jika terlalu banyak percobaan)</li>
              <li>✓ Cek browser console untuk error messages</li>
              <li>✓ Cek Network tab untuk melihat response dari API</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

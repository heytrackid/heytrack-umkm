'use client'

import React, { useState } from 'react'
import HCaptchaField from '@/components/forms/shared/HCaptchaField'
import HCaptchaProgrammaticField from '@/components/forms/shared/HCaptchaProgrammaticField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const HCaptchaTestPage = () => {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showProgrammatic, setShowProgrammatic] = useState(false)

  const handleVerify = (token: string, _eKey: string) => {
    setToken(token)
    setError(null)
  }

  const handleError = (err: string) => {
    setError(`hCaptcha error: ${err}`)
    setToken(null)
  }

  const handleExpire = () => {
    setError('hCaptcha expired')
    setToken(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">hCaptcha Test Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Basic hCaptcha</CardTitle>
          </CardHeader>
          <CardContent>
            <HCaptchaField
              sitekey="611e889c-9904-477e-aaa0-ff685616f536"
              onVerify={handleVerify}
              onError={handleError}
              onExpire={handleExpire}
              required
            />
            
            {token && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                Verified! Token: {token.substring(0, 10)}...
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
          onClick={() => setShowProgrammatic(!showProgrammatic)}
          className="w-full"
        >
          {showProgrammatic ? 'Hide' : 'Show'} Programmatic hCaptcha
        </Button>

        {showProgrammatic && (
          <Card>
            <CardHeader>
              <CardTitle>Programmatic hCaptcha</CardTitle>
            </CardHeader>
            <CardContent>
              <HCaptchaProgrammaticField
                sitekey="611e889c-9904-477e-aaa0-ff685616f536"
                onVerify={handleVerify}
                onError={handleError}
                onExpire={handleExpire}
                required
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default HCaptchaTestPage
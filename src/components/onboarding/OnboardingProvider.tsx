'use client'

import { useEffect, useState } from 'react'
import { OnboardingWizard } from './OnboardingWizard'
import { logger } from '@/lib/logger'

export function OnboardingProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/onboarding')
      const result = await response.json()

      if (result.success && result.data) {
        // Show onboarding if not completed and not skipped
        if (!result.data.completed && !result.data.skipped) {
          setShowOnboarding(true)
        }
      }
    } catch (error) {
      logger.error({ error }, 'Failed to check onboarding status')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <OnboardingWizard 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
      />
    </>
  )
}

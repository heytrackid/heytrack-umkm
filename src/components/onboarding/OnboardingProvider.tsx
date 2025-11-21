'use client'

import { useQuery } from '@tanstack/react-query'
import { OnboardingWizard } from './OnboardingWizard'
import { logger } from '@/lib/logger'
import { fetchApi } from '@/lib/query/query-helpers'
import { useState, useEffect } from 'react'

interface OnboardingStatus {
  completed: boolean
  skipped: boolean
}

export function OnboardingProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(false)

  // ✅ Use React Query instead of manual fetch
  const { data, isLoading, error } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: () => fetchApi<OnboardingStatus>('/onboarding'),
    staleTime: 5 * 60 * 1000, // 5 minutes - status doesn't change often
  })

  // Compute whether to show onboarding (no setState in effect)
  const shouldShowOnboarding = Boolean(!isLoading && data && !data.completed && !data.skipped && !isOnboardingDismissed)

  // Handle error logging
  useEffect(() => {
    if (error) {
      logger.error({ error }, 'Failed to check onboarding status')
    }
  }, [error])

  if (isLoading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <OnboardingWizard 
        open={shouldShowOnboarding} 
        onOpenChange={setIsOnboardingDismissed}
      />
    </>
  )
}

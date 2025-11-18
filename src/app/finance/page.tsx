'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { LoadingState } from '@/components/ui/loading-state'

/**
 * Redirect page for backward compatibility
 * /finance -> /cash-flow
 */
const FinanceRedirect = (): JSX.Element => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/cash-flow')
  }, [router])

  return (
    <LoadingState message="Redirecting to Cash Flow..." size="md" />
  )
}

export default FinanceRedirect
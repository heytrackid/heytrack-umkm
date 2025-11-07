'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Redirect page for backward compatibility
 * /finance -> /cash-flow
 */
const FinanceRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/cash-flow')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to Cash Flow...</p>
      </div>
    </div>
  )
}

export default FinanceRedirect

import dynamic from 'next/dynamic'
import { createLogger } from '@/lib/logger'

// Server-side data fetching
async function fetchAutoSyncData() {
  const logger = createLogger('AutoSyncFinancialDashboard')
  try {
    const response = await fetch(`${process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000'}/api/financial/auto-sync`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch auto-sync data')
    }

    const data = await response.json()
    return data
  } catch (error) {
    logger.error({ error }, 'Failed to fetch auto-sync data')
    return null
  }
}

// Client component for interactive features
const AutoSyncClient = dynamic(
  () => import('./AutoSyncFinancialDashboardClient').then(m => ({ default: m.AutoSyncFinancialDashboardClient })),
  {
    loading: () => <div>Loading auto-sync dashboard...</div>,
    ssr: false
  }
)

export async function AutoSyncFinancialDashboard() {
  const autoSyncData = await fetchAutoSyncData()

  if (!autoSyncData?.success) {
    return <div>Failed to load auto-sync data</div>
  }

  return <AutoSyncClient initialData={autoSyncData.data} />
}
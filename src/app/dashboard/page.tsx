// import { createLogger } from '@/lib/logger'

// Server-side data fetching (removed in client-fetch option)
/* async function fetchDashboardData() {
  const logger = createLogger('Dashboard')
  try {
    const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/dashboard/stats`, {
      cache: 'no-store', // Always fetch fresh data for dashboard
    })

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data')
    }

    const data = await response.json()
    return data
  } catch (error) {
    logger.error({ error }, 'Failed to fetch dashboard data')
    return null
  }
} */

// Client component for interactive dashboard features
// Import directly without dynamic - DashboardClient already has its own lazy loading
import { DashboardClient } from './components/DashboardClient'

const DashboardPage = () => {
  // Debug logging for auth state verification
  if (typeof window !== 'undefined') {
    // This will be handled by useAuth hook in DashboardClient
  }

  return <DashboardClient />
}

export default DashboardPage
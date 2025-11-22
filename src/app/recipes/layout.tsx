import type { ReactNode } from 'react'
import { RouteErrorBoundary } from '@/components/error-boundaries'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const DynamicLayout = ({
  children,
}: {
  children: ReactNode
}) => (
  <RouteErrorBoundary>
    {children}
  </RouteErrorBoundary>
)

export default DynamicLayout

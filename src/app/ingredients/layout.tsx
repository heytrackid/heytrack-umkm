import type { ReactNode } from 'react'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

const DynamicLayout = ({
  children,
}: {
  children: ReactNode
}) => <>{children}</>

export default DynamicLayout

import type { ReactNode } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const SettingsLayout = ({
  children,
}: {
  children: ReactNode
}) => <>{children}</>

export default SettingsLayout


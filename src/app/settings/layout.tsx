import type { ReactNode } from 'react'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}

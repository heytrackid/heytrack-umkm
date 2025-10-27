import type { ReactNode } from 'react'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DynamicLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}

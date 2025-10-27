import type { ReactNode } from 'react'
// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function AuthLayout({
    children,
}: {
    children: ReactNode
}) {
    return <>{children}</>
}
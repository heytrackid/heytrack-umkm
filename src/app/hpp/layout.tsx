import type { ReactNode } from 'react'
// Force dynamic rendering for all HPP pages
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function HppLayout({
    children,
}: {
    children: ReactNode
}) {
    return <>{children}</>
}
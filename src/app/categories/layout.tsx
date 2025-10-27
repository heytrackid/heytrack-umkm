import type { ReactNode } from 'react'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function CategoriesLayout({
    children,
}: {
    children: ReactNode
}) {
    return <>{children}</>
}
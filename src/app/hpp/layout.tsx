import type { ReactNode } from 'react'
// Force dynamic rendering for all HPP pages
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HppLayout = ({
    children,
}: {
    children: ReactNode
}) => children

export default HppLayout
import type { ReactNode } from 'react'
// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const AuthLayout = ({
    children,
}: {
    children: ReactNode
}): JSX.Element => <>{children}</>

export default AuthLayout

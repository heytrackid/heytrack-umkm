import type { ReactNode } from 'react'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

const CustomersLayout = ({
    children,
}: {
    children: ReactNode
}): JSX.Element => <>{children}</>

export default CustomersLayout
import type { ReactNode } from 'react'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

const CategoriesLayout = ({
    children,
}: {
    children: ReactNode
}): JSX.Element => <>{children}</>

export default CategoriesLayout
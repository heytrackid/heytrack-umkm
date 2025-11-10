import { RegisterPageClient } from './RegisterPageClient'

// Force dynamic rendering (allowed in Server Components)
export const dynamic = 'force-dynamic'

const RegisterPage = async (): Promise<JSX.Element> => {
  return <RegisterPageClient />
}

export default RegisterPage

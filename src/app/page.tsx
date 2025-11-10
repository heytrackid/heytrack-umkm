import { redirect } from 'next/navigation'

/**
 * Root page - simple redirect to dashboard
 * Middleware handles all auth redirects, this is just a fallback
 */
export default async function HomePage(): Promise<never> {
  redirect('/dashboard')
}

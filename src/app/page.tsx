import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect directly to dashboard as main page
  redirect('/dashboard')
}

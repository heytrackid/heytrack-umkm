import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase'
import DashboardClient from './page-client' // Import the existing client component

export default async function DashboardProtected() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  // Pass user data to client component if needed
  return <DashboardClient user={data.user} />
}

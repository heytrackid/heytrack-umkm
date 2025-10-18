import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase'

export default async function Dashboard() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">My App</h2>
        <p className="text-lg text-foreground/60">
          Hello {data.user.email}!
        </p>
      </div>
      <div className="flex flex-col gap-8 w-full">
        <div>
          <h3 className="text-lg font-medium">Your user details</h3>
          <pre className="bg-muted p-4 rounded-lg mt-2 overflow-x-auto">
            {JSON.stringify(data.user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

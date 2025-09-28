import { auth } from '@clerk/nextjs/server'

export default async function Dashboard() {
  // This will automatically redirect to sign-in if user is not authenticated
  await auth.protect()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Protected Dashboard</h1>
      <p className="text-muted-foreground">
        This page is only accessible to authenticated users.
      </p>
      
      <div className="mt-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Server-side Protected</h2>
        <p>This page uses <code>auth.protect()</code> on the server side.</p>
        <p>Unauthenticated users are automatically redirected to sign-in.</p>
      </div>
    </div>
  )
}
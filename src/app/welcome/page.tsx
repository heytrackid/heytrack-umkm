import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">HeyTrack Bakery Management</h1>
        
        <SignedOut>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Welcome! Please sign in to access your bakery management dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <SignInButton mode="redirect">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-4">
            <p className="text-lg">Welcome back! You're successfully signed in.</p>
            <div className="flex flex-col items-center gap-4">
              <UserButton />
              <a 
                href="/" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
'use client'

import { useUser, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'

export default function TestClerkPage() {
  const { user, isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Clerk Test Page</h1>
      
      <SignedOut>
        <div className="space-y-4">
          <h2 className="text-xl">You are signed out</h2>
          <div className="space-x-4">
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-green-600 text-white rounded">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="space-y-4">
          <h2 className="text-xl">Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!</h2>
          <p>You are successfully signed in.</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </SignedIn>
      
      <div className="mt-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          isLoaded: {isLoaded.toString()}, isSignedIn: {isSignedIn.toString()}
        </p>
      </div>
    </div>
  )
}
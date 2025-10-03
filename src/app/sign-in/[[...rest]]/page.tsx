import { SignIn } from '@clerk/nextjs'
import type { ComponentProps } from 'react'
import Link from 'next/link'

type SignInProps = ComponentProps<typeof SignIn>

const authAppearance: SignInProps['appearance'] = {
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton'
  },
  variables: {
    colorPrimary: '#000000',
    colorText: '#0f172a',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#0f172a',
    borderRadius: '0.5rem',
    fontSize: '16px'
  },
  elements: {
    rootBox: 'bg-transparent shadow-none',
    card: 'border-0 bg-transparent p-0 shadow-none',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    formFieldLabel: 'text-sm font-medium text-gray-700 mb-2',
    formFieldInput:
      'h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:ring-0 focus:outline-none',
    formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600',
    formButtonPrimary:
      'h-12 rounded-lg bg-black text-sm font-medium text-white transition hover:bg-gray-800 w-full',
    socialButtonsBlockButton:
      'h-12 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50 flex items-center justify-center gap-2',
    socialButtonsIconButton: 'rounded-lg border border-gray-200 hover:bg-gray-50',
    dividerLine: 'bg-gray-200',
    dividerText: 'text-xs font-medium text-gray-400',
    footerAction: 'text-sm text-gray-600',
    footerActionLink: 'font-medium text-black hover:text-gray-700',
    identityPreview: 'rounded-lg border border-gray-200 bg-gray-50',
    formResendCodeLink: 'text-black hover:text-gray-700'
  }
}

const LeftPanel = () => (
  <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 p-12 text-white">
    {/* Gradient overlay with flowing lines effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
    
    {/* Flowing lines animation */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-pink-400/20 to-blue-400/20 blur-2xl animate-pulse" style={{animationDelay: '4s'}} />
    </div>

    {/* Curved lines pattern */}
    <div className="absolute inset-0 opacity-10">
      <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 100C100 50 200 150 400 100V200C300 250 200 150 0 200V100Z" fill="white" opacity="0.1"/>
        <path d="M0 200C150 150 250 250 400 200V300C250 350 150 250 0 300V200Z" fill="white" opacity="0.1"/>
        <path d="M0 300C200 250 300 350 400 300V400C200 450 100 350 0 400V300Z" fill="white" opacity="0.1"/>
        <path d="M0 400C100 350 300 450 400 400V500C300 550 100 450 0 500V400Z" fill="white" opacity="0.1"/>
      </svg>
    </div>

    <div className="relative z-10 flex h-full flex-col justify-between">
      {/* Top section with quote label */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">A WISE QUOTE</p>
        <div className="h-0.5 w-12 bg-white/60 rounded-full" />
      </div>

      {/* Main content */}
      <div className="space-y-6">
        <h2 className="text-5xl font-bold leading-tight">
          Get<br />
          Everything<br />
          You Want
        </h2>
        <p className="text-lg text-white/80 max-w-md leading-relaxed">
          You can get everything you want if you work hard, trust the process, and stick to the plan.
        </p>
      </div>
    </div>
  </div>
)

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex min-h-[600px]">
        <LeftPanel />
        
        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-12 bg-gray-50">
          <div className="w-full max-w-sm space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                Cogie
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-600 text-sm">
                  Enter your email and password to access your account
                </p>
              </div>
            </div>

            {/* Clerk Sign In Component */}
            <div className="space-y-6">
              <SignIn 
                appearance={authAppearance} 
                routing="path" 
                path="/sign-in" 
                redirectUrl="/dashboard"
                signUpUrl="/sign-up"
              />
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/sign-up" className="font-medium text-black hover:text-gray-700">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

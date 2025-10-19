// Client component for interactive buttons
'use client'
function NotFoundActions() {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={() => window.location.href = '/'}
        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        🏠 Go Home
      </button>
      <button
        onClick={() => window.history.back()}
        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        ← Go Back
      </button>
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">❓</span>
          </div>
          <h1 className="text-2xl font-bold">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <NotFoundActions />
        </div>
      </div>
    </div>
  )
}

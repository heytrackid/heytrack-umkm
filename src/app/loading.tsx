'use client'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-6" role="status" aria-live="polite">
        {/* Modern Spinning Loader */}
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-600 border-t-cyan-400"></div>
          <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-cyan-400/20"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-xl font-medium text-white">Memuat...</p>
          <p className="text-sm text-slate-400 mt-1">Mohon tunggu sebentar</p>
        </div>
      </div>
    </div>
  )
}

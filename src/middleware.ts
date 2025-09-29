// Temporarily disabled Clerk middleware for development
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// // Define public routes that don't require authentication
// const isPublicRoute = createRouteMatcher([
//   '/sign-in(.*)',
//   '/sign-up(.*)',
//   '/',  // Keep homepage public for now
//   '/home',  // Homepage with Clerk components
//   '/test-clerk',  // Testing page
// ])

// export default clerkMiddleware(async (auth, req) => {
//   // Protect all routes except public ones
//   if (!isPublicRoute(req)) {
//     await auth.protect()
//   }
// })

// Default middleware that allows all routes
export default function middleware() {
  return
}


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

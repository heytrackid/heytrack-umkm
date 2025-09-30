// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Ignore certain errors
  ignoreErrors: [
    // Network errors
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    // Supabase auth errors (expected)
    'AuthSessionMissingError',
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry server event (dev):', event)
      return null // Don't send to Sentry in development
    }

    // Add additional context
    if (event.request) {
      // Sanitize sensitive data
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
      }
    }

    return event
  },
})

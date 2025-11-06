import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

// Create a new ratelimit instance
export const ratelimit = new Ratelimit({
  redis: kv,
  // 10 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

// API rate limit: 100 requests per minute per IP
export const apiRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
})

// Strict rate limit for auth endpoints: 5 requests per minute per IP
export const authRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
})
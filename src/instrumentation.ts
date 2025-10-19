export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../instrumentation-server');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // For edge runtime, we'll use the client config for now
    // as Next.js handles edge runtime differently
    await import('../instrumentation-client');
  }
}

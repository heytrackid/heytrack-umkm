// External libraries
// Internal modules
import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute } from '@/lib/api/route-factory'

// Types and schemas
// Constants and config
// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/test',
  },
  async () => {
    return createSuccessResponse({ message: 'Test route working' })
  }
)
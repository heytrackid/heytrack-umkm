// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { apiLogger } from '@/lib/logger'
import { ReportService } from '@/services/reports/ReportService'
import type { NextResponse } from 'next/server'



// GET /api/reports/[...slug] - Dynamic reports routes
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/reports',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { params, request } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const subRoute = slug[0]

    switch (subRoute) {
      case 'inventory':
        return getInventoryReportHandler(context)
      case 'profit':
        return getProfitReportHandler(context, request)
      case 'sales':
        return getSalesReportHandler(context, request)
      default:
        return handleAPIError(new Error('Invalid report type'), 'API Route')
    }
  }
)

// Get inventory report handler
async function getInventoryReportHandler(context: RouteContext): Promise<NextResponse> {
  const { user } = context

  try {
    const reportService = new ReportService(context.supabase)
    const report = await reportService.getInventoryReport(user.id)

    apiLogger.info({ userId: user.id, totalItems: report.totalItems }, 'Inventory report generated')

    return createSuccessResponse(report)
  } catch (error) {
    return handleAPIError(error, 'GET /api/reports/inventory')
  }
}

// Get profit report handler
async function getProfitReportHandler(context: RouteContext, request: Request): Promise<NextResponse> {
  const { user } = context
  const { searchParams } = new URL(request.url)

  try {
    const filters: {
      aggregation: 'daily' | 'weekly' | 'monthly'
      includeBreakdown: boolean
      startDate?: string
      endDate?: string
    } = {
      aggregation: (searchParams.get('aggregation') as 'daily' | 'weekly' | 'monthly') || 'monthly',
      includeBreakdown: searchParams.get('include_breakdown') === 'true'
    }
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    if (startDate !== null) filters.startDate = startDate
    if (endDate !== null) filters.endDate = endDate

    const reportService = new ReportService(context.supabase)
    const report = await reportService.getProfitReport(user.id, filters)

    apiLogger.info({
      userId: user.id,
      period: report.period,
      totalRevenue: report.summary.totalRevenue
    }, 'Profit report generated')

    return createSuccessResponse(report)
  } catch (error) {
    return handleAPIError(error, 'GET /api/reports/profit')
  }
}

// Get sales report handler
async function getSalesReportHandler(context: RouteContext, request: Request): Promise<NextResponse> {
  const { user } = context
  const { searchParams } = new URL(request.url)

  try {
    const filters: { startDate?: string; endDate?: string } = {}
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    if (startDate !== null) filters.startDate = startDate
    if (endDate !== null) filters.endDate = endDate

    const reportService = new ReportService(context.supabase)
    const report = await reportService.getSalesReport(user.id, filters)

    apiLogger.info({
      userId: user.id,
      totalOrders: report.summary.totalOrders,
      totalRevenue: report.summary.totalRevenue
    }, 'Sales report generated')

    return createSuccessResponse(report)
  } catch (error) {
    return handleAPIError(error, 'GET /api/reports/sales')
  }
}
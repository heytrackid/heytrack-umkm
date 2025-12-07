/**
 * Customer Stats Service
 * Handles automatic customer statistics updates
 */

import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

export interface CustomerLTV {
  customer_id: string
  customer_name: string
  total_orders: number
  total_spent: number
  average_order_value: number
  order_frequency_days: number
  first_order_date: string
  last_order_date: string
  customer_age_days: number
  projected_ltv_1year: number
  projected_ltv_3year: number
  rfm_score: {
    recency: number // 1-5 (5 = most recent)
    frequency: number // 1-5 (5 = most frequent)
    monetary: number // 1-5 (5 = highest value)
    total: number // Sum of R+F+M
    segment: 'Champions' | 'Loyal' | 'Potential' | 'At Risk' | 'Lost'
  }
}

export class CustomerStatsService extends BaseService {
  private readonly logger = dbLogger

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Update customer stats after order delivered
   */
  async updateStatsFromOrder(
    customerId: string,
    orderAmount: number
  ): Promise<void> {
    try {
      // Get current customer stats
      const { data: customer, error: fetchError } = await this.context.supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', customerId)
        .eq('user_id', this.context.userId)
        .single()

      if (fetchError || !customer) {
        this.logger.warn({ customerId }, 'Customer not found for stats update')
        return
      }

      const newTotalOrders = (customer.total_orders ?? 0) + 1
      const newTotalSpent = Number(customer.total_spent ?? 0) + orderAmount

      // Update customer stats
      const { error: updateError } = await this.context.supabase
        .from('customers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          last_order_date: new Date().toISOString().split('T')[0] ?? null,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('user_id', this.context.userId)

      if (updateError) {
        this.logger.error({ error: updateError, customerId }, 'Failed to update customer stats')
        return
      }

      this.logger.info({ customerId, newTotalOrders, newTotalSpent }, 'Customer stats updated')
    } catch (error) {
      this.logger.error({ error, customerId }, 'Error updating customer stats')
    }
  }

  /**
   * Reverse customer stats when order cancelled
   */
  async reverseStatsFromOrder(
    customerId: string,
    orderAmount: number
  ): Promise<void> {
    try {
      const { data: customer, error: fetchError } = await this.context.supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', customerId)
        .eq('user_id', this.context.userId)
        .single()

      if (fetchError || !customer) {
        return
      }

      const newTotalOrders = Math.max(0, (customer.total_orders ?? 0) - 1)
      const newTotalSpent = Math.max(0, Number(customer.total_spent ?? 0) - orderAmount)

      await this.context.supabase
        .from('customers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('user_id', this.context.userId)

      this.logger.info({ customerId, newTotalOrders, newTotalSpent }, 'Customer stats reversed')
    } catch (error) {
      this.logger.error({ error, customerId }, 'Error reversing customer stats')
    }
  }

  /**
   * Calculate Customer Lifetime Value (LTV) with RFM segmentation
   */
  async calculateCustomerLTV(customerId: string): Promise<CustomerLTV> {
    // Get customer basic info
    const { data: customer, error: customerError } = await this.context.supabase
      .from('customers')
      .select('id, name, total_orders, total_spent')
      .eq('id', customerId)
      .eq('user_id', this.context.userId)
      .single()

    if (customerError || !customer) {
      throw new Error(`Customer not found: ${customerId}`)
    }

    // Get order history
    const { data: orders, error: ordersError } = await this.context.supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('customer_id', customerId)
      .eq('user_id', this.context.userId)
      .eq('status', 'DELIVERED')
      .order('created_at', { ascending: true })

    if (ordersError) {
      throw new Error('Failed to fetch order history')
    }

    const totalOrders = orders?.length ?? 0
    const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

    // Calculate dates
    const firstOrderDate = orders?.[0]?.created_at ?? new Date().toISOString()
    const lastOrderDate = orders?.[orders.length - 1]?.created_at ?? new Date().toISOString()
    
    const firstDate = new Date(firstOrderDate)
    const lastDate = new Date(lastOrderDate)
    const today = new Date()
    
    const customerAgeDays = Math.max(1, Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
    const daysSinceLastOrder = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate order frequency (average days between orders)
    const orderFrequencyDays = totalOrders > 1 
      ? Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24) / (totalOrders - 1))
      : customerAgeDays

    // Project LTV
    // Formula: (Average Order Value × Purchase Frequency per Year) × Customer Lifespan
    const purchasesPerYear = orderFrequencyDays > 0 ? 365 / orderFrequencyDays : 0
    const projectedLTV1Year = averageOrderValue * purchasesPerYear
    const projectedLTV3Year = projectedLTV1Year * 3 * 0.85 // 15% discount for retention uncertainty

    // Calculate RFM Score
    const rfmScore = this.calculateRFMScore(
      daysSinceLastOrder,
      totalOrders,
      totalSpent,
      customerAgeDays
    )

    return {
      customer_id: customerId,
      customer_name: customer.name,
      total_orders: totalOrders,
      total_spent: totalSpent,
      average_order_value: averageOrderValue,
      order_frequency_days: orderFrequencyDays,
      first_order_date: firstOrderDate.split('T')[0] ?? firstOrderDate,
      last_order_date: lastOrderDate.split('T')[0] ?? lastOrderDate,
      customer_age_days: customerAgeDays,
      projected_ltv_1year: projectedLTV1Year,
      projected_ltv_3year: projectedLTV3Year,
      rfm_score: rfmScore
    }
  }

  /**
   * Calculate RFM (Recency, Frequency, Monetary) score
   * Returns scores from 1-5 for each dimension
   */
  private calculateRFMScore(
    daysSinceLastOrder: number,
    totalOrders: number,
    totalSpent: number,
    customerAgeDays: number
  ): CustomerLTV['rfm_score'] {
    // Recency Score (5 = most recent, 1 = least recent)
    let recency = 1
    if (daysSinceLastOrder <= 7) recency = 5
    else if (daysSinceLastOrder <= 30) recency = 4
    else if (daysSinceLastOrder <= 60) recency = 3
    else if (daysSinceLastOrder <= 90) recency = 2

    // Frequency Score (5 = most frequent, 1 = least frequent)
    // Normalize by customer age to be fair to new customers
    const ordersPerMonth = customerAgeDays > 0 ? (totalOrders / customerAgeDays) * 30 : 0
    let frequency = 1
    if (ordersPerMonth >= 4) frequency = 5
    else if (ordersPerMonth >= 2) frequency = 4
    else if (ordersPerMonth >= 1) frequency = 3
    else if (ordersPerMonth >= 0.5) frequency = 2

    // Monetary Score (5 = highest value, 1 = lowest value)
    let monetary = 1
    if (totalSpent >= 10000000) monetary = 5 // 10M IDR
    else if (totalSpent >= 5000000) monetary = 4 // 5M IDR
    else if (totalSpent >= 2000000) monetary = 3 // 2M IDR
    else if (totalSpent >= 500000) monetary = 2 // 500K IDR

    const total = recency + frequency + monetary

    // Segment customers based on RFM
    let segment: CustomerLTV['rfm_score']['segment'] = 'Lost'
    
    if (recency >= 4 && frequency >= 4 && monetary >= 4) {
      segment = 'Champions' // Best customers
    } else if (recency >= 3 && frequency >= 3) {
      segment = 'Loyal' // Regular customers
    } else if (recency >= 4 && frequency <= 2) {
      segment = 'Potential' // New or returning customers
    } else if (recency <= 2 && frequency >= 3) {
      segment = 'At Risk' // Used to be good, now inactive
    } else {
      segment = 'Lost' // Inactive customers
    }

    return {
      recency,
      frequency,
      monetary,
      total,
      segment
    }
  }

  /**
   * Calculate LTV for all customers
   */
  async calculateAllCustomerLTV(): Promise<CustomerLTV[]> {
    const { data: customers, error } = await this.context.supabase
      .from('customers')
      .select('id')
      .eq('user_id', this.context.userId)
      .eq('is_active', true)

    if (error || !customers) {
      throw new Error('Failed to fetch customers')
    }

    const results: CustomerLTV[] = []

    for (const customer of customers) {
      try {
        const ltv = await this.calculateCustomerLTV(customer.id)
        results.push(ltv)
      } catch (err) {
        this.logger.error({ error: err, customerId: customer.id }, 'Failed to calculate LTV')
      }
    }

    // Sort by projected LTV (highest first)
    return results.sort((a, b) => b.projected_ltv_1year - a.projected_ltv_1year)
  }
}

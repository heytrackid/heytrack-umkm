// lib/services/customer-service.ts
// Example service demonstrating business logic separation

import { SanitizationPresets, sanitizeObject } from '@/lib/sanitization'
import type { Customer, CustomerInsert, CustomerUpdate } from '@/types/database'
import { BaseService, ServiceResult } from './base-service'

export interface CreateCustomerData {
  name: string
  email: string
  phone?: string
  address?: string
  customer_type?: 'regular' | 'retail' | 'wholesale' | 'vip'
  discount_percentage?: number
  notes?: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  is_active?: boolean
}

export class CustomerService extends BaseService {
  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerData): Promise<ServiceResult<unknown>> {
    return this.executeWithAudit(
      async () => {
        // Sanitize input data
        const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>, SanitizationPresets.userProfile)

        // Validate business rules
        await this.validateCustomerData(sanitizedData)

        // Check for duplicate email (only if email is provided)
        if (sanitizedData['email'] && sanitizedData['email'] !== '') {
          const existingCustomer = await this.context.supabase
            .from('customers')
            .select('id')
            .eq('email', sanitizedData['email'] as string)
            .eq('user_id', this.context.userId)
            .single()

          if (existingCustomer.data) {
            return this.createError('Customer with this email already exists', 'DUPLICATE_EMAIL')
          }
        }

        // Create customer
        const { data: customer, error } = await this.context.supabase
          .from('customers')
          .insert({
            ...(sanitizedData as CustomerInsert),
            user_id: this.context.userId,
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create customer: ${error.message}`)
        }

        return this.createResult(customer)
      },
      'CREATE',
      'customers',
      undefined,
      { customerData: data }
    )
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, data: UpdateCustomerData): Promise<ServiceResult<unknown>> {
    return this.executeWithAudit(
      async () => {
        // Verify ownership
        const existingCustomer = await this.getCustomerById(id)
        if (!existingCustomer) {
          return this.createError('Customer not found', 'NOT_FOUND')
        }

        // Sanitize input data
        const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>, SanitizationPresets.userProfile)

        // Validate business rules
        await this.validateCustomerData(sanitizedData, true)

        // Update customer
        const { data: customer, error } = await this.context.supabase
          .from('customers')
          .update(sanitizedData as CustomerUpdate)
          .eq('id', id)
          .eq('user_id', this.context.userId)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to update customer: ${error.message}`)
        }

        return this.createResult(customer)
      },
      'UPDATE',
      'customers',
      id,
      { updateData: data }
    )
  }

  /**
   * Delete a customer (with business rule validation)
   */
  async deleteCustomer(id: string): Promise<ServiceResult<unknown>> {
    return this.executeWithAudit(
      async () => {
        // Check if customer has orders
        const { data: orders } = await this.context.supabase
          .from('orders')
          .select('id')
          .eq('customer_id', id)
          .eq('user_id', this.context.userId)
          .limit(1)

        if (orders && orders.length > 0) {
          return this.createError(
            'Cannot delete customer with existing orders. Please delete orders first.',
            'HAS_ORDERS'
          )
        }

        // Delete customer
        const { error } = await this.context.supabase
          .from('customers')
          .delete()
          .eq('id', id)
          .eq('user_id', this.context.userId)

        if (error) {
          throw new Error(`Failed to delete customer: ${error.message}`)
        }

        return this.createResult(true)
      },
      'DELETE',
      'customers',
      id
    )
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<unknown | null> {
    const { data, error } = await this.context.supabase
      .from('customers')
      .select('id, address, created_at, created_by, customer_type, discount_percentage, email, favorite_items, is_active, last_order_date, loyalty_points, name, notes, phone, total_orders, total_spent, updated_at, updated_by, user_id')
      .eq('id', id)
      .eq('user_id', this.context.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch customer: ${error.message}`)
    }

    return data
  }

  /**
   * List customers with filtering and pagination
   */
  async listCustomers(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<ServiceResult<{ customers: Customer[], total: number }>> {
    const {
      page = 1,
      limit = 50,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options

    const offset = (page - 1) * limit

    let query = this.context.supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('user_id', this.context.userId)

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to list customers: ${error.message}`)
    }

    return this.createResult({
      customers: data || [],
      total: count || 0
    })
  }

  /**
   * Validate customer data according to business rules
   */
  private async validateCustomerData(
    data: Partial<CreateCustomerData>,
    isUpdate = false
  ): Promise<void> {
    // Required fields for creation
    if (!isUpdate) {
      if (!data.name?.trim()) {
        throw new Error('Customer name is required')
      }
      // Email is now optional
    }

    // Email format validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format')
      }
    }

    // Phone format validation
    if (data.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(data.phone)) {
        throw new Error('Invalid phone number format')
      }
    }

    // Discount percentage validation
    if (data.discount_percentage !== undefined) {
      if (data.discount_percentage < 0 || data.discount_percentage > 100) {
        throw new Error('Discount percentage must be between 0 and 100')
      }
    }

    // Customer type validation
    if (data.customer_type && !['regular', 'retail', 'wholesale', 'vip'].includes(data.customer_type)) {
      throw new Error('Invalid customer type')
    }
  }
}
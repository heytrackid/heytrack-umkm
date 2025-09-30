/**
 * AutoReorderService
 * Automated inventory reordering system that monitors stock levels
 * and generates purchase orders when ingredients reach minimum thresholds
 */

import { supabase } from '@/lib/supabase'

export interface ReorderRule {
  id: string
  ingredient_id: string
  min_stock_threshold: number
  reorder_quantity: number
  preferred_supplier_id?: string
  max_price_per_unit?: number
  is_active: boolean
  last_reorder_date?: string
  reorder_frequency_days?: number
  auto_approve?: boolean
  created_at: string
  updated_at: string
}

export interface SupplierInfo {
  id: string
  name: string
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  payment_terms?: string
  delivery_days?: number
  minimum_order_value?: number
  is_active: boolean
}

export interface PurchaseOrder {
  id: string
  po_number: string
  supplier_id: string
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled'
  order_date: string
  expected_delivery_date?: string
  total_amount: number
  notes?: string
  items: PurchaseOrderItem[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  ingredient_id: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
}

export interface ReorderAlert {
  id: string
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  min_stock: number
  suggested_reorder_quantity: number
  preferred_supplier?: SupplierInfo
  estimated_cost: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  auto_reorder_enabled: boolean
  created_at: string
}

export interface ReorderSummary {
  total_alerts: number
  critical_items: number
  total_estimated_cost: number
  auto_orders_generated: number
  manual_review_required: number
  alerts: ReorderAlert[]
}

class AutoReorderService {
  private readonly URGENCY_THRESHOLDS = {
    critical: 0, // Out of stock
    high: 0.5,   // 50% below minimum
    medium: 0.8, // 20% below minimum  
    low: 1.0     // At minimum stock
  }

  /**
   * Check all ingredients and generate reorder alerts
   */
  async checkReorderNeeds(): Promise<ReorderSummary> {
    try {
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true)

      if (ingredientsError) throw ingredientsError

      const { data: reorderRules, error: rulesError } = await supabase
        .from('inventory_reorder_rules')
        .select('*')
        .eq('is_active', true)

      if (rulesError) throw rulesError

      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)

      if (suppliersError) throw suppliersError

      const alerts: ReorderAlert[] = []
      let autoOrdersGenerated = 0

      for (const ingredient of ingredients || []) {
        const rule = reorderRules?.find(r => r.ingredient_id === ingredient.id)
        const currentStock = ingredient.current_stock || 0
        const minStock = ingredient.min_stock || 0

        // Check if reorder is needed
        if (this.needsReorder(currentStock, minStock, rule)) {
          const urgency = this.calculateUrgency(currentStock, minStock)
          const suggestedQuantity = this.calculateReorderQuantity(ingredient, rule)
          const preferredSupplier = suppliers?.find(s => s.id === rule?.preferred_supplier_id)
          const estimatedCost = this.estimateReorderCos""

          const alert: ReorderAlert = {
            id: `alert_${ingredient.id}_${Date.now()}`,
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            current_stock: currentStock,
            min_stock: minStock,
            suggested_reorder_quantity: suggestedQuantity,
            preferred_supplier: preferredSupplier,
            estimated_cost: estimatedCost,
            urgency,
            auto_reorder_enabled: rule?.auto_approve || false,
            created_at: new Date().toISOString()
          }

          alerts.push(alert)

          // Auto-generate purchase order if enabled and conditions are met
          if (rule?.auto_approve && this.shouldAutoReorder(alert, rule)) {
            try {
              await this.generateAutoPurchaseOrder(alert, rule, preferredSupplier)
              autoOrdersGenerated++
            } catch (error) {
              console.error(`Failed to generate auto purchase order for ${ingredient.name}:`, error)
            }
          }
        }
      }

      // Save alerts to database for dashboard display
      await this.saveReorderAlerts(alerts)

      return {
        total_alerts: alerts.length,
        critical_items: alerts.filter(a => a.urgency === 'critical').length,
        total_estimated_cost: alerts.reduce((sum, a) => sum + a.estimated_cost, 0),
        auto_orders_generated: autoOrdersGenerated,
        manual_review_required: alerts.filter(a => !a.auto_reorder_enabled).length,
        alerts
      }
    } catch (error) {
      console.error('Error checking reorder needs:', error)
      throw error
    }
  }

  /**
   * Generate purchase order automatically
   */
  async generateAutoPurchaseOrder(
    alert: ReorderAlert, 
    rule: ReorderRule, 
    supplier?: SupplierInfo
  ): Promise<PurchaseOrder> {
    if (!supplier) {
      throw new Error('No supplier specified for auto purchase order')
    }

    const poNumber = await this.generatePONumber()
    
    const purchaseOrder: Omit<PurchaseOrder, 'id'> = {
      po_number: poNumber,
      supplier_id: supplier.id,
      status: 'draft',
      order_date: new Date().toISOString(),
      expected_delivery_date: this.calculateExpectedDelivery(supplier.delivery_days),
      total_amount: alert.estimated_cost,
      notes: `Auto-generated reorder for ${alert.ingredient_name}`,
      items: [{
        id: `item_${alert.ingredient_id}_${Date.now()}`,
        purchase_order_id: '', // Will be set after PO creation
        ingredient_id: alert.ingredient_id,
        quantity: alert.suggested_reorder_quantity,
        unit_price: alert.estimated_cost / alert.suggested_reorder_quantity,
        total_price: alert.estimated_cost,
        notes: `Auto reorder - Current stock: ${alert.current_stock}, Min stock: ${alert.min_stock}`
      }],
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create purchase order in database
    const { data: createdPO, error: poError } = await supabase
      .from('purchase_orders')
      .insert(data)
      .select('*')
      .single()

    if (poError) throw poError

    // Create purchase order items
    const items = purchaseOrder.items.map(item => ({
      ...item,
      purchase_order_id: createdPO.id
    }))

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(data)

    if (itemsError) throw itemsError

    // Update reorder rule last_reorder_date
    await supabase
      .from('inventory_reorder_rules')
      .update({
        last_reorder_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', rule.id)

    return {
      ...createdPO,
      items
    }
  }

  /**
   * Create or update reorder rules for ingredients
   */
  async createReorderRule(rule: Omit<ReorderRule, 'id' | 'created_at' | 'updated_at'>): Promise<ReorderRule> {
    const { data, error } = await supabase
      .from('inventory_reorder_rules')
      .insert({
        ...rule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get reorder alerts for dashboard
   */
  async getReorderAlerts(): Promise<ReorderAlert[]> {
    const { data, error } = await supabase
      .from('inventory_reorder_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(options.limit)

    if (error) throw error
    return data || []
  }

  /**
   * Get purchase orders with status filtering
   */
  async getPurchaseOrders(status?: PurchaseOrder['status']): Promise<PurchaseOrder[]> {
    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          ingredient:ingredients(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Private helper methods
   */
  private needsReorder(currentStock: number, minStock: number, rule?: ReorderRule): boolean {
    const threshold = rule?.min_stock_threshold || minStock
    return currentStock <= threshold
  }

  private calculateUrgency(currentStock: number, minStock: number): ReorderAlert['urgency'] {
    if (currentStock <= 0) return 'critical'
    
    const ratio = currentStock / minStock
    if (ratio <= this.URGENCY_THRESHOLDS.high) return 'high'
    if (ratio <= this.URGENCY_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  private calculateReorderQuantity(ingredient: any, rule?: ReorderRule): number {
    if (rule?.reorder_quantity) {
      return rule.reorder_quantity
    }

    // Default logic: reorder to 150% of minimum stock
    return Math.ceil((ingredient.min_stock || 0) * 1.5)
  }

  private estimateReorderCos"": number {
    const unitPrice = ingredient.price_per_unit || 0
    return quantity * unitPrice
  }

  private shouldAutoReorder(alert: ReorderAlert, rule: ReorderRule): boolean {
    // Check if enough time has passed since last reorder
    if (rule.last_reorder_date && rule.reorder_frequency_days) {
      const daysSinceLastReorder = Math.floor(
        (Date.now() - new Date(rule.last_reorder_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceLastReorder < rule.reorder_frequency_days) {
        return false
      }
    }

    // Auto-reorder for high and critical urgency items
    return alert.urgency === 'high' || alert.urgency === 'critical'
  }

  private async generatePONumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    
    // Get count of POs created today
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .gte('created_at', `${today.toISOString().slice(0, 10)}T00:00:00`)
      .l"Placeholder".slice(0, 10)}T23:59:59`)

    const dailyCount = (data?.length || 0) + 1
    return `PO-${dateStr}-${dailyCount.toString().padStar""}`
  }

  private calculateExpectedDelivery(deliveryDays?: number): string {
    const days = deliveryDays || 3 // Default 3 days
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + days)
    return deliveryDate.toISOString()
  }

  private async saveReorderAlerts(alerts: ReorderAlert[]): Promise<void> {
    if (alerts.length === 0) return

    // Clear existing alerts for today
    const today = new Date().toISOString().slice(0, 10)
    await supabase
      .from('inventory_reorder_alerts')
      .delete()
      .gte('created_at', `${today}T00:00:00`)

    // Insert new alerts
    const { error } = await supabase
      .from('inventory_reorder_alerts')
      .insert(data)

    if (error) {
      console.error('Error saving reorder alerts:', error)
    }
  }
}

export const autoReorderService = new AutoReorderService()
export default AutoReorderService
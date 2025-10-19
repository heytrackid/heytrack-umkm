interface SmartNotification {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'inventory' | 'production' | 'financial' | 'order'
  title: string
  message: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
  read: boolean
  data?: any
}

export async function fetchNotificationData(): Promise<{ ingredients: any[], orders: any[] }> {
  // Fetch data needed for automation engine analysis with timeout
  const fetchWithTimeout = (url: string, timeout = 5000) => {
    return Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ])
  }

  const [ingredientsRes, ordersRes] = await Promise.allSettled([
    fetchWithTimeout('/api/ingredients'),
    fetchWithTimeout('/api/orders')
  ])

  // Extract data with fallback to empty arrays
  let ingredients: any[] = []
  let orders: any[] = []

  if (ingredientsRes.status === 'fulfilled' && ingredientsRes.value.ok) {
    try {
      const data = await ingredientsRes.value.json()
      ingredients = Array.isArray(data) ? data : []
    } catch (e) {
      console.warn('Failed to parse ingredients data:', e)
    }
  }

  if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
    try {
      const data = await ordersRes.value.json()
      orders = Array.isArray(data) ? data : []
    } catch (e) {
      console.warn('Failed to parse orders data:', e)
    }
  }

  return { ingredients, orders }
}

export async function generateAdditionalNotifications(
  ingredients: any[],
  orders: any[]
): Promise<SmartNotification[]> {
  const additional: SmartNotification[] = []

  // Check for orders with tight delivery schedules
  const urgentOrders = orders.filter(order => {
    if (!order.delivery_date) return false
    const deliveryTime = new Date(order.delivery_date).getTime()
    const now = Date.now()
    const hoursUntilDelivery = (deliveryTime - now) / (1000 * 60 * 60)
    return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0 && order.status !== 'DELIVERED'
  })

  if (urgentOrders.length > 0) {
    additional.push({
      id: `urgent-orders-${Date.now()}`,
      type: 'warning',
      category: 'order',
      title: `${urgentOrders.length} Pesanan Mendesak!`,
      message: `Ada ${urgentOrders.length} pesanan yang harus diselesaikan dalam 24 jam`,
      priority: 'high',
      timestamp: new Date(),
      read: false,
      data: { orders: urgentOrders }
    })
  }

  // Check for profitable vs unprofitable items
  const lowMarginCount = orders.filter(order => {
    return order.order_items?.some((item: any) => {
      const margin = item.unit_price > 0 ? ((item.unit_price - 5000) / item.unit_price) * 100 : 0
      return margin < 30
    })
  }).length

  if (lowMarginCount > 0) {
    additional.push({
      id: `low-margin-${Date.now()}`,
      type: 'info',
      category: 'financial',
      title: 'Margin Keuntungan Perlu Perhatian',
      message: `${lowMarginCount} pesanan dengan margin rendah. Pertimbangkan review pricing`,
      priority: 'medium',
      timestamp: new Date(),
      read: false
    })
  }

  // HPP calculation recommendations
  const needsHPPReview = ingredients.filter(ing => ing.stock > ing.min_stock * 2).length
  if (needsHPPReview > 3) {
    additional.push({
      id: `hpp-review-${Date.now()}`,
      type: 'info',
      category: 'inventory',
      title: '💡 Optimasi Inventory Tersedia',
      message: `${needsHPPReview} bahan dengan stock berlebih. Pertimbangkan bundling atau menu spesial`,
      priority: 'low',
      timestamp: new Date(),
      read: false
    })
  }

  return additional
}

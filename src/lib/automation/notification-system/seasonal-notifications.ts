import type { SmartNotification } from './types'

/**
 * Seasonal Notifications Module
 * Handles seasonal business notification generation
 */


export class SeasonalNotifications {
  /**
   * Generate seasonal business notifications
   */
  static generateSeasonalNotifications(): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12
    const _day = now.getDate()

    // Holiday season preparations
    const holidays = [
      { name: 'Lebaran', months: [5, 6], message: 'Persiapkan produk lebaran dan stok ekstra' },
      { name: 'Natal', months: [12], message: 'Season kue natal - tingkatkan produksi cake dan cookies' },
      { name: 'Tahun Baru', months: [12, 1], message: 'Persiapan celebration cake untuk tahun baru' },
      { name: 'Valentine', months: [2], message: 'Valentine season - fokus pada cake romantis dan coklat' }
    ]

    holidays.forEach(holiday => {
      if (holiday.months.includes(month)) {
        notifications.push({
          type: 'info',
          category: 'production',
          title: `${holiday.name} Season`,
          message: holiday.message,
          action: 'plan_seasonal_production',
          priority: 'medium',
          timestamp: now,
          data: { season: holiday.name, month }
        })
      }
    })

    // Weather-based notifications
    if (month >= 10 || month <= 3) { // Rainy season
      notifications.push({
        type: 'info',
        category: 'inventory',
        title: 'Musim Hujan',
        message: 'Pastikan penyimpanan bahan kering terlindungi dari kelembaban.',
        action: 'check_storage',
        priority: 'low',
        timestamp: now,
        data: { season: 'rainy' }
      })
    }

    return notifications
  }
}

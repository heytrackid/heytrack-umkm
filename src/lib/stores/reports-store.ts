// Reports Store - Zustand Implementation
// Real-time business analytics

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { dbLogger } from '@/lib/logger'
import type { Report, SyncEvent } from '../data-synchronization/types'
import { syncEmitter } from '../data-synchronization/sync-events'

interface ReportsStore {
  // Data
  currentReport: Report | null
  reportHistory: Report[]

  // Sync state
  syncEvents: SyncEvent[]
  lastSyncTime: Date
  isOnline: boolean

  // Actions
  generateReport: (periode: string) => Promise<void>
  updateReport: (updates: Partial<Report>) => void

  // Business logic
  getReportByPeriod: (periode: string) => Report | undefined
  getLatestReport: () => Report | undefined
  calculateProfitMargin: () => number

  // Sync functions
  emitSyncEvent: (event: Omit<SyncEvent, 'timestamp'>) => void
  syncCrossPlatform: () => Promise<void>
}

const initialReport: Report = {
  periode: 'current',
  totalPendapatan: 0,
  totalPengeluaran: 0,
  keuntungan: 0,
  totalPesanan: 0,
  produkTerlaris: [],
  bahanKritis: [],
  pelangganAktif: 0,
  marginRataRata: 0,
  lastGenerated: new Date()
}

export const useReportsStore = create<ReportsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentReport: initialReport,
    reportHistory: [],
    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,

    // Actions
    generateReport: async (periode) => {
      // This would calculate report data from other stores
      // For now, create a mock report
      const newReport: Report = {
        periode,
        totalPendapatan: 1000000,
        totalPengeluaran: 600000,
        keuntungan: 400000,
        totalPesanan: 50,
        produkTerlaris: [
          { nama: 'Kue Coklat', terjual: 20 },
          { nama: 'Brownies', terjual: 15 }
        ],
        bahanKritis: ['Tepung Terigu', 'Mentega'],
        pelangganAktif: 25,
        marginRataRata: 40,
        lastGenerated: new Date()
      }

      set((state) => ({
        currentReport: newReport,
        reportHistory: [...state.reportHistory, newReport]
      }))

      get().emitSyncEvent({
        type: 'price_updated', // Could be report_generated
        payload: { periode, report: newReport },
        source: 'reports-store'
      })

      dbLogger.info(`Report generated for period: ${periode}`)
    },

    updateReport: (updates) => {
      set((state) => ({
        currentReport: state.currentReport ? { ...state.currentReport, ...updates } : null
      }))

      dbLogger.info('Report updated')
    },

    // Business logic
    getReportByPeriod: (periode) => {
      return get().reportHistory.find(report => report.periode === periode)
    },

    getLatestReport: () => {
      return get().currentReport
    },

    calculateProfitMargin: () => {
      const report = get().currentReport
      if (!report || report.totalPendapatan === 0) return 0

      return (report.keuntungan / report.totalPendapatan) * 100
    },

    // Sync functions
    emitSyncEvent: (event) => {
      const syncEvent: SyncEvent = {
        ...event,
        timestamp: new Date()
      }

      set((state) => ({
        syncEvents: [...state.syncEvents, syncEvent]
      }))

      syncEmitter.emit(event.type as any, event.payload, event.source)
    },

    syncCrossPlatform: async () => {
      set({ lastSyncTime: new Date() })
      dbLogger.info('Reports store synced cross-platform')
    }
  }))
)

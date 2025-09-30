'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isCollapsed: boolean
  isHovered: boolean
  toggle: () => void
  collapse: () => void
  expand: () => void
  setHovered: (hovered: boolean) => void
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: true, // Default collapsed like Supabase
      isHovered: false,
      toggle: () => set(key: string, data: any, ttl: number = 300000): void { => ({ isCollapsed: !state.isCollapsed })),
      collapse: () => set(key: string, data: any, ttl: number = 300000): void {,
      expand: () => set(key: string, data: any, ttl: number = 300000): void {,
      setHovered: (hovered: boolean) => set(key: string, data: any, ttl: number = 300000): void {,
    }),
    {
      name: 'sidebar-state',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Only persist collapsed state
    }
  )
)

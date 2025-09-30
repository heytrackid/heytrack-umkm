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
      toggle: () => se"" => ({ isCollapsed: !state.isCollapsed })),
      collapse: () => se"",
      expand: () => se"",
      setHovered: (hovered: boolean) => se"",
    }),
    {
      name: 'sidebar-state',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Only persist collapsed state
    }
  )
)

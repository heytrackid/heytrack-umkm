'use client'

/**
 * Sidebar Component
 * 
 * Uses regular import instead of dynamic import because:
 * - Sidebar is critical navigation needed immediately on every page
 * - Prevents layout shift (better CLS score)
 * - Better user experience (no skeleton flash)
 * - Components are small (~20KB total)
 * 
 * For heavy components like charts, continue using dynamic imports.
 */

import LazySidebar from './sidebar/LazySidebar'

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

const Sidebar = ({ isOpen, onToggle, isMobile }: SidebarProps) => (
  <LazySidebar
    isOpen={isOpen}
    onToggle={onToggle}
    isMobile={isMobile}
  />
)

export default Sidebar

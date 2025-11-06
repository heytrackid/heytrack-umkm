import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SmartBottomNav, NavItem } from '../SmartNavigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

// Mock the preloading hooks
vi.mock('@/hooks/usePreloading', () => ({
  useAdvancedLinkPreloading: vi.fn(() => ({
    onMouseEnter: vi.fn(),
    onFocus: vi.fn(),
  })),
  useAdvancedButtonPreloading: vi.fn(() => ({
    preloadModalOnHover: vi.fn(),
    preloadChartOnHover: vi.fn(),
  })),
}))

describe('SmartNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('NavItem', () => {
    const mockItem = {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      preloadTargets: ['/orders', '/cash-flow', '/ingredients'] as string[]
    }

    it('should render navigation item with correct title and icon', () => {
      ;(usePathname as any).mockReturnValue('/dashboard')

      render(<NavItem item={mockItem} index={0} />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('nav-icon')).toBeInTheDocument()
    })

    it('should show active state when pathname matches href', () => {
      ;(usePathname as any).mockReturnValue('/dashboard')

      render(<NavItem item={mockItem} index={0} />)

      const link = screen.getByRole('navigation', { name: 'Navigate to Dashboard' })
      expect(link).toHaveClass('text-primary')
      expect(link).toHaveClass('bg-primary/10')
    })

    it('should show active state for dashboard when pathname is root', () => {
      const dashboardItem = {
        title: 'Dasbor',
        href: '/dashboard',
        icon: LayoutDashboard,
        preloadTargets: ['/orders', '/cash-flow', '/ingredients'] as string[]
      }

      ;(usePathname as any).mockReturnValue('/')

      render(<NavItem item={dashboardItem} index={0} />)

      const link = screen.getByRole('navigation', { name: 'Navigate to Dasbor' })
      expect(link).toHaveClass('text-primary')
    })

    it('should show active state when pathname starts with href', () => {
      const ordersItem = {
        title: 'Orders',
        href: '/orders',
        icon: LayoutDashboard,
        preloadTargets: ['/customers', '/orders/new'] as string[]
      }

      ;(usePathname as any).mockReturnValue('/orders/new')

      render(<NavItem item={ordersItem} index={0} />)

      const link = screen.getByRole('navigation', { name: 'Navigate to Orders' })
      expect(link).toHaveClass('text-primary')
    })

    it('should not show active state when pathname does not match', () => {
      ;(usePathname as any).mockReturnValue('/orders')

      render(<NavItem item={mockItem} index={0} />)

      const link = screen.getByRole('navigation', { name: 'Navigate to Dashboard' })
      expect(link).not.toHaveClass('text-primary')
      expect(link).not.toHaveClass('bg-primary/10')
    })

    it('should render active indicator dot when active', () => {
      ;(usePathname as any).mockReturnValue('/dashboard')

      render(<NavItem item={mockItem} index={0} />)

      const activeDot = screen.getByTestId('active-indicator')
      expect(activeDot).toHaveClass('opacity-100')
    })

    it('should hide active indicator dot when not active', () => {
      ;(usePathname as any).mockReturnValue('/orders')

      render(<NavItem item={mockItem} index={0} />)

      const activeDot = screen.getByTestId('active-indicator')
      expect(activeDot).toHaveClass('opacity-0')
    })
  })

  describe('SmartBottomNav', () => {
    it('should render main navigation items', () => {
      ;(usePathname as any).mockReturnValue('/dashboard')

      render(<SmartBottomNav />)

      expect(screen.getByText('Dasbor')).toBeInTheDocument()
      expect(screen.getByText('Pesanan')).toBeInTheDocument()
      expect(screen.getByText('Pelanggan')).toBeInTheDocument()
      expect(screen.getByText('Bahan')).toBeInTheDocument()
      expect(screen.getByText('Lainnya')).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
      ;(usePathname as any).mockReturnValue('/dashboard')

      render(<SmartBottomNav />)

      const nav = screen.getByTestId('mobile-nav')
      expect(nav).toHaveAttribute('aria-label', 'Mobile navigation')
    })
  })
})
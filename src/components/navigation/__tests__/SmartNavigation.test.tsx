import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SmartBottomNav, NavItem } from '@/components/navigation/SmartNavigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'

//  Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

const mockUsePathname = vi.mocked(usePathname)

//  the preloading hooks
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

//  useInstantNavigation
vi.mock('@/hooks/useInstantNavigation', () => ({
  useInstantNavigation: vi.fn(() => ({
    navigateInstant: vi.fn(),
    prefetchRoute: vi.fn(),
  })),
}))

describe('SmartNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('NavItem', () => {
    const Item = {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      preloadTargets: ['/orders', '/cash-flow', '/ingredients'] as string[]
    }

    it('should render navigation item with correct title and icon', () => {
      vi.mocked(usePathname).mockReturnValue('/dashboard')

      render(<NavItem item={Item} index={0} />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('nav-icon')).toBeInTheDocument()
    })

    it('should show active state when pathname matches href', () => {
      vi.mocked(usePathname).mockReturnValue('/dashboard')

      render(<NavItem item={Item} index={0} />)

      const link = screen.getByRole('button', { name: 'Navigate to Dashboard' })
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

      mockUsePathname.mockReturnValue('/')

      render(<NavItem item={dashboardItem} index={0} />)

      const link = screen.getByRole('button', { name: 'Navigate to Dasbor' })
      expect(link).toHaveClass('text-primary')
    })

    it('should show active state when pathname starts with href', () => {
      const ordersItem = {
        title: 'Orders',
        href: '/orders',
        icon: LayoutDashboard,
        preloadTargets: ['/customers', '/orders/new'] as string[]
      }

      mockUsePathname.mockReturnValue('/orders/new')

      render(<NavItem item={ordersItem} index={0} />)

      const link = screen.getByRole('button', { name: 'Navigate to Orders' })
      expect(link).toHaveClass('text-primary')
    })

    it('should not show active state when pathname does not match', () => {
      mockUsePathname.mockReturnValue('/orders')

      render(<NavItem item={Item} index={0} />)

      const link = screen.getByRole('button', { name: 'Navigate to Dashboard' })
      expect(link).not.toHaveClass('text-primary')
      expect(link).not.toHaveClass('bg-primary/10')
    })

    it('should render active indicator dot when active', () => {
      ;(usePathname as any).ReturnValue('/dashboard')

      render(<NavItem item={Item} index={0} />)

      const activeDot = screen.getByTestId('active-indicator')
      expect(activeDot).toHaveClass('opacity-100')
    })

    it('should hide active indicator dot when not active', () => {
      mockUsePathname.mockReturnValue('/orders')

      render(<NavItem item={Item} index={0} />)

      const activeDot = screen.getByTestId('active-indicator')
      expect(activeDot).toHaveClass('opacity-0')
    })
  })

  describe('SmartBottomNav', () => {
    it('should render main navigation items', () => {
      ;(usePathname as any).ReturnValue('/dashboard')

      render(<SmartBottomNav />)

      expect(screen.getByText('Dasbor')).toBeInTheDocument()
      expect(screen.getByText('Pesanan')).toBeInTheDocument()
      expect(screen.getByText('Pelanggan')).toBeInTheDocument()
      expect(screen.getByText('Bahan')).toBeInTheDocument()
      expect(screen.getByText('Lainnya')).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
      ;(usePathname as any).ReturnValue('/dashboard')

      render(<SmartBottomNav />)

      const nav = screen.getByTestId('mobile-nav')
      expect(nav).toHaveAttribute('aria-label', 'Mobile navigation')
    })
  })
})
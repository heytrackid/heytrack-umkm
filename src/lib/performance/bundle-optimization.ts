/**
 * Bundle Optimization Utilities
 * 
 * Tips untuk mengurangi bundle size:
 * 1. Use dynamic imports untuk heavy components
 * 2. Tree-shake unused code
 * 3. Use lighter alternatives
 * 4. Defer non-critical code
 */

/**
 * Dynamically import heavy libraries only when needed
 */
export const lazyImports = {
  // Charts - Load only when needed
  recharts: () => import('recharts'),
  
  // Excel export - Load only when exporting
  exceljs: () => import('exceljs'),
  
  // File saver - Load only when downloading
  fileSaver: () => import('file-saver'),
  
  // Date picker - Load only when date input is shown
  datePicker: () => import('react-day-picker'),
  
  // Rich text editor - Load only when editing
  // editor: () => import('@tiptap/react'),
  
  // PDF generation - Load only when generating PDF
  // pdf: () => import('jspdf'),
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') {return}

  // Preload fonts
  const fonts = [
    '/fonts/geist-sans.woff2',
    '/fonts/geist-mono.woff2'
  ]

  fonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = font
    document.head.appendChild(link)
  })
}

/**
 * Prefetch next page resources
 */
export function prefetchRoute(route: string) {
  if (typeof window === 'undefined') {return}

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = route
  document.head.appendChild(link)
}

/**
 * Check if feature should be loaded based on device
 */
export function shouldLoadFeature(feature: string): boolean {
  if (typeof window === 'undefined') {return false}

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isSlowConnection = 'connection' in navigator && 
    (navigator as any).connection?.effectiveType === '2g'

  // Don't load heavy features on mobile with slow connection
  const heavyFeatures = ['charts', 'export', 'ai-chatbot']
  
  if (isMobile && isSlowConnection && heavyFeatures.includes(feature)) {
    return false
  }

  return true
}

/**
 * Get optimal image quality based on connection
 */
export function getOptimalImageQuality(): number {
  if (typeof window === 'undefined') {return 75}

  const {connection} = (navigator as any)
  
  if (!connection) {return 75}

  switch (connection.effectiveType) {
    case '4g':
      return 85
    case '3g':
      return 65
    case '2g':
      return 45
    default:
      return 75
  }
}

/**
 * Defer non-critical scripts
 */
export function deferNonCriticalScripts() {
  if (typeof window === 'undefined') {return}

  // Defer analytics
  setTimeout(() => {
    // Load analytics script
    const script = document.createElement('script')
    script.src = '/analytics.js'
    script.async = true
    document.body.appendChild(script)
  }, 3000)
}

/**
 * Remove unused CSS
 */
export function removeUnusedCSS() {
  if (typeof window === 'undefined') {return}
  if (process.env.NODE_ENV !== 'production') {return}

  // This would typically be done at build time with PurgeCSS
  // But we can also do runtime cleanup for dynamic content
  
  const usedSelectors = new Set<string>()
  
  // Get all elements
  document.querySelectorAll('*').forEach(el => {
    el.classList.forEach(className => {
      usedSelectors.add(`.${className}`)
    })
  })

  // Log unused selectors (in dev)
  console.log('Used CSS selectors:', usedSelectors.size)
}

/**
 * Optimize third-party scripts
 */
export function optimizeThirdPartyScripts() {
  if (typeof window === 'undefined') {return}

  // Delay third-party scripts until page is interactive
  if (document.readyState === 'complete') {
    loadThirdPartyScripts()
  } else {
    window.addEventListener('load', loadThirdPartyScripts)
  }
}

function loadThirdPartyScripts() {
  // Load non-critical third-party scripts
  // Example: Google Analytics, Hotjar, etc.
  
  // Use requestIdleCallback if available
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      // Load scripts here
    })
  } else {
    setTimeout(() => {
      // Load scripts here
    }, 2000)
  }
}

/**
 * Monitor bundle size in development
 */
export function monitorBundleSize() {
  if (typeof window === 'undefined') {return}
  if (process.env.NODE_ENV !== 'development') {return}

  const resources = performance.getEntriesByType('resource')
  
  const jsResources = resources.filter(r => r.name.endsWith('.js'))
  const cssResources = resources.filter(r => r.name.endsWith('.css'))
  
  const totalJSSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0)
  const totalCSSSize = cssResources.reduce((acc, r) => acc + (r.transferSize || 0), 0)
  
  console.group('📦 Bundle Size Monitor')
  console.log(`JavaScript: ${(totalJSSize / 1024).toFixed(2)} KB`)
  console.log(`CSS: ${(totalCSSSize / 1024).toFixed(2)} KB`)
  console.log(`Total: ${((totalJSSize + totalCSSSize) / 1024).toFixed(2)} KB`)
  console.groupEnd()
}

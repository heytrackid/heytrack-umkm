/** @type {import('tailwindcss').Config} */
module.exports = {
  // Extend the existing Tailwind configuration with responsive utilities
  theme: {
    extend: {
      // Custom breakpoints for mobile-first design
      screens: {
        'xs': '480px',   // Extra small devices
        'sm': '640px',   // Small devices (Tailwind default)
        'md': '768px',   // Medium devices (Tailwind default)
        'lg': '1024px',  // Large devices (Tailwind default)
        'xl': '1280px',  // Extra large devices (Tailwind default)
        '2xl': '1536px', // 2X large devices (Tailwind default)
        
        // Max-width breakpoints for mobile-first approach
        'max-xs': {'max': '479px'},
        'max-sm': {'max': '639px'},
        'max-md': {'max': '767px'},
        'max-lg': {'max': '1023px'},
        'max-xl': {'max': '1279px'},
        
        // Device-specific breakpoints
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
        
        // Orientation-based breakpoints
        'portrait': {'raw': '(orientation: portrait)'},
        'landscape': {'raw': '(orientation: landscape)'},
        
        // Touch device detection
        'touch': {'raw': '(hover: none) and (pointer: coarse)'},
        'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
        
        // High resolution displays
        'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
      },
      
      // Responsive spacing scale
      spacing: {
        'mobile': '1rem',
        'tablet': '1.5rem',
        'desktop': '2rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Responsive font sizes
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1rem' }],
        'sm-mobile': ['0.875rem', { lineHeight: '1.25rem' }],
        'base-mobile': ['1rem', { lineHeight: '1.5rem' }],
        'lg-mobile': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl-mobile': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl-mobile': ['1.5rem', { lineHeight: '2rem' }],
        '3xl-mobile': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      
      // Touch-friendly sizing
      minHeight: {
        'touch': '44px',
        'button': '44px',
        'input': '44px',
      },
      
      minWidth: {
        'touch': '44px',
        'button': '44px',
      },
      
      // Responsive grid columns
      gridTemplateColumns: {
        'mobile-1': '1fr',
        'mobile-2': 'repeat(2, 1fr)',
        'tablet-2': 'repeat(2, 1fr)',
        'tablet-3': 'repeat(3, 1fr)',
        'desktop-3': 'repeat(3, 1fr)',
        'desktop-4': 'repeat(4, 1fr)',
        'desktop-5': 'repeat(5, 1fr)',
        'desktop-6': 'repeat(6, 1fr)',
        
        // Auto-fit responsive columns
        'responsive-sm': 'repeat(auto-fit, minmax(200px, 1fr))',
        'responsive-md': 'repeat(auto-fit, minmax(250px, 1fr))',
        'responsive-lg': 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      
      // Responsive gaps
      gap: {
        'mobile': '1rem',
        'tablet': '1.5rem',
        'desktop': '2rem',
      },
      
      // Container max widths for different screen sizes
      maxWidth: {
        'mobile': '100%',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
        'ultra-wide': '1536px',
      },
      
      // Z-index scale for layering
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      
      // Animation durations based on user preferences
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
        'reduced-motion': '0ms',
      },
      
      // Border radius scale
      borderRadius: {
        'mobile': '0.5rem',
        'tablet': '0.75rem',
        'desktop': '1rem',
      },
      
      // Box shadow scale for depth
      boxShadow: {
        'mobile': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'tablet': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'desktop': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-mobile': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'card-desktop': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  
  // Responsive utilities plugin
  plugins: [
    // Custom plugin for responsive utilities
    function({ addUtilities, addComponents, theme }) {
      // Touch-friendly utilities
      addUtilities({
        '.touch-target': {
          minHeight: theme('minHeight.touch'),
          minWidth: theme('minWidth.touch'),
        },
        '.btn-touch': {
          minHeight: theme('minHeight.button'),
          minWidth: theme('minWidth.button'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      });
      
      // Safe area utilities
      addUtilities({
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-x': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-y': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-all': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
      });
      
      // Mobile-optimized scrolling
      addUtilities({
        '.scroll-touch': {
          '-webkit-overflow-scrolling': 'touch',
          'overscroll-behavior': 'contain',
        },
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
      });
      
      // Responsive text utilities
      addUtilities({
        '.text-responsive': {
          fontSize: '0.875rem',
          '@screen sm': {
            fontSize: '1rem',
          },
        },
        '.text-responsive-lg': {
          fontSize: '1rem',
          '@screen sm': {
            fontSize: '1.125rem',
          },
          '@screen lg': {
            fontSize: '1.25rem',
          },
        },
      });
      
      // Mobile-first components
      addComponents({
        '.container-responsive': {
          width: '100%',
          paddingLeft: theme('spacing.mobile'),
          paddingRight: theme('spacing.mobile'),
          '@screen sm': {
            paddingLeft: theme('spacing.tablet'),
            paddingRight: theme('spacing.tablet'),
          },
          '@screen lg': {
            paddingLeft: theme('spacing.desktop'),
            paddingRight: theme('spacing.desktop'),
          },
        },
        
        '.card-responsive': {
          backgroundColor: 'white',
          borderRadius: theme('borderRadius.mobile'),
          padding: theme('spacing.mobile'),
          boxShadow: theme('boxShadow.card-mobile'),
          '@screen sm': {
            borderRadius: theme('borderRadius.tablet'),
            padding: theme('spacing.tablet'),
            boxShadow: theme('boxShadow.card-desktop'),
          },
        },
        
        '.btn-responsive': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          fontWeight: '500',
          borderRadius: theme('borderRadius.mobile'),
          minHeight: theme('minHeight.button'),
          transition: 'all 0.2s ease-in-out',
          '@screen sm': {
            width: 'auto',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            minHeight: 'auto',
          },
        },
        
        '.grid-responsive': {
          display: 'grid',
          gridTemplateColumns: theme('gridTemplateColumns.mobile-1'),
          gap: theme('gap.mobile'),
          '@screen sm': {
            gridTemplateColumns: theme('gridTemplateColumns.tablet-2'),
            gap: theme('gap.tablet'),
          },
          '@screen lg': {
            gridTemplateColumns: theme('gridTemplateColumns.desktop-3'),
            gap: theme('gap.desktop'),
          },
        },
        
        '.modal-responsive': {
          position: 'fixed',
          inset: '0',
          zIndex: theme('zIndex.modal'),
          backgroundColor: 'white',
          '@screen sm': {
            position: 'relative',
            inset: 'auto',
            maxWidth: theme('maxWidth.tablet'),
            margin: '0 auto',
            borderRadius: theme('borderRadius.tablet'),
            boxShadow: theme('boxShadow.desktop'),
          },
        },
      });
    },
    
    // Animation preferences plugin
    function({ addUtilities, addBase }) {
      addBase({
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      });
      
      addUtilities({
        '.animate-respectful': {
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none !important',
            transition: 'none !important',
          },
        },
      });
    },
    
    // Print styles plugin
    function({ addUtilities }) {
      addUtilities({
        '@media print': {
          '.print-hidden': {
            display: 'none !important',
          },
          '.print-visible': {
            display: 'block !important',
          },
          '.print-break-before': {
            pageBreakBefore: 'always',
          },
          '.print-break-after': {
            pageBreakAfter: 'always',
          },
          '.print-break-inside-avoid': {
            pageBreakInside: 'avoid',
          },
        },
      });
    },
  ],
  
  // Responsive variants configuration
  variants: {
    extend: {
      // Enable responsive variants for more utilities
      display: ['responsive', 'group-hover'],
      visibility: ['responsive', 'group-hover'],
      opacity: ['responsive', 'group-hover'],
      backgroundColor: ['responsive', 'hover', 'focus', 'active'],
      textColor: ['responsive', 'hover', 'focus', 'active'],
      borderColor: ['responsive', 'hover', 'focus', 'active'],
      borderWidth: ['responsive', 'hover', 'focus'],
      margin: ['responsive', 'first', 'last'],
      padding: ['responsive'],
      space: ['responsive'],
      width: ['responsive', 'hover', 'focus'],
      height: ['responsive', 'hover', 'focus'],
      maxWidth: ['responsive'],
      maxHeight: ['responsive'],
      minWidth: ['responsive'],
      minHeight: ['responsive'],
    },
  },
};
// Animation utilities for consistent micro-interactions

export const animations = {
  // Entrance animations
  fadeIn: 'animate-in fade-in duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom-5 duration-300',
  slideInFromTop: 'animate-in slide-in-from-top-5 duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left-5 duration-300',
  slideInFromRight: 'animate-in slide-in-from-right-5 duration-300',
  zoomIn: 'animate-in zoom-in duration-300',
  
  // Exit animations
  fadeOut: 'animate-out fade-out duration-200',
  slideOutToBottom: 'animate-out slide-out-to-bottom-5 duration-200',
  slideOutToTop: 'animate-out slide-out-to-top-5 duration-200',
  zoomOut: 'animate-out zoom-out duration-200',

  // Combo animations
  fadeInUp: 'animate-in fade-in slide-in-from-bottom-5 duration-300',
  fadeInDown: 'animate-in fade-in slide-in-from-top-5 duration-300',
  fadeOutDown: 'animate-out fade-out slide-out-to-bottom-5 duration-200',

  // Stagger animations (use with delay utilities)
  stagger: (index: number, baseDelay = 50) => ({
    animationDelay: `${index * baseDelay}ms`
  }),

  // Bounce animations
  bounceIn: 'animate-in zoom-in duration-500',
  shake: 'animate-pulse',

  // Loading animations
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',

  // Hover transitions
  scaleOnHover: 'hover:scale-105 transition-transform duration-200',
  liftOnHover: 'hover:-translate-y-1 hover: transition-all duration-200',
  glowOnHover: 'hover: /20  duration-200',

  // Focus animations
  focusRing: 'focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200',

  // Smooth transitions
  smooth: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
}

// Keyframe animations for Tailwind config (if needed)
export const keyframes = {
  'slide-in-from-bottom-5': {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'slide-in-from-top-5': {
    '0%': { transform: 'translateY(-20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'slide-in-from-left-5': {
    '0%': { transform: 'translateX(-20px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'slide-in-from-right-5': {
    '0%': { transform: 'translateX(20px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'zoom-in': {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
}

// Spring animation helper
export function spring(tension = 300, friction = 20) {
  return {
    type: 'spring',
    stiffness: tension,
    damping: friction
  }
}

// Timing functions
export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
}

// Duration presets
export const durations = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700
}

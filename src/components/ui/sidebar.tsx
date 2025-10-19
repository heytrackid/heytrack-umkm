"use client"

import * as React from "react"
import dynamic from 'next/dynamic'

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = false
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(
    () => setOpen((open) => !open),
    [setOpen]
  )

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={`group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

const Sidebar = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.Sidebar })), {
  ssr: true,
  loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />
})

const SidebarTrigger = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarTrigger })), {
  ssr: true,
  loading: () => <div className="animate-pulse bg-muted h-8 w-8 rounded" />
})

const SidebarRail = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarRail })), {
  ssr: true
})

const SidebarInset = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarInset })), {
  ssr: true
})

const SidebarInput = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarInput })), {
  ssr: true
})

const SidebarHeader = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarHeader })), {
  ssr: true
})

const SidebarFooter = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarFooter })), {
  ssr: true
})

const SidebarSeparator = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarSeparator })), {
  ssr: true
})

const SidebarContent = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarContent })), {
  ssr: true
})

const SidebarGroup = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarGroup })), {
  ssr: true
})

const SidebarGroupLabel = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarGroupLabel })), {
  ssr: true
})

const SidebarGroupAction = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarGroupAction })), {
  ssr: true
})

const SidebarGroupContent = dynamic(() => import('./sidebar/sidebar-components').then(mod => ({ default: mod.SidebarGroupContent })), {
  ssr: true
})

const SidebarMenu = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenu })), {
  ssr: true
})

const SidebarMenuItem = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuItem })), {
  ssr: true
})

const SidebarMenuButton = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuButton })), {
  ssr: true
})

const SidebarMenuAction = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuAction })), {
  ssr: true
})

const SidebarMenuBadge = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuBadge })), {
  ssr: true
})

const SidebarMenuSkeleton = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuSkeleton })), {
  ssr: true
})

const SidebarMenuSub = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuSub })), {
  ssr: true
})

const SidebarMenuSubItem = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuSubItem })), {
  ssr: true
})

const SidebarMenuSubButton = dynamic(() => import('./sidebar/sidebar-menu').then(mod => ({ default: mod.SidebarMenuSubButton })), {
  ssr: true
})

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

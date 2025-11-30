"use client"

import * as React from "react"
import { createPortal } from "react-dom"

export interface PortalProps {
  children: React.ReactNode
  /**
   * The container element to portal into.
   * @defaultValue `document.body`
   */
  container?: Element | DocumentFragment | null
  /**
   * The key to use for the portal.
   */
  key?: string | null
}

/**
 * Portal component that renders children into a DOM node outside of the parent component's DOM hierarchy.
 * Useful for modals, tooltips, popovers, and other overlay content.
 */
export function Portal({ children, container, key }: PortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) {
    return null
  }

  return createPortal(children, container || document.body, key)
}

Portal.displayName = "Portal"


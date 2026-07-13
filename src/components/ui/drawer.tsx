'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type DrawerDirection = 'top' | 'right' | 'bottom' | 'left'

interface DrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  direction: DrawerDirection
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawer() {
  const context = React.useContext(DrawerContext)
  if (!context) throw new Error('Drawer bileşenleri Drawer içinde kullanılmalıdır')
  return context
}

function Drawer({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  direction = 'bottom',
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  direction?: DrawerDirection
  children: React.ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen

  const setOpen = React.useCallback((nextOpen: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }, [controlledOpen, onOpenChange])

  React.useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, setOpen])

  return <DrawerContext.Provider value={{ open, onOpenChange: setOpen, direction }}>{children}</DrawerContext.Provider>
}
Drawer.displayName = 'Drawer'

function DrawerPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
DrawerPortal.displayName = 'DrawerPortal'

function DrawerTrigger({ children, asChild = false }: { children: React.ReactElement<{ onClick?: React.MouseEventHandler }>; asChild?: boolean }) {
  const { onOpenChange } = useDrawer()
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event)
        onOpenChange(true)
      },
    })
  }

  return <button type="button" onClick={() => onOpenChange(true)}>{children}</button>
}
DrawerTrigger.displayName = 'DrawerTrigger'

function DrawerClose({ children, asChild = false }: { children: React.ReactElement<{ onClick?: React.MouseEventHandler }>; asChild?: boolean }) {
  const { onOpenChange } = useDrawer()
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event)
        onOpenChange(false)
      },
    })
  }

  return <button type="button" onClick={() => onOpenChange(false)}>{children}</button>
}
DrawerClose.displayName = 'DrawerClose'

const DrawerOverlay = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(({ className, ...props }, ref) => {
  const { onOpenChange } = useDrawer()
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Kapat"
      className={cn('fixed inset-0 z-50 cursor-default bg-black/45', className)}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  )
})
DrawerOverlay.displayName = 'DrawerOverlay'

const directionClasses: Record<DrawerDirection, string> = {
  bottom: 'inset-x-0 bottom-0 mt-24 max-h-[92dvh] rounded-t-md border-t',
  top: 'inset-x-0 top-0 mb-24 max-h-[92dvh] rounded-b-md border-b',
  right: 'inset-y-0 right-0 h-dvh w-full border-l md:max-w-[50vw]',
  left: 'inset-y-0 left-0 h-dvh w-full border-r md:max-w-[50vw]',
}

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { direction?: DrawerDirection; showHandle?: boolean }
>(({ className, children, direction: contentDirection, showHandle, ...props }, ref) => {
  const { open, direction } = useDrawer()
  const resolvedDirection = contentDirection ?? direction
  const resolvedShowHandle = showHandle ?? (resolvedDirection === 'bottom' || resolvedDirection === 'top')

  if (!open) return null

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 flex flex-col border-border bg-card text-card-foreground shadow-xl outline-none',
          directionClasses[resolvedDirection],
          className
        )}
        {...props}
      >
        {resolvedShowHandle ? <div className="mx-auto mt-3 h-1 w-16 rounded-md bg-muted" /> : null}
        {children}
      </div>
    </DrawerPortal>
  )
})
DrawerContent.displayName = 'DrawerContent'

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-border p-4 text-left', className)} {...props} />
}
DrawerHeader.displayName = 'DrawerHeader'

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-auto border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]', className)} {...props} />
}
DrawerFooter.displayName = 'DrawerFooter'

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<'h2'>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-lg font-semibold leading-tight tracking-tight', className)} {...props} />
))
DrawerTitle.displayName = 'DrawerTitle'

const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('mt-1 text-sm leading-6 text-muted-foreground', className)} {...props} />
))
DrawerDescription.displayName = 'DrawerDescription'

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

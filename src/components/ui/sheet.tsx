'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onOpenChange, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Kapat" className="absolute inset-0 cursor-default bg-black/40" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  )
}

function SheetContent({ className, children, side = 'bottom' }: React.ComponentProps<'div'> & { side?: 'bottom' | 'right' | 'left' }) {
  const sideClass = side === 'bottom' ? 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl' : side === 'right' ? 'right-0 top-0 h-dvh w-full max-w-md' : 'left-0 top-0 h-dvh w-full max-w-md'

  return (
    <div role="dialog" aria-modal="true" className={cn('absolute overflow-hidden border border-border bg-card shadow-xl', sideClass, className)}>
      {children}
    </div>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('border-b border-border p-4', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props} />
}

function SheetCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Kapat" onClick={onClick}>
      <X className="h-4 w-4" />
    </Button>
  )
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetCloseButton }

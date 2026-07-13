'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null)

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>
}

function useDropdown() {
  const context = React.useContext(DropdownContext)
  if (!context) throw new Error('DropdownMenu bileşenleri DropdownMenu içinde kullanılmalıdır')
  return context
}

function DropdownMenuTrigger({ children }: { children: React.ReactElement<{ onClick?: React.MouseEventHandler }> }) {
  const { open, setOpen } = useDropdown()
  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event)
      setOpen(!open)
    },
  })
}

function DropdownMenuContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { open } = useDropdown()
  if (!open) return null
  return <div role="menu" className={cn('absolute z-50 mt-2 min-w-44 rounded-lg border border-border bg-card p-1 shadow-lg', className)} {...props} />
}

function DropdownMenuItem({ className, ...props }: React.ComponentProps<'button'>) {
  return <button role="menuitem" className={cn('flex min-h-10 w-full cursor-pointer items-center rounded-md px-3 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none', className)} {...props} />
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }

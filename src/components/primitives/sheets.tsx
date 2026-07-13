'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

interface SheetBaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

function CloseButton() {
  return (
    <DrawerClose asChild>
      <Button variant="ghost" size="icon-sm" aria-label="Kapat">
        <X className="size-4" />
      </Button>
    </DrawerClose>
  )
}

export function FilterSheet({ open, onOpenChange, title, description, children, footer }: SheetBaseProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent direction="bottom" className="max-h-[92dvh]">
        <DrawerHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <DrawerTitle>{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </div>
          <CloseButton />
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? <DrawerFooter>{footer}</DrawerFooter> : null}
      </DrawerContent>
    </Drawer>
  )
}

export function FormSheet({ open, onOpenChange, title, description, children, footer }: SheetBaseProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent direction="right" showHandle={false} className="md:w-[50vw] md:max-w-none">
        <DrawerHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <DrawerTitle>{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </div>
          <CloseButton />
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? <DrawerFooter>{footer}</DrawerFooter> : null}
      </DrawerContent>
    </Drawer>
  )
}

interface ActionSheetAction {
  label: string
  description?: string
  icon?: ReactNode
  destructive?: boolean
  iconClassName?: string
  className?: string
  onSelect: () => void
}

interface ActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  actions: ActionSheetAction[]
}

export function ActionSheet({ open, onOpenChange, title, description, actions }: ActionSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent direction="bottom">
        <DrawerHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <DrawerTitle>{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </div>
          <CloseButton />
        </DrawerHeader>
        <div className="space-y-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={cn('flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30', action.className, action.destructive && 'text-destructive')}
              onClick={() => {
                action.onSelect()
                onOpenChange(false)
              }}
            >
              {action.icon ? <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground', action.iconClassName)}>{action.icon}</span> : null}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{action.label}</span>
                {action.description ? <span className="block text-xs leading-5 text-muted-foreground">{action.description}</span> : null}
              </span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface StickyActionBarProps {
  children: ReactNode
  className?: string
}

export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return <div className={cn('sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:mx-0 sm:rounded-md sm:border', className)}>{children}</div>
}

export function SheetFooterActions({ onCancel, submitLabel = 'Kaydet', submitting = false }: { onCancel: () => void; submitLabel?: string; submitting?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        İptal
      </Button>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Kaydediliyor...' : submitLabel}
      </Button>
    </div>
  )
}

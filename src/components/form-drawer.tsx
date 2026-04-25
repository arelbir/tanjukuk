'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ReactNode, useState } from 'react'

interface FormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormDrawer({ open, onOpenChange, title, description, children, className }: FormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-full sm:max-w-2xl flex flex-col h-full", className)}>
        <SheetHeader className="px-6 sm:px-8 pt-6 pb-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface FormDrawerTriggerProps {
  onClick: () => void
  children: ReactNode
  className?: string
}

export function FormDrawerTrigger({ onClick, children, className }: FormDrawerTriggerProps) {
  return (
    <div onClick={onClick} className={cn("cursor-pointer", className)}>
      {children}
    </div>
  )
}

export function useFormDrawer<T extends object>(defaultValues: T) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<T>(defaultValues)
  const [editingId, setEditingId] = useState<string | null>(null)

  const openForCreate = (initialValues?: Partial<T>) => {
    if (initialValues) {
      setValues({ ...defaultValues, ...initialValues })
    }
    setEditingId(null)
    setOpen(true)
  }

  const openForEdit = (id: string, initialValues: T) => {
    setEditingId(id)
    setValues(initialValues)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setValues({ ...defaultValues })
    setEditingId(null)
  }

  const updateValues = (updates: Partial<T>) => {
    setValues(prev => ({ ...prev, ...updates }))
  }

  return {
    open,
    values,
    editingId,
    isEditing: !!editingId,
    openForCreate,
    openForEdit,
    close,
    updateValues,
    setValues
  }
}
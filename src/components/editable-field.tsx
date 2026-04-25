import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface EditableFieldProps {
  label: string
  isEditing: boolean
  displayValue: ReactNode
  children: ReactNode
  className?: string
}

export function EditableField({ label, isEditing, displayValue, children, className }: EditableFieldProps) {
  return (
    <div className={className}>
      <Label className="text-sm text-muted-foreground mb-1 block">{label}</Label>
      {isEditing ? (
        <div className="mt-1">
          {children}
        </div>
      ) : (
        <div className="font-medium min-h-6">{displayValue || '-'}</div>
      )}
    </div>
  )
}

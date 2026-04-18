'use client'

import { useId } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type LookupItem = { id: string; label?: string; name?: string }
type StaticItem = { value: string; label: string }

interface FormFieldSelectProps<T> {
  label: string
  value: string
  onValueChange: (value: string | null) => void
  items: T[]
  getValue?: (item: T) => string
  getLabel?: (item: T) => string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

function defaultGetValue(item: LookupItem): string {
  return item.id
}

function defaultGetLabel(item: LookupItem): string {
  return item.label || item.name || item.id
}

export function FormFieldSelect<T extends LookupItem | StaticItem>({
  label,
  value,
  onValueChange,
  items,
  getValue = defaultGetValue as (item: T) => string,
  getLabel = defaultGetLabel as (item: T) => string,
  placeholder = 'Seçin',
  required = false,
  disabled = false,
}: FormFieldSelectProps<T>) {
  const id = useId()

  const selectedItem = items.find(i => getValue(i) === value)
  const displayLabel = selectedItem ? getLabel(selectedItem) : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Select value={value || ''} onValueChange={(v) => onValueChange(v || null)} disabled={disabled}>
        <SelectTrigger id={id} className="h-11">
          <SelectValue placeholder={placeholder}>
            {displayLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((item, index) => (
            <SelectItem key={getValue(item) + index} value={getValue(item)}>
              {getLabel(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function FormFieldSelectWithId({
  label,
  value,
  onValueChange,
  items,
  placeholder = 'Seçin',
  required = false,
  disabled = false,
}: {
  label: string
  value: string
  onValueChange: (value: string | null) => void
  items: { id: string; label?: string; name?: string }[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
}) {
  const id = useId()

  const getLabel = (item: { id: string; label?: string; name?: string }): string => {
    return item.label || item.name || item.id
  }

  const selectedItem = items.find(i => i.id === value)
  const displayLabel = selectedItem ? getLabel(selectedItem) : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Select value={value || ''} onValueChange={(v) => onValueChange(v || null)} disabled={disabled}>
        <SelectTrigger id={id} className="h-11">
          <SelectValue placeholder={placeholder}>
            {displayLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {getLabel(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
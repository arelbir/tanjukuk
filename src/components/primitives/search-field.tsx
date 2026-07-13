'use client'

import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchField({ value, onChange, placeholder = 'Ara...', className }: SearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9 pr-10" />
      {value ? (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Aramayı temizle" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => onChange('')}>
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'

interface RadioGroupProps<T> {
  items: T[]
  value: string
  onChange: (value: string) => void
  labelExtractor?: (item: T) => string
  valueExtractor?: (item: T) => string
}

export function RadioGroup<T extends { id: string; label?: string }>({
  items,
  value,
  onChange,
  labelExtractor,
  valueExtractor,
}: RadioGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const val = valueExtractor ? valueExtractor(item) : item.id
        const isSelected = value === val
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              'px-4 py-2 text-sm rounded-md border transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary font-medium'
                : 'bg-background text-muted-foreground border-input hover:bg-muted'
            )}
          >
            {labelExtractor ? labelExtractor(item) : item.label}
          </button>
        )
      })}
    </div>
  )
}

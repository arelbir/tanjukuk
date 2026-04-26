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
    <div className="flex flex-wrap gap-2 w-full">
      {items.map((item) => {
        const val = valueExtractor ? valueExtractor(item) : item.id
        const isSelected = value === val
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              'px-3 py-2 text-xs rounded border transition-colors flex-1 h-8 font-medium',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white text-muted-foreground border-input hover:bg-muted'
            )}
          >
            {labelExtractor ? labelExtractor(item) : item.label}
          </button>
        )
      })}
    </div>
  )
}

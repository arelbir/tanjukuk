'use client'

import { cn } from '@/lib/utils'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  className?: string
  ariaLabel?: string
}

export function SegmentedControl<T extends string>({ value, options, onChange, className, ariaLabel = 'Seçenekler' }: SegmentedControlProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('flex min-h-11 gap-1 overflow-x-auto rounded-md bg-muted p-1', className)}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'flex min-h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
              active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onChange(option.value)}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' ? <span className="rounded-md bg-secondary px-1.5 text-xs text-secondary-foreground">{option.count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

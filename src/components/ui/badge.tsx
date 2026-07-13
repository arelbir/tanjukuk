import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex h-6 w-fit items-center rounded-md border px-2.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-primary/20 bg-primary/10 text-primary',
      secondary: 'border-border bg-secondary text-secondary-foreground',
      destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
      outline: 'border-border bg-card text-foreground',
      success: 'border-emerald-600/20 bg-emerald-50 text-emerald-700',
      warning: 'border-amber-600/20 bg-amber-50 text-amber-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }

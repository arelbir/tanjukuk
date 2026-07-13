import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-md border text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        outline: 'border-border bg-card text-foreground hover:bg-muted active:bg-secondary',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted active:bg-secondary',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        link: 'min-h-0 border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 gap-2 px-4',
        sm: 'h-10 gap-1.5 px-3 text-sm',
        lg: 'h-12 gap-2 px-5 text-base',
        icon: 'size-11 p-0',
        'icon-sm': 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }

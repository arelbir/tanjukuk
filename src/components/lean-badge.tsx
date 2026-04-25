import { Badge } from '@/components/ui/badge'
import { LEAN_LABELS } from '@/types/case'

interface LeanBadgeProps {
  value: string | null
  className?: string
}

export function LeanBadge({ value, className }: LeanBadgeProps) {
  if (!value) return null

  const label = LEAN_LABELS[value] || value
  const variant = value === 'L' ? 'default' : value === 'A' ? 'destructive' : 'secondary'

  return (
    <Badge 
      variant={variant}
      className={className}
    >
      {label}
    </Badge>
  )
}
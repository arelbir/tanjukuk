import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  label: string
  className?: string
}

// Semantic color mapping for case statuses
const STATUS_COLORS: Record<string, string> = {
  'Yerel Mahkeme': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'İstinaf': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  'Temyiz': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  'Kapandı': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
  'Kesinleşti': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
}

// Default color for unknown statuses
const DEFAULT_COLOR = 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'

export function StatusBadge({ label, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[label] || DEFAULT_COLOR
  
  return (
    <Badge 
      variant="outline" 
      className={cn(colorClass, className)}
    >
      {label}
    </Badge>
  )
}

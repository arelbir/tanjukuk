import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'

interface CollapsibleCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsibleCard({ title, description, icon, children, defaultOpen = false }: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="border-border/50 bg-card/50 shadow-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon || <Info className="w-5 h-5 text-muted-foreground" />}
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

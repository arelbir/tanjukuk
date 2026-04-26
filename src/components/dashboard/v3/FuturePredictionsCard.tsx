'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PredictionItem {
  id: string
  title: string
  value: string
  subtitle: string
  confidence: number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  variant: 'success' | 'warning' | 'danger' | 'info'
}

interface FuturePredictionsCardProps {
  predictions: PredictionItem[]
}

const variantStyles = {
  success: {
    valueColor: 'text-emerald-600',
    trendIcon: TrendingUp
  },
  warning: {
    valueColor: 'text-amber-600',
    trendIcon: TrendingUp
  },
  danger: {
    valueColor: 'text-rose-600',
    trendIcon: TrendingDown
  },
  info: {
    valueColor: 'text-foreground',
    trendIcon: Minus
  }
}

function PredictionCard({ prediction }: { prediction: PredictionItem }) {
  const styles = variantStyles[prediction.variant]
  const TrendIcon = prediction.trend === 'up' ? TrendingUp : prediction.trend === 'down' ? TrendingDown : Minus
  const Icon = prediction.icon

  return (
    <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="truncate">{prediction.title}</span>
          <TrendIcon className={cn('w-3 h-3 ml-auto', styles.valueColor)} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className={cn('text-2xl font-display font-bold truncate', styles.valueColor)}>
          {prediction.value}
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
          <span className="truncate">{prediction.subtitle}</span>
          <span className="text-muted-foreground/50 ml-1 flex-shrink-0">%{prediction.confidence}</span>
        </p>
      </CardContent>
    </Card>
  )
}

export function FuturePredictionsCard({ predictions }: FuturePredictionsCardProps) {
  // Only show first 4 critical predictions
  const criticalPredictions = predictions.slice(0, 4)

  if (criticalPredictions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Öne Çıkan Öngörüler</h3>
      </div>

      {/* Grid Layout - TodayLens Style */}
      <div className="grid gap-4 md:grid-cols-4">
        {criticalPredictions.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))}
      </div>
    </div>
  )
}

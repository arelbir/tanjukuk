import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ExecutiveMetric } from '@/types/dashboard-v3'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface ExecutiveSummaryProps {
  metrics: ExecutiveMetric[]
}

export function ExecutiveSummary({ metrics }: ExecutiveSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const content = (
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-display font-bold ${metric.color}`}>
                      {typeof metric.value === 'number' 
                        ? metric.value.toLocaleString('tr-TR')
                        : metric.value
                      }
                    </p>
                    {metric.trend && (
                      <div className={`flex items-center text-xs font-medium ${
                        metric.trend.direction === 'up' ? 'text-green-600' :
                        metric.trend.direction === 'down' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {metric.trend.direction === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                        {metric.trend.direction === 'down' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {metric.trend.direction === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
                        {Math.abs(metric.trend.value)}%
                      </div>
                    )}
                  </div>
                  {metric.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-lg bg-muted/50 ${metric.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )

        return metric.href ? (
          <Link key={metric.title} href={metric.href}>
            {content}
          </Link>
        ) : (
          <div key={metric.title}>{content}</div>
        )
      })}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { TodayLens } from '@/components/dashboard/v3/TodayLens'
import { FinanceLens } from '@/components/dashboard/v3/FinanceLens'
import { GrowthLens } from '@/components/dashboard/v3/GrowthLens'
import { CalendarLens } from '@/components/dashboard/v3/CalendarLens'
import { CasesLens } from '@/components/dashboard/v3/CasesLens'
import { FuturePredictionsCard } from '@/components/dashboard/v3/FuturePredictionsCard'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useAuth } from '@/hooks/useAuth'
import { LensType } from '@/types/dashboard-v3'
import { predictNext, averageGrowthRate } from '@/lib/predictions/TrendAnalyzer'
import {
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  CalendarDays,
  FileText,
  type LucideIcon
} from 'lucide-react'

const allLenses: { id: LensType; label: string; icon: LucideIcon; description: string; roles: ('admin' | 'lawyer' | 'assistant')[] }[] = [
  {
    id: 'today',
    label: 'Bugün',
    icon: Calendar,
    description: 'Operasyonel komuta merkezi',
    roles: ['admin', 'lawyer', 'assistant']
  },
  {
    id: 'calendar',
    label: 'Takvim',
    icon: CalendarDays,
    description: 'Duruşma takvimi ve randevular',
    roles: ['lawyer', 'assistant']
  },
  {
    id: 'cases',
    label: 'Dosyalar',
    icon: FileText,
    description: 'Aktif dosyalar ve durumlar',
    roles: ['lawyer', 'assistant']
  },
  {
    id: 'finance',
    label: 'Finans',
    icon: TrendingUp,
    description: 'Finansal sağlık ve nakit akışı',
    roles: ['admin']
  },
  {
    id: 'growth',
    label: 'Büyüme',
    icon: BarChart3,
    description: 'Büyüme motoru ve trendler',
    roles: ['admin']
  },
]

export default function DashboardV3Page() {
  const [activeLens, setActiveLens] = useState<LensType>('today')
  const { stats, loading, error, monthlyTrends, lawyerCaseCounts } = useDashboardData()
  const { role } = useAuth()

  // Filter lenses based on user role
  const lenses = allLenses.filter(lens =>
    role ? lens.roles.includes(role) : false
  )

  // Set default lens to first available for the role
  const defaultLens = lenses[0]?.id || 'today'
  if (activeLens === 'today' && defaultLens !== 'today') {
    setActiveLens(defaultLens)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="h-24 bg-muted rounded animate-pulse" />
        <div className="flex gap-2 border-b border-border/50 pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-600">Hata: {error}</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Veri bulunamadı</div>
      </div>
    )
  }

  // Calculate risk metrics
  const workloadRisk = stats.weekHearings > 10 ? 'high' : stats.weekHearings > 5 ? 'medium' : 'low'
  const financialRisk = stats.monthExpenses > stats.monthIncome ? 'high' : stats.monthExpenses > stats.monthIncome * 0.8 ? 'medium' : 'low'
  
  // Generate insight cards based on data
  const insights: { type: string }[] = []
  if (workloadRisk === 'high') {
    insights.push({ type: 'danger' })
  } else if (workloadRisk === 'medium') {
    insights.push({ type: 'warning' })
  }
  if (financialRisk === 'high') {
    insights.push({ type: 'danger' })
  } else if (financialRisk === 'medium') {
    insights.push({ type: 'warning' })
  }

  // Prepare predictions - use real trend analysis
  const netProfit = stats.monthIncome - stats.monthExpenses
  const isHighWorkload = stats.weekHearings > 8
  const isProfitable = netProfit > 0

  // Extract monthly data for predictions
  const monthlyIncome = monthlyTrends.map(m => m.income)
  const monthlyCases = monthlyTrends.map(m => m.cases)
  const monthlyHearings = monthlyTrends.map(m => m.hearings)

  // Client growth prediction using trend analysis
  const clientPrediction = predictNext(monthlyCases, 'ensemble')
  const clientGrowthRate = averageGrowthRate(monthlyCases)

  // Hearing prediction using trend analysis
  const hearingPrediction = predictNext(monthlyHearings, 'ensemble')

  // Income prediction using trend analysis
  const incomePredResult = predictNext(monthlyIncome, 'ensemble')

  const predictions = [
    // Client growth - based on real trend
    {
      id: 'clients-growth',
      title: 'Beklenen Müvekkil Artışı',
      value: `+${clientPrediction.predicted} dosya`,
      subtitle: `Trend: %${clientGrowthRate.toFixed(1)} büyüme`,
      confidence: clientPrediction.confidence,
      icon: Users,
      trend: clientPrediction.trend,
      variant: clientPrediction.trend === 'up' ? ('success' as const) : clientPrediction.trend === 'down' ? ('danger' as const) : ('info' as const)
    },
    // Workload intensity - based on real trend
    {
      id: 'workload-intensity',
      title: isHighWorkload ? 'Yoğun Hafta' : 'Normal Hafta',
      value: `${hearingPrediction.predicted} duruşma`,
      subtitle: 'Gelecek hafta tahmini',
      confidence: hearingPrediction.confidence,
      icon: Calendar,
      trend: hearingPrediction.trend,
      variant: isHighWorkload ? ('warning' as const) : ('success' as const)
    },
    // Financial health - based on real trend
    {
      id: 'financial-health',
      title: isProfitable ? 'Karlı Dönem' : 'Zarar Riski',
      value: `${netProfit.toLocaleString('tr-TR')} ₺`,
      subtitle: `Tahmini gelir: ${incomePredResult.predicted.toLocaleString('tr-TR')} ₺`,
      confidence: incomePredResult.confidence,
      icon: TrendingUp,
      trend: isProfitable ? ('up' as const) : ('down' as const),
      variant: isProfitable ? ('success' as const) : ('danger' as const)
    },
    // Team capacity - operational insight
    {
      id: 'team-capacity',
      title: 'Ekip Kapasitesi',
      value: lawyerCaseCounts.length > 0 
        ? `${(stats.activeCases / lawyerCaseCounts.length).toFixed(1)}`
        : 'N/A',
      subtitle: 'Dosya / avukat',
      confidence: 90,
      icon: BarChart3,
      trend: (stats.activeCases / (lawyerCaseCounts.length || 1)) > 12 ? ('up' as const) : ('neutral' as const),
      variant: (stats.activeCases / (lawyerCaseCounts.length || 1)) > 12 ? ('warning' as const) : ('info' as const)
    }
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Future Predictions - Admin only */}
      {role === 'admin' && predictions.length > 0 && (
        <FuturePredictionsCard predictions={predictions} />
      )}

      {/* Lens Navigation */}
      <nav className="flex gap-1 border-b border-border/50 pb-4" aria-label="Dashboard lens navigation">
        {lenses.map((lens) => {
          const Icon = lens.icon
          return (
            <button
              key={lens.id}
              onClick={() => setActiveLens(lens.id)}
              aria-label={`${lens.label} lens - ${lens.description}`}
              aria-pressed={activeLens === lens.id}
              className={`
                relative px-3 py-2 rounded-lg text-xs font-medium transition-all h-8
                flex items-center gap-2
                ${activeLens === lens.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }
              `}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{lens.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Active Lens Content */}
      <div>
        {activeLens === 'today' && (
          <TodayLens stats={stats} />
        )}
        {activeLens === 'calendar' && (
          <CalendarLens stats={stats} />
        )}
        {activeLens === 'cases' && (
          <CasesLens stats={stats} />
        )}
        {activeLens === 'finance' && (
          <FinanceLens
            stats={stats}
            monthlyTrends={monthlyTrends}
          />
        )}
        {activeLens === 'growth' && (
          <GrowthLens
            stats={stats}
            monthlyTrends={monthlyTrends}
            lawyerCaseCounts={lawyerCaseCounts}
          />
        )}
      </div>
    </div>
  )
}

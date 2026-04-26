import { LucideIcon } from 'lucide-react'

export type LensType = 'today' | 'finance' | 'growth' | 'calendar' | 'cases'

export interface DashboardStats {
  totalCases: number
  activeCases: number
  totalClients: number
  todayHearings: number
  weekHearings: number
  monthIncome: number
  monthExpenses: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  cases: number
  hearings: number
}

export interface Prediction {
  month: string
  predicted: number
  confidence: number
}

export interface LawyerCaseCount {
  name: string
  value: number
}

export interface StatusDistribution {
  name: string
  value: number
  color: string
}

export interface ExecutiveMetric {
  title: string
  value: number | string
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  icon: LucideIcon
  color: string
  href?: string
}

export interface TodayEvent {
  id: string
  time: string
  title: string
  description: string
  type: 'hearing' | 'deadline' | 'meeting' | 'task'
  priority: 'high' | 'medium' | 'low'
  href?: string
}

export interface InsightCard {
  type: 'info' | 'warning' | 'success' | 'danger'
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
  metric?: string
}

export interface CalendarLensProps {
  stats: DashboardStats
}

export interface CasesLensProps {
  stats: DashboardStats
}

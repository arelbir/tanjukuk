export type LensType = 'today' | 'finance' | 'growth' | 'risk'

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

export interface InsightCard {
  type: 'info' | 'warning' | 'success' | 'danger'
  title: string
  message: string
  action?: string
  metric?: string
}

export interface TimelineEvent {
  id: string
  time: string
  title: string
  description: string
  type: 'hearing' | 'deadline' | 'meeting' | 'task'
  priority: 'high' | 'medium' | 'low'
}

import { LucideIcon } from 'lucide-react'

export interface DashboardStats {
  totalCases: number
  activeCases: number
  totalClients: number
  todayHearings: number
  weekHearings: number
  monthIncome: number
  monthExpenses: number
}

export interface StatusDistribution {
  name: string
  value: number
  color: string
}

export interface LawyerCaseCount {
  name: string
  value: number
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

export type Timeframe = 'week' | 'month' | 'quarter' | 'year'

export interface DashboardCard {
  title: string
  value: number
  total: number | null
  icon: LucideIcon
  color: string
}

export interface FinanceCard {
  title: string
  value: number
  icon: LucideIcon
  color: string
  isMoney: boolean
}

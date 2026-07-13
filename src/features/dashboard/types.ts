export interface DashboardCalendarItem {
  id: string
  title: string
  event_type: string
  starts_at: string
  priority: string | null
  is_completed: boolean
}

export interface DashboardOperationalSummary {
  todayAgenda: DashboardCalendarItem[]
  weekHearings: DashboardCalendarItem[]
  upcomingDeadlines: DashboardCalendarItem[]
  overdueTasks: DashboardCalendarItem[]
  activeCaseCount: number
  activeEnforcementCount: number
}

export interface CurrencyTotal {
  currency: string
  amount: number
}

export interface ExpenseScopeTotal {
  scope: string
  amount: number
}

export interface DashboardFinanceSummary {
  pendingReceivables: CurrencyTotal[]
  overdueReceivables: CurrencyTotal[]
  monthPayments: CurrencyTotal[]
  monthExpenses: CurrencyTotal[]
  expenseScopeTotals: ExpenseScopeTotal[]
}

export interface DashboardOverviewData {
  operational: DashboardOperationalSummary
  finance: DashboardFinanceSummary
}

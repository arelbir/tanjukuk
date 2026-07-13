import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type { CurrencyTotal, DashboardFinanceSummary, DashboardOperationalSummary, DashboardOverviewData, ExpenseScopeTotal } from './types'

export type TypedSupabaseClient = SupabaseClient<Database>

export async function getOperationalDashboard(supabase: TypedSupabaseClient): Promise<DashboardOperationalSummary> {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [todayResult, hearingsResult, deadlinesResult, overdueResult, casesResult, enforcementsResult] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('id, title, event_type, starts_at, priority, is_completed')
      .gte('starts_at', todayStart.toISOString())
      .lte('starts_at', todayEnd.toISOString())
      .order('starts_at', { ascending: true }),
    supabase
      .from('calendar_events')
      .select('id, title, event_type, starts_at, priority, is_completed')
      .eq('event_type', 'hearing')
      .eq('is_completed', false)
      .gte('starts_at', now.toISOString())
      .lte('starts_at', weekEnd.toISOString())
      .order('starts_at', { ascending: true }),
    supabase
      .from('calendar_events')
      .select('id, title, event_type, starts_at, priority, is_completed')
      .eq('event_type', 'deadline')
      .eq('is_completed', false)
      .gte('starts_at', now.toISOString())
      .lte('starts_at', weekEnd.toISOString())
      .order('starts_at', { ascending: true }),
    supabase
      .from('calendar_events')
      .select('id, title, event_type, starts_at, priority, is_completed')
      .eq('event_type', 'task')
      .eq('is_completed', false)
      .lt('starts_at', now.toISOString())
      .order('starts_at', { ascending: true }),
    supabase.from('case_files').select('id', { count: 'exact', head: true }).eq('is_archived', false),
    supabase.from('enforcement_files').select('id', { count: 'exact', head: true }).eq('is_archived', false),
  ])

  if (todayResult.error) throw todayResult.error
  if (hearingsResult.error) throw hearingsResult.error
  if (deadlinesResult.error) throw deadlinesResult.error
  if (overdueResult.error) throw overdueResult.error
  if (casesResult.error) throw casesResult.error
  if (enforcementsResult.error) throw enforcementsResult.error

  return {
    todayAgenda: todayResult.data || [],
    weekHearings: hearingsResult.data || [],
    upcomingDeadlines: deadlinesResult.data || [],
    overdueTasks: overdueResult.data || [],
    activeCaseCount: casesResult.count || 0,
    activeEnforcementCount: enforcementsResult.count || 0,
  }
}

export async function getFinanceDashboard(supabase: TypedSupabaseClient): Promise<DashboardFinanceSummary> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]

  const [receivablesResult, paymentsResult, expensesResult] = await Promise.all([
    supabase
      .from('receivables')
      .select('remaining_amount, currency, due_date, status')
      .in('status', ['pending', 'partial'])
      .is('cancelled_at', null),
    supabase
      .from('payments')
      .select('amount, currency, payment_date')
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd)
      .is('cancelled_at', null),
    supabase
      .from('expenses')
      .select('amount, currency, expense_date, scope')
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd)
      .is('cancelled_at', null),
  ])

  if (receivablesResult.error) throw receivablesResult.error
  if (paymentsResult.error) throw paymentsResult.error
  if (expensesResult.error) throw expensesResult.error

  const receivables = receivablesResult.data || []
  const payments = paymentsResult.data || []
  const expenses = expensesResult.data || []

  return {
    pendingReceivables: sumByCurrency(receivables.filter((item) => !item.due_date || item.due_date >= today), 'remaining_amount'),
    overdueReceivables: sumByCurrency(receivables.filter((item) => item.due_date && item.due_date < today), 'remaining_amount'),
    monthPayments: sumByCurrency(payments, 'amount'),
    monthExpenses: sumByCurrency(expenses, 'amount'),
    expenseScopeTotals: sumExpensesByScope(expenses),
  }
}

export async function getDashboardOverview(supabase: TypedSupabaseClient): Promise<DashboardOverviewData> {
  const [operational, finance] = await Promise.all([getOperationalDashboard(supabase), getFinanceDashboard(supabase)])
  return { operational, finance }
}

function sumByCurrency<T extends { currency: string; [key: string]: unknown }>(items: T[], field: keyof T): CurrencyTotal[] {
  const totals = new Map<string, number>()

  for (const item of items) {
    const currency = item.currency || 'TRY'
    const amount = Number(item[field] || 0)
    totals.set(currency, (totals.get(currency) || 0) + amount)
  }

  return Array.from(totals.entries()).map(([currency, amount]) => ({ currency, amount }))
}

function sumExpensesByScope(items: Array<{ scope: string; amount: number }>): ExpenseScopeTotal[] {
  const totals = new Map<string, number>()

  for (const item of items) {
    totals.set(item.scope, (totals.get(item.scope) || 0) + Number(item.amount || 0))
  }

  return Array.from(totals.entries()).map(([scope, amount]) => ({ scope, amount }))
}

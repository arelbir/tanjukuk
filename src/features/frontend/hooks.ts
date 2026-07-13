'use client'

import { useMemo } from 'react'
import { agenda, documents, files, financeItems, notifications } from '@/components/domain/demo-data'
import type { UserContext } from '@/lib/auth'

export function useTodayAgenda() {
  return useMemo(() => agenda.filter((item) => item.date === 'Bugün'), [])
}

export function useOverdueTasks() {
  return useMemo(() => agenda.filter((item) => item.overdue), [])
}

export function useUpcomingHearings() {
  return useMemo(() => agenda.filter((item) => item.type === 'Duruşma'), [])
}

export function useFinanceWarnings() {
  return useMemo(() => financeItems.filter((item) => item.kind === 'Alacak'), [])
}

export function useHomeSummary() {
  const todayAgenda = useTodayAgenda()
  const overdueTasks = useOverdueTasks()
  const upcomingHearings = useUpcomingHearings()
  const financeWarnings = useFinanceWarnings()
  return { todayAgenda, overdueTasks, upcomingHearings, financeWarnings }
}

export function useCaseFileCards(user?: UserContext) {
  return useMemo(() => files.filter((file) => file.type === 'case' && user?.role !== 'finance'), [user?.role])
}

export function useEnforcementFileCards(user?: UserContext) {
  return useMemo(() => files.filter((file) => file.type === 'enforcement' && user?.role !== 'finance'), [user?.role])
}

export function useUnifiedFiles(user?: UserContext) {
  const caseFiles = useCaseFileCards(user)
  const enforcementFiles = useEnforcementFileCards(user)
  return useMemo(() => [...caseFiles, ...enforcementFiles], [caseFiles, enforcementFiles])
}

export function useCalendarItems(filters: { segment?: string } = {}) {
  return useMemo(() => agenda.filter((item) => filters.segment === 'overdue' ? item.overdue : filters.segment === 'today' ? item.date === 'Bugün' : true), [filters.segment])
}

export function useReceivablesView() {
  return useMemo(() => financeItems.filter((item) => item.kind === 'Alacak'), [])
}

export function usePaymentsView() {
  return useMemo(() => financeItems.filter((item) => item.kind === 'Tahsilat'), [])
}

export function useExpensesView() {
  return useMemo(() => financeItems.filter((item) => item.kind === 'Gider'), [])
}

export function useFinanceSummary() {
  const receivables = useReceivablesView()
  const payments = usePaymentsView()
  const expenses = useExpensesView()
  return { receivables, payments, expenses }
}

export function useDocumentsView() {
  return useMemo(() => documents, [])
}

export function useNotificationsView() {
  return useMemo(() => notifications, [])
}

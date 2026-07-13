import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { queryKeys } from './keys'

export type InvalidationTarget = QueryKey | readonly QueryKey[]

function toTargets(target: InvalidationTarget): QueryKey[] {
  if (Array.isArray(target) && Array.isArray(target[0])) {
    return target as QueryKey[]
  }

  return [target as QueryKey]
}

export async function invalidateQueries(queryClient: QueryClient, target: InvalidationTarget) {
  await Promise.all(
    toTargets(target).map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
      })
    )
  )
}

export async function invalidateEntity(queryClient: QueryClient, entityKey: QueryKey) {
  await queryClient.invalidateQueries({ queryKey: entityKey })
}

export async function invalidateEntityList(queryClient: QueryClient, listKey: QueryKey) {
  await queryClient.invalidateQueries({ queryKey: listKey })
}

export async function invalidateAfterClientMutation(queryClient: QueryClient, clientId?: string) {
  await invalidateQueries(queryClient, [
    queryKeys.clients.all,
    queryKeys.dashboard.all,
    ...(clientId ? [queryKeys.clients.detail(clientId)] : []),
  ])
}

export async function invalidateAfterCaseFileMutation(queryClient: QueryClient, caseFileId?: string, clientId?: string) {
  await invalidateQueries(queryClient, [
    queryKeys.caseFiles.all,
    queryKeys.calendarEvents.all,
    queryKeys.receivables.all,
    queryKeys.expenses.all,
    queryKeys.dashboard.all,
    ...(caseFileId ? [queryKeys.caseFiles.detail(caseFileId)] : []),
    ...(clientId ? [queryKeys.clients.detail(clientId)] : []),
  ])
}

export async function invalidateAfterEnforcementFileMutation(
  queryClient: QueryClient,
  enforcementFileId?: string,
  clientId?: string
) {
  await invalidateQueries(queryClient, [
    queryKeys.enforcementFiles.all,
    queryKeys.calendarEvents.all,
    queryKeys.receivables.all,
    queryKeys.expenses.all,
    queryKeys.dashboard.all,
    ...(enforcementFileId ? [queryKeys.enforcementFiles.detail(enforcementFileId)] : []),
    ...(clientId ? [queryKeys.clients.detail(clientId)] : []),
  ])
}

export async function invalidateAfterCalendarMutation(
  queryClient: QueryClient,
  eventId?: string,
  relatedFile?: { type: 'case' | 'enforcement'; id: string }
) {
  await invalidateQueries(queryClient, [
    queryKeys.calendarEvents.all,
    queryKeys.notifications.all,
    queryKeys.dashboard.all,
    ...(eventId ? [queryKeys.calendarEvents.detail(eventId)] : []),
    ...(relatedFile?.type === 'case' ? [queryKeys.caseFiles.detail(relatedFile.id)] : []),
    ...(relatedFile?.type === 'enforcement' ? [queryKeys.enforcementFiles.detail(relatedFile.id)] : []),
  ])
}

export async function invalidateAfterFinanceMutation(
  queryClient: QueryClient,
  options?: {
    clientId?: string
    caseFileId?: string
    enforcementFileId?: string
    receivableId?: string
    paymentId?: string
    expenseId?: string
  }
) {
  await invalidateQueries(queryClient, [
    queryKeys.receivables.all,
    queryKeys.payments.all,
    queryKeys.expenses.all,
    queryKeys.dashboard.all,
    ...(options?.clientId ? [queryKeys.clients.detail(options.clientId)] : []),
    ...(options?.caseFileId ? [queryKeys.caseFiles.detail(options.caseFileId)] : []),
    ...(options?.enforcementFileId ? [queryKeys.enforcementFiles.detail(options.enforcementFileId)] : []),
    ...(options?.receivableId ? [queryKeys.receivables.detail(options.receivableId)] : []),
    ...(options?.paymentId ? [queryKeys.payments.detail(options.paymentId)] : []),
    ...(options?.expenseId ? [queryKeys.expenses.detail(options.expenseId)] : []),
  ])
}

export async function invalidateAfterDocumentMutation(
  queryClient: QueryClient,
  options?: {
    documentId?: string
    clientId?: string
    caseFileId?: string
    enforcementFileId?: string
  }
) {
  await invalidateQueries(queryClient, [
    queryKeys.documents.all,
    ...(options?.documentId ? [queryKeys.documents.detail(options.documentId)] : []),
    ...(options?.clientId ? [queryKeys.clients.detail(options.clientId)] : []),
    ...(options?.caseFileId ? [queryKeys.caseFiles.detail(options.caseFileId)] : []),
    ...(options?.enforcementFileId ? [queryKeys.enforcementFiles.detail(options.enforcementFileId)] : []),
  ])
}

export async function invalidateAfterLookupMutation(queryClient: QueryClient) {
  await invalidateQueries(queryClient, [queryKeys.lookupValues.all, queryKeys.dashboard.all])
}

export async function invalidateAfterNotificationMutation(queryClient: QueryClient, notificationId?: string) {
  await invalidateQueries(queryClient, [
    queryKeys.notifications.all,
    ...(notificationId ? [queryKeys.notifications.detail(notificationId)] : []),
  ])
}

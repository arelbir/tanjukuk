import { notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { FileDetailView } from '@/components/domain/file-detail-view'
import { requirePageContext } from '@/lib/auth/page'
import { getCaseFileDetail } from '@/features/cases/repository'
import { getEnforcementFileDetail } from '@/features/enforcements/repository'

function money(value: number | null | undefined) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(value || 0))
}

export default async function FileDetailPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { id, type } = await params
  const { supabase, user, unreadCount } = await requirePageContext()

  if (type === 'case') {
    const detail = await getCaseFileDetail(supabase, id)
    if (!detail) notFound()

    const file = {
      id: detail.caseFile.id,
      type: 'case' as const,
      code: detail.caseFile.file_code,
      client: detail.caseFile.client?.name || 'Müvekkil yok',
      counterparty: detail.caseFile.opposing_party || 'Karşı taraf yok',
      status: detail.caseFile.status?.label || 'Durum yok',
      responsible: detail.caseFile.lawyer?.full_name || detail.caseFile.lawyer?.email || 'Atanmamış',
      nextAgenda: detail.events[0]?.title || 'Ajanda kaydı yok',
      finance: `${money(detail.finance.paymentTotal)} tahsilat · ${money(detail.finance.expenseTotal)} gider`,
      court: [detail.caseFile.court_city, detail.caseFile.court_no].filter(Boolean).join(' ') || 'Mahkeme bilgisi yok',
      amount: money(Number(detail.caseFile.case_value || 0)),
    }

    return (
      <AppShell user={user} unreadCount={unreadCount}>
        <FileDetailView file={file} />
      </AppShell>
    )
  }

  if (type === 'enforcement') {
    const detail = await getEnforcementFileDetail(supabase, id)
    if (!detail) notFound()

    const file = {
      id: detail.enforcementFile.id,
      type: 'enforcement' as const,
      code: detail.enforcementFile.file_code,
      client: detail.enforcementFile.client?.name || 'Müvekkil yok',
      counterparty: detail.enforcementFile.debtor_party || 'Borçlu yok',
      status: detail.enforcementFile.status?.label || 'Durum yok',
      responsible: detail.enforcementFile.lawyer?.full_name || detail.enforcementFile.lawyer?.email || 'Atanmamış',
      nextAgenda: detail.events[0]?.title || 'Ajanda kaydı yok',
      finance: `${money(detail.finance.collectedTotal)} tahsilat · ${money(detail.finance.expenseTotal)} gider`,
      court: detail.enforcementFile.enforcement_office || 'Daire bilgisi yok',
      amount: money(detail.finance.remainingAmount),
    }

    return (
      <AppShell user={user} unreadCount={unreadCount}>
        <FileDetailView file={file} />
      </AppShell>
    )
  }

  notFound()
}

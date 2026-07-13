'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { QuickActionMenu, type QuickActionType } from '@/components/domain/quick-action-menu'
import { AgendaFormSheet, type AgendaFormValues } from '@/components/domain/agenda-form-sheet'
import { ClientQuickFormSheet, type ClientQuickFormValues } from '@/components/domain/client-quick-form-sheet'
import { DocumentQuickUploadSheet, type DocumentQuickUploadValues } from '@/components/domain/document-quick-upload-sheet'
import { FinanceQuickFormSheet, type FinanceQuickFormValues } from '@/components/domain/finance-quick-form-sheet'
import type { FinanceFormOptions } from '@/features/finance/types'
import type { UserContext } from '@/lib/auth'

interface QuickActionControllerProps {
  user: UserContext
  open: boolean
  onOpenChange: (open: boolean) => void
  financeOptions?: FinanceFormOptions
}

function actionLabel(action: QuickActionType) {
  switch (action) {
    case 'task':
      return 'Görev'
    case 'hearing':
      return 'Duruşma'
    case 'client':
      return 'Müvekkil'
    case 'document':
      return 'Belge'
    case 'payment':
      return 'Tahsilat'
    case 'expense':
      return 'Masraf'
  }
}

export function QuickActionController({ user, open, onOpenChange, financeOptions }: QuickActionControllerProps) {
  const [activeAction, setActiveAction] = useState<QuickActionType | null>(null)
  const [clientOptions, setClientOptions] = useState<Array<{ id: string; label: string }>>([])

  useEffect(() => {
    if (financeOptions?.clients?.length) return
    fetch('/api/clients')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (payload?.clients) {
          setClientOptions(payload.clients.map((client: { id: string; name: string }) => ({ id: client.id, label: client.name })))
        }
      })
      .catch(() => undefined)
  }, [financeOptions])

  const resolvedFinanceOptions = useMemo<FinanceFormOptions | undefined>(() => {
    if (financeOptions) return financeOptions
    return {
      clients: clientOptions,
      caseFiles: [],
      enforcementFiles: [],
      receivables: [],
      paymentCategories: [],
      expenseCategories: [],
      paymentMethods: [],
    }
  }, [clientOptions, financeOptions])

  function selectAction(action: QuickActionType) {
    onOpenChange(false)
    setActiveAction(action)
  }

  function closeActiveAction(openState: boolean) {
    if (!openState) setActiveAction(null)
  }

  async function submitAgenda(values: AgendaFormValues) {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        event_type: activeAction === 'hearing' ? 'hearing' : 'task',
        starts_at: values.dateTime || new Date().toISOString(),
        ends_at: '',
        is_all_day: false,
        location: '',
        priority: 'normal',
        reminder_at: '',
        assigned_to: '',
        client_id: '',
        case_file_id: '',
        enforcement_file_id: '',
        court_room: activeAction === 'hearing' ? values.description : '',
        hearing_result: '',
        interim_decision: '',
        next_step: '',
        next_hearing_at: '',
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      toast.error(payload?.error || 'Ajanda kaydı oluşturulamadı')
      return
    }

    toast.success(`${actionLabel(activeAction || 'task')} kaydı alındı`, {
      description: values.title,
    })
  }

  async function submitClient(values: ClientQuickFormValues) {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        type: values.type === 'Şirket' || values.type === 'Kurum' ? 'company' : 'individual',
        phone: values.contact.includes('@') ? '' : values.contact,
        email: values.contact.includes('@') ? values.contact : '',
        tax_number: '',
        national_id: '',
        company_representative: '',
        address: '',
        notes: '',
        is_active: true,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      toast.error(payload?.error || 'Müvekkil oluşturulamadı')
      return
    }

    toast.success('Müvekkil kaydı alındı', {
      description: values.name,
    })
  }

  function submitDocument(values: DocumentQuickUploadValues) {
    toast.success('Belge yükleme alındı', {
      description: values.fileName || values.description || values.relation,
    })
  }

  async function submitFinance(values: FinanceQuickFormValues) {
    if (!values.clientId) {
      toast.error('Müvekkil seçin')
      return
    }

    const [relationType, relationId] = values.relation.split(':')
    const body = values.kind === 'payment'
      ? {
        client_id: values.clientId,
        receivable_id: '',
        category_id: '',
        payment_method_id: '',
        case_file_id: relationType === 'case' ? relationId : '',
        enforcement_file_id: relationType === 'enforcement' ? relationId : '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: values.amount,
        currency: 'TRY',
        description: values.description,
      }
      : {
        scope: relationType === 'case' || relationType === 'enforcement' ? 'file' : 'office',
        category_id: '',
        sub_category_id: '',
        payment_method_id: '',
        case_file_id: relationType === 'case' ? relationId : '',
        enforcement_file_id: relationType === 'enforcement' ? relationId : '',
        expense_date: new Date().toISOString().split('T')[0],
        amount: values.amount,
        currency: 'TRY',
        is_billable_to_client: false,
        document_ref: values.fileName,
        description: values.description,
      }

    const response = await fetch(values.kind === 'payment' ? '/api/finance/payments' : '/api/finance/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      toast.error(payload?.error || 'Finans kaydı oluşturulamadı')
      return
    }

    toast.success(`${values.kind === 'payment' ? 'Tahsilat' : 'Masraf'} kaydı alındı`, {
      description: values.amount ? `${values.amount} TL` : values.relation,
    })
  }

  return (
    <>
      <QuickActionMenu user={user} open={open} onOpenChange={onOpenChange} onSelectAction={selectAction} />

      {activeAction === 'task' || activeAction === 'hearing' ? (
        <AgendaFormSheet key={activeAction} open mode={activeAction} onOpenChange={closeActiveAction} onSubmit={submitAgenda} />
      ) : null}

      <ClientQuickFormSheet open={activeAction === 'client'} onOpenChange={closeActiveAction} onSubmit={submitClient} />
      <DocumentQuickUploadSheet open={activeAction === 'document'} onOpenChange={closeActiveAction} onSubmit={submitDocument} />
      <FinanceQuickFormSheet kind="payment" open={activeAction === 'payment'} onOpenChange={closeActiveAction} onSubmit={submitFinance} options={resolvedFinanceOptions} />
      <FinanceQuickFormSheet kind="expense" open={activeAction === 'expense'} onOpenChange={closeActiveAction} onSubmit={submitFinance} options={resolvedFinanceOptions} />
    </>
  )
}

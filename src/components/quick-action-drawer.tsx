'use client'

import { QuickActionDrawerProps, QuickActionType } from '@/types/quick-actions'
import { FormDrawer } from '@/components/form-drawer'
import { NewCaseForm } from './quick-actions/new-case-form'
import { NewClientForm } from './quick-actions/new-client-form'
import { NewHearingForm } from './quick-actions/new-hearing-form'
import { NewIncomeForm } from './quick-actions/new-income-form'

const actionComponents: Record<QuickActionType, React.ComponentType<{ onClose: () => void }>> = {
  'new-case': NewCaseForm,
  'new-client': NewClientForm,
  'new-hearing': NewHearingForm,
  'new-income': NewIncomeForm,
  'new-expense': NewIncomeForm,
}

const actionTitles: Record<QuickActionType, string> = {
  'new-case': 'Yeni Dosya',
  'new-client': 'Yeni Müvekkil',
  'new-hearing': 'Yeni Duruşma',
  'new-income': 'Yeni Gelir',
  'new-expense': 'Yeni Gider',
}

export function QuickActionDrawer({ isOpen, onClose, actionType }: QuickActionDrawerProps) {
  const ActionComponent = actionComponents[actionType]
  const title = actionTitles[actionType]

  return (
    <FormDrawer open={isOpen} onOpenChange={onClose} title={title}>
      <ActionComponent onClose={onClose} />
    </FormDrawer>
  )
}

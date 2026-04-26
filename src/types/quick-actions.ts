export type QuickActionType = 'new-case' | 'new-client' | 'new-hearing' | 'new-income' | 'new-expense'

export interface QuickAction {
  type: QuickActionType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export interface QuickActionDrawerProps {
  isOpen: boolean
  onClose: () => void
  actionType: QuickActionType
}

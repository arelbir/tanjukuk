'use client'

import { CalendarPlus, ClipboardPlus, FileUp, Receipt, UserPlus, WalletCards } from 'lucide-react'
import { ActionSheet } from '@/components/primitives'
import { can, type UserContext } from '@/lib/auth'

export type QuickActionType = 'task' | 'hearing' | 'client' | 'document' | 'payment' | 'expense'

interface QuickActionMenuProps {
  user: UserContext
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAction: (action: QuickActionType) => void
}

export function QuickActionMenu({ user, open, onOpenChange, onSelectAction }: QuickActionMenuProps) {
  const canCreateAgenda = can(user, 'calendar:create', { isResponsibleLawyer: true })
  const canCreateFinance = can(user, 'finance:create_payment') || can(user, 'finance:create_expense')

  const actions = [
    ...(canCreateAgenda ? [
      { label: 'Görev ekle', description: 'Yeni görev kaydı', icon: <ClipboardPlus className="size-5" />, iconClassName: 'bg-blue-50 text-blue-600', className: 'hover:border-blue-200 hover:bg-blue-50/70', onSelect: () => onSelectAction('task') },
      { label: 'Duruşma ekle', description: 'Yeni duruşma kaydı', icon: <CalendarPlus className="size-5" />, iconClassName: 'bg-violet-50 text-violet-600', className: 'hover:border-violet-200 hover:bg-violet-50/70', onSelect: () => onSelectAction('hearing') },
    ] : []),
    { label: 'Müvekkil ekle', description: 'Yeni müvekkil kaydı', icon: <UserPlus className="size-5" />, iconClassName: 'bg-cyan-50 text-cyan-600', className: 'hover:border-cyan-200 hover:bg-cyan-50/70', onSelect: () => onSelectAction('client') },
    { label: 'Belge yükle', description: 'Belge veya dekont yükle', icon: <FileUp className="size-5" />, iconClassName: 'bg-amber-50 text-amber-600', className: 'hover:border-amber-200 hover:bg-amber-50/70', onSelect: () => onSelectAction('document') },
    ...(canCreateFinance ? [
      { label: 'Tahsilat gir', description: 'Tahsilat kaydı', icon: <WalletCards className="size-5" />, iconClassName: 'bg-emerald-50 text-emerald-600', className: 'hover:border-emerald-200 hover:bg-emerald-50/70', onSelect: () => onSelectAction('payment') },
      { label: 'Masraf gir', description: 'Masraf kaydı', icon: <Receipt className="size-5" />, iconClassName: 'bg-orange-50 text-orange-600', className: 'hover:border-orange-200 hover:bg-orange-50/70', onSelect: () => onSelectAction('expense') },
    ] : []),
  ]

  return <ActionSheet open={open} onOpenChange={onOpenChange} title="Yeni işlem" description="İşlem türü seçin." actions={actions} />
}

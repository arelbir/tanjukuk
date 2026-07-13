'use client'

import { useRouter } from 'next/navigation'
import { CalendarCheck, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MarkNotificationReadButton({ id, label, className }: { id: string; label: string; className?: string }) {
  const router = useRouter()

  async function markRead() {
    const response = await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      toast.error(payload?.error || 'Bildirim güncellenemedi')
      return
    }
    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon-sm" className={cn('mt-0.5 size-8 shrink-0 rounded-full', className)} aria-label={`${label} bildirimini okundu yap`} onClick={markRead}>
      <CalendarCheck className="size-4" />
    </Button>
  )
}

export function MarkAllNotificationsReadButton() {
  const router = useRouter()

  async function markAllRead() {
    const response = await fetch('/api/notifications/read-all', { method: 'POST' })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      toast.error(payload?.error || 'Bildirimler güncellenemedi')
      return
    }
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={markAllRead}>
      <CheckCheck className="size-4" />
      Tümünü okundu yap
    </Button>
  )
}

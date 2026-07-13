'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileArchiveButtonProps {
  id: string
  type: 'case' | 'enforcement'
  label: string
  redirectTo?: string
}

export function FileArchiveButton({ id, type, label, redirectTo }: FileArchiveButtonProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function archiveFile() {
    const confirmed = window.confirm(`${label} arşive alınsın mı?\n\nDosya silinmez; aktif listeden kaldırılır ve geçmiş/audit kaydı korunur.`)
    if (!confirmed) return

    setBusy(true)
    const endpoint = type === 'case' ? `/api/cases/${id}/archive` : `/api/enforcements/${id}/archive`
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: true }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      window.alert(payload.error || 'Dosya arşive alınamadı')
      setBusy(false)
      return
    }

    if (redirectTo) {
      router.push(redirectTo)
      router.refresh()
      return
    }

    router.refresh()
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={archiveFile} disabled={busy} className="shrink-0 text-muted-foreground hover:text-destructive">
      <Archive className="size-4" />
      Arşivle
    </Button>
  )
}
